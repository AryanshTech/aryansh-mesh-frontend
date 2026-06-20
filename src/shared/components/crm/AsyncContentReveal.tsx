import type { ReactNode } from 'react';
import { cn } from '@/design-system/lib/utils';

type AsyncContentRevealProps = {
  loading: boolean;
  children: ReactNode;
  className?: string;
};

export function AsyncContentReveal({ loading, children, className }: AsyncContentRevealProps) {
  return (
    <div
      className={cn(
        'transition-opacity duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none',
        loading ? 'opacity-0' : 'opacity-100 animate-content-in',
        className,
      )}
    >
      {children}
    </div>
  );
}
