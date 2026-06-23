import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface CommandPaletteCtx {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const Ctx = createContext<CommandPaletteCtx | null>(null);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const value = useMemo<CommandPaletteCtx>(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShellCommandPalette() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useShellCommandPalette must be used within CommandPaletteProvider');
  return ctx;
}
