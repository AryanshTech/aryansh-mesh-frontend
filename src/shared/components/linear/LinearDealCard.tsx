import type { ReactNode } from 'react';
import { cn } from '@/design-system/lib/utils';
import { typographyClasses } from '@/design-system/tokens/typography';
import { Avatar, AvatarFallback } from '@/design-system/components/ui/avatar';

type LinearDealCardProps = {
  title: string;
  subtitle?: string;
  value?: string;
  priority?: 'high' | 'medium' | 'low';
  priorityLabel?: string;
  aiInsight?: string;
  avatars?: string[];
  archived?: boolean;
  className?: string;
  children?: ReactNode;
};

const priorityBorder: Record<NonNullable<LinearDealCardProps['priority']>, string> = {
  high: 'border-l-destructive',
  medium: 'border-l-primary',
  low: 'border-l-muted-foreground',
};

export function LinearDealCard({
  title,
  subtitle,
  value,
  priority,
  priorityLabel,
  aiInsight,
  avatars = [],
  archived = false,
  className,
  children,
}: LinearDealCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50',
        priority && `border-l-2 ${priorityBorder[priority]}`,
        archived && 'opacity-60 grayscale',
        className,
      )}
    >
      {priorityLabel ? (
        <span className={cn('mb-2 inline-block rounded-full border border-border bg-muted px-2 py-0.5', typographyClasses.caption, 'text-muted-foreground')}>
          {priorityLabel}
        </span>
      ) : null}
      <p className={cn(typographyClasses.bodySm, 'font-medium text-foreground')}>{title}</p>
      {subtitle ? (
        <p className={cn('mt-0.5', typographyClasses.caption, 'text-muted-foreground')}>{subtitle}</p>
      ) : null}
      {value ? (
        <p className={cn('mt-2', typographyClasses.mono, 'text-foreground')}>{value}</p>
      ) : null}
      {avatars.length > 0 ? (
        <div className="mt-3 flex -space-x-2">
          {avatars.map((initials) => (
            <Avatar key={initials} className="size-6 border border-border">
              <AvatarFallback className={typographyClasses.caption}>{initials}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      ) : null}
      {aiInsight ? (
        <p className={cn('mt-3 rounded-md border border-primary/20 bg-primary/5 px-2 py-1', typographyClasses.caption, 'text-primary')}>
          {aiInsight}
        </p>
      ) : null}
      {children}
    </div>
  );
}
