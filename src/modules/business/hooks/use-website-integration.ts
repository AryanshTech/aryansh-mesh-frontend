import { useMemo } from 'react';
import { resolveApiV1BaseUrl, resolveGatewayOrigin } from '@/core/api/config';
import { useAuth } from '@/core/auth/use-auth';
import { useTenant } from '@/modules/business/features/admin/use-tenants';
import { useBusinessProfile } from '@/modules/business/features/business/use-business';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';

const API_V1_BASE = resolveApiV1BaseUrl();
const EMBED_ORIGIN =
  resolveGatewayOrigin() || (typeof window !== 'undefined' ? window.location.origin : '');

export function useWebsiteIntegrationContext() {
  const { session } = useAuth();
  const { isWorkspace, tenantId, path } = useTenantScope();
  const { data: workspaceTenant } = useTenant(isWorkspace ? tenantId : '');
  const { data: businessProfile } = useBusinessProfile();

  const tenantSlug = isWorkspace ? workspaceTenant?.slug : session?.tenantSlug;
  const tenantName =
    (isWorkspace ? workspaceTenant?.name : session?.tenantName) ?? tenantSlug ?? '';

  const allowedOrigins = useMemo(() => {
    const origins = [...(businessProfile?.allowedWebsiteOrigins ?? [])];
    if (businessProfile?.websiteUrl) {
      try {
        const websiteOrigin = new URL(businessProfile.websiteUrl).origin;
        if (!origins.includes(websiteOrigin)) {
          origins.unshift(websiteOrigin);
        }
      } catch {
        // ignore invalid website URL
      }
    }
    return origins;
  }, [businessProfile]);

  return {
    tenantSlug: tenantSlug ?? '',
    tenantName,
    allowedOrigins,
    profilePath: path('/profile'),
    connectPath: path('/connect'),
    publishPath: path('/publish'),
    apiBase: API_V1_BASE,
    embedOrigin: EMBED_ORIGIN,
    hasSlug: Boolean(tenantSlug),
  };
}
