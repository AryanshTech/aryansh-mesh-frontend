import { useTranslation } from 'react-i18next';
import { CalendarClock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Badge } from '@/design-system/components/ui/badge';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/design-system/components/ui/empty';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/components/ui/table';
import { FeatureListShell } from '@/shared/components/crm/FeatureListShell';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { useBookings } from '@/modules/business/features/bookings/use-bookings';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';

export function BookingListPage() {
  const { t } = useTranslation();
  const { isWorkspace } = useTenantScope();
  const { data, isLoading, isError } = useBookings(0, 50);

  if (isLoading) {
    return (
      <CrmPageShell>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </CrmPageShell>
    );
  }

  if (isError) {
    return (
      <CrmPageShell>
        <Alert variant="destructive">
          <AlertTitle>{t('errors.network')}</AlertTitle>
          <AlertDescription>{t('bookings.loadError')}</AlertDescription>
        </Alert>
      </CrmPageShell>
    );
  }

  const items = data?.items ?? [];

  return (
    <CrmPageShell>
      <PageHeader
        description={t('bookings.subtitle')}
        breadcrumbs={
          isWorkspace
            ? [
                { label: t('admin.tenants.title'), href: '/admin/tenants' },
                { label: t('pages.bookings') },
              ]
            : undefined
        }
      />

      {items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarClock />
            </EmptyMedia>
            <EmptyTitle>{t('bookings.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('bookings.empty.description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <FeatureListShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('bookings.table.date')}</TableHead>
                <TableHead>{t('bookings.table.time')}</TableHead>
                <TableHead>{t('bookings.table.name')}</TableHead>
                <TableHead>{t('bookings.table.phone')}</TableHead>
                <TableHead>{t('bookings.table.guests')}</TableHead>
                <TableHead>{t('bookings.table.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{booking.time}</TableCell>
                  <TableCell className="font-medium">{booking.customerName}</TableCell>
                  <TableCell>{booking.customerPhone}</TableCell>
                  <TableCell>{booking.partySize}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{booking.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </FeatureListShell>
      )}
    </CrmPageShell>
  );
}
