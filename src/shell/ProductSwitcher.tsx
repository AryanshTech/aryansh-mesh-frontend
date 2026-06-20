import { Briefcase, Megaphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { layout } from '@/design-system/tokens/layout';
import { cn } from '@/design-system/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/design-system/components/ui/toggle-group';
import { usePermissions } from '@/core/permissions/use-permissions';

type ProductId = 'business' | 'marketing';

type ProductSwitcherProps = {
  isCollapsed: boolean;
};

function resolveActiveProduct(pathname: string): ProductId {
  return pathname.startsWith('/marketing') ? 'marketing' : 'business';
}

export function ProductSwitcher({ isCollapsed }: ProductSwitcherProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { canAccessBusiness, canAccessMarketing, isPlatformAdmin, isSuperAdmin } = usePermissions();

  if (!canAccessBusiness || !canAccessMarketing || isPlatformAdmin || isSuperAdmin) {
    return null;
  }

  const active = resolveActiveProduct(pathname);

  const products: { id: ProductId; icon: typeof Briefcase; labelKey: string; path: string }[] = [
    { id: 'business', icon: Briefcase, labelKey: 'shell.productSwitcher.business', path: '/dashboard' },
    { id: 'marketing', icon: Megaphone, labelKey: 'shell.productSwitcher.marketing', path: '/marketing' },
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
        value={active}
        onValueChange={(value) => {
          if (!value) return;
          const product = products.find((p) => p.id === value);
          if (product && product.id !== active) navigate(product.path);
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
                'data-[state=on]:bg-primary/10 data-[state=on]:text-primary',
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
