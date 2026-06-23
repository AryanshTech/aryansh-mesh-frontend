import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface HeaderActionsCtx {
  actions: ReactNode | null;
  title: string | null;
  setActions: (node: ReactNode | null) => void;
  setTitle: (title: string | null) => void;
}

const Ctx = createContext<HeaderActionsCtx | null>(null);

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const setActionsCb = useCallback((node: ReactNode | null) => setActions(node), []);
  const setTitleCb = useCallback((t: string | null) => setTitle(t), []);
  const value = useMemo<HeaderActionsCtx>(
    () => ({ actions, title, setActions: setActionsCb, setTitle: setTitleCb }),
    [actions, title, setActionsCb, setTitleCb],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHeaderActions() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useHeaderActions must be used within HeaderActionsProvider');
  return ctx;
}
