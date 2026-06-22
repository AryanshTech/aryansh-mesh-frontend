import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, ExternalLink, Search } from 'lucide-react';
import { Button } from '@/design-system/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Badge } from '@/design-system/components/ui/badge';
import { Card, CardContent } from '@/design-system/components/ui/card';
import { Input } from '@/design-system/components/ui/input';
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
import { ShellPageActions } from '@/shared/components/layout/ShellPageActions';
import { LinearPageHeader } from '@/shared/components/linear';
import { useTenants } from '@/modules/business/features/admin/use-tenants';
import { formatDate } from '@/modules/business/navigation';
import { getLocale } from '@/core/i18n';
import { buildTenantWorkspacePath } from '@/shell/navigation';
import { recordRecentTenant } from '@/shell/recent-workspaces';

const PAGE_SIZE = 20;

export function TenantListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const locale = getLocale();
  const { data, isLoading, isError, refetch } = useTenants(page, PAGE_SIZE);

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter(
      (tenant) =>
        tenant.name.toLowerCase().includes(normalized) ||
        tenant.slug.toLowerCase().includes(normalized),
    );
  }, [data?.items, query]);

  const openWorkspace = (tenantId: string, tenantName: string) => {
    const path = buildTenantWorkspacePath(tenantId, 'dashboard');
    recordRecentTenant({ id: tenantId, name: tenantName, lastPath: path });
    navigate(path);
  };

  return (
    <CrmPageShell>
      <LinearPageHeader
        title={t('admin.tenants.title')}
        description={t('admin.tenants.description')}
        actions={
          <ShellPageActions>
            <Button onClick={() => navigate('/admin/tenants/new')}>
              <Plus data-icon="inline-start" />
              {t('admin.tenants.create')}
            </Button>
          </ShellPageActions>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('shell.adminHub.searchBusinesses')}
          className="pl-9"
          aria-label={t('shell.adminHub.searchBusinesses')}
        />
      </div>

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

          {!isLoading && !isError && data && data.items.length > 0 && filteredItems.length === 0 && (
            <Empty className="border-0 py-8">
              <EmptyHeader>
                <EmptyTitle>{t('shell.adminHub.noSearchResults')}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          )}

          {!isLoading && !isError && data && filteredItems.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.tenants.table.name')}</TableHead>
                    <TableHead>{t('admin.tenants.table.slug')}</TableHead>
                    <TableHead>{t('admin.tenants.table.status')}</TableHead>
                    <TableHead>{t('admin.tenants.table.createdAt')}</TableHead>
                    <TableHead className="w-[180px] text-right">{t('shell.adminHub.openWorkspace')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">
                        <Link
                          to={`/admin/tenants/${tenant.id}`}
                          className="text-foreground hover:text-primary"
                          onClick={() =>
                            recordRecentTenant({
                              id: tenant.id,
                              name: tenant.name,
                              lastPath: `/admin/tenants/${tenant.id}`,
                            })
                          }
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
                        <Button size="sm" onClick={() => openWorkspace(tenant.id, tenant.name)}>
                          <ExternalLink data-icon="inline-start" />
                          {t('shell.adminHub.openWorkspace')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!query.trim() && data.totalPages > 1 && (
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
