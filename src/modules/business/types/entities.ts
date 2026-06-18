export type { Role, SessionResponse, MeResponse } from './auth';
export type { ApiErrorBody, ApiErrorDetail, PaginatedResponse } from './api';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  currency: string;
  timezone: string;
  onboardingComplete: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export type TenantListResponse = import('./api').PaginatedResponse<Tenant>;
