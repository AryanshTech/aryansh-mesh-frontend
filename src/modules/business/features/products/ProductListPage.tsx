import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Brush, Code, Filter, Megaphone, MoreHorizontal, Package, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Card } from '@/design-system/components/ui/card';
import { Checkbox } from '@/design-system/components/ui/checkbox';
import {
  Empty,
  EmptyContent,
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
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { ShellPageActions } from '@/shared/components/layout/ShellPageActions';
import {
  LinearDataToolbar,
  LinearInsightBanner,
  LinearPageHeader,
  LinearPagination,
  LinearProgressBar,
  LinearStatCard,
  LinearStatusBadge,
} from '@/shared/components/linear';
import { useProducts } from '@/modules/business/features/products/use-products';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import type { Product } from '@/modules/business/types/tenant-api';
import { cn } from '@/design-system/lib/utils';
import { typographyClasses } from '@/design-system/tokens/typography';

const CATEGORY_ICONS: Record<string, typeof Package> = {
  marketing: Megaphone,
  development: Code,
  design: Brush,
};

function marginPercent(product: Product): number | null {
  if (!product.price || product.price <= 0) return null;
  return Math.round(((product.price - product.cost) / product.price) * 1000) / 10;
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(amount);
}

export function ProductListPage() {
  const { t } = useTranslation();
  const { isWorkspace, path } = useTenantScope();
  const { canEdit } = usePermissions();
  const { data, isLoading, isError } = useProducts(0, 100);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const items = data?.items ?? [];

  const filtered = useMemo(() => {
    if (activeTab === 'all') return items;
    return items.filter((p) => p.category?.toLowerCase() === activeTab);
  }, [items, activeTab]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => {
    const active = items.filter((p) => p.status?.toLowerCase() === 'active').length;
    const margins = items.map(marginPercent).filter((m): m is number => m !== null);
    const avgMargin = margins.length
      ? Math.round((margins.reduce((a, b) => a + b, 0) / margins.length) * 10) / 10
      : 0;
    const inventory = items.reduce((sum, p) => sum + (p.price ?? 0), 0);
    return { total: items.length, active, avgMargin, inventory };
  }, [items]);

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of items) {
      const key = p.category || 'other';
      counts[key] = (counts[key] ?? 0) + 1;
    }
    const total = items.length || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label, count]) => ({ label, value: Math.round((count / total) * 100) }));
  }, [items]);

  if (isLoading) {
    return (
      <CrmPageShell>
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </CrmPageShell>
    );
  }

  if (isError) {
    return (
      <CrmPageShell>
        <Alert variant="destructive">
          <AlertTitle>{t('errors.network')}</AlertTitle>
          <AlertDescription>{t('products.loadError')}</AlertDescription>
        </Alert>
      </CrmPageShell>
    );
  }

  return (
    <CrmPageShell>
      <LinearPageHeader
        title={t('linear.catalog.title')}
        description={t('linear.catalog.subtitle')}
        actions={
          canEdit ? (
            <ShellPageActions>
              <Button variant="outline" size="sm">
                <Filter data-icon="inline-start" />
                {t('linear.catalog.filters')}
              </Button>
              <Button asChild size="sm">
                <Link to={path('/products/new')}>
                  <Plus data-icon="inline-start" />
                  {t('linear.catalog.newProduct')}
                </Link>
              </Button>
            </ShellPageActions>
          ) : undefined
        }
      />

      {isWorkspace ? (
        <p className={typographyClasses.caption}>
          {t('admin.tenants.title')} / {t('pages.products')}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <LinearStatCard label={t('linear.catalog.totalProducts')} value={stats.total} delta="+12%" deltaVariant="success" icon={Package} />
        <LinearStatCard label={t('linear.catalog.activeServices')} value={stats.active} icon={Megaphone} />
        <LinearStatCard label={t('linear.catalog.avgMargin')} value={`${stats.avgMargin}%`} deltaVariant="success" icon={Package} />
        <LinearStatCard
          label={t('linear.catalog.inventoryValue')}
          value={formatMoney(stats.inventory, items[0]?.currency ?? 'USD')}
          trailing={<LinearStatusBadge label={t('linear.catalog.live')} variant="live" />}
        />
      </div>

      {items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Package />
            </EmptyMedia>
            <EmptyTitle>{t('products.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('empty.productsMessage')}</EmptyDescription>
          </EmptyHeader>
          {canEdit && (
            <EmptyContent>
              <Button asChild>
                <Link to={path('/products/new')}>{t('empty.productsCta')}</Link>
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <Card className={cn(layout.linear.hairlineCard, 'overflow-hidden')}>
          <LinearDataToolbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={[
              { id: 'all', label: t('linear.catalog.tabAll') },
              { id: 'services', label: t('linear.catalog.tabServices') },
              { id: 'software', label: t('linear.catalog.tabSoftware') },
            ]}
            trailing={<span className={typographyClasses.caption}>{t('linear.catalog.sortName')}</span>}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox aria-label={t('common.selectAll')} />
                </TableHead>
                <TableHead className={typographyClasses.eyebrowUpper}>{t('products.table.name')}</TableHead>
                <TableHead className={typographyClasses.eyebrowUpper}>{t('products.table.category')}</TableHead>
                <TableHead className={cn('text-right', typographyClasses.eyebrowUpper)}>{t('linear.catalog.cost')}</TableHead>
                <TableHead className={cn('text-right', typographyClasses.eyebrowUpper)}>{t('products.table.price')}</TableHead>
                <TableHead className={cn('text-right', typographyClasses.eyebrowUpper)}>{t('linear.catalog.margin')}</TableHead>
                <TableHead className={cn('text-center', typographyClasses.eyebrowUpper)}>{t('products.table.status')}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((product) => {
                const Icon = CATEGORY_ICONS[product.category?.toLowerCase() ?? ''] ?? Package;
                const margin = marginPercent(product);
                const isActive = product.status?.toLowerCase() === 'active';
                return (
                  <TableRow key={product.id} className="group">
                    <TableCell>
                      <Checkbox aria-label={product.name} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded bg-muted">
                          <Icon className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.sku ? (
                            <p className={cn(typographyClasses.mono, 'text-muted-foreground')}>{product.sku}</p>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category || '—'}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatMoney(product.cost, product.currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatMoney(product.price, product.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      {margin !== null ? (
                        <span className={cn('text-xs font-semibold', margin >= 50 ? 'text-success' : 'text-muted-foreground')}>
                          {margin}%
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <LinearStatusBadge
                        label={product.status}
                        variant={isActive ? 'active' : 'draft'}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {canEdit ? (
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" asChild>
                          <Link to={path(`/products/${product.id}`)} aria-label={t('common.edit')}>
                            <MoreHorizontal />
                          </Link>
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <LinearPagination
            from={filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}
            to={Math.min(page * pageSize, filtered.length)}
            total={filtered.length}
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
            summaryLabel={t('linear.catalog.showing', {
              from: filtered.length === 0 ? 0 : (page - 1) * pageSize + 1,
              to: Math.min(page * pageSize, filtered.length),
              total: filtered.length,
            })}
            className="border-t border-border bg-muted/30 px-4 py-3"
          />
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <LinearInsightBanner
            title={t('linear.catalog.insightTitle')}
            badge={t('linear.insight.badge')}
            description={t('linear.catalog.insightDescription')}
            primaryAction={{ label: t('linear.catalog.acceptRecommendation'), onClick: () => {} }}
            secondaryAction={{ label: t('linear.catalog.dismiss'), onClick: () => {} }}
          />
        </div>
        <Card className="p-6">
          <p className={typographyClasses.eyebrowUpper}>{t('linear.catalog.categoryBreakdown')}</p>
          <div className="mt-4 flex flex-col gap-4">
            {categoryBreakdown.map((row, index) => (
              <LinearProgressBar
                key={row.label}
                label={row.label}
                value={row.value}
                variant={index === 0 ? 'primary' : index === 1 ? 'primary' : 'muted'}
              />
            ))}
          </div>
        </Card>
      </div>
    </CrmPageShell>
  );
}
