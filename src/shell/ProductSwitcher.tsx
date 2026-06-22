import { Briefcase, Megaphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { layout } from '@/design-system/tokens/layout';
import { cn } from '@/design-system/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/design-system/components/ui/toggle-group';
import { useProductZone } from '@/shell/use-product-zone';
import type { ProductZone } from '@/shell/navigation';

type ProductSwitcherProps = {
  isCollapsed: boolean;
};

export function ProductSwitcher({ isCollapsed }: ProductSwitcherProps) {
  const { t } = useTranslation();
  const { zone, showProductSwitcher, navigateToZone } = useProductZone();

  if (!showProductSwitcher) {
    return null;
  }

  const products: { id: ProductZone; icon: typeof Briefcase; labelKey: string }[] = [
    { id: 'business', icon: Briefcase, labelKey: 'shell.productSwitcher.business' },
    { id: 'marketing', icon: Megaphone, labelKey: 'shell.productSwitcher.marketing' },
  ];

  return (
    <div
      className={cn('mb-3', isCollapsed && 'flex flex-col items-center gap-1')}
      aria-label={t('shell.productSwitcher.label')}
    >
      {!isCollapsed ? (
        <p className={cn(layout.sidebar.sectionLabel, 'mb-1.5 px-2')}>
          {t('shell.productSwitcher.label')}
        </p>
      ) : null}
      <ToggleGroup
        type="single"
        value={zone}
        onValueChange={(value) => {
          if (!value) return;
          navigateToZone(value as ProductZone);
        }}
        variant="outline"
        className={cn(
          'w-full rounded-sm border border-border bg-muted p-0.5',
          isCollapsed && 'flex-col border-0 bg-transparent p-0',
        )}
        aria-label={t('shell.productSwitcher.label')}
      >
        {products.map(({ id, icon: Icon, labelKey }) => {
          const label = t(labelKey);
          return (
            <ToggleGroupItem
              key={id}
              value={id}
              title={isCollapsed ? label : undefined}
              aria-label={label}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 text-xs min-h-10',
                isCollapsed && 'size-10 flex-none p-0',
                'data-[state=on]:border data-[state=on]:border-border/50 data-[state=on]:bg-card data-[state=on]:font-medium data-[state=on]:text-foreground data-[state=on]:shadow-none',
              )}
            >
              <Icon className="size-3.5 shrink-0" />
              {!isCollapsed ? <span className="truncate">{label}</span> : null}
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </div>
  );
}
