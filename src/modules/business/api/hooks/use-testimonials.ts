import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { businessKeys } from '@/modules/business/api/query-keys';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import type { Testimonial } from '@/modules/business/types/entities';

interface TestimonialApi {
  id: string;
  tenantId?: string;
  author: string;
  quote: string;
  rating?: number | null;
  photoUrl?: string | null;
  status?: string | null;
  sortOrder?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface TestimonialListApi {
  items: TestimonialApi[];
  total?: number;
  totalElements?: number;
}

export type TestimonialView = Testimonial;

function mapTestimonial(t: TestimonialApi): TestimonialView {
  return {
    id: t.id,
    tenantId: t.tenantId,
    author: t.author,
    quote: t.quote,
    rating: t.rating ?? null,
    photoUrl: t.photoUrl ?? null,
    status: t.status ?? 'draft',
    sortOrder: t.sortOrder ?? null,
  };
}

function mapList(raw: TestimonialListApi | TestimonialApi[]): { items: TestimonialView[]; total: number } {
  if (Array.isArray(raw)) return { items: raw.map(mapTestimonial), total: raw.length };
  return {
    items: (raw.items ?? []).map(mapTestimonial),
    total: raw.total ?? raw.totalElements ?? raw.items?.length ?? 0,
  };
}

export interface TestimonialInput {
  author: string;
  quote: string;
  rating?: number;
  photoUrl?: string | null;
}

export function useTestimonials() {
  const { tenantId, path, hasTenant } = useTenantPath();
  return useQuery({
    queryKey: businessKeys.testimonials(tenantId),
    queryFn: () => api.get<TestimonialListApi | TestimonialApi[]>(`${path}/testimonials`),
    enabled: hasTenant,
    select: mapList,
  });
}

export function useCreateTestimonial() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: (input: TestimonialInput) =>
      api.post<TestimonialApi>(`${path}/testimonials`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'testimonials'] });
    },
  });
}

export function useUpdateTestimonial() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TestimonialInput> }) =>
      api.patch<TestimonialApi>(`${path}/testimonials/${id}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'testimonials'] });
    },
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  const { tenantId, path } = useTenantPath();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`${path}/testimonials/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['business', tenantId, 'testimonials'] });
    },
  });
}
