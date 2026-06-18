export type Role =
  | 'platform_super_admin'
  | 'tenant_owner'
  | 'tenant_admin'
  | 'tenant_editor'
  | 'tenant_viewer';

export type MarketingRole = 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface SessionResponse {
  uid: string;
  email: string;
  displayName: string | null;
  accessLevel?: string;
  businessRole?: string | null;
  role: Role;
  tenantId: string | null;
  tenantName: string | null;
  tenantSlug: string | null;
  onboardingComplete: boolean;
  services?: string[];
}

export interface MeResponse {
  uid: string;
  email: string;
  displayName?: string;
  accessLevel?: string;
  role: Role | null;
  tenantId: string | null;
}

export interface InvitePreviewResponse {
  email: string;
  tenantName: string;
  role: Role;
  expiresAt: string;
  status: string;
}
