import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';

export interface Company {
  id: string;
  name: string;
  createdAt: string;
}

export interface CompanyInput {
  name: string;
}

export function useCompanies() {
  return useQuery({
    queryKey: ['marketing', 'companies'],
    queryFn: () =>
      api.get<{ items: Company[]; total: number } | Company[]>('/companies'),
    select: (data) => (Array.isArray(data) ? { items: data, total: data.length } : data),
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CompanyInput) => api.post<Company>('/companies', input),
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
