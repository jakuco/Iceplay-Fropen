export class DownloadFileDto {
  private constructor(public readonly key: string) {}

  static create(payload: any): [string?, DownloadFileDto?] {
    const { key } = payload ?? {};

    if (!key || typeof key !== "string" || key.trim().length === 0) {
      return ["key is required"];
    }

    return [undefined, new DownloadFileDto(key.trim())];
  }
}
