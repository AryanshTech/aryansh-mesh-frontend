import type { ReactNode } from 'react';
import { layout } from '@/design-system/tokens/layout';
import { cn } from '@/design-system/lib/utils';

export type CrmPageShellMode = 'constrained' | 'viewport' | 'threeColumn';

interface CrmPageShellProps {
  children: ReactNode;
  className?: string;
  mode?: CrmPageShellMode;
}

export function CrmPageShell({ children, className, mode = 'constrained' }: CrmPageShellProps) {
  return (
    <div className={cn(layout.pageShell[mode], className)}>
      {children}
    </div>
  );
}
