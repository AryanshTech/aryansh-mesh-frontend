import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type ShellRightRailContextValue = {
  content: ReactNode | null;
  setContent: (content: ReactNode | null) => void;
};

const ShellRightRailContext = createContext<ShellRightRailContextValue | null>(null);

export function ShellRightRailProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<ReactNode | null>(null);

  const setContent = useCallback((next: ReactNode | null) => {
    setContentState(next);
  }, []);

  const value = useMemo(
    () => ({ content, setContent }),
    [content, setContent],
  );

  return (
    <ShellRightRailContext.Provider value={value}>
      {children}
    </ShellRightRailContext.Provider>
  );
}

export function useShellRightRail() {
  const ctx = useContext(ShellRightRailContext);
  if (!ctx) {
    throw new Error('useShellRightRail must be used within ShellRightRailProvider');
  }
  return ctx;
}
