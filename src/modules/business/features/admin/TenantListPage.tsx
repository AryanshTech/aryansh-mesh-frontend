import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Badge } from '@/design-system/components/ui/badge';
import { Card, CardContent } from '@/design-system/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/design-system/components/ui/pagination';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/design-system/components/ui/empty';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { ShellPageActions } from '@/shared/components/layout/ShellPageActions';
import { useTenants } from '@/modules/business/features/admin/use-tenants';
import { formatDate } from '@/modules/business/navigation';
import { getLocale } from '@/core/i18n';

const PAGE_SIZE = 20;

export function TenantListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const locale = getLocale();
  const { data, isLoading, isError, refetch } = useTenants(page, PAGE_SIZE);

  return (
    <CrmPageShell>
      <PageHeader
        description={t('admin.tenants.description')}
        action={
          <ShellPageActions>
            <Button onClick={() => navigate('/admin/tenants/new')}>
              <Plus />
              {t('admin.tenants.create')}
            </Button>
          </ShellPageActions>
        }
      />

      <Card>
        <CardContent className="p-0">
          {isLoading && (
            <div className="flex flex-col gap-2 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {isError && (
            <div className="p-4">
              <Alert variant="destructive">
                <AlertTitle>{t('errors.network')}</AlertTitle>
                <AlertDescription className="flex flex-col gap-3">
                  <span>{t('admin.tenants.loadError')}</span>
                  <Button variant="outline" size="sm" className="w-fit" onClick={() => void refetch()}>
                    {t('common.retry')}
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {!isLoading && !isError && data && data.items.length === 0 && (
            <Empty className="border-0">
              <EmptyHeader>
                <EmptyTitle>{t('admin.tenants.empty.title')}</EmptyTitle>
                <EmptyDescription>{t('admin.tenants.empty.description')}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => navigate('/admin/tenants/new')}>
                  {t('admin.tenants.empty.cta')}
                </Button>
              </EmptyContent>
            </Empty>
          )}

          {!isLoading && !isError && data && data.items.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.tenants.table.name')}</TableHead>
                    <TableHead>{t('admin.tenants.table.slug')}</TableHead>
                    <TableHead>{t('admin.tenants.table.status')}</TableHead>
                    <TableHead>{t('admin.tenants.table.createdAt')}</TableHead>
                    <TableHead className="w-[140px] text-right">{t('common.edit')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">
                        <Link
                          to={`/admin/tenants/${tenant.id}`}
                          className="text-foreground hover:text-primary"
                        >
                          {tenant.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/admin/tenants/${tenant.id}`}
                          className="text-muted-foreground hover:text-primary"
                        >
                          {tenant.slug}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{tenant.status}</Badge>
                      </TableCell>
                      <TableCell className="font-tabular text-muted-foreground">
                        {formatDate(tenant.createdAt, locale)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/admin/tenants/${tenant.id}/workspace/dashboard`,
                            )
                          }
                        >
                          <ExternalLink className="size-4" />
                          {t('admin.tenants.detail.manageTenant')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.totalPages > 1 && (
                <Pagination className="p-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        aria-disabled={page === 0}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink isActive>{page + 1}</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setPage((p) => Math.min(data.totalPages - 1, p + 1))
                        }
                        aria-disabled={page >= data.totalPages - 1}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </CrmPageShell>
  );
}
