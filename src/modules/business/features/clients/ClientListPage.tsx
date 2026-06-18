import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
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
import { ConfirmDialog } from '@/shared/components/crm/ConfirmDialog';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { useClients, useDeleteClient } from '@/modules/business/features/clients/use-clients';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import { ApiError } from '@/modules/business/types/api';

export function ClientListPage() {
  const { t } = useTranslation();
  const { isWorkspace, path } = useTenantScope();
  const { canEdit } = usePermissions();
  const { data, isLoading, isError } = useClients(0, 50);
  const deleteClient = useDeleteClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteClient.mutateAsync(deleteId);
      toast.success(t('clients.deleted'));
      setDeleteId(null);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t('errors.network'));
      }
    }
  }

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
          <AlertDescription>{t('clients.loadError')}</AlertDescription>
        </Alert>
      </CrmPageShell>
    );
  }

  const items = data?.items ?? [];

  return (
    <CrmPageShell>
      <PageHeader
        title={t('pages.clients')}
        description={t('clients.subtitle')}
        breadcrumbs={
          isWorkspace
            ? [
                { label: t('admin.tenants.title'), href: '/business/admin/tenants' },
                { label: t('pages.clients') },
              ]
            : undefined
        }
        action={
          canEdit ? (
            <Button asChild>
              <Link to={path('/clients/new')}>
                <Plus className="size-4" />
                {t('empty.clientsCta')}
              </Link>
            </Button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>{t('clients.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('empty.clientsMessage')}</EmptyDescription>
          </EmptyHeader>
          {canEdit && (
            <EmptyContent>
              <Button asChild>
                <Link to={path('/clients/new')}>{t('empty.clientsCta')}</Link>
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('clients.table.name')}</TableHead>
                <TableHead>{t('clients.table.email')}</TableHead>
                <TableHead>{t('clients.table.company')}</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email || '—'}</TableCell>
                  <TableCell>{client.company || '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={path(`/clients/${client.id}`)}>{t('common.edit')}</Link>
                      </Button>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(client.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t('clients.deleteTitle')}
        description={t('clients.deleteDescription')}
        onConfirm={() => void handleDelete()}
        loading={deleteClient.isPending}
      />
    </CrmPageShell>
  );
}
