import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '@/modules/marketing/api/endpoints';

export function useAgencyCompanies(page = 0, size = 100) {
  return useQuery({
    queryKey: ['marketing', 'companies', page, size],
    queryFn: () => companiesApi.list('', page, size),
  });
}
