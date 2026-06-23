import { useTranslation } from 'react-i18next';
import { CalendarDays } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { ListSkeleton } from '@/shared/components/Skeletons';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Card } from '@/design-system/components/ui/card';
import { useBookings, type BookingView } from '@/modules/business/api/hooks/use-bookings';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';

function bookingTone(status: BookingView['status']) {
  if (status === 'CONFIRMED') return 'success' as const;
  if (status === 'CANCELLED') return 'warning' as const;
  if (status === 'COMPLETED') return 'success' as const;
  return 'default' as const;
}

function formatDateTime(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BookingsPage() {
  const { t } = useTranslation();
  const { hasTenant } = useTenantPath();
  const { data, isLoading, isError, refetch, isFetching } = useBookings();
  const bookings = data?.items ?? [];
  const showSkeleton = !hasTenant || isLoading || (isFetching && !data);

  return (
    <PageShell>
      <PageHeader
        title={t('bookings.title')}
        description={t('bookings.subtitle')}
      />
      {showSkeleton ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState title={t('bookings.errorTitle')} onRetry={() => void refetch()} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarDays />}
          title={t('bookings.emptyTitle')}
          description={t('bookings.emptyDescription')}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left">
              <tr>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('bookings.fieldClient')}</th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('bookings.fieldPartySize')}</th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('bookings.fieldStartsAt')}</th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('bookings.fieldStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2.5">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{b.customerName}</span>
                      {b.customerPhone ? (
                        <span className="text-xs text-muted-foreground">{b.customerPhone}</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{b.partySize ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{formatDateTime(b.startsAt)}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge label={b.status} tone={bookingTone(b.status)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </PageShell>
  );
}
