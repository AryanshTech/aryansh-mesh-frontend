import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';

export type SocialPlatform =
  | 'LINKEDIN'
  | 'X'
  | 'THREADS'
  | 'BLUESKY'
  | 'MASTODON'
  | 'INSTAGRAM'
  | 'TIKTOK'
  | 'YOUTUBE'
  | 'PRODUCT_HUNT'
  | 'FACEBOOK'
  | 'PINTEREST'
  | 'REDDIT';

export type SocialPostStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SCHEDULED' | 'REJECTED';

export interface SocialPost {
  id: string;
  projectId: string;
  platform: SocialPlatform;
  scheduledDate?: string | null;
  content: string;
  formatType?: string | null;
  status: SocialPostStatus;
  typefullyDraftId?: string | null;
  createdAt: string;
}

export interface SocialPostInput {
  content: string;
  platform: SocialPlatform;
  formatType?: string;
  scheduledDate?: string;
}

function socialRoot(projectId: string, tenantId?: string, suffix = ''): string {
  const base = tenantId
    ? `/tenants/${tenantId}/marketing/social-posts`
    : `/projects/${projectId}/social-posts`;
  return `${base}${suffix}`;
}

function scopeKey(projectId: string, tenantId?: string): string {
  return tenantId ? `tenant:${tenantId}` : `project:${projectId}`;
}

export function useSocialPosts(
  projectId: string | undefined,
  tenantId?: string,
  enabled = true,
) {
  const key = scopeKey(projectId ?? '', tenantId);
  return useQuery({
    queryKey: ['marketing', 'social-posts', key],
    queryFn: async () => {
      const rows = await api.get<SocialPost[]>(socialRoot(projectId!, tenantId));
      return { items: rows ?? [], total: rows?.length ?? 0 };
    },
    enabled: enabled && (!!projectId || !!tenantId),
  });
}

export function useCreateSocialPost(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  const key = scopeKey(projectId, tenantId);
  return useMutation({
    mutationFn: (input: SocialPostInput) =>
      api.post<SocialPost>(socialRoot(projectId, tenantId), {
        platform: input.platform,
        content: input.content,
        formatType: input.formatType,
        scheduledDate: input.scheduledDate,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['marketing', 'social-posts', key] });
    },
  });
}

export function useApproveSocialPost(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  const key = scopeKey(projectId, tenantId);
  return useMutation({
    mutationFn: (postId: string) =>
      api.post<SocialPost>(socialRoot(projectId, tenantId, `/${postId}/approve`)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['marketing', 'social-posts', key] });
    },
  });
}

export function useRejectSocialPost(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  const key = scopeKey(projectId, tenantId);
  return useMutation({
    mutationFn: ({ postId, feedback }: { postId: string; feedback: string }) =>
      api.post<SocialPost>(socialRoot(projectId, tenantId, `/${postId}/reject`), { feedback }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['marketing', 'social-posts', key] });
    },
  });
}

export function useScheduleSocialPost(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  const key = scopeKey(projectId, tenantId);
  return useMutation({
    mutationFn: (postId: string) =>
      api.post<SocialPost>(socialRoot(projectId, tenantId, `/${postId}/schedule`)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['marketing', 'social-posts', key] });
    },
  });
}
