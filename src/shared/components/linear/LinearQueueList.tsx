import type { ReactNode } from 'react';
import { ScrollArea } from '@/design-system/components/ui/scroll-area';
import { cn } from '@/design-system/lib/utils';
import { layout } from '@/design-system/tokens/layout';
import { typographyClasses } from '@/design-system/tokens/typography';

export type QueueItem = {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  preview?: string;
  tag?: string;
  timestamp?: string;
};

type LinearQueueListProps = {
  title?: string;
  count?: number;
  items: QueueItem[];
  activeId?: string;
  onSelect: (id: string) => void;
  headerAction?: ReactNode;
  className?: string;
};

export function LinearQueueList({
  title,
  count,
  items,
  activeId,
  onSelect,
  headerAction,
  className,
}: LinearQueueListProps) {
  return (
    <div className={cn('flex flex-col border-r border-border bg-card', className)}>
      {(title || count !== undefined) && (
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          {title ? <h2 className={cn(typographyClasses.cardTitle, 'text-foreground')}>{title}</h2> : <span />}
          {count !== undefined ? (
            <span className={cn('rounded-full border border-border bg-muted px-2 py-0.5', typographyClasses.caption, 'text-muted-foreground')}>
              {count}
            </span>
          ) : null}
          {headerAction}
        </div>
      )}
      <ScrollArea className="flex-1 scrollbar-linear">
        <div className="flex flex-col gap-1 p-2">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  'w-full p-3 text-left',
                  isActive ? layout.linear.queueItemActive : layout.linear.queueItem,
                )}
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  {item.tag ? (
                    <span className={cn(typographyClasses.eyebrowUpper, isActive ? 'text-primary' : 'text-muted-foreground')}>
                      {item.tag}
                    </span>
                  ) : item.eyebrow ? (
                    <span className={cn(typographyClasses.eyebrowUpper, isActive ? 'text-primary' : 'text-muted-foreground')}>
                      {item.eyebrow}
                    </span>
                  ) : null}
                  {item.timestamp ? (
                    <span className={cn(typographyClasses.caption, 'text-muted-foreground')}>{item.timestamp}</span>
                  ) : null}
                </div>
                <p className={cn('truncate', typographyClasses.button, isActive ? 'text-foreground' : 'text-muted-foreground')}>
                  {item.title}
                </p>
                {item.preview ? (
                  <p className={cn('mt-1 line-clamp-2', typographyClasses.caption, 'text-muted-foreground')}>{item.preview}</p>
                ) : item.subtitle ? (
                  <p className={cn('mt-1 truncate', typographyClasses.caption, 'text-muted-foreground')}>{item.subtitle}</p>
                ) : null}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
