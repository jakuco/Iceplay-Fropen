// src/domain/dto/team/team.mapper.ts
import { ITeam } from "../../../data/mongo/models/team.model";
import { TeamDTO } from "./team.dto";

export function toTeamDto(team: ITeam): TeamDTO {
  return {
    id: team.id.toString(),
    name: team.name,
    shortName: team.shortname,
    city: team.location ?? undefined,
    coachId: undefined,
  };
}
