export class PaginationDTO {

  private constructor(
    public readonly page: number,
    public readonly limit: number,
  ) {}

  static create(page: any = 1, limit: any = 10): [string?, PaginationDTO?] {

    const pageNumber  = Number(page);
    const limitNumber = Number(limit);

    if (Number.isNaN(pageNumber) || Number.isNaN(limitNumber)) {
      return ['Page and Limit must be a number'];
    }

    const pageInt  = Math.floor(pageNumber);
    const limitInt = Math.floor(limitNumber);

    if (pageInt <= 0 || limitInt <= 0) {
      return ['Page and Limit must be greater than 0'];
    }

    if (limitInt > 100) {
      return ['Limit must be less than or equal to 100'];
    }

    return [undefined, new PaginationDTO(pageInt, limitInt)];
  }
}
