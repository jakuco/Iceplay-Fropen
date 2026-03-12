export interface Organization {
    id: number;
    name: string;
    slug: string;
    description: string;
    logo: string;
    contactEmail: string;
    contactPhone: string;
    city: string;
    country: string;
    primaryColor: string;
    secondaryColor: string;
    creactedAt: Date;
    updatedAt: Date;
}