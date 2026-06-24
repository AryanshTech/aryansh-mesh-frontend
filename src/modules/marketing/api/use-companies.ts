import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { normalizeList, resolveEntityId } from '@/modules/marketing/api/marketing-utils';

export interface Company {
  id: string;
  companyId: string;
  name: string;
  createdAt: string;
}

export interface CompanyInput {
  name: string;
}

interface CompanyApi {
  id?: string;
  companyId?: string;
  name: string;
  createdAt: string;
}

function mapCompany(raw: CompanyApi): Company {
  const companyId = resolveEntityId(raw, 'companyId');
  return {
    id: companyId,
    companyId,
    name: raw.name,
    createdAt: raw.createdAt,
  };
}

export function useCompanies() {
  return useQuery({
    queryKey: ['marketing', 'companies'],
    queryFn: () =>
      api.get<{ items: CompanyApi[]; total: number } | CompanyApi[]>('/companies'),
    select: (data) => {
      const items = normalizeList(data).map(mapCompany);
      return { items, total: items.length };
    },
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CompanyInput) => api.post<CompanyApi>('/companies', input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['marketing', 'companies'] });
    },
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (companyId: string) => api.delete<void>(`/companies/${companyId}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['marketing', 'companies'] });
    },
  });
}
