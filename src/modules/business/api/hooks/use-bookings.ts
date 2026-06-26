import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { fetchAllPages } from '@/modules/business/api/fetch-paged-list';
import { businessKeys } from '@/modules/business/api/query-keys';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import type { Booking } from '@/modules/business/types/entities';

interface BookingApi {
  id: string;
  customerName: string;
  customerPhone?: string | null;
  partySize?: number | null;
  notes?: string | null;
  date: string;
  time: string;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface BookingListApi {
  items: BookingApi[];
  total?: number;
  totalElements?: number;
}

export interface BookingView extends Booking {
  clientName: string;
  productName?: string | null;
  startsAt: string;
}

const STATUS_FROM_API: Record<string, BookingView['status']> = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  cancelled: 'CANCELLED',
  completed: 'COMPLETED',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

function combineDateTime(date: string, time: string): string {
  if (!date) return '';
  if (!time) return date;
  const iso = `${date}T${time.length === 5 ? `${time}:00` : time}`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toISOString();
}

function mapBooking(b: BookingApi): BookingView {
  const status = STATUS_FROM_API[(b.status ?? 'pending').toLowerCase()] ?? 'PENDING';
  return {
    id: b.id,
    customerName: b.customerName,
    customerPhone: b.customerPhone ?? null,
    partySize: b.partySize ?? null,
    notes: b.notes ?? null,
    date: b.date,
    time: b.time,
    status,
    createdAt: b.createdAt ?? '',
    updatedAt: b.updatedAt ?? '',
    clientName: b.customerName,
    productName: null,
    startsAt: combineDateTime(b.date, b.time),
  };
}

export function useBookings() {
  const { tenantId, path, hasTenant } = useTenantPath();
  return useQuery({
    queryKey: businessKeys.bookings(tenantId),
    queryFn: async () => {
      const result = await fetchAllPages<BookingApi>((page) =>
        api.get<BookingListApi>(`${path}/bookings`, { query: { page, size: 100 } }),
      );
      return { items: result.items.map(mapBooking), total: result.total };
    },
    enabled: hasTenant,
  });
}
