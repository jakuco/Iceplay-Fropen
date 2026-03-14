import { Readable } from 'stream';

export interface UploadOptions {
  key?: string;
  contentType?: string;
}

export interface UploadResult {
  key: string;
  bucket: string;
  size: number;
  contentType: string;
  compressed: boolean;
}

export interface DownloadResult {
  stream: Readable;
  contentType: string;
  contentLength?: number;
  key: string;
}