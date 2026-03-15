// src/domain/dto/team/team.mapper.ts
import { ITeam } from "../../../data/mongo/models/team.model";
import { TeamDTO } from "./team.dto";

export function toTeamDto(team: ITeam): TeamDTO {
  return {
    id: team.team_id.toString(),
    name: team.name,
    shortName: team.shortname,
    city: team.city,
    coachId: team.coach_id,

    //createdAt: team.createdAt.toISOString(),
    //updatedAt: team.updatedAt.toISOString(),
  };
}

function calculateScore(events: any[], team: "home" | "away"): number {
  return events?.filter(e => e.event === "goal" && e.team === team).length ?? 0;
}

function mapStateToStatus(state: number): string {
  /*switch (state) {
    case 0: return "scheduled";
    case 1: return "live";
    case 2: return "finished";
    case 3: return "suspended";
    case 4: return "postponed";
    case 5: return "cancelled";
    default: return "unknown";
  }*/
    return "unknown";
}
