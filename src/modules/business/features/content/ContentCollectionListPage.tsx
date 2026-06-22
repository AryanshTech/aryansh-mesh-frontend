import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Blocks, Plus, Trash2 } from 'lucide-react';
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
import { LinearPageHeader, LinearStatCard, LinearStatusBadge } from '@/shared/components/linear';
import {
  useContentCollections,
  useDeleteContentCollection,
} from '@/modules/business/features/content/use-content-collections';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import { ApiError } from '@/modules/business/types/api';
import { typographyClasses } from '@/design-system/tokens/typography';

export function ContentCollectionListPage() {
  const { t } = useTranslation();
  const { isWorkspace, path } = useTenantScope();
  const { canEdit } = usePermissions();
  const { data, isLoading, isError } = useContentCollections(0, 50);
  const deleteCollection = useDeleteContentCollection();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteCollection.mutateAsync(deleteId);
      toast.success(t('content.deleted'));
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
          <AlertDescription>{t('content.loadError')}</AlertDescription>
        </Alert>
      </CrmPageShell>
    );
  }

  const items = data?.items ?? [];

  return (
    <CrmPageShell>
      <LinearPageHeader
        title={t('pages.content')}
        description={t('content.subtitle')}
        metaPills={
          isWorkspace
            ? [{ id: 'workspace', label: t('admin.tenants.title'), value: t('pages.content') }]
            : undefined
        }
        actions={
          canEdit ? (
            <Button asChild>
              <Link to={path('/content/new')}>
                <Plus className="size-4" />
                {t('content.empty.cta')}
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <LinearStatCard label={t('pages.content')} value={items.length} icon={Blocks} />
      </div>

      {items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Blocks />
            </EmptyMedia>
            <EmptyTitle>{t('content.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('content.empty.message')}</EmptyDescription>
          </EmptyHeader>
          {canEdit && (
            <EmptyContent>
              <Button asChild>
                <Link to={path('/content/new')}>{t('content.empty.cta')}</Link>
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
                <TableHead>{t('content.table.label')}</TableHead>
                <TableHead>{t('content.table.key')}</TableHead>
                <TableHead>{t('content.table.items')}</TableHead>
                <TableHead>{t('content.table.status')}</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell className="font-medium">{collection.label}</TableCell>
                  <TableCell>
                    <code className={typographyClasses.mono}>{collection.key}</code>
                  </TableCell>
                  <TableCell>{collection.items.length}</TableCell>
                  <TableCell>
                    <LinearStatusBadge
                      label={t(`common.status.${collection.status.toLowerCase()}`, {
                        defaultValue: collection.status,
                      })}
                      variant={collection.status.toLowerCase() === 'published' ? 'active' : 'muted'}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={path(`/content/${collection.id}`)}>{t('common.edit')}</Link>
                      </Button>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(collection.id)}
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
        title={t('content.deleteTitle')}
        description={t('content.deleteDescription')}
        onConfirm={() => void handleDelete()}
        loading={deleteCollection.isPending}
      />
    </CrmPageShell>
  );
}
