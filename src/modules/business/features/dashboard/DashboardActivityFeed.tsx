import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/components/ui/table';
import { LinearStatusBadge } from '@/shared/components/linear';
import { layout } from '@/design-system/tokens/layout';
import { typographyClasses } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';
import type { DashboardActivityItem } from '@/modules/business/features/dashboard/use-dashboard-activity';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

type DashboardActivityFeedProps = {
  items: DashboardActivityItem[];
  isLoading: boolean;
  viewAllHref?: string;
};

export function DashboardActivityFeed({ items, isLoading, viewAllHref }: DashboardActivityFeedProps) {
  const { t } = useTranslation();

  return (
    <Card className={cn(layout.linear.hairlineCard, 'h-full overflow-hidden')}>
      <CardHeader dense className="flex-row items-center justify-between border-b border-border px-6 py-4">
        <CardTitle className={typographyClasses.cardTitle}>
          {t('linear.dashboard.recentActivity')}
        </CardTitle>
        {viewAllHref ? (
          <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" asChild>
            <Link to={viewAllHref}>{t('linear.dashboard.viewAll')}</Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent dense className="p-0">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className={cn('p-6', typographyClasses.caption)}>{t('dashboard.noActivity')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead>{t('dashboard.activity.customer')}</TableHead>
                <TableHead>{t('dashboard.activity.type')}</TableHead>
                <TableHead>{t('dashboard.activity.value')}</TableHead>
                <TableHead className="text-right">{t('dashboard.activity.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/20">
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-full bg-muted', typographyClasses.caption, 'font-semibold')}>
                        {initials(item.name)}
                      </div>
                      <div>
                        <p className={typographyClasses.button}>{item.name}</p>
                        {item.email ? (
                          <p className={cn(typographyClasses.caption, 'text-muted-foreground')}>{item.email}</p>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.kind === 'client'
                      ? t('dashboard.activity.clientAdded')
                      : t('dashboard.activity.bookingReceived')}
                  </TableCell>
                  <TableCell className={cn(typographyClasses.mono, 'text-muted-foreground')}>
                    {item.value ?? '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status ? (
                      <LinearStatusBadge
                        label={item.status}
                        appearance="pill"
                        variant={item.status.toLowerCase() === 'success' ? 'success' : 'pending'}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
