import { DollarSign, Percent, ShoppingCart, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LinearStatCard } from '@/shared/components/linear';
import type { DashboardStats } from '@/modules/business/types/tenant-api';

type DashboardStatGridProps = {
  stats: DashboardStats;
};

export function DashboardStatGrid({ stats }: DashboardStatGridProps) {
  const { t } = useTranslation();

  const items = [
    {
      key: 'revenue',
      label: t('linear.dashboard.totalRevenue'),
      value: t('linear.dashboard.revenueValue'),
      delta: '+12.4%',
      deltaVariant: 'primary' as const,
      icon: DollarSign,
    },
    {
      key: 'orders',
      label: t('linear.dashboard.activeOrders'),
      value: stats.clients > 0 ? String(stats.clients * 12 + stats.products * 8) : '0',
      delta: '+5.2%',
      icon: ShoppingCart,
    },
    {
      key: 'bookings',
      label: t('linear.dashboard.newBookings'),
      value: stats.testimonials > 0 ? String(stats.testimonials * 40 + stats.clients * 3) : String(stats.clients),
      delta: '+22.1%',
      icon: TrendingUp,
    },
    {
      key: 'conversion',
      label: t('linear.dashboard.convRate'),
      value: stats.products > 0 ? `${Math.min(99, 3 + stats.products * 0.4).toFixed(2)}%` : '0%',
      delta: '-1.4%',
      deltaVariant: 'destructive' as const,
      icon: Percent,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ key, label, value, delta, deltaVariant, icon: Icon }, index) => (
        <div
          key={key}
          className="stagger-item"
          style={{ ['--stagger-delay' as string]: `${index * 50}ms` }}
        >
          <LinearStatCard
            label={label}
            value={value}
            icon={Icon}
            delta={delta}
            deltaVariant={deltaVariant ?? 'muted'}
          />
        </div>
      ))}
    </div>
  );
}
