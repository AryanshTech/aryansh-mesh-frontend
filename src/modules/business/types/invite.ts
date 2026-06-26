export interface InviteResponse {
  inviteId: string;
  expiresAt: string;
  acceptUrl: string;
  resent: boolean;
  emailSent: boolean;
}

export interface InvitePreview {
  email: string;
  tenantName: string;
  role: string;
  expiresAt: string;
}
