import * as React from 'react';
import type { LucideIcon } from 'lucide-react';

export type ShellSearchSlot = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel?: string;
  disabled?: boolean;
};

export type HeaderAction = {
  id: string;
  icon: LucideIcon;
  label: string;
  onSelect: () => void;
  pressed?: boolean;
};

type HeaderActionsContextValue = {
  actions: HeaderAction[];
  setActions: (actions: HeaderAction[]) => void;
  shellSearch: ShellSearchSlot | null;
  setShellSearch: (slot: ShellSearchSlot | null) => void;
  shellToolbarHost: HTMLElement | null;
  setShellToolbarHost: (el: HTMLElement | null) => void;
};

const HeaderActionsContext = React.createContext<HeaderActionsContextValue | null>(null);

export function HeaderActionsProvider({ children }: { children: React.ReactNode }) {
  const [actions, setActions] = React.useState<HeaderAction[]>([]);
  const [shellSearch, setShellSearch] = React.useState<ShellSearchSlot | null>(null);
  const [shellToolbarHost, setShellToolbarHost] = React.useState<HTMLElement | null>(null);
  const value = React.useMemo(
    () => ({
      actions,
      setActions,
      shellSearch,
      setShellSearch,
      shellToolbarHost,
      setShellToolbarHost,
    }),
    [actions, shellSearch, shellToolbarHost],
  );
  return <HeaderActionsContext.Provider value={value}>{children}</HeaderActionsContext.Provider>;
}

export function useHeaderActionsList(): HeaderAction[] {
  const ctx = React.useContext(HeaderActionsContext);
  return ctx?.actions ?? [];
}

export function useShellSearchSlot(): ShellSearchSlot | null {
  const ctx = React.useContext(HeaderActionsContext);
  return ctx?.shellSearch ?? null;
}

export function useShellToolbarHost(): HTMLElement | null {
  const ctx = React.useContext(HeaderActionsContext);
  return ctx?.shellToolbarHost ?? null;
}

const noopToolbarHost = (_el: HTMLElement | null): void => {};

export function useSetShellToolbarHost(): (el: HTMLElement | null) => void {
  const ctx = React.useContext(HeaderActionsContext);
  return ctx?.setShellToolbarHost ?? noopToolbarHost;
}

export function useHeaderActions(
  factory: () => HeaderAction[] | null,
  deps: React.DependencyList,
): void {
  const ctx = React.useContext(HeaderActionsContext);
  React.useEffect(() => {
    if (!ctx) return;
    const next = factory() ?? [];
    ctx.setActions(next);
    return () => {
      ctx.setActions([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useShellSearchRegistration(
  factory: () => ShellSearchSlot | null,
  deps: React.DependencyList,
): void {
  const ctx = React.useContext(HeaderActionsContext);
  React.useEffect(() => {
    if (!ctx) return;
    const next = factory();
    ctx.setShellSearch(next ?? null);
    return () => {
      ctx.setShellSearch(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
