import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type { InvitePreview } from '@/modules/business/types/invite';

export function useInvitePreview(token: string | undefined) {
  return useQuery({
    queryKey: ['invite-preview', token],
    queryFn: () => api.get<InvitePreview>(`/public/invites/${token!}`, { skipAuth: true }),
    enabled: Boolean(token),
    retry: false,
  });
}
