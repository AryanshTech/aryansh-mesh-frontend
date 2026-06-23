export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'PLATFORM_ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string | null;
  avatarUrl?: string | null;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  businessName?: string;
}
