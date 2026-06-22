import { Badge } from '@/design-system/components/ui/badge';
import { cn } from '@/design-system/lib/utils';
import { typographyClasses } from '@/design-system/tokens/typography';

type StatusVariant = 'active' | 'draft' | 'live' | 'pending' | 'success' | 'warning' | 'muted';

const dotColors: Record<StatusVariant, string> = {
  active: 'bg-success',
  success: 'bg-success',
  live: 'bg-success',
  draft: 'bg-muted-foreground',
  pending: 'bg-primary',
  warning: 'bg-warning',
  muted: 'bg-muted-foreground',
};

type LinearStatusBadgeProps = {
  label: string;
  variant?: StatusVariant;
  appearance?: 'dot' | 'pill';
  className?: string;
};

export function LinearStatusBadge({
  label,
  variant = 'muted',
  appearance = 'dot',
  className,
}: LinearStatusBadgeProps) {
  if (appearance === 'pill') {
    return (
      <span
        className={cn(
          typographyClasses.caption,
          'inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-muted-foreground',
          className,
        )}
      >
        {label}
      </span>
    );
  }

  return (
    <Badge variant="status" className={cn(className)}>
      <span className={cn('size-1.5 rounded-full', dotColors[variant])} />
      {label}
    </Badge>
  );
}
