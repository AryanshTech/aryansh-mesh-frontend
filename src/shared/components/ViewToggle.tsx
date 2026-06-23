import { LayoutGrid, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/design-system/lib/utils';
import type { ViewMode } from '@/shared/hooks/use-view-mode';

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ mode, onChange, className }: ViewToggleProps) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5',
        className,
      )}
      role="group"
      aria-label={t('common.viewToggle')}
    >
      <button
        type="button"
        aria-pressed={mode === 'card'}
        onClick={() => onChange('card')}
        className={cn(
          'inline-flex h-7 items-center gap-1.5 rounded-[5px] px-2.5 text-xs font-medium transition-colors',
          mode === 'card'
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <LayoutGrid className="size-3.5" />
        {t('common.viewCards')}
      </button>
      <button
        type="button"
        aria-pressed={mode === 'list'}
        onClick={() => onChange('list')}
        className={cn(
          'inline-flex h-7 items-center gap-1.5 rounded-[5px] px-2.5 text-xs font-medium transition-colors',
          mode === 'list'
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <List className="size-3.5" />
        {t('common.viewList')}
      </button>
    </div>
  );
}
