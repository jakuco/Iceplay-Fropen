export class CreatePlayerDto {

  private constructor(
    public readonly player_id: number,
    public readonly number: number,
    public readonly name: string,
    public readonly lastname: string,
    public readonly weight: number,
    public readonly height: number,
    public readonly primary_position: number,
    public readonly secondary_position: number,
    public readonly home_country: string,
    public readonly state_id: number,
    public readonly type: number,
    public readonly team_id: number,
    public readonly player_statics: any
  ) {}

  static create(payload: any): [string?, CreatePlayerDto?] {

    const {
      player_id,
      number,
      name,
      lastname,
      weight,
      height,
      primary_position,
      secondary_position,
      home_country,
      state_id,
      type,
      team_id,
      player_statics
    } = payload ?? {};

    if (player_id === undefined || isNaN(Number(player_id)))
      return ['player_id must be a number'];

    if (!name || typeof name !== 'string')
      return ['name is required'];

    if (!lastname || typeof lastname !== 'string')
      return ['lastname is required'];

    if (number === undefined || isNaN(Number(number)))
      return ['number must be a number'];

    if (team_id === undefined || isNaN(Number(team_id)))
      return ['team_id must be a number'];

    return [
      undefined,
      new CreatePlayerDto(
        Number(player_id),
        Number(number),
        name.trim(),
        lastname.trim(),
        Number(weight ?? 0),
        Number(height ?? 0),
        Number(primary_position ?? 0),
        Number(secondary_position ?? 0),
        home_country ?? '',
        Number(state_id ?? 0),
        Number(type ?? 0),
        Number(team_id),
        player_statics ?? {}
      )
    ];
  }
}
