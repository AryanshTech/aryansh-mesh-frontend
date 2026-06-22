import { useTranslation } from 'react-i18next';
import { cn } from '@/design-system/lib/utils';
import { useProductZone } from '@/shell/use-product-zone';
import type { ProductZone } from '@/shell/navigation';
import { typographyClasses } from '@/design-system/tokens/typography';

export function ShellProductToggle() {
  const { t } = useTranslation();
  const { zone, showProductSwitcher, navigateToZone } = useProductZone();

  if (!showProductSwitcher) {
    return null;
  }

  const products: { id: ProductZone; labelKey: string }[] = [
    { id: 'marketing', labelKey: 'shell.productSwitcher.marketing' },
    { id: 'business', labelKey: 'shell.productSwitcher.business' },
  ];

  return (
    <nav
      className="hidden items-center gap-6 md:flex"
      aria-label={t('shell.productSwitcher.label')}
    >
      {products.map(({ id, labelKey }) => {
        const isActive = zone === id;
        const label = t(labelKey);
        return (
          <button
            key={id}
            type="button"
            onClick={() => navigateToZone(id)}
            className={cn(
              typographyClasses.button,
              'pb-0.5 transition-colors',
              isActive
                ? 'border-b border-primary text-foreground'
                : 'border-b border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
