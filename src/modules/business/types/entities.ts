// Type definitions mirror backend response DTOs in
// businessManagerBackend/src/main/java/com/aryansh/businessmanager/model/dto/response/

export interface DashboardSnapshot {
  productCount: number;
  bookingCount: number;
  clientCount: number;
  testimonialCount: number;
  costCount: number;
  publishStatus: 'PUBLISHED' | 'DRAFT' | 'PUBLISHING';
  lastPublishedAt: string | null;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
  }>;
}

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Product {
  id: string;
  tenantId?: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  price: number;
  cost?: number | null;
  currency: string;
  status: ProductStatus;
  images?: Array<Record<string, unknown>> | null;
  category?: string | null;
  sortOrder?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImageInput {
  url: string;
  alt?: string;
  order?: number;
}

export interface ProductInput {
  name: string;
  sku?: string;
  description?: string;
  price: number;
  currency: string;
  status: ProductStatus;
  category?: string;
  images?: ProductImageInput[];
}

export interface ProductView extends Product {
  imageUrl?: string | null;
  priceCents: number;
}

export interface Client {
  id: string;
  tenantId?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone?: string | null;
  partySize?: number | null;
  notes?: string | null;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | string;
  createdAt: string;
  updatedAt: string;
}

export interface Cost {
  id: string;
  tenantId?: string;
  label: string;
  amount: number;
  currency: string;
  category?: string | null;
  productId?: string | null;
  date: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  tenantId?: string;
  name: string;
  slug?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  hours?: Array<Record<string, unknown>> | null;
  images?: Array<Record<string, unknown>> | null;
  primary?: boolean;
  sortOrder?: number;
  status?: string;
}

export interface Testimonial {
  id: string;
  tenantId?: string;
  author: string;
  quote: string;
  rating?: number | null;
  photoUrl?: string | null;
  status?: string;
  sortOrder?: number | null;
}

export interface ContentItem {
  id: string;
  title?: string | null;
  value?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number | null;
}

export interface ContentCollection {
  id: string;
  tenantId?: string;
  key?: string;
  label: string;
  description?: string | null;
  items: ContentItem[];
  itemCount: number;
  status?: string;
}

export interface BusinessProfile {
  legalName: string;
  tagline?: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: Record<string, string> | null;
  websiteUrl?: string | null;
  allowedWebsiteOrigins?: string[] | null;
  social?: Record<string, string> | null;
  logoUrl?: string | null;
  hours?: Array<Record<string, unknown>> | null;
  bookingSettings?: Record<string, unknown> | null;
  publicExtras?: Record<string, unknown> | null;
  status: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface PublishStatus {
  hasUnpublishedChanges: boolean;
  draftCounts: Record<string, number>;
  lastPublishedAt: string | null;
  lastVersion: number | null;
  status: 'PUBLISHED' | 'DRAFT' | 'PUBLISHING';
  pendingChanges: number;
}
