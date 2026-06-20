import type { ReactNode } from 'react';
import { appColors } from '@/design-system/tokens/colors';
import { cn } from '@/design-system/lib/utils';

interface CrmPageShellProps {
  children: ReactNode;
  className?: string;
}

export function CrmPageShell({ children, className }: CrmPageShellProps) {
  return (
    <div
      className={cn(
        appColors.dashboard.page,
        'flex w-full flex-col gap-6 animate-fade-in-up',
        className,
      )}
    >
      {children}
    </div>
  );
}
