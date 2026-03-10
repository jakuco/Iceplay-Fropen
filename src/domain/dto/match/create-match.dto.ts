export class CreateMatchDto {

  private constructor(
    public readonly match_id: number,
    public readonly championship_id: number,
    public readonly home_team_id: number,
    public readonly away_team_id: number,
    public readonly date: Date,
    public readonly state: number,
    public readonly city: string,
    public readonly venue: string,
    public readonly match_events?: any
  ) {}

  static create(payload: any): [string?, CreateMatchDto?] {

    const {
      match_id,
      championship_id,
      home_team_id,
      away_team_id,
      date,
      state,
      city,
      venue,
      match_events
    } = payload ?? {};

    if (match_id === undefined || isNaN(Number(match_id))) {
      return ["match_id must be a number"];
    }

    if (championship_id === undefined || isNaN(Number(championship_id))) {
      return ["championship_id must be a number"];
    }

    if (home_team_id === undefined || isNaN(Number(home_team_id))) {
      return ["home_team_id must be a number"];
    }

    if (away_team_id === undefined || isNaN(Number(away_team_id))) {
      return ["away_team_id must be a number"];
    }

    if (!date) {
      return ["date is required"];
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return ["date must be a valid date"];
    }

    if (state === undefined || isNaN(Number(state))) {
      return ["state must be a number"];
    }

    // regla básica: no permitir mismo equipo
    if (Number(home_team_id) === Number(away_team_id)) {
      return ["home_team_id and away_team_id must be different"];
    }

    return [
      undefined,
      new CreateMatchDto(
        Number(match_id),
        Number(championship_id),
        Number(home_team_id),
        Number(away_team_id),
        dateObj,
        Number(state),
        String(city),
        String(venue),
        match_events ?? undefined
      )
    ];
  }
}
