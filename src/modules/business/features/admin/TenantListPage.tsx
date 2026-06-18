import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
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
        title={t('admin.tenants.title')}
        description={t('admin.tenants.description')}
        action={
          <Button onClick={() => navigate('/business/admin/tenants/new')}>
            <Plus />
            {t('admin.tenants.create')}
          </Button>
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
            <Empty className="border-0">
              <EmptyHeader>
                <EmptyTitle>{t('errors.network')}</EmptyTitle>
                <EmptyDescription>{t('common.retry')}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={() => void refetch()}>
                  {t('common.retry')}
                </Button>
              </EmptyContent>
            </Empty>
          )}

          {!isLoading && !isError && data && data.items.length === 0 && (
            <Empty className="border-0">
              <EmptyHeader>
                <EmptyTitle>{t('admin.tenants.empty.title')}</EmptyTitle>
                <EmptyDescription>{t('admin.tenants.empty.description')}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => navigate('/business/admin/tenants/new')}>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((tenant) => (
                    <TableRow
                      key={tenant.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/business/admin/tenants/${tenant.id}`)}
                    >
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>{tenant.slug}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{tenant.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(tenant.createdAt, locale)}</TableCell>
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
