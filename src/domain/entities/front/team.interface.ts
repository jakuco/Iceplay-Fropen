export interface ITeam {
  id: string;
  championshipId: string;
  organizationId: string;
  name: string;
  shortName: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  primaryColor: string;
  secondaryColor: string;
  foundedYear?: number;
  homeVenue?: string;
  city?: string;
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;
  isActive: boolean;
  hasActiveMatches: boolean;
  playersCount: number;
  createdAt: Date;
  updatedAt: Date;
}