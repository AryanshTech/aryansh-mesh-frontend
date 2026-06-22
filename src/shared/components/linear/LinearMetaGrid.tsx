import type { LucideIcon } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { typographyClasses } from '@/design-system/tokens/typography';

export type MetaGridItem = {
  id: string;
  label: string;
  value: string;
  icon?: LucideIcon;
};

type LinearMetaGridProps = {
  items: MetaGridItem[];
  className?: string;
};

export function LinearMetaGrid({ items, className }: LinearMetaGridProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.id} className="rounded-lg border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              {Icon ? <Icon className="size-3.5 text-muted-foreground" /> : null}
              <p className={cn(typographyClasses.eyebrowUpper, 'text-muted-foreground')}>{item.label}</p>
            </div>
            <p className={cn(typographyClasses.button, 'text-foreground')}>{item.value}</p>
          </div>
        );
      })}
    </div>
  );
}
