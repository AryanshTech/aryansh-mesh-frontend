import type { ReactNode } from 'react';
import { ScrollArea } from '@/design-system/components/ui/scroll-area';
import { cn } from '@/design-system/lib/utils';
import { typographyClasses } from '@/design-system/tokens/typography';

type LinearKanbanColumnProps = {
  title: string;
  count: number;
  total?: string;
  children: ReactNode;
  className?: string;
};

export function LinearKanbanColumn({ title, count, total, children, className }: LinearKanbanColumnProps) {
  return (
    <div
      className={cn(
        'flex h-full min-w-[320px] max-w-[320px] flex-col rounded-lg border border-border bg-card',
        className
      )}
    >
      <div className="mb-1 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <h3 className={cn(typographyClasses.eyebrowUpper, 'text-muted-foreground')}>{title}</h3>
          <span className={cn('rounded-xs bg-muted px-1.5 py-0.5', typographyClasses.caption, 'text-muted-foreground')}>{count}</span>
        </div>
        {total ? <span className={cn(typographyClasses.mono, 'text-muted-foreground')}>{total}</span> : null}
      </div>
      <ScrollArea className="flex-1 px-3 pb-4 scrollbar-linear">
        <div className="flex flex-col gap-3">{children}</div>
      </ScrollArea>
    </div>
  );
}
