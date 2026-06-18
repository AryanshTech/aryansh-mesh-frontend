import { createContext, useContext, type ReactNode } from 'react';
import { useSidebarNav } from '@/modules/marketing/hooks/useSidebarNav';

type SidebarNavContextValue = ReturnType<typeof useSidebarNav>;

const SidebarNavContext = createContext<SidebarNavContextValue | null>(null);

export function SidebarNavProvider({ children }: { children: ReactNode }) {
  const value = useSidebarNav();
  return (
    <SidebarNavContext.Provider value={value}>{children}</SidebarNavContext.Provider>
  );
}

export function useSidebarNavContext(): SidebarNavContextValue {
  const ctx = useContext(SidebarNavContext);
  if (!ctx) {
    throw new Error('useSidebarNavContext must be used within SidebarNavProvider');
  }
  return ctx;
}
