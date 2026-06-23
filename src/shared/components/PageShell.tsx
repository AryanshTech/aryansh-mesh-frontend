import { type ReactNode } from 'react';
import { cn } from '@/design-system/lib/utils';

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6 md:px-8',
        className,
      )}
    >
      {children}
    </div>
  );
}
