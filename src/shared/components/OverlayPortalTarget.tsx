import { createContext, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/design-system/lib/utils';

const OverlayPortalContainerContext = createContext<HTMLElement | null>(null);

/** Portal target for Select/Popover content inside drawers and dialogs. */
export function useOverlayPortalContainer(): HTMLElement | null {
  return useContext(OverlayPortalContainerContext);
}

interface OverlayPortalTargetProps {
  children: ReactNode;
  className?: string;
}

/**
 * Keeps portaled overlays (Select menus, etc.) inside the same DOM subtree as the
 * drawer/dialog so parent Radix layers do not treat them as outside clicks.
 */
export function OverlayPortalTarget({ children, className }: OverlayPortalTargetProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  return (
    <OverlayPortalContainerContext.Provider value={container}>
      <div ref={setContainer} className={cn('relative', className)}>
        {children}
      </div>
    </OverlayPortalContainerContext.Provider>
  );
}
