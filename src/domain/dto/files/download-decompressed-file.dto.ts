export class DownloadDecompressedFileDto {
  private constructor(public readonly key: string) {}

  static create(payload: any): [string?, DownloadDecompressedFileDto?] {
    const { key } = payload ?? {};

    if (!key || typeof key !== "string" || key.trim().length === 0) {
      return ["key is required"];
    }

    return [undefined, new DownloadDecompressedFileDto(key.trim())];
  }
}
