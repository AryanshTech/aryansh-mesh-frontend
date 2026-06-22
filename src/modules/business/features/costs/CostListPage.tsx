import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DollarSign, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent } from '@/design-system/components/ui/card';
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
import { LinearPageHeader, LinearStatCard } from '@/shared/components/linear';
import { useCosts, useDeleteCost } from '@/modules/business/features/costs/use-costs';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import { ApiError } from '@/modules/business/types/api';

export function CostListPage() {
  const { t } = useTranslation();
  const { isWorkspace, path } = useTenantScope();
  const { canEdit } = usePermissions();
  const { data, isLoading, isError } = useCosts(0, 50);
  const deleteCost = useDeleteCost();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteCost.mutateAsync(deleteId);
      toast.success(t('costs.deleted'));
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
          <AlertDescription>{t('costs.loadError')}</AlertDescription>
        </Alert>
      </CrmPageShell>
    );
  }

  const items = data?.items ?? [];

  return (
    <CrmPageShell>
      <LinearPageHeader
        title={t('pages.costs')}
        description={t('costs.subtitle')}
        metaPills={
          isWorkspace
            ? [{ id: 'workspace', label: t('admin.tenants.title'), value: t('pages.costs') }]
            : undefined
        }
        actions={
          canEdit ? (
            <Button asChild>
              <Link to={path('/costs/new')}>
                <Plus className="size-4" />
                {t('empty.costsCta')}
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <LinearStatCard label={t('pages.costs')} value={items.length} icon={DollarSign} />
      </div>

      {items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <DollarSign />
            </EmptyMedia>
            <EmptyTitle>{t('costs.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('empty.costsMessage')}</EmptyDescription>
          </EmptyHeader>
          {canEdit && (
            <EmptyContent>
              <Button asChild>
                <Link to={path('/costs/new')}>{t('empty.costsCta')}</Link>
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <Card className="overflow-hidden">
          <CardContent dense className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('costs.table.label')}</TableHead>
                <TableHead>{t('costs.table.amount')}</TableHead>
                <TableHead>{t('costs.table.date')}</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((cost) => (
                <TableRow key={cost.id}>
                  <TableCell className="font-medium">{cost.label}</TableCell>
                  <TableCell>
                    {cost.amount} {cost.currency}
                  </TableCell>
                  <TableCell>
                    {cost.date ? new Date(cost.date).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={path(`/costs/${cost.id}`)}>{t('common.edit')}</Link>
                      </Button>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(cost.id)}
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
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t('costs.deleteTitle')}
        description={t('costs.deleteDescription')}
        onConfirm={() => void handleDelete()}
        loading={deleteCost.isPending}
      />
    </CrmPageShell>
  );
}
