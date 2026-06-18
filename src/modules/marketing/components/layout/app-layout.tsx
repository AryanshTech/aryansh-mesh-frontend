import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/design-system/components/ui/sidebar';
import { TooltipProvider } from '@/design-system/components/ui/tooltip';
import { SidebarNavProvider } from '@/modules/marketing/contexts/sidebar-nav-context';
import { MarketingAppSidebar } from './app-sidebar';

/** Legacy marketing layout — prefer shell/AppLayout in AryanshMesh */
export function AppLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <SidebarNavProvider>
          <MarketingAppSidebar />
          <SidebarInset className="h-svh min-h-0 overflow-hidden">
            <Outlet />
          </SidebarInset>
        </SidebarNavProvider>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export { MarketingAppSidebar as AppSidebar };
