// src/domain/dto/championship/championship.mapper.ts
import { IChampionship } from "../../../data/mongo/models/championship.model";
//import { ChampionshipDto } from "./championship.dto";
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
    id: championship.championship_id.toString(),
    organizationId: "0",
    name: championship.name,
    sport: "football", // Assuming football for now, could be dynamic

    format: mapFormat(championship.type_id), // Map type_id to format enum
    season: "2025-2026", // Placeholder, should be derived from season_id
    
    status: mapStatus(championship.state_id),

    settings: {
      // Points per result (League format)
      pointsForWin: 3, // Default: 3
      pointsForDraw: 1, // Default: 1
      pointsForLoss: 0, // Default: 0
    
      // Format configuration
      roundsCount: 2, // 1 = single round, 2 = home and away
      //teamsPerGroup?: number; // For group stage format
      //teamsAdvancePerGroup?: number;
    
      // Tiebreaker rules (in priority order)
      tiebreakers: ['goal_difference'],
    
      // Match rules
      allowDraws: false, // Volleyball: false
      extraTimeAllowed: true,
      penaltyShootoutAllowed: true,
    },
    
    // Dates
    //registrationStartDate?: Date,
    //registrationEndDate?: Date,
    startDate: new Date(), // Placeholder, should be derived from championship data
    //endDate?: Date,
    
    // Summary statistics (denormalized for performance)
    totalTeams: 0,
    totalMatches: 0,
    matchesPlayed: 0,
    
    //scheduledDate: championship.date.toISOString()
    //scheduledTime: championship.date.toISOString().substring(11, 16), // HH:mm
    /*actualStartTime: championship.actualStartTime?.toISOString(),
    actualEndTime: championship.actualEndTime?.toISOString(),*/

    //status: mapStateToStatus(championship.state),

    //createdAt: championship.createdAt.toISOString(),
    //updatedAt: championship.updatedAt.toISOString(),
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
