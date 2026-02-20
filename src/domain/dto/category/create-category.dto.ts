export class CreateCategoryDto {

  private constructor(
    public readonly category_id: number,
    public readonly name: string,
    public readonly description?: string
  ) {}

  static create(payload: any): [string?, CreateCategoryDto?] {

    const { category_id, name, description } = payload ?? {};

    if (category_id === undefined || isNaN(Number(category_id))) {
      return ["category_id must be a number"];
    }

    if (!name || typeof name !== "string") {
      return ["name is required"];
    }

    return [
      undefined,
      new CreateCategoryDto(
        Number(category_id),
        name.trim(),
        description ? String(description).trim() : undefined
      )
    ];
  }
}
