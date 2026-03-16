// src/domain/dto/match/match.mapper.ts
import { IMatch } from "../../../data/mongo/models/match.model";
import { MatchDto } from "./match.dto";

export function toMatchDto(match: IMatch): MatchDto {
  return {
    id: match.id.toString(),
    championshipId: "0",
    homeTeamId: match.homeTeamId.toString(),
    awayTeamId: match.awayTeamId.toString(),

    scheduledDate: match.scheduledDate?.toISOString() ?? new Date().toISOString(),
    scheduledTime: match.scheduledDate?.toISOString().substring(11, 16) ?? "00:00",
    venue: match.venue ?? undefined,
    city: match.city ?? undefined,

    homeScore: match.homeScore,
    awayScore: match.awayScore,
    status: match.status,
    elapsedSeconds: 0,
  };
}
