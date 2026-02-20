export class UpdateChampionshipDto {
  private constructor(
    public readonly name?: string,
    public readonly type_id?: number,
    public readonly format_id?: number,
    public readonly state_id?: number,
    public readonly season_id?: number,
  ) {}

  static create(payload: any): [string?, UpdateChampionshipDto?] {
    const {
      name,
      type_id,
      format_id,
      state_id,
      season_id,
    } = payload ?? {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return ['name must be a non-empty string'];
      }
      if (name.trim().length > 40) {
        return ['name must be less than or equal to 40 characters'];
      }
    }

    const toNumberOrUndefined = (v: any, field: string): [string?, number?] => {
      if (v === undefined) return [undefined, undefined];
      const n = Number(v);
      if (Number.isNaN(n)) return [`${field} must be a number`];
      return [undefined, n];
    };

    const [e1, typeN] = toNumberOrUndefined(type_id, 'type_id');
    if (e1) return [e1];

    const [e2, formatN] = toNumberOrUndefined(format_id, 'format_id');
    if (e2) return [e2];

    const [e3, stateN] = toNumberOrUndefined(state_id, 'state_id');
    if (e3) return [e3];

    const [e4, seasonN] = toNumberOrUndefined(season_id, 'season_id');
    if (e4) return [e4];

    return [
      undefined,
      new UpdateChampionshipDto(
        name !== undefined ? name.trim() : undefined,
        typeN,
        formatN,
        stateN,
        seasonN,
      ),
    ];
  }
}