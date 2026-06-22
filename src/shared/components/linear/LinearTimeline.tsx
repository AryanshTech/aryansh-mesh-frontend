import { cn } from '@/design-system/lib/utils';
import { typographyClasses } from '@/design-system/tokens/typography';

export type TimelineItem = {
  id: string;
  title: string;
  subtitle?: string;
  active?: boolean;
};

type LinearTimelineProps = {
  items: TimelineItem[];
  className?: string;
};

export function LinearTimeline({ items, className }: LinearTimelineProps) {
  return (
    <div className={cn('relative flex flex-col gap-6', className)}>
      <div className="absolute bottom-2 left-[5px] top-2 w-px bg-border" aria-hidden />
      {items.map((item) => (
        <div key={item.id} className="relative flex flex-col gap-0.5 pl-6">
          <div
            className={cn(
              'absolute left-0 top-1 size-2.5 rounded-full border-2 border-card',
              item.active ? 'bg-primary' : 'bg-muted-foreground'
            )}
          />
          <p className={cn('text-sm', item.active ? 'font-medium text-foreground' : 'text-muted-foreground')}>
            {item.title}
          </p>
          {item.subtitle ? (
            <p className={typographyClasses.caption}>{item.subtitle}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
