import type { ReactNode } from 'react';
import { cn } from '@/design-system/lib/utils';
import { typographyClasses, mutedBodySm } from '@/design-system/tokens/typography';

type MetaPill = {
  id: string;
  label: string;
  value: string;
  variant?: 'default' | 'warning' | 'primary';
};

type LinearPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  metaPills?: MetaPill[];
  className?: string;
};

export function LinearPageHeader({
  title,
  description,
  actions,
  metaPills,
  className,
}: LinearPageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <h1 className={typographyClasses.headline}>{title}</h1>
              {description ? (
                <p className={cn('mt-1', mutedBodySm)}>{description}</p>
              ) : null}
            </div>
            {metaPills && metaPills.length > 0 ? (
              <div className="flex flex-wrap gap-2 pb-1">
                {metaPills.map((pill) => (
                  <span
                    key={pill.id}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1',
                      typographyClasses.caption,
                      pill.variant === 'warning' && 'border-warning/30 text-warning',
                      pill.variant === 'primary' && 'text-primary',
                    )}
                  >
                    <span className="text-muted-foreground">{pill.label}</span>
                    <span className="font-semibold text-foreground">{pill.value}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
