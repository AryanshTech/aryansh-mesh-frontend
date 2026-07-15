import { useMutation } from '@tanstack/react-query';
import { api } from '@/core/api/client';

export type FeedbackRating = 'like' | 'dislike';

function feedbackRoot(projectId: string, tenantId?: string) {
  return tenantId
    ? `/tenants/${tenantId}/marketing/content-feedback`
    : `/projects/${projectId}/content-feedback`;
}

export function useContentFeedbackRating(projectId: string, tenantId?: string) {
  return useMutation({
    mutationFn: (input: {
      targetId: string;
      rating: FeedbackRating;
      targetType?: 'CREATIVE_RUN' | 'CONTENT' | 'SOCIAL_POST';
    }) =>
      api.post(`${feedbackRoot(projectId, tenantId)}/ratings`, {
        targetType: input.targetType ?? 'CREATIVE_RUN',
        targetId: input.targetId,
        rating: input.rating,
      }),
  });
}
