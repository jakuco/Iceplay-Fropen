export class CreateChampionshipTeamDto {
  private constructor(
    public readonly team_id: number,
    public readonly championship_id: number,
    public readonly inscription_date: Date,
  ) {}

  static create(payload: any): [string?, CreateChampionshipTeamDto?] {
    const { team_id, championship_id, inscription_date } = payload ?? {};

    if (team_id === undefined || Number.isNaN(Number(team_id))) {
      return ['team_id must be a number'];
    }

    if (championship_id === undefined || Number.isNaN(Number(championship_id))) {
      return ['championship_id must be a number'];
    }

    let dateValue: Date;
    if (inscription_date === undefined || inscription_date === null || inscription_date === '') {
      dateValue = new Date();
    } else {
      const d = new Date(inscription_date);
      if (Number.isNaN(d.getTime())) return ['inscription_date must be a valid date'];
      dateValue = d;
    }

    return [
      undefined,
      new CreateChampionshipTeamDto(
        Number(team_id),
        Number(championship_id),
        dateValue,
      ),
    ];
  }
}