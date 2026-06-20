import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useAuth } from '@/core/auth/use-auth';
import type { NavItemDef, NavRequirement, NavSectionDef } from '@/shell/navigation';
import { buildProjectNavPath, MARKETING_PROJECT_NAV, NAV_SECTIONS } from '@/shell/navigation';

function meetsRequirement(
  req: NavRequirement,
  flags: {
    canAccessBusiness: boolean;
    canAccessMarketing: boolean;
    isSuperAdmin: boolean;
    isPlatformAdmin: boolean;
    canManageTeam: boolean;
  },
): boolean {
  switch (req) {
    case 'business':
      return flags.canAccessBusiness;
    case 'marketing':
      return flags.canAccessMarketing;
    case 'platform_admin':
      return flags.isSuperAdmin || flags.isPlatformAdmin;
    case 'manage_team':
      return flags.canManageTeam;
    case 'workspace_tenant':
      return true;
    default: {
      const _exhaustive: never = req;
      return _exhaustive;
    }
  }
}

function filterNavItem(item: NavItemDef, flags: ReturnType<typeof usePermissions>): NavItemDef | null {
  if (!item.requires?.length) return item;
  const ok = item.requires.every((r) =>
    meetsRequirement(r, {
      canAccessBusiness: flags.canAccessBusiness,
      canAccessMarketing: flags.canAccessMarketing,
      isSuperAdmin: flags.isSuperAdmin,
      isPlatformAdmin: flags.isPlatformAdmin,
      canManageTeam: flags.canManageTeam,
    }),
  );
  return ok ? item : null;
}

export function useFilteredNavSections(): NavSectionDef[] {
  const permissions = usePermissions();
  const { profile } = useAuth();

  return useMemo(() => {
    const flags = {
      canAccessBusiness: permissions.canAccessBusiness,
      canAccessMarketing: permissions.canAccessMarketing,
      isSuperAdmin: permissions.isSuperAdmin,
      isPlatformAdmin: permissions.isPlatformAdmin,
      canManageTeam: permissions.canManageTeam,
    };

    return NAV_SECTIONS.map((section) => {
      if (section.requires?.length) {
        const sectionOk = section.requires.every((r) => meetsRequirement(r, flags));
        if (!sectionOk) return null;
      }

      const items = section.items
        .map((item) => filterNavItem(item, permissions))
        .filter((item): item is NavItemDef => item !== null);

      if (section.id === 'admin' && profile?.accessLevel === 'platform_admin') {
        return { ...section, items };
      }

      if (items.length === 0) return null;
      return { ...section, items };
    }).filter((s): s is NavSectionDef => s !== null);
  }, [permissions, profile?.accessLevel]);
}

export function useCommandNavLinks(): { labelKey: string; descriptionKey: string; to: string }[] {
  const sections = useFilteredNavSections();
  const { projectId } = useParams();
  const { canAccessMarketing } = usePermissions();

  return useMemo(() => {
    const topLevel = sections.flatMap((section) =>
      section.items.map((item) => ({
        labelKey: item.labelKey,
        descriptionKey: `${item.labelKey}Description`,
        to: item.path,
      })),
    );

    if (!projectId || !canAccessMarketing) {
      return topLevel;
    }

    const projectLinks = MARKETING_PROJECT_NAV.map((item) => ({
      labelKey: item.labelKey,
      descriptionKey: `${item.labelKey}Description`,
      to: buildProjectNavPath(projectId, item.path),
    }));

    return [...topLevel, ...projectLinks];
  }, [sections, projectId, canAccessMarketing]);
}
