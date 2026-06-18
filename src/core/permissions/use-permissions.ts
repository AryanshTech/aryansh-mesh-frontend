import { useMemo } from 'react';
import { useAuth } from '@/core/auth/use-auth';
import type { Role } from '@/core/auth/types';

const EDIT_ROLES: Role[] = [
  'tenant_editor',
  'tenant_admin',
  'tenant_owner',
  'platform_super_admin',
];

const PUBLISH_ROLES: Role[] = [
  'tenant_admin',
  'tenant_owner',
  'platform_super_admin',
];

const TEAM_ROLES: Role[] = [
  'tenant_admin',
  'tenant_owner',
  'platform_super_admin',
];

export function usePermissions() {
  const { session, profile } = useAuth();
  const role = session?.role;
  const services = session?.services ?? [];

  return useMemo(
    () => ({
      role,
      canEdit: role ? EDIT_ROLES.includes(role) : false,
      canPublish: role ? PUBLISH_ROLES.includes(role) : false,
      canManageTeam: role ? TEAM_ROLES.includes(role) : false,
      isSuperAdmin: role === 'platform_super_admin',
      isViewer: role === 'tenant_viewer',
      isPlatformAdmin: profile?.accessLevel === 'platform_admin',
      isPlatformTeam: profile?.accessLevel === 'platform_team',
      canAccessBusiness:
        role === 'platform_super_admin' || services.includes('business-manager'),
      canAccessMarketing:
        profile?.accessLevel === 'platform_admin' ||
        profile?.accessLevel === 'platform_team' ||
        services.includes('marketing-hub'),
    }),
    [role, profile, services],
  );
}
