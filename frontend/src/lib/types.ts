export type FuelType = 'ESSENCE' | 'DIESEL' | 'ELECTRIQUE' | 'HYBRIDE' | 'GPL';
export type Transmission = 'MANUELLE' | 'AUTOMATIQUE';
export type BodyType =
  | 'BERLINE'
  | 'CITADINE'
  | 'SUV'
  | 'BREAK'
  | 'COUPE'
  | 'CABRIOLET'
  | 'MONOSPACE'
  | 'UTILITAIRE';
export type VehicleStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'DRAFT';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  isActive: boolean;
  _count?: { vehicles: number };
}

export interface VehicleImage {
  id: string;
  url: string;
  alt?: string | null;
  order: number;
}

export interface Vehicle {
  id: string;
  slug: string;
  brandId: string;
  brand: Brand;
  model: string;
  version?: string | null;
  year: number;
  price: string; // Decimal Prisma sérialisé en string via JSON
  mileage: number;
  fuelType: FuelType;
  transmission: Transmission;
  bodyType?: BodyType | null;
  doors?: number | null;
  seats?: number | null;
  power?: number | null;
  color?: string | null;
  city: string;
  postalCode: string;
  region?: string | null;
  description: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  status: VehicleStatus;
  isFeatured: boolean;
  viewsCount: number;
  images: VehicleImage[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface VehicleSearchParams {
  brandId?: string;
  model?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  fuelType?: FuelType;
  transmission?: Transmission;
  bodyType?: BodyType;
  status?: VehicleStatus;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'year_asc' | 'year_desc' | 'mileage_asc' | 'recent';
  page?: number;
  limit?: number;
}

export interface AdminSession {
  id: string;
  email: string;
  role: 'ADMIN' | 'SUPERADMIN';
}
