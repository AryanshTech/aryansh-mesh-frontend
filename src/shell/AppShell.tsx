import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeaderActionsProvider } from '@/shell/HeaderActionsContext';
import { ShellSidebar, readSidebarCollapsed, writeSidebarCollapsed } from '@/shell/ShellSidebar';
import { ShellHeader } from '@/shell/ShellHeader';
import { usePageMeta } from '@/shell/use-page-meta';
import { SidebarNavProvider } from '@/modules/marketing/contexts/sidebar-nav-context';
import { layout } from '@/design-system/tokens/layout';
import { TooltipProvider } from '@/design-system/components/ui/tooltip';
import { Sheet, SheetContent } from '@/design-system/components/ui/sheet';

const MOBILE_NAV_QUERY = '(max-width: 767px)';

function useIsMobileNav(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_NAV_QUERY).matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia(MOBILE_NAV_QUERY);
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}

export function AppShell() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isMobile = useIsMobileNav();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const pageMeta = usePageMeta();

  useEffect(() => {
    writeSidebarCollapsed(sidebarCollapsed);
  }, [sidebarCollapsed]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

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

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileNavOpen((open) => !open);
      return;
    }
    setSidebarCollapsed((collapsed) => !collapsed);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <HeaderActionsProvider>
        <SidebarNavProvider>
          <div className="flex min-h-screen min-w-0">
            <a href="#main-content" className={layout.shellHeader.skipLink}>
              {t('shell.skipToContent')}
            </a>

            <ShellSidebar
              isCollapsed={sidebarCollapsed}
              className="hidden md:flex"
            />

            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetContent side="left" className="w-[min(100vw,228px)] border-border p-0 sm:max-w-[228px]">
                <ShellSidebar
                  isCollapsed={false}
                  forceExpanded
                  onNavigate={() => setMobileNavOpen(false)}
                  className="flex h-full w-full border-0"
                />
              </SheetContent>
            </Sheet>

            <main className="shell-mesh flex min-h-screen min-w-0 flex-1 flex-col">
              <ShellHeader
                isCollapsed={sidebarCollapsed}
                isMobileNav={isMobile}
                mobileNavOpen={mobileNavOpen}
                pageTitle={pageMeta.title}
                pageSubtitle={pageMeta.subtitle}
                commandOpen={commandOpen}
                onToggleSidebar={handleToggleSidebar}
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
    </TooltipProvider>
  );
}
