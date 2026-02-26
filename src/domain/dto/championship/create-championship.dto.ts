export class CreateChampionshipDto {
  private constructor(
    public readonly championship_id: number,
    public readonly name: string,
    public readonly type_id: number,
    public readonly format_id: number,
    public readonly state_id: number,
    public readonly season_id: number,
  ) {}

  static create(payload: any): [string?, CreateChampionshipDto?] {
    const {
      championship_id,
      name,
      type_id,
      format_id,
      state_id,
      season_id,
    } = payload ?? {};

    if (championship_id === undefined || Number.isNaN(Number(championship_id))) {
      return ['championship_id must be a number'];
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return ['name is required'];
    }

    if (type_id === undefined || Number.isNaN(Number(type_id))) {
      return ['type_id must be a number'];
    }

    if (format_id === undefined || Number.isNaN(Number(format_id))) {
      return ['format_id must be a number'];
    }

    if (state_id === undefined || Number.isNaN(Number(state_id))) {
      return ['state_id must be a number'];
    }

    if (season_id === undefined || Number.isNaN(Number(season_id))) {
      return ['season_id must be a number'];
    }

    
    if (name.trim().length > 40) {
      return ['name must be less than or equal to 40 characters'];
    }

    return [
      undefined,
      new CreateChampionshipDto(
        Number(championship_id),
        name.trim(),
        Number(type_id),
        Number(format_id),
        Number(state_id),
        Number(season_id),
      ),
    ];
  }
}