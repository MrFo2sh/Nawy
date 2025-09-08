export interface Apartment {
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
  userId: string; // User who created this apartment
  createdAt: string;
  updatedAt: string;
}

export interface ApartmentCreateRequest {
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

export interface ApartmentUpdateRequest
  extends Partial<ApartmentCreateRequest> {}

export interface ApartmentFilters {
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

export interface ApartmentStats {
  total: number;
  available: number;
  unavailable: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
  bedroomDistribution: { [key: number]: number };
  projectCounts: { [key: string]: number };
}
