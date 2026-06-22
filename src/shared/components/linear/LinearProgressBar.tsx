import { cn } from '@/design-system/lib/utils';
import { typographyClasses } from '@/design-system/tokens/typography';

type LinearProgressBarProps = {
  label: string;
  value: number;
  displayValue?: string;
  variant?: 'primary' | 'muted' | 'warning';
  className?: string;
};

export function LinearProgressBar({
  label,
  value,
  displayValue,
  variant = 'primary',
  className,
}: LinearProgressBarProps) {
  const barClass =
    variant === 'warning'
      ? 'bg-warning'
      : variant === 'muted'
        ? 'bg-muted-foreground'
        : 'bg-primary';

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <div className={cn('flex justify-between', typographyClasses.button)}>
          <span className="text-muted-foreground">{label}</span>
          <span className={typographyClasses.caption}>{displayValue ?? `${value}%`}</span>
        </div>
      ) : null}
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div className={cn('h-full rounded-full transition-all', barClass)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}
