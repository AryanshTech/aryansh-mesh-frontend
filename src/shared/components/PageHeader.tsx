import { type ReactNode } from 'react';
import { cn } from '@/design-system/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  toggle?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  toggle,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-2 border-b border-border pb-5 md:flex-row md:items-end md:justify-between md:gap-4',
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <h1 className="typo-display-md text-foreground">{title}</h1>
        {description ? (
          <p className="typo-body-sm text-muted-foreground max-w-prose">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {toggle}
        {actions}
      </div>
    </header>
  );
}
