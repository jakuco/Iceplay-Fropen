import { StorageService } from "./storage.service";
import { CompressionService } from "./compression.service";

import { UploadOptions } from "$domain/entities/storage.entity";

export class FileService {
  constructor(private storage: StorageService) {}

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
}
