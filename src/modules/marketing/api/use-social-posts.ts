import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';

export interface SocialPost {
  id: string;
  content: string;
  status: 'DRAFT' | 'APPROVED' | 'SCHEDULED' | 'REJECTED';
  scheduledAt?: string;
  platform?: string;
  createdAt: string;
}

export interface SocialPostInput {
  content: string;
  platform?: string;
  scheduledAt?: string;
}

export function useSocialPosts(projectId: string | undefined) {
  return useQuery({
    queryKey: ['marketing', 'social-posts', projectId],
    queryFn: () =>
      api.get<{ items: SocialPost[]; total: number } | SocialPost[]>(
        `/projects/${projectId!}/social-posts`,
      ),
    enabled: !!projectId,
    select: (data) => (Array.isArray(data) ? { items: data, total: data.length } : data),
  });
}

export function useCreateSocialPost(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SocialPostInput) =>
      api.post<SocialPost>(`/projects/${projectId}/social-posts`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['marketing', 'social-posts', projectId] });
    },
  });
}

export function useApproveSocialPost(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      api.post<SocialPost>(`/social-posts/${postId}/approve`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['marketing', 'social-posts', projectId] });
    },
  });
}

export function useRejectSocialPost(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      api.post<SocialPost>(`/social-posts/${postId}/reject`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['marketing', 'social-posts', projectId] });
    },
  });
}

export function useScheduleSocialPost(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, scheduledAt }: { postId: string; scheduledAt: string }) =>
      api.post<SocialPost>(`/social-posts/${postId}/schedule`, { scheduledAt }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['marketing', 'social-posts', projectId] });
    },
  });
}
