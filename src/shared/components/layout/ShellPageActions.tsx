import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useShellToolbarHost } from '@/shell/HeaderActionsContext';
import { useIsMobileNav } from '@/shared/hooks/use-is-mobile-nav';

type ShellPageActionsProps = {
  children: ReactNode;
};

/** Renders primary page actions in the sticky header toolbar on desktop; inline elsewhere. */
export function ShellPageActions({ children }: ShellPageActionsProps) {
  const host = useShellToolbarHost();
  const isMobile = useIsMobileNav();

  if (isMobile || !host) {
    return <>{children}</>;
  }

  return createPortal(children, host);
}
