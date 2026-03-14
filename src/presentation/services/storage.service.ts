import {
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

import { r2Client } from "$config/r2.client";
import { envs } from "$config/envs";
import { CustomError } from "../../domain";
import {
  DownloadResult,
  UploadOptions,
  UploadResult,
} from "$domain/entities/storage.entity";

export class StorageService {
  private readonly bucket: string;

  // Dependency Injection
  constructor(private readonly client: S3Client = r2Client) {
    this.bucket = envs.R2_BUCKET_NAME;
  }

  async uploadToStorage(
    buffer: Buffer,
    options: UploadOptions & { originalName: string; compressed?: boolean },
  ): Promise<UploadResult> {
    const key = options.key ?? `${Date.now()}-${options.originalName}`;
    const contentType = options.contentType ?? "application/octet-stream";

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          ContentLength: buffer.byteLength,
        }),
      );

      return {
        key,
        bucket: this.bucket,
        size: buffer.byteLength,
        contentType,
        compressed: options.compressed ?? false,
      };
    } catch (error) {
      throw CustomError.internalServer(`Upload error: ${error}`);
    }
  }

  async downloadFromStorage(key: string): Promise<DownloadResult> {
    try {
      const headResult = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      const getResult = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      if (!getResult.Body) {
        throw CustomError.notfound(`Object not found: ${key}`);
      }

      return {
        stream: getResult.Body as Readable,
        contentType: headResult.ContentType ?? "application/octet-stream",
        contentLength: headResult.ContentLength,
        key,
      };
    } catch (error) {
      if (error instanceof CustomError) throw error;

      throw CustomError.internalServer(`Download error: ${error}`);
    }
  }
}
