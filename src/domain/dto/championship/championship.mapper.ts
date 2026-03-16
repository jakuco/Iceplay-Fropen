// src/domain/dto/championship/championship.mapper.ts
import { IChampionship } from "../../../data/mongo/models/championship.model";
import { ChampionshipDto, ChampionshipFormat, ChampionshipStatus, ChampionshipSettings, TiebreakerRule } from "./championship.dto";

export function mapFormat(typeId: number): ChampionshipFormat {
  switch (typeId) {
    case 1: return 'league';
    case 2: return 'knockout';
    case 3: return 'group_stage';
    case 4: return 'mixed';
    default: return 'league';
  }
}

export function mapStatus(stateId: number): ChampionshipStatus {
  switch (stateId) {
    case 0: return 'draft';
    case 1: return 'registration';
    case 2: return 'active';
    case 3: return 'finished';
    case 4: return 'cancelled';
    default: return 'draft';
  }
}


export function toChampionshipDto(championship: IChampionship): ChampionshipDto {
  return {
    id: championship.id.toString(),
    organizationId: championship.organizationId.toString(),
    name: championship.name,
    sport: "football",

    format: mapFormat(0),
    season: championship.season,

    status: mapStatus(championship.status),

    settings: {
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
      roundsCount: 2,
      tiebreakers: ['goal_difference'],
      allowDraws: false,
      extraTimeAllowed: true,
      penaltyShootoutAllowed: true,
    },

    startDate: championship.startDate ?? new Date(),

    totalTeams: 0,
    totalMatches: 0,
    matchesPlayed: 0,
  };
}
