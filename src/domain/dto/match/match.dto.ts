// src/domain/dto/match/match.dto.ts
export interface MatchDto {
  id: string;
  championshipId: string;
  homeTeamId: string;
  awayTeamId: string;

  scheduledDate: string; // ISO string
  scheduledTime: string; // "HH:mm"
  actualStartTime?: string;
  actualEndTime?: string;
  venue?: string;
  city?: string;
  elapsedSeconds?: number;

  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'live' | 'finished' | 'suspended' | 'postponed' | 'cancelled' | string;

  //createdAt: string;
  //updatedAt: string;
}
