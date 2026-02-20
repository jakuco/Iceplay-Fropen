export class CreateMatchPlayerDto {

  private constructor(
    public readonly player_id: number,
    public readonly match_id: number,
    public readonly score: number
  ) {}

  static create(payload: any): [string?, CreateMatchPlayerDto?] {

    const { player_id, match_id, score } = payload ?? {};

    if (player_id === undefined || isNaN(Number(player_id))) {
      return ['player_id must be a number'];
    }

    if (match_id === undefined || isNaN(Number(match_id))) {
      return ['match_id must be a number'];
    }

    return [
      undefined,
      new CreateMatchPlayerDto(
        Number(player_id),
        Number(match_id),
        Number(score ?? 0)
      )
    ];
  }
}
