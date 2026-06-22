import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { cn } from '@/design-system/lib/utils';
import { layout } from '@/design-system/tokens/layout';
import { typographyClasses } from '@/design-system/tokens/typography';

type LinearInsightBannerProps = {
  title: string;
  description: ReactNode;
  badge?: string;
  icon?: LucideIcon;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  actions?: ReactNode;
  variant?: 'banner' | 'compact';
  className?: string;
};

export function LinearInsightBanner({
  title,
  description,
  badge,
  icon: Icon,
  primaryAction,
  secondaryAction,
  actions,
  variant = 'banner',
  className,
}: LinearInsightBannerProps) {
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'rounded-lg border border-primary/20 bg-card p-5',
          className,
        )}
      >
        <div className="mb-3 flex items-center gap-2 text-primary">
          {Icon ? <Icon className="size-[18px]" /> : null}
          <span className={typographyClasses.eyebrow}>{title}</span>
        </div>
        <p className={cn(typographyClasses.bodySm, 'text-muted-foreground')}>{description}</p>
        {actions ? <div className="mt-4">{actions}</div> : null}
      </div>
    );
  }

  return (
    <div className={cn(layout.linear.insightBanner, 'flex flex-col gap-4 lg:flex-row lg:items-start', className)}>
      <div className="flex flex-1 items-start gap-4">
        {Icon ? (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
            <Icon className="text-primary" />
          </div>
        ) : null}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h3 className={cn(typographyClasses.cardTitle, 'text-foreground')}>{title}</h3>
            {badge ? (
              <Badge variant="outline" className="border-primary/20 bg-primary/10 uppercase text-primary typo-caption">
                {badge}
              </Badge>
            ) : null}
          </div>
          <p className={typographyClasses.bodySm}>{description}</p>
        </div>
      </div>
      {(primaryAction || secondaryAction || actions) && (
        <div className="flex shrink-0 gap-3">
          {actions}
          {!actions && secondaryAction ? (
            <Button variant="outline" size="sm" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          ) : null}
          {!actions && primaryAction ? (
            <Button size="sm" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
