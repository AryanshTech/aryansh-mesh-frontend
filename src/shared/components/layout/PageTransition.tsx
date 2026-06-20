import type { ReactNode } from 'react';
import { cn } from '@/design-system/lib/utils';

type PageTransitionProps = {
  routeKey: string;
  children: ReactNode;
  className?: string;
};

export function PageTransition({ routeKey, children, className }: PageTransitionProps) {
  return (
    <div key={routeKey} className={cn('animate-content-in min-w-0 w-full', className)}>
      {children}
    </div>
  );
}
