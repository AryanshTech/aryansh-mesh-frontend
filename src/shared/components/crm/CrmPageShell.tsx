import type { ReactNode } from 'react';
import { layout } from '@/design-system/tokens/layout';
import { cn } from '@/design-system/lib/utils';

interface CrmPageShellProps {
  children: ReactNode;
  className?: string;
}

export function CrmPageShell({ children, className }: CrmPageShellProps) {
  return (
    <div className={cn(layout.dashboard.page, 'min-w-0 w-full', className)}>
      {children}
    </div>
  );
}
