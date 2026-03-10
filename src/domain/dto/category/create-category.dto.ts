export class CreateCategoryDto {
  private constructor(
    public readonly name: string,
    public readonly available: boolean,
  ) {}

  static create(payload: any): [string?, CreateCategoryDto?] {
    const { name, available } = payload ?? {};

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return ['name is required'];
    }

    // Si no viene available, usa false (igual que tu schema)
    const availableBool = (available === undefined)
      ? false
      : Boolean(available);

    return [
      undefined,
      new CreateCategoryDto(name.trim(), availableBool),
    ];
  }
}
