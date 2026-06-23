import { type ReactNode } from 'react';
import { cn } from '@/design-system/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/30 px-6 py-16 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="text-muted-foreground [&>svg]:size-8">{icon}</div>
      ) : null}
      <div className="flex flex-col gap-1">
        <h3 className="typo-card-title text-foreground">{title}</h3>
        {description ? (
          <p className="typo-body-sm text-muted-foreground max-w-md">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
