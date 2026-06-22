import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { cn } from '@/design-system/lib/utils';
import { typographyClasses } from '@/design-system/tokens/typography';

export type PhaseItem = {
  id: string;
  phase: string;
  title: string;
  status: string;
  icon: LucideIcon;
  active?: boolean;
  progress?: number;
  onClick?: () => void;
};

type LinearPhaseStripProps = {
  phases: PhaseItem[];
  className?: string;
};

export function LinearPhaseStrip({ phases, className }: LinearPhaseStripProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 md:grid-cols-4', className)}>
      {phases.map((phase) => {
        const Icon = phase.icon;
        const progress = phase.progress ?? (phase.active ? 100 : 0);
        return (
          <Card
            key={phase.id}
            variant={phase.active ? 'elevated' : 'default'}
            className={cn(
              'cursor-pointer overflow-hidden transition-colors hover:bg-muted/50',
              phase.active ? 'border-primary/30 bg-muted' : 'bg-card',
            )}
            onClick={phase.onClick}
          >
            <CardHeader dense className="flex-row items-center justify-between space-y-0 pb-2">
              <span className={cn(typographyClasses.eyebrowUpper, phase.active ? 'text-primary' : 'text-muted-foreground')}>
                {phase.phase}
              </span>
              <Icon className={cn('size-4', phase.active ? 'text-primary' : 'text-muted-foreground')} />
            </CardHeader>
            <CardContent dense>
              <CardTitle className={cn(typographyClasses.subhead, !phase.active && 'text-muted-foreground')}>
                {phase.title}
              </CardTitle>
              <div className="mt-2 flex items-center gap-2">
                {phase.active ? (
                  <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                ) : null}
                <p className={typographyClasses.caption}>{phase.status}</p>
              </div>
              <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-border">
                <div
                  className={cn('h-full rounded-full transition-all', phase.active ? 'bg-primary' : 'bg-muted-foreground/40')}
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
