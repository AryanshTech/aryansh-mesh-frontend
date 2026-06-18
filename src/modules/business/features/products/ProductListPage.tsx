import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
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
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { useProducts } from '@/modules/business/features/products/use-products';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import { Package } from 'lucide-react';

export function ProductListPage() {
  const { t } = useTranslation();
  const { isWorkspace, path } = useTenantScope();
  const { canEdit } = usePermissions();
  const { data, isLoading, isError } = useProducts(0, 50);

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
          <AlertDescription>{t('products.loadError')}</AlertDescription>
        </Alert>
      </CrmPageShell>
    );
  }

  const items = data?.items ?? [];

  return (
    <CrmPageShell>
      <PageHeader
        title={t('pages.products')}
        description={t('products.subtitle')}
        breadcrumbs={
          isWorkspace
            ? [
                { label: t('admin.tenants.title'), href: '/business/admin/tenants' },
                { label: t('pages.products') },
              ]
            : undefined
        }
        action={
          canEdit ? (
            <Button asChild>
              <Link to={path('/products/new')}>
                <Plus className="size-4" />
                {t('empty.productsCta')}
              </Link>
            </Button>
          ) : undefined
        }
      />

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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('products.table.name')}</TableHead>
                <TableHead>{t('products.table.price')}</TableHead>
                <TableHead>{t('products.table.status')}</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {product.price} {product.currency}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={path(`/products/${product.id}`)}>{t('common.edit')}</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </CrmPageShell>
  );
}
