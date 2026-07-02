import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/shell/Sidebar';
import { Header } from '@/shell/Header';
import { CommandPalette } from '@/shell/CommandPalette';
import { CommandPaletteProvider } from '@/shell/CommandPaletteContext';
import { HeaderActionsProvider } from '@/shell/HeaderActionsContext';

export function AppShell() {
  return (
    <CommandPaletteProvider>
      <HeaderActionsProvider>
        <div className="flex h-dvh bg-canvas text-foreground">
          <Sidebar />
          <div className="flex flex-1 flex-col min-w-0 min-h-0">
            <Header />
            <main className="flex min-h-0 flex-1 flex-col min-w-0 overflow-y-auto">
              <Outlet />
            </main>
          </div>
        </div>
        <CommandPalette />
      </HeaderActionsProvider>
    </CommandPaletteProvider>
  );
}
