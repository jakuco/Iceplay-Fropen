export class CreateTeamDto {
  private constructor(
    public readonly team_id: number,
    public readonly name: string,
    public readonly shortname: string,
    public readonly city: string,
    public readonly coach_id: number,
  ) {}

  static create(payload: any): [string?, CreateTeamDto?] {
    const { team_id, name, shortname, city, coach_id } = payload ?? {};

    if (team_id === undefined || isNaN(Number(team_id))) return ['team_id must be a number'];
    if (!name || typeof name !== 'string') return ['name is required'];
    if (!shortname || typeof shortname !== 'string') return ['shortname is required'];
    if (!city || typeof city !== 'string') return ['city is required'];
    if (coach_id === undefined || isNaN(Number(coach_id))) return ['coach_id must be a number'];

    return [undefined, new CreateTeamDto(
      Number(team_id),
      name.trim(),
      shortname.trim(),
      city.trim(),
      Number(coach_id),
    )];
  }
}
