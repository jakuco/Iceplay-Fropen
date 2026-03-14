import { gzip, gunzip } from "zlib";
import { promisify } from "util";
import { Readable } from "stream";
import { CustomError } from "../../domain";

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

export class CompressionService {
  // Dependency Injection
  constructor() {}

  async compress(buffer: Buffer): Promise<Buffer> {
    try {
      const compressed = await gzipAsync(buffer as unknown as Uint8Array);
      return compressed;
    } catch (error) {
      throw CustomError.internalServer(`Compression error: ${error}`);
    }
  }

  async decompress(buffer: Buffer): Promise<Buffer> {
    try {
      const decompressed = await gunzipAsync(buffer as unknown as Uint8Array);
      return decompressed;
    } catch (error) {
      throw CustomError.internalServer(`Decompression error: ${error}`);
    }
  }

  async streamToBuffer(stream: Readable): Promise<Buffer> {
    try {
      return await new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];

        stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
      });
    } catch (error) {
      throw CustomError.internalServer(`Stream processing error: ${error}`);
    }
  }
}
