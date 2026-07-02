import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';

/** Clears cached marketing data when the active business/tenant changes. */
export function MarketingQuerySync() {
  const { tenantId } = useTenantPath();
  const queryClient = useQueryClient();
  const previousTenantId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (
      previousTenantId.current &&
      tenantId &&
      previousTenantId.current !== tenantId
    ) {
      queryClient.removeQueries({ queryKey: ['marketing'] });
    }
    previousTenantId.current = tenantId || undefined;
  }, [queryClient, tenantId]);

  return null;
}
