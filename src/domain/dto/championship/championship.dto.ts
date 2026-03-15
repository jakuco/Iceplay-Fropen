
export type ChampionshipStatus = 'draft' | 'registration' | 'active' | 'finished' | 'cancelled';
export type ChampionshipFormat = 'league' | 'knockout' | 'group_stage' | 'mixed';
export type TiebreakerRule =
  | 'goal_difference'
  | 'goals_for'
  | 'head_to_head'
  | 'head_to_head_goal_difference'
  | 'points_in_head_to_head'
  | 'fair_play';

export interface ChampionshipSettings {
  // Points per result (League format)
  pointsForWin: number; // Default: 3
  pointsForDraw: number; // Default: 1
  pointsForLoss: number; // Default: 0

  // Format configuration
  roundsCount: number; // 1 = single round, 2 = home and away
  teamsPerGroup?: number; // For group stage format
  teamsAdvancePerGroup?: number;

  // Tiebreaker rules (in priority order)
  tiebreakers: TiebreakerRule[];

  // Match rules
  allowDraws: boolean; // Volleyball: false
  extraTimeAllowed: boolean;
  penaltyShootoutAllowed: boolean;
}



export interface ChampionshipDto {
  id: string;
  organizationId: string;
  name: string;
  //slug: string;
  //description?: string;
  //sport: Sport;
  sport: string;
  format: ChampionshipFormat;
  season: string; // "2024-2025"
  status: ChampionshipStatus;
  logo?: string;
  coverImage?: string;

  // Tournament configuration
  settings: ChampionshipSettings;

  // Dates
  registrationStartDate?: Date;
  registrationEndDate?: Date;
  startDate: Date;
  endDate?: Date;

  // Summary statistics (denormalized for performance)
  totalTeams: number;
  totalMatches: number;
  matchesPlayed: number;

  //createdAt: Date;
  //updatedAt: Date;

  /*
  export interface IChampionship extends Document {
    championship_id: number;
    name: string;
    type_id: number;
    format_id: number;
    state_id: number;
    season_id: number;
  } 
  */
}

export function mapFormat(typeId: number): ChampionshipFormat {
  switch (typeId) {
    case 1: return 'league';
    case 2: return 'knockout';
    case 3: return 'group_stage';
    case 4: return 'mixed';
    default: return 'league'; // valor por defecto
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
