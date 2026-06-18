export interface InviteResponse {
  inviteId: string;
  expiresAt: string;
  acceptUrl: string;
  resent: boolean;
  emailSent: boolean;
}

export interface BusinessProfile {
  legalName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: Record<string, string>;
  websiteUrl: string;
  allowedWebsiteOrigins: string[];
  social: Record<string, string>;
  logoUrl: string;
  hours: Array<Record<string, unknown>>;
  bookingSettings: Record<string, unknown>;
  publicExtras: Record<string, unknown>;
  status: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  cost: number;
  currency: string;
  images: Array<Record<string, unknown>>;
  category: string;
  status: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export type ProductListResponse = import('./api').PaginatedResponse<Product>;

export interface ImageAsset {
  url: string;
  alt?: string;
  order?: number;
}

export interface Cost {
  id: string;
  tenantId: string;
  label: string;
  amount: number;
  currency: string;
  category: string;
  productId: string | null;
  date: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  hours: Array<Record<string, unknown>>;
  images: Array<Record<string, unknown>>;
  primary: boolean;
  sortOrder: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface Testimonial {
  id: string;
  tenantId: string;
  author: string;
  quote: string;
  rating: number;
  photoUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  id: string;
  title: string;
  value: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
}

export interface ContentCollection {
  id: string;
  tenantId: string;
  key: string;
  label: string;
  description: string;
  items: ContentItem[];
  status: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface TeamMember {
  uid: string;
  email: string;
  role: string;
  joinedAt: string;
}

export interface PublishStatus {
  hasUnpublishedChanges: boolean;
  draftCounts: Record<string, number>;
  lastPublishedAt: string | null;
  lastVersion: number;
}

export interface PublishResult {
  snapshotId: string;
  version: number;
  publishedAt: string;
}

export interface DashboardStats {
  products: number;
  clients: number;
  testimonials: number;
  costs: number;
  hasUnpublishedChanges: boolean;
  lastPublishedAt: string | null;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  notes: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingListResponse = import('./api').PaginatedResponse<Booking>;
export type CostListResponse = import('./api').PaginatedResponse<Cost>;
export type ClientListResponse = import('./api').PaginatedResponse<Client>;
export type LocationListResponse = import('./api').PaginatedResponse<Location>;
export type TestimonialListResponse = import('./api').PaginatedResponse<Testimonial>;
export type ContentCollectionListResponse = import('./api').PaginatedResponse<ContentCollection>;
export type TeamListResponse = import('./api').PaginatedResponse<TeamMember>;
