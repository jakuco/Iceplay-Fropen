

export interface TeamDTO {
  id: string;
  //championshipId: string;
  //organizationId: string; // Denormalized for queries
  name: string;
  shortName: string; // "FCB", "RMA"
  //slug: string;
  logo?: string;
  //coverImage?: string;

  // Colors
  //primaryColor: string;
  //secondaryColor: string;

  // Information
  //foundedYear?: number;
  //homeVenue?: string;
  city?: string;
  
  // Contact
  //managerName?: string;
  //managerPhone?: string;
  //managerEmail?: string;
  coachId?: number;

  // State
  //isActive: boolean;
  //hasActiveMatches: boolean; // Prevents deletion if has matches

  // Summary statistics (denormalized)
  //playersCount: number;

  //createdAt: Date;
  //updatedAt: Date;


  /*
  team_id: number; 
  name: string;
  shortname: string;
  city: string;
  coach_id: number;
  */
}