export interface Championship{
  id: string; 
  organizationId: number;
  sportId: number;
  name: string;
  slug: string;
  description: string;
  season: string;
  logo: string;
  status: number;
  registrationStartDate: Date;
  registrationEndDate: Date;
  startDate: Date;
  endDate: Date;
  maxTeams: number;
  maxPlayersPerTeam: number;
  createdAt: Date;
  updatedAt: Date;
}