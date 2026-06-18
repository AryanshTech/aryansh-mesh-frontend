import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Megaphone } from 'lucide-react';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useActiveProduct } from '@/shell/use-active-product';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/design-system/components/ui/dropdown-menu';
import { Button } from '@/design-system/components/ui/button';

export function ProductSwitcher() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const product = useActiveProduct();
  const { canAccessBusiness, canAccessMarketing } = usePermissions();

  if (!canAccessBusiness || !canAccessMarketing) {
    const label = canAccessMarketing
      ? t('shell.productSwitcher.marketing')
      : t('shell.productSwitcher.business');
    return <span className="px-2 text-sm font-medium text-sidebar-foreground">{label}</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground">
          {product === 'marketing' ? <Megaphone className="size-4" /> : <Building2 className="size-4" />}
          <span>
            {product === 'marketing'
              ? t('shell.productSwitcher.marketing')
              : t('shell.productSwitcher.business')}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {canAccessBusiness && (
          <DropdownMenuItem onClick={() => navigate('/business/dashboard')}>
            <Building2 className="mr-2 size-4" />
            {t('shell.productSwitcher.business')}
          </DropdownMenuItem>
        )}
        {canAccessMarketing && (
          <DropdownMenuItem onClick={() => navigate('/marketing')}>
            <Megaphone className="mr-2 size-4" />
            {t('shell.productSwitcher.marketing')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
