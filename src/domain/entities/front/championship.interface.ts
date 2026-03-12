export interface IChampionship {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  sport: 'football' | 'basketball' | 'volleyball';
  format: 'league' | 'knockout' | 'group_stage' | 'mixed';
  season: string;
  status: 'draft' | 'registration' | 'active' | 'finished' | 'cancelled';
  logo?: string;
  coverImage?: string;
  settings: {
    pointsForWin: number;
    pointsForDraw: number;
    pointsForLoss: number;
    roundsCount: number;
    teamsPerGroup?: number;
    teamsAdvancePerGroup?: number;
    tiebreakers: string[];
    allowDraws: boolean;
    extraTimeAllowed: boolean;
    penaltyShootoutAllowed: boolean;
  };
  registrationStartDate?: Date;
  registrationEndDate?: Date;
  startDate: Date;
  endDate?: Date;
  totalTeams: number;
  totalMatches: number;
  matchesPlayed: number;
  createdAt: Date;
  updatedAt: Date;
}