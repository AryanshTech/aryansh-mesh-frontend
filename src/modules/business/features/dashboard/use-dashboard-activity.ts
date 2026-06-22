import { useMemo } from 'react';
import { useClients } from '@/modules/business/features/clients/use-clients';
import { useBookings } from '@/modules/business/features/bookings/use-bookings';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';

export type DashboardActivityKind = 'client' | 'booking';

export type DashboardActivityItem = {
  id: string;
  kind: DashboardActivityKind;
  name: string;
  timestamp: string;
  status?: string;
  email?: string;
  value?: string;
};

export function useDashboardActivity() {
  const { hasTenantContext } = useTenantScope();
  const clientsQuery = useClients(0, 10);
  const bookingsQuery = useBookings(0, 10);

  const items = useMemo(() => {
    const activities: DashboardActivityItem[] = [];

    for (const client of clientsQuery.data?.items ?? []) {
      activities.push({
        id: `client-${client.id}`,
        kind: 'client',
        name: client.name,
        timestamp: client.createdAt,
        email: client.email,
        status: 'Success',
      });
    }

    for (const booking of bookingsQuery.data?.items ?? []) {
      activities.push({
        id: `booking-${booking.id}`,
        kind: 'booking',
        name: booking.customerName,
        timestamp: booking.createdAt,
        status: booking.status,
      });
    }

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [clientsQuery.data, bookingsQuery.data]);

  return {
    items,
    isLoading: hasTenantContext && (clientsQuery.isLoading || bookingsQuery.isLoading),
    isError: clientsQuery.isError || bookingsQuery.isError,
  };
}
