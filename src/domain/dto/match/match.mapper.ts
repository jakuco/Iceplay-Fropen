// src/domain/dto/match/match.mapper.ts
import { IMatch } from "../../../data/mongo/models/match.model";
import { MatchDto } from "./match.dto";

export function toMatchDto(match: IMatch): MatchDto {
  return {
    id: match.match_id.toString(),
    championshipId: match.championship_id.toString(),
    homeTeamId: match.home_team_id.toString(),
    awayTeamId: match.away_team_id.toString(),

    scheduledDate: match.date.toISOString(),
    scheduledTime: match.date.toISOString().substring(11, 16), // HH:mm
    /*actualStartTime: match.actualStartTime?.toISOString(),
    actualEndTime: match.actualEndTime?.toISOString(),*/
    venue: match.venue,
    city: match.city,

    homeScore: calculateScore(match.match_events, "home"),
    awayScore: calculateScore(match.match_events, "away"),
    status: mapStateToStatus(match.state),
    elapsedSeconds: 0,

    //createdAt: match.createdAt.toISOString(),
    //updatedAt: match.updatedAt.toISOString(),
  };
}

function calculateScore(events: any[], team: "home" | "away"): number {
  return events?.filter(e => e.event === "goal" && e.team === team).length ?? 0;
}

function mapStateToStatus(state: number): string {
  switch (state) {
    case 0: return "scheduled";
    case 1: return "live";
    case 2: return "finished";
    case 3: return "suspended";
    case 4: return "postponed";
    case 5: return "cancelled";
    default: return "unknown";
  }
}
