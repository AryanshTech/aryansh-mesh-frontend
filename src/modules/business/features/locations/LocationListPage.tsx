import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
import { ConfirmDialog } from '@/shared/components/crm/ConfirmDialog';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { useDeleteLocation, useLocations } from '@/modules/business/features/locations/use-locations';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import { ApiError } from '@/modules/business/types/api';

export function LocationListPage() {
  const { t } = useTranslation();
  const { isWorkspace, path } = useTenantScope();
  const { canEdit } = usePermissions();
  const { data, isLoading, isError } = useLocations(0, 50);
  const deleteLocation = useDeleteLocation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteLocation.mutateAsync(deleteId);
      toast.success(t('locations.deleted'));
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
          <AlertDescription>{t('locations.loadError')}</AlertDescription>
        </Alert>
      </CrmPageShell>
    );
  }

  const items = data?.items ?? [];

  return (
    <CrmPageShell>
      <PageHeader
        title={t('pages.locations')}
        description={t('locations.subtitle')}
        breadcrumbs={
          isWorkspace
            ? [
                { label: t('admin.tenants.title'), href: '/business/admin/tenants' },
                { label: t('pages.locations') },
              ]
            : undefined
        }
        action={
          canEdit ? (
            <Button asChild>
              <Link to={path('/locations/new')}>
                <Plus className="size-4" />
                {t('locations.empty.cta')}
              </Link>
            </Button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MapPin />
            </EmptyMedia>
            <EmptyTitle>{t('locations.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('locations.empty.message')}</EmptyDescription>
          </EmptyHeader>
          {canEdit && (
            <EmptyContent>
              <Button asChild>
                <Link to={path('/locations/new')}>{t('locations.empty.cta')}</Link>
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('locations.table.name')}</TableHead>
                <TableHead>{t('locations.table.city')}</TableHead>
                <TableHead>{t('locations.table.coordinates')}</TableHead>
                <TableHead>{t('locations.table.status')}</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link
                        to={path(`/locations/${location.id}`)}
                        className="font-medium hover:underline"
                      >
                        {location.name}
                      </Link>
                      {location.primary && (
                        <Badge variant="secondary">{t('locations.primary')}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{location.city || '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {location.latitude != null && location.longitude != null
                      ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{location.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(location.id)}
                          aria-label={t('common.delete')}
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
        title={t('locations.deleteTitle')}
        description={t('locations.deleteDescription')}
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        loading={deleteLocation.isPending}
      />
    </CrmPageShell>
  );
}
