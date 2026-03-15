export interface IOrganization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  settings?: {
    defaultSport: 'football' | 'basketball' | 'volleyball';
    timezone: string;
    locale: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}