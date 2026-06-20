import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { MARKETING_PROJECT_NAV, PAGE_META_ROUTES } from '@/shell/navigation';

type PageMeta = { title: string; subtitle?: string };

function resolveAdminWorkspaceMeta(pathname: string, t: (key: string) => string): PageMeta | null {
  const match = pathname.match(/^\/admin\/tenants\/[^/]+\/workspace(?:\/(.*))?$/);
  if (!match) return null;

  const rest = match[1] ?? 'dashboard';

  if (rest === 'dashboard' || rest.startsWith('dashboard/')) {
    return { title: t('pages.dashboard') };
  }
  if (rest === 'profile' || rest.startsWith('profile/')) {
    return { title: t('pages.business'), subtitle: t('business.subtitle') };
  }
  if (rest.startsWith('products')) {
    return { title: t('pages.products'), subtitle: t('products.subtitle') };
  }
  if (rest.startsWith('costs')) {
    return { title: t('pages.costs'), subtitle: t('costs.subtitle') };
  }
  if (rest.startsWith('clients')) {
    return { title: t('pages.clients'), subtitle: t('clients.subtitle') };
  }
  if (rest.startsWith('locations')) {
    return { title: t('pages.locations'), subtitle: t('locations.subtitle') };
  }
  if (rest.startsWith('testimonials')) {
    return { title: t('pages.testimonials'), subtitle: t('testimonials.subtitle') };
  }
  if (rest.startsWith('content')) {
    return { title: t('pages.content'), subtitle: t('content.subtitle') };
  }
  if (rest.startsWith('bookings')) {
    return { title: t('pages.bookings'), subtitle: t('bookings.subtitle') };
  }
  if (rest.startsWith('publish')) {
    return { title: t('pages.publish'), subtitle: t('publish.subtitle') };
  }
  if (rest.startsWith('connect')) {
    return { title: t('pages.connect'), subtitle: t('connect.subtitle') };
  }
  if (rest.startsWith('settings/team')) {
    return { title: t('pages.team'), subtitle: t('team.subtitle') };
  }
  if (rest.startsWith('settings/account')) {
    return { title: t('pages.account'), subtitle: t('account.subtitle') };
  }
  if (rest.startsWith('onboarding')) {
    return { title: t('pages.onboarding'), subtitle: t('onboarding.subtitle') };
  }

  return { title: t('nav.appName') };
}

export function usePageMeta(): PageMeta {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { projectId, companyId } = useParams();

  return useMemo(() => {
    const workspaceMeta = resolveAdminWorkspaceMeta(pathname, t);
    if (workspaceMeta) {
      return workspaceMeta;
    }

    for (const route of PAGE_META_ROUTES) {
      if (pathname === route.prefix || pathname.startsWith(`${route.prefix}/`)) {
        return {
          title: t(route.titleKey),
          subtitle: route.subtitleKey ? t(route.subtitleKey) : undefined,
        };
      }
    }

    if (companyId && pathname.match(/^\/marketing\/companies\/[^/]+$/)) {
      return { title: t('marketing.companies.title') };
    }

    if (projectId && pathname.includes('/marketing/projects/')) {
      const projectBase = `/marketing/projects/${projectId}`;
      const suffix = pathname.slice(projectBase.length).replace(/^\//, '');
      const matched = MARKETING_PROJECT_NAV.find((item) => item.path === suffix);
      if (matched) {
        return { title: t(matched.labelKey) };
      }
      return { title: t('nav.projectDashboard') };
    }

    return { title: t('nav.appName') };
  }, [pathname, projectId, companyId, t]);
}
