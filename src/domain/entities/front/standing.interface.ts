export interface IStanding {
  id: string;
  championshipId: string;
  teamId: string;
  group?: string;
  position: number;
  previousPosition?: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  // Calculado: últimos resultados del equipo
  form: ('W' | 'D' | 'L')[];
  // Volleyball
  setsWon?: number;
  setsLost?: number;
  setsDifference?: number;
  pointsRatio?: number;
  updatedAt: Date;
}