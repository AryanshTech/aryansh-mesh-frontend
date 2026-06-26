import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import type { InviteResponse } from '@/modules/business/types/invite';

export interface Member {
  uid: string;
  email: string;
  name?: string;
  role: string;
  joinedAt: string;
}

export interface InviteInput {
  email: string;
  role: string;
}

export function useMembers(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['members', tenantId],
    queryFn: () =>
      api.get<{ items: Member[]; total: number } | Member[]>(
        `/tenants/${tenantId!}/members`,
      ),
    enabled: !!tenantId,
    select: (data) => (Array.isArray(data) ? { items: data, total: data.length } : data),
  });
}

export function useInviteMember(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteInput) =>
      api.post<InviteResponse>(`/tenants/${tenantId}/members/invite`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['members', tenantId] });
    },
  });
}

export function useUpdateMember(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: string }) =>
      api.patch<Member>(`/tenants/${tenantId}/members/${uid}`, { role }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['members', tenantId] });
    },
  });
}

export function useRemoveMember(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) =>
      api.delete<void>(`/tenants/${tenantId}/members/${uid}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['members', tenantId] });
    },
  });
}
