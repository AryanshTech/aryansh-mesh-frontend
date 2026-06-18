import { useMutation } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type { InviteResponse } from '@/modules/business/types/tenant-api';

export interface InviteOwnerInput {
  tenantId: string;
  email: string;
  role: 'tenant_owner';
}

export function useInviteOwner() {
  return useMutation({
    mutationFn: ({ tenantId, email, role }: InviteOwnerInput) =>
      api.post<InviteResponse>(`/tenants/${tenantId}/members/invite`, {
        email,
        role,
      }),
  });
}
