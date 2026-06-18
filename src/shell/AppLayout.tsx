import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/design-system/components/ui/sidebar';
import { Separator } from '@/design-system/components/ui/separator';
import { AppSidebar } from '@/shell/AppSidebar';
import { AppHeader } from '@/shell/AppHeader';
import { SidebarNavProvider } from '@/modules/marketing/contexts/sidebar-nav-context';
import { useActiveProduct } from '@/shell/use-active-product';

export function AppLayout() {
  const product = useActiveProduct();

  const content = (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <AppHeader />
        </header>
        <main className="flex flex-1 flex-col gap-4 bg-background p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </>
  );

  return (
    <SidebarProvider>
      {product === 'marketing' ? (
        <SidebarNavProvider>{content}</SidebarNavProvider>
      ) : (
        content
      )}
    </SidebarProvider>
  );
}
