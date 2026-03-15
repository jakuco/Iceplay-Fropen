export interface Match {
  id: number;
  groupTeamId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
  status: string;
  round: number;
  matchday: number;
  scheduledDate: Date;
  scheduledTime: string;
  actualStartTime: Date;
  actualEndTime: Date;
  venue: string;
  city: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TypeMatchEvent {
  id: number;
  label: string;
  icon: string;
  color: string;
  matchPoint: number;
  category: string; // scoring | card | substitution | other
  standingPoints: number;
}

export interface MatchEvent {
  matchId: number;
  typeMatchEventId: number;
  playerId: number;
  teamId: number;
  time: number; // en segundos
}