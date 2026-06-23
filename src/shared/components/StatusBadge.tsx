import { cn } from '@/design-system/lib/utils';

type StatusTone = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  className?: string;
}

const toneClasses: Record<StatusTone, string> = {
  default: 'bg-muted text-muted-foreground border-border',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-primary/10 text-primary border-primary/20',
};

export function StatusBadge({ label, tone = 'default', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 typo-caption uppercase tracking-wide',
        toneClasses[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
