export interface GroupTeam {
  id: number;
  phaseId: number;
  name: string;
  type: string; // group | direct | playoff
  order: number;
}