export interface IEvent {
  id: string;
  matchId: string;
  championshipId: string;
  type: string;
  playerId: string;
  teamId: string;
  relatedPlayerId?: string;
  period: number;
  minute: number;
  extraMinute?: number;
  description?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}