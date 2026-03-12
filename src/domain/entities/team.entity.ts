export interface Team {
  id: number;
  championshipId: number;
  name: string;
  shortname: string;
  slug: string;
  logoUrl: string;
  documentURL: string;
  primaryColor: string;
  secondaryColor: string;
  foundedYear: number;
  homeVenue: number;
  location: string;
  isActive: boolean;
  hasActiveMatches: boolean;
  coachName: string;
  coachPhone: string;
}