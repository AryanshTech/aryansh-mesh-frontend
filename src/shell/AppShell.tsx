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
        <div className="flex min-h-screen bg-canvas text-foreground">
          <Sidebar />
          <div className="flex min-h-screen flex-1 flex-col min-w-0">
            <Header />
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
        <CommandPalette />
      </HeaderActionsProvider>
    </CommandPaletteProvider>
  );
}
