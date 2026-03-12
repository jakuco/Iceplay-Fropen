export interface IMatch {
  id: string;
  championshipId: string;
  organizationId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status:
    | 'scheduled'
    | 'warmup'
    | 'live'
    | 'halftime'
    | 'break'
    | 'overtime'
    | 'penalties'
    | 'finished'
    | 'suspended'
    | 'postponed'
    | 'cancelled';
  round: number;
  matchday: number;
  group?: string;
  stage?: string;
  scheduledDate: Date;
  scheduledTime: string;
  actualStartTime?: Date;
  actualEndTime?: Date;
  venue?: string;
  city?: string;
  referee?: string;
  assistantReferee1?: string;
  assistantReferee2?: string;
  currentPeriod: number;
  elapsedSeconds: number;
  isClockRunning: boolean;
  // Calculado: agregado desde matchEvents por periodo
  periodScores: {
    period: number;
    homeScore: number;
    awayScore: number;
  }[];
  // Volleyball
  homeSets?: number;
  awaySets?: number;
  notes?: string;
  isHighlighted: boolean;
  streamUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}