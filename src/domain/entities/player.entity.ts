export interface Player {
  id: number;
  teamId: number;
  positionId: number;
  firstName: string;
  lastName: string;
  nickName: string;
  number: number;
  birthDate: Date;
  height: number;
  weight: number;
  status: string;
  suspensionEndDate: Date;
  suspensionReason: string;
  createdAt: Date;
  updatedAt: Date;
}