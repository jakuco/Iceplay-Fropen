export class UpdateChampionshipTeamDto {
  private constructor(
    public readonly team_id?: number,
    public readonly championship_id?: number,
    public readonly inscription_date?: Date,
  ) {}

  static create(payload: any): [string?, UpdateChampionshipTeamDto?] {
    const { team_id, championship_id, inscription_date } = payload ?? {};

    const toNumberOrUndefined = (v: any, field: string): [string?, number?] => {
      if (v === undefined) return [undefined, undefined];
      const n = Number(v);
      if (Number.isNaN(n)) return [`${field} must be a number`];
      return [undefined, n];
    };

    const [e1, teamN] = toNumberOrUndefined(team_id, 'team_id');
    if (e1) return [e1];

    const [e2, champN] = toNumberOrUndefined(championship_id, 'championship_id');
    if (e2) return [e2];

    let dateValue: Date | undefined = undefined;
    if (inscription_date !== undefined) {
      const d = new Date(inscription_date);
      if (Number.isNaN(d.getTime())) return ['inscription_date must be a valid date'];
      dateValue = d;
    }

    return [
      undefined,
      new UpdateChampionshipTeamDto(teamN, champN, dateValue),
    ];
  }
}