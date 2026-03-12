export interface Phase {
  id: number;
  championshipId: number;
  name: string;
  phaseType: string; // swiss | league | knockout | groups
  phaseOrder: number;
  status: string;
}

export interface PhaseSwiss {
  id: number;
  phaseId: number;
  numRounds: number;
  pairingSystem: string;
  firstRound: string;
  allowRematch: boolean;
  tiebreakOrder: string;
  directAdvancedCount: number;
  playoffCount: number;
}

export interface PhaseLeague {
  id: number;
  phaseId: number;
  legs: number;
  tiebreakOrder: string;
  advanceCount: number;
}

export interface PhaseKnockout {
  id: number;
  phaseId: number;
  legs: number;
  fixtureMode: string;
  seeding: string;
  byeStrategy: string;
  tieBreak: string;
  awayGoalsRule: boolean;
  thirdPlaceMatch: boolean;
}

export interface PhaseGroups {
  id: number;
  phaseId: number;
  numGroups: number;
  teamsPerGroup: number;
  assignment: string;
  legs: number;
  advancePerGroup: number;
  advanceBestThirds: number;
  tiebreakOrder: string;
}