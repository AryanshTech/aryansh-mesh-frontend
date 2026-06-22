import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeaderActionsProvider } from '@/shell/HeaderActionsContext';
import { ShellSidebar, readSidebarCollapsed, writeSidebarCollapsed } from '@/shell/ShellSidebar';
import { ShellHeader } from '@/shell/ShellHeader';
import { ShellRightRail } from '@/shell/ShellRightRail';
import { ShellRightRailProvider } from '@/shell/ShellRightRailContext';
import { useShellLayoutMode } from '@/shell/use-shell-layout-mode';
import { SidebarNavProvider } from '@/modules/marketing/contexts/sidebar-nav-context';
import { layout } from '@/design-system/tokens/layout';
import { PageTransition } from '@/shared/components/layout/PageTransition';
import { useIsMobileNav } from '@/shared/hooks/use-is-mobile-nav';
import { TooltipProvider } from '@/design-system/components/ui/tooltip';
import { Sheet, SheetContent } from '@/design-system/components/ui/sheet';
import { cn } from '@/design-system/lib/utils';

export function AppShell() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const shellMode = useShellLayoutMode();
  const isMobile = useIsMobileNav();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const isBusinessShell = shellMode === 'business';

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

  const mainContent = (
    <div id="main-content" className="app-main-content">
      <PageTransition routeKey={pathname}>
        <Outlet />
      </PageTransition>
    </div>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <HeaderActionsProvider>
        <SidebarNavProvider>
          <ShellRightRailProvider>
            <div className="shell-canvas">
              <a href="#main-content" className={layout.shellHeader.skipLink}>
                {t('shell.skipToContent')}
              </a>

              {isBusinessShell ? (
                <>
                  <ShellHeader
                    isCollapsed={sidebarCollapsed}
                    isMobileNav={isMobile}
                    mobileNavOpen={mobileNavOpen}
                    commandOpen={commandOpen}
                    onToggleSidebar={handleToggleSidebar}
                    onOpenCommand={() => setCommandOpen(true)}
                    onCloseCommand={() => setCommandOpen(false)}
                  />
                  <div className="shell-layout-business">
                    <ShellSidebar
                      isCollapsed={sidebarCollapsed}
                      hideBrand
                      onOpenCommand={() => setCommandOpen(true)}
                      className={cn(
                        'fixed left-0 top-14 z-40 hidden h-[calc(100vh-3.5rem)] md:flex',
                        sidebarCollapsed ? 'w-[68px]' : 'w-60',
                      )}
                    />
                    <div
                      className={cn(
                        'shell-layout-business__main',
                        sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-60',
                      )}
                    >
                      {mainContent}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex min-h-screen min-w-0">
                  <ShellSidebar
                    isCollapsed={sidebarCollapsed}
                    onOpenCommand={() => setCommandOpen(true)}
                    className="hidden md:flex"
                  />
                  <div className="relative shell-layout-marketing min-w-0 flex-1">
                    <ShellHeader
                      isCollapsed={sidebarCollapsed}
                      isMobileNav={isMobile}
                      mobileNavOpen={mobileNavOpen}
                      commandOpen={commandOpen}
                      onToggleSidebar={handleToggleSidebar}
                      onOpenCommand={() => setCommandOpen(true)}
                      onCloseCommand={() => setCommandOpen(false)}
                    />
                    {mainContent}
                    <ShellRightRail variant="marketing" />
                  </div>
                </div>
              )}

              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetContent side="left" className="w-[min(100vw,228px)] border-border p-0 sm:max-w-[228px]">
                  <ShellSidebar
                    isCollapsed={false}
                    forceExpanded
                    hideBrand={isBusinessShell}
                    onNavigate={() => setMobileNavOpen(false)}
                    onOpenCommand={() => setCommandOpen(true)}
                    className="flex h-full w-full border-0"
                  />
                </SheetContent>
              </Sheet>
            </div>
          </ShellRightRailProvider>
        </SidebarNavProvider>
      </HeaderActionsProvider>
    </TooltipProvider>
  );
}
