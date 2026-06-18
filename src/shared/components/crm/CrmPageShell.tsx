import type { ReactNode } from 'react';
import { cn } from '@/design-system/lib/utils';

interface CrmPageShellProps {
  children: ReactNode;
  className?: string;
}

export function CrmPageShell({ children, className }: CrmPageShellProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>{children}</div>
  );
}
