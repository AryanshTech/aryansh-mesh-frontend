import { useMemo } from 'react';
import { resolveApiV1BaseUrl, resolveGatewayOrigin } from '@/core/api/config';
import { useBusinessProfile } from '@/modules/business/api/hooks/use-business-profile';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import { useMarketingWorkspace } from '@/modules/marketing/api/use-marketing-workspace';

export function useWebsiteIntegration() {
  const { tenantId, hasTenant } = useTenantPath();
  const { data: profile } = useBusinessProfile();
  const { data: workspace } = useMarketingWorkspace(hasTenant ? tenantId : undefined);

  const tenantSlug = workspace?.tenantSlug ?? '';
  const tenantName = profile?.legalName || workspace?.company.name || tenantSlug;
  const apiBase = resolveApiV1BaseUrl();
  const embedOrigin = resolveGatewayOrigin() || (typeof window !== 'undefined' ? window.location.origin : '');

  const allowedOrigins = useMemo(() => {
    const origins = [...(profile?.allowedWebsiteOrigins ?? [])];
    if (profile?.websiteUrl) {
      try {
        const websiteOrigin = new URL(profile.websiteUrl).origin;
        if (!origins.includes(websiteOrigin)) {
          origins.unshift(websiteOrigin);
        }
      } catch {
        // ignore invalid website URL
      }
    }
    return origins;
  }, [profile]);

  return {
    tenantSlug,
    tenantName,
    allowedOrigins,
    hasSlug: Boolean(tenantSlug),
    profilePath: '/business',
    connectPath: '/connect',
    publishPath: '/publish',
    apiBase,
    embedOrigin,
  };
}
