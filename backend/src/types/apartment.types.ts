import { Document, Types } from "mongoose";

export interface IApartment extends Document {
  _id: string;
  unitName: string;
  unitNumber: string;
  project: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  price: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  floorPlan?: string;
  petPolicy: "allowed" | "not-allowed" | "conditional";
  parkingSpaces: number;
  leaseTerms: string[];
  contactEmail: string;
  contactPhone: string;
  virtualTourUrl?: string;
  userId: Types.ObjectId; // User who created this apartment
  createdAt: Date;
  updatedAt: Date;
}

export interface ApartmentCreateDTO {
  unitName: string;
  unitNumber: string;
  project: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  price: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  amenities: string[];
  images?: string[];
  isAvailable?: boolean;
  floorPlan?: string;
  petPolicy: "allowed" | "not-allowed" | "conditional";
  parkingSpaces: number;
  leaseTerms: string[];
  contactEmail: string;
  contactPhone: string;
  virtualTourUrl?: string;
}

export interface ApartmentUpdateDTO extends Partial<ApartmentCreateDTO> {}

export interface ApartmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  unitName?: string;
  unitNumber?: string;
  project?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  state?: string;
  isAvailable?: boolean;
  petPolicy?: "allowed" | "not-allowed" | "conditional";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
