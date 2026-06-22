import type { ReactNode } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
import { cn } from '@/design-system/lib/utils';
import { layout } from '@/design-system/tokens/layout';

type FilterChip = {
  id: string;
  label: string;
  value: string;
  onClick?: () => void;
};

type LinearFilterBarProps = {
  chips: FilterChip[];
  onFiltersClick?: () => void;
  filtersLabel?: string;
  trailing?: ReactNode;
  className?: string;
};

export function LinearFilterBar({
  chips,
  onFiltersClick,
  filtersLabel = 'Filters',
  trailing,
  className,
}: LinearFilterBarProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4 border-b border-border px-gutter py-2', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={layout.linear.filterChip}
            onClick={chip.onClick}
          >
            <span className="text-muted-foreground">{chip.label}:</span>
            <span className="text-foreground">{chip.value}</span>
          </button>
        ))}
        {onFiltersClick ? (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onFiltersClick}>
            <Filter data-icon="inline-start" />
            {filtersLabel}
          </Button>
        ) : null}
      </div>
      {trailing}
    </div>
  );
}
