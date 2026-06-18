import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { queryKeys } from '@/modules/business/api/query-keys';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import type { InviteResponse, TeamListResponse, TeamMember } from '@/modules/business/types/tenant-api';
import type { Role } from '@/modules/business/types/auth';

export function useTeamMembers() {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.team(tenantId),
    queryFn: async () => {
      const response = await api.get<TeamListResponse | TeamMember[]>(
        `/tenants/${tenantId}/members`,
      );
      if (Array.isArray(response)) {
        return { items: response, page: 0, size: response.length, total: response.length, totalPages: 1 };
      }
      return response;
    },
    enabled: Boolean(tenantId),
  });
}

export interface InviteMemberInput {
  email: string;
  role: Role;
}

export function useInviteMember() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InviteMemberInput) =>
      api.post<InviteResponse>(`/tenants/${tenantId}/members/invite`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.team(tenantId) });
    },
  });
}

export function useUpdateMemberRole() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: Role }) =>
      api.patch<TeamMember>(`/tenants/${tenantId}/members/${uid}`, { role }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.team(tenantId) });
    },
  });
}

export function useRemoveMember() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) =>
      api.delete<void>(`/tenants/${tenantId}/members/${uid}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.team(tenantId) });
    },
  });
}
