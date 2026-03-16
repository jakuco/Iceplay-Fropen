import { StorageService } from "./storage.service";
import { CompressionService } from "./compression.service";
import { basename, extname } from "path";
import AdmZip from "adm-zip";
import * as XLSX from "xlsx";
import sharp from "sharp";
import { createExtractorFromData } from "node-unrar-js";

import { UploadOptions } from "$domain/entities/storage.entity";
import { CustomError } from "../../domain";

type ArchiveEntry = {
  name: string;
  buffer: Buffer;
};

type RarFileHeader = {
  name: string;
  flags: {
    directory: boolean;
  };
};

type RarFile = {
  fileHeader: RarFileHeader;
  extraction?: Uint8Array;
};

type RowToProcess = {
  idNumber: string;
  photoFile: string;
  imageEntry: ArchiveEntry;
};

export class FileService {
  constructor(private storage: StorageService) {}

  private normalizeHeader = (value: unknown): string => {
    return String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
  };

  private normalizeFileName = (value: string): string => {
    return basename(value).trim().toLowerCase();
  };

  private isZipFile = (filename: string): boolean => {
    return extname(filename).toLowerCase() === ".zip";
  };

  private isRarFile = (filename: string): boolean => {
    return extname(filename).toLowerCase() === ".rar";
  };

  private extractZipEntries(archiveBuffer: Buffer): ArchiveEntry[] {
    const zip = new AdmZip(archiveBuffer);
    return zip
      .getEntries()
      .filter((entry) => !entry.isDirectory)
      .map((entry) => ({
        name: entry.entryName,
        buffer: entry.getData(),
      }));
  }

  private async extractRarEntries(archiveBuffer: Buffer): Promise<ArchiveEntry[]> {
    const arrayBuffer = Uint8Array.from(archiveBuffer).buffer;

    const extractor = await createExtractorFromData({ data: arrayBuffer });
    const listResult = extractor.getFileList() as unknown as {
      state: "SUCCESS" | "FAIL";
      fileHeaders?: RarFileHeader[];
    };

    if (listResult.state !== "SUCCESS") {
      throw CustomError.badRequest("Invalid RAR file");
    }

    const fileHeaders = listResult.fileHeaders ?? [];
    const filesToExtract = fileHeaders
      .filter((header) => !header.flags.directory)
      .map((header) => header.name);

    const extractResult = extractor.extract({ files: filesToExtract }) as unknown as {
      state: "SUCCESS" | "FAIL";
      files?: RarFile[];
    };

    if (extractResult.state !== "SUCCESS") {
      throw CustomError.badRequest("Unable to extract RAR file");
    }

    const files = extractResult.files ?? [];

    return files
      .filter((file) => file.extraction)
      .map((file) => ({
        name: file.fileHeader.name,
        buffer: Buffer.from(file.extraction as Uint8Array),
      }));
  }

  private async extractArchiveEntries(
    archiveBuffer: Buffer,
    archiveName: string,
  ): Promise<ArchiveEntry[]> {
    if (this.isZipFile(archiveName)) {
      return this.extractZipEntries(archiveBuffer);
    }

    if (this.isRarFile(archiveName)) {
      return this.extractRarEntries(archiveBuffer);
    }

    throw CustomError.badRequest("Only .zip or .rar files are supported");
  }

  async uploadFile(
    buffer: Buffer,
    originalName: string,
    options?: UploadOptions,
  ) {
    return this.storage.uploadToStorage(buffer, { ...options, originalName });
  }

  async downloadFile(key: string) {
    return this.storage.downloadFromStorage(key);
  }

  async deleteFileByKey(key: string) {
    return this.storage.deleteFromStorage(key);
  }

  async uploadCompressedFile(
    buffer: Buffer,
    originalName: string,
    options?: UploadOptions,
  ) {
    const compressionService = new CompressionService();
    const compressed = await compressionService.compress(buffer);
    return this.storage.uploadToStorage(compressed, {
      ...options,
      originalName,
      contentType: "application/gzip",
      compressed: true,
    });
  }

  async downloadAndDecompressFile(key: string) {
    const result = await this.storage.downloadFromStorage(key);
    const compressionService = new CompressionService();
    const buffer = await compressionService.streamToBuffer(result.stream);
    return { buffer: await compressionService.decompress(buffer), key };
  }

  async uploadPlayersFromCompressedArchive(
    archiveBuffer: Buffer,
    archiveName: string,
  ) {
    const entries = await this.extractArchiveEntries(archiveBuffer, archiveName);

    const xlsxEntries = entries.filter((entry) => /\.xlsx$/i.test(entry.name));

    if (xlsxEntries.length !== 1) {
      throw CustomError.badRequest(
        "The archive must contain exactly one .xlsx file",
      );
    }

    const workbook = XLSX.read(xlsxEntries[0].buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      throw CustomError.badRequest("The .xlsx file does not contain sheets");
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
      header: 1,
      raw: false,
      defval: "",
    });

    let headerIndex = -1;
    let idNumberColumn = -1;
    let photoFileColumn = -1;

    for (let index = 0; index < rows.length; index++) {
      const currentRow = rows[index] ?? [];
      const normalizedHeaders = currentRow.map((value) =>
        this.normalizeHeader(value),
      );

      const currentIdColumn = normalizedHeaders.indexOf("id_number");
      const currentPhotoColumn = normalizedHeaders.indexOf("player_photo_file");

      if (currentIdColumn >= 0 && currentPhotoColumn >= 0) {
        headerIndex = index;
        idNumberColumn = currentIdColumn;
        photoFileColumn = currentPhotoColumn;
        break;
      }
    }

    if (headerIndex < 0) {
      throw CustomError.badRequest(
        "The .xlsx file must include id_number and player_photo_file columns",
      );
    }

    const imageEntries = entries.filter((entry) => {
      const extension = extname(entry.name).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"].includes(
        extension,
      );
    });

    const imageMap = new Map<string, ArchiveEntry>();
    for (const entry of imageEntries) {
      imageMap.set(this.normalizeFileName(entry.name), entry);
    }

    const rowsToProcess: RowToProcess[] = [];

    const missingPhotos: Array<{
      idNumber: string;
      sourcePhotoFile: string;
    }> = [];

    // PASS 1 — VALIDACIÓN
    for (let rowIndex = headerIndex + 1; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex] ?? [];

      const idNumber = String(row[idNumberColumn] ?? "").trim();
      const photoFile = String(row[photoFileColumn] ?? "").trim();

      if (!idNumber || !photoFile) {
        continue;
      }

      const imageEntry = imageMap.get(this.normalizeFileName(photoFile));

      if (!imageEntry) {
        missingPhotos.push({
          idNumber,
          sourcePhotoFile: photoFile,
        });
        continue;
      }

      rowsToProcess.push({
        idNumber,
        photoFile,
        imageEntry,
      });
    }

    if (missingPhotos.length > 0) {
      const missing = missingPhotos
        .map((photo) => `${photo.idNumber}:${photo.sourcePhotoFile}`)
        .join(", ");

      throw CustomError.badRequest(
        `Some photos listed in the Excel were not found in the archive: ${missing}`,
      );
    }

    // PASS 2 — SUBIDA
    const uploadPromises = rowsToProcess.map(async (row) => {
      let jpgBuffer: Buffer;

      try {
        jpgBuffer = await sharp(row.imageEntry.buffer)
          .jpeg({ quality: 90 })
          .toBuffer();
      } catch {
        throw CustomError.badRequest(
          `Invalid image format for ${row.photoFile}`,
        );
      }

      const key = `${row.idNumber}/foto.jpg.gz`;

      const uploadResult = await this.uploadCompressedFile(
        jpgBuffer,
        "foto.jpg",
        {
          key,
          contentType: "image/jpeg",
        },
      );

      return {
        idNumber: row.idNumber,
        sourcePhotoFile: row.photoFile,
        key: uploadResult.key,
      };
    });

    const uploaded = await Promise.all(uploadPromises);

    return {
      totalRows: rows.length - (headerIndex + 1),
      uploadedCount: uploaded.length,
      missingCount: 0,
      uploaded,
    };
  }
}
