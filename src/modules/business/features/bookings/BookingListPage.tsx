import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bolt, CalendarClock, DollarSign, Mail, Phone, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/design-system/components/ui/empty';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { Textarea } from '@/design-system/components/ui/textarea';
import { layout } from '@/design-system/tokens/layout';
import { typographyClasses } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import {
  LinearInsightBanner,
  LinearMetaGrid,
  LinearQueueList,
  LinearSplitLayout,
  LinearTimeline,
} from '@/shared/components/linear';
import { useBookings } from '@/modules/business/features/bookings/use-bookings';
import type { Booking } from '@/modules/business/types/tenant-api';

function relativeTime(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  const diffMs = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const minutes = Math.round(diffMs / 60_000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  return rtf.format(hours, 'hour');
}

export function BookingListPage() {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError } = useBookings(0, 50);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const items = data?.items ?? [];

  const queueItems = useMemo(
    () =>
      items.map((booking) => ({
        id: booking.id,
        tag: t('linear.bookings.inquiry'),
        title: booking.customerName,
        preview: booking.notes || t('linear.bookings.noDescription'),
        timestamp: relativeTime(booking.createdAt, i18n.language),
      })),
    [items, t, i18n.language],
  );

  const selected: Booking | undefined = items.find((b) => b.id === (selectedId ?? items[0]?.id));

  if (isLoading) {
    return (
      <CrmPageShell mode="viewport">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </CrmPageShell>
    );
  }

  if (isError) {
    return (
      <CrmPageShell mode="viewport">
        <Alert variant="destructive">
          <AlertTitle>{t('errors.network')}</AlertTitle>
          <AlertDescription>{t('bookings.loadError')}</AlertDescription>
        </Alert>
      </CrmPageShell>
    );
  }

  if (items.length === 0) {
    return (
      <CrmPageShell mode="viewport" className="p-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarClock />
            </EmptyMedia>
            <EmptyTitle>{t('bookings.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('bookings.empty.description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CrmPageShell>
    );
  }

  const activeId = selected?.id;

  return (
    <CrmPageShell mode="viewport">
      <LinearSplitLayout
        fullBleed
        leftWidth={380}
        left={
          <LinearQueueList
            title={t('linear.bookings.inbox')}
            count={items.length}
            items={queueItems}
            activeId={activeId}
            onSelect={setSelectedId}
            className="h-full min-h-0"
          />
        }
        center={
          selected ? (
            <div className="flex h-full min-h-0 flex-col overflow-y-auto scrollbar-linear bg-background">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-8 py-5">
                <div>
                  <h1 className={cn(typographyClasses.body, 'font-semibold text-foreground')}>
                    {t('linear.bookings.inquiryTitle', { service: selected.notes?.split(' ')[0] ?? t('linear.bookings.inquiry') })}
                  </h1>
                  <p className={typographyClasses.caption}>{t('linear.bookings.assignedTo')}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success(t('linear.bookings.archiveSuccess'))}
                  >
                    {t('linear.bookings.archive')}
                  </Button>
                  <Button size="sm" onClick={() => toast.success(t('linear.bookings.acceptSuccess'))}>
                    {t('linear.bookings.accept')}
                  </Button>
                </div>
              </div>

              <div className="grid gap-8 px-8 py-8 lg:grid-cols-12">
                <div className="flex flex-col gap-6 lg:col-span-8">
                  <Card className={layout.linear.hairlineCard}>
                    <CardContent dense className="pt-6">
                      <div className="mb-6 flex items-start gap-6">
                        <div className="flex size-16 items-center justify-center rounded-lg border border-border bg-muted text-lg font-semibold">
                          {selected.customerName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h2 className={cn(typographyClasses.body, 'font-semibold')}>{selected.customerName}</h2>
                          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                            {selected.customerPhone ? (
                              <span className={cn('flex items-center gap-2', typographyClasses.caption, 'text-muted-foreground')}>
                                <Phone className="text-muted-foreground" />
                                {selected.customerPhone}
                              </span>
                            ) : null}
                            <span className={cn('flex items-center gap-2', typographyClasses.caption, 'text-muted-foreground')}>
                              <Mail className="text-muted-foreground" />
                              {t('linear.bookings.noEmail')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-border pt-6">
                        <h3 className={typographyClasses.eyebrow}>{t('linear.bookings.projectDescription')}</h3>
                        <p className={cn('mt-3 leading-relaxed', typographyClasses.bodySm, 'text-muted-foreground')}>
                          {selected.notes || t('linear.bookings.noDescription')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <LinearMetaGrid
                    items={[
                      {
                        id: 'service',
                        label: t('linear.bookings.serviceRequested'),
                        value: selected.notes?.slice(0, 40) ?? t('linear.bookings.inquiry'),
                        icon: Wrench,
                      },
                      {
                        id: 'budget',
                        label: t('linear.bookings.estimatedBudget'),
                        value: t('linear.bookings.budgetPlaceholder'),
                        icon: DollarSign,
                      },
                    ]}
                  />

                  <LinearInsightBanner
                    variant="compact"
                    title={t('linear.bookings.gtmIntelligence')}
                    icon={Bolt}
                    description={t('linear.bookings.gtmDescription')}
                  />
                </div>

                <div className="flex flex-col gap-6 lg:col-span-4">
                  <Card className={layout.linear.hairlineCard}>
                    <CardHeader dense>
                      <CardTitle className={typographyClasses.eyebrow}>{t('linear.bookings.requestedSlot')}</CardTitle>
                    </CardHeader>
                    <CardContent dense>
                      <div className="flex items-center gap-4">
                        <div className="flex size-11 flex-col items-center justify-center rounded-md border border-border bg-muted">
                          <span className={cn(typographyClasses.caption, 'font-bold uppercase text-muted-foreground')}>
                            {selected.date.split('-')[1] ?? '—'}
                          </span>
                          <span className={cn(typographyClasses.subhead, 'font-bold text-primary')}>{selected.date.split('-')[2] ?? '—'}</span>
                        </div>
                        <div>
                          <p className={typographyClasses.button}>{selected.date}</p>
                          <p className={typographyClasses.caption}>{selected.time}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-4 w-full">
                        {t('linear.bookings.reschedule')}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className={layout.linear.hairlineCard}>
                    <CardHeader dense>
                      <CardTitle className={typographyClasses.eyebrow}>{t('linear.bookings.leadHistory')}</CardTitle>
                    </CardHeader>
                    <CardContent dense>
                      <LinearTimeline
                        items={[
                          {
                            id: '1',
                            title: t('linear.bookings.inquiryReceived'),
                            subtitle: relativeTime(selected.createdAt, i18n.language),
                            active: true,
                          },
                          {
                            id: '2',
                            title: t('linear.bookings.autoResponse'),
                            subtitle: t('linear.bookings.autoResponseTime'),
                          },
                        ]}
                      />
                    </CardContent>
                  </Card>

                  <Card className={layout.linear.hairlineCard}>
                    <CardHeader dense className="flex-row items-center justify-between">
                      <CardTitle className={typographyClasses.eyebrow}>{t('linear.bookings.internalNotes')}</CardTitle>
                    </CardHeader>
                    <CardContent dense>
                      <Textarea placeholder={t('linear.bookings.notesPlaceholder')} className="min-h-24" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : null
        }
      />
    </CrmPageShell>
  );
}
