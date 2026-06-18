export type Role =
  | 'platform_super_admin'
  | 'tenant_owner'
  | 'tenant_admin'
  | 'tenant_editor'
  | 'tenant_viewer';

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
}

export interface MeResponse {
  uid: string;
  email: string;
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
