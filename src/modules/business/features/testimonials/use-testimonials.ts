import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { queryKeys } from '@/modules/business/api/query-keys';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import type { Testimonial, TestimonialListResponse } from '@/modules/business/types/tenant-api';

export function useTestimonials(page: number, size: number) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.testimonials(tenantId, page, size),
    queryFn: () =>
      api.get<TestimonialListResponse>(
        `/tenants/${tenantId}/testimonials?page=${page}&size=${size}`,
      ),
    enabled: Boolean(tenantId),
  });
}

export function useTestimonial(testimonialId: string) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: queryKeys.tenant.testimonial(tenantId, testimonialId),
    queryFn: () =>
      api.get<Testimonial>(`/tenants/${tenantId}/testimonials/${testimonialId}`),
    enabled: Boolean(tenantId) && Boolean(testimonialId) && testimonialId !== 'new',
  });
}

export interface TestimonialInput {
  author: string;
  quote: string;
  rating: number;
  status?: string;
}

export function useCreateTestimonial() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TestimonialInput) =>
      api.post<Testimonial>(`/tenants/${tenantId}/testimonials`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant', tenantId, 'testimonials'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.dashboard(tenantId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.publish.status(tenantId) });
    },
  });
}

export function useUpdateTestimonial(testimonialId: string) {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<TestimonialInput>) =>
      api.patch<Testimonial>(`/tenants/${tenantId}/testimonials/${testimonialId}`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant', tenantId, 'testimonials'] });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.testimonial(tenantId, testimonialId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.dashboard(tenantId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.publish.status(tenantId) });
    },
  });
}

export function useDeleteTestimonial() {
  const { tenantId } = useTenantScope();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (testimonialId: string) =>
      api.delete<void>(`/tenants/${tenantId}/testimonials/${testimonialId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant', tenantId, 'testimonials'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.dashboard(tenantId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenant.publish.status(tenantId) });
    },
  });
}
