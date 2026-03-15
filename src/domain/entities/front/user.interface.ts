export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin';
  organizationId?: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}