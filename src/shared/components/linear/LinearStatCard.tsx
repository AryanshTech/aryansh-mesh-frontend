import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/design-system/lib/utils';
import { layout } from '@/design-system/tokens/layout';
import { typographyClasses } from '@/design-system/tokens/typography';

type LinearStatCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  delta?: string;
  deltaVariant?: 'success' | 'primary' | 'muted' | 'warning' | 'destructive';
  trailing?: ReactNode;
  className?: string;
};

export function LinearStatCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaVariant = 'muted',
  trailing,
  className,
}: LinearStatCardProps) {
  const deltaClass =
    deltaVariant === 'success' || deltaVariant === 'primary'
      ? 'text-primary'
      : deltaVariant === 'warning'
        ? 'text-warning'
        : deltaVariant === 'destructive'
          ? 'text-destructive'
          : 'text-muted-foreground';

  return (
    <div className={cn(layout.linear.statCard, className)}>
      <div className="mb-4 flex items-start justify-between">
        {Icon ? (
          <Icon className={cn('size-5', deltaVariant === 'primary' ? 'text-primary' : 'text-muted-foreground')} />
        ) : (
          <span />
        )}
        {delta ? (
          <span className={cn(typographyClasses.caption, 'font-semibold', deltaClass)}>{delta}</span>
        ) : null}
      </div>
      <div>
        <p className={cn('mb-1', typographyClasses.caption, 'text-muted-foreground')}>{label}</p>
        <div className="flex items-end justify-between gap-2">
          <span className={cn(typographyClasses.subhead, typographyClasses.tabular, 'text-foreground')}>{value}</span>
          {trailing}
        </div>
      </div>
    </div>
  );
}
