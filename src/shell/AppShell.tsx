import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeaderActionsProvider } from '@/shell/HeaderActionsContext';
import { ShellSidebar, readSidebarCollapsed, writeSidebarCollapsed } from '@/shell/ShellSidebar';
import { ShellHeader } from '@/shell/ShellHeader';
import { SidebarNavProvider } from '@/modules/marketing/contexts/sidebar-nav-context';
import { appColors } from '@/design-system/tokens/colors';
import { cn } from '@/design-system/lib/utils';

function usePageMeta(): { title: string; subtitle?: string } {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { projectId } = useParams();

  return useMemo(() => {
    const routes: Record<string, { title: string; subtitle?: string }> = {
      '/dashboard': { title: t('business.dashboard.title') },
      '/profile': { title: t('business.business.title') },
      '/products': { title: t('business.products.title') },
      '/costs': { title: t('business.costs.title') },
      '/clients': { title: t('business.clients.title') },
      '/locations': { title: t('business.locations.title') },
      '/testimonials': { title: t('business.testimonials.title') },
      '/content': { title: t('business.content.title') },
      '/bookings': { title: t('business.bookings.title') },
      '/publish': { title: t('business.publish.title') },
      '/settings/team': { title: t('business.team.title') },
      '/settings/account': { title: t('business.account.title') },
      '/onboarding': { title: t('business.onboarding.title') },
      '/admin/tenants': { title: t('business.admin.tenants.title') },
      '/marketing': { title: t('marketing.agency.title') },
      '/marketing/companies': { title: t('marketing.companies.title') },
    };

    for (const [path, meta] of Object.entries(routes)) {
      if (pathname === path || pathname.startsWith(`${path}/`)) {
        return meta;
      }
    }

    if (projectId && pathname.includes('/marketing/projects/')) {
      return { title: t('marketing.projectDashboard.title') };
    }

    return { title: t('nav.appName') };
  }, [pathname, projectId, t]);
}

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed);
  const [commandOpen, setCommandOpen] = useState(false);
  const pageMeta = usePageMeta();

  useEffect(() => {
    writeSidebarCollapsed(sidebarCollapsed);
  }, [sidebarCollapsed]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tagName = target.tagName.toLowerCase();
        const isCommandInput = target.dataset.commandPaletteInput === 'true';
        const isTyping =
          (tagName === 'input' || tagName === 'textarea' || target.isContentEditable) &&
          !isCommandInput;
        if (isTyping) return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <HeaderActionsProvider>
      <SidebarNavProvider>
        <div className={cn('flex min-h-screen', appColors.layout.background)}>
          <ShellSidebar isCollapsed={sidebarCollapsed} />
          <main className="flex min-h-screen min-w-0 flex-1 flex-col">
            <ShellHeader
              isCollapsed={sidebarCollapsed}
              pageTitle={pageMeta.title}
              pageSubtitle={pageMeta.subtitle}
              commandOpen={commandOpen}
              onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
              onOpenCommand={() => setCommandOpen(true)}
              onCloseCommand={() => setCommandOpen(false)}
            />
            <div id="main-content" className="page-shell flex-1 overflow-y-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarNavProvider>
    </HeaderActionsProvider>
  );
}
