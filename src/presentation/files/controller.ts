import { Request, Response } from "express";
import { Readable } from "stream";
import { Status } from "$config/status";
import { ServiceError } from "$domain/errors";
import { FileService } from "$presentation/services/file.service";
import {
  DownloadFileDto,
  UploadFileDto,
  UploadCompressedFileDto,
  DownloadDecompressedFileDto,
} from "../../domain";

export class FileController {
  // Dependency Injection
  constructor(public readonly fileService: FileService) {}

  private handleError = (error: unknown, res: Response) => {
    const normalizedError =
      typeof error === "object" && error !== null
        ? (error as Partial<ServiceError> & {
            statusCode?: number;
            message?: string;
          })
        : undefined;

    const code =
      normalizedError?.code ??
      normalizedError?.statusCode ??
      Status.INTERNAL_SERVER_ERROR;
    const message = normalizedError?.message ?? "Internal server error";

    if (code >= 500) {
      console.error(message);
    }

    return res.status(code).json({
      message,
    });
  };

  public uploadFile = async (req: Request, res: Response) => {
		console.log("Received upload request", req);
    const file = (req as Request & { file?: unknown }).file;
    const [error, uploadFileDto] = UploadFileDto.create({ file });

    if (error) {
      return res.status(Status.BAD_REQUEST).json({ message: error });
    }

    try {
      const serviceResult = await this.fileService.uploadFile(
        uploadFileDto!.buffer,
        uploadFileDto!.originalName,
        {
          contentType: uploadFileDto!.contentType,
        },
      );

      res.status(Status.CREATED).json(serviceResult);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  public downloadFile = async (req: Request, res: Response) => {
    const [error, downloadDto] = DownloadFileDto.create(req.params);

    if (error) {
      return res.status(Status.BAD_REQUEST).json({ message: error });
    }

    this.fileService
      .downloadFile(downloadDto!.key)
      .then((result) => {
        res.setHeader("Content-Type", result.contentType);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${downloadDto!.key}"`,
        );

        if (result.contentLength) {
          res.setHeader("Content-Length", result.contentLength);
        }

        (result.stream as Readable).pipe(res);
      })
      .catch((error) => this.handleError(error, res));
  };

  public uploadCompressedFile = async (req: Request, res: Response) => {
    const file = (req as Request & { file?: unknown }).file;
    const [error, uploadCompressedDto] = UploadCompressedFileDto.create({
      file,
    });

    if (error) {
      return res.status(Status.BAD_REQUEST).json({ message: error });
    }

    try {
      const serviceResult = await this.fileService.uploadCompressedFile(
        uploadCompressedDto!.buffer,
        uploadCompressedDto!.originalName,
        {
          contentType: uploadCompressedDto!.contentType,
        },
      );

      res.status(Status.CREATED).json(serviceResult);
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  public downloadDecompressedFile = async (req: Request, res: Response) => {
    const [error, downloadDto] = DownloadDecompressedFileDto.create(req.params);

    if (error) {
      return res.status(Status.BAD_REQUEST).json({ message: error });
    }

    let result: Awaited<ReturnType<FileService["downloadAndDecompressFile"]>>;
    try {
      result = await this.fileService.downloadAndDecompressFile(
        downloadDto!.key,
      );
    } catch (error) {
      return this.handleError(error, res);
    }

    res.setHeader("Content-Type", "application/octet-stream");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${downloadDto!.key.replace(/\.gz$/, "")}"`,
    );

    res.setHeader("Content-Length", result.buffer.byteLength);

    res.send(result.buffer);
  };
}
