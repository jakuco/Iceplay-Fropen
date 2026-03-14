export class UploadFileDto {
  private constructor(
    public readonly buffer: Buffer,
    public readonly originalName: string,
    public readonly contentType?: string,
  ) {}

  static create(payload: any): [string?, UploadFileDto?] {
    const { file } = payload ?? {};

    if (!file) return ["file is required"];

    if (!file.buffer) return ["file buffer is required"];

    if (!file.originalname) return ["file originalname is required"];

    return [
      undefined,
      new UploadFileDto(file.buffer, file.originalname, file.mimetype),
    ];
  }
}
