import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  CalendarClock,
  DollarSign,
  LayoutDashboard,
  Link2,
  MapPin,
  MessageSquareQuote,
  Package,
  Rocket,
  Users,
  Blocks,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Button } from '@/design-system/components/ui/button';

const modules = [
  { suffix: '/dashboard', key: 'business.nav.dashboard', icon: LayoutDashboard },
  { suffix: '/profile', key: 'business.nav.business', icon: Building2 },
  { suffix: '/products', key: 'business.nav.products', icon: Package },
  { suffix: '/clients', key: 'business.nav.clients', icon: Users },
  { suffix: '/locations', key: 'business.nav.locations', icon: MapPin },
  { suffix: '/costs', key: 'business.nav.costs', icon: DollarSign },
  { suffix: '/testimonials', key: 'business.nav.testimonials', icon: MessageSquareQuote },
  { suffix: '/content', key: 'business.nav.content', icon: Blocks },
  { suffix: '/bookings', key: 'business.nav.bookings', icon: CalendarClock },
  { suffix: '/publish', key: 'business.nav.publish', icon: Rocket },
  { suffix: '/connect', key: 'business.nav.connect', icon: Link2 },
] as const;

interface AdminTenantQuickNavProps {
  tenantId: string;
}

export function AdminTenantQuickNav({ tenantId }: AdminTenantQuickNavProps) {
  const { t } = useTranslation();
  const base = `/admin/tenants/${tenantId}/workspace`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.tenants.detail.manageModules')}</CardTitle>
        <CardDescription>{t('admin.tenants.detail.manageModulesHint')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map(({ suffix, key, icon: Icon }) => (
          <Button key={suffix} variant="outline" className="h-auto justify-start gap-2 px-3 py-2.5" asChild>
            <Link to={`${base}${suffix}`}>
              <Icon className="size-4 shrink-0" />
              <span>{t(key)}</span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
