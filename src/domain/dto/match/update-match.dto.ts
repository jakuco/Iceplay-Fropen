export class UpdateMatchDto {

  private constructor(
    public readonly championship_id?: number,
    public readonly home_team_id?: number,
    public readonly away_team_id?: number,
    public readonly date?: Date,
    public readonly state?: number,
    public readonly match_events?: any
  ) {}

  static create(payload: any): [string?, UpdateMatchDto?] {

    const {
      championship_id,
      home_team_id,
      away_team_id,
      date,
      state,
      match_events
    } = payload ?? {};

    if (home_team_id && away_team_id) {
      if (Number(home_team_id) === Number(away_team_id)) {
        return ["home_team_id and away_team_id must be different"];
      }
    }

    return [
      undefined,
      new UpdateMatchDto(
        championship_id !== undefined ? Number(championship_id) : undefined,
        home_team_id !== undefined ? Number(home_team_id) : undefined,
        away_team_id !== undefined ? Number(away_team_id) : undefined,
        date ? new Date(date) : undefined,
        state !== undefined ? Number(state) : undefined,
        match_events
      )
    ];
  }
}
