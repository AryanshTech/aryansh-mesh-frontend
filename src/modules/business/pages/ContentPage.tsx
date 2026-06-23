import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Plus, FolderOpen } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { ListSkeleton } from '@/shared/components/Skeletons';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { Button } from '@/design-system/components/ui/button';
import { Card } from '@/design-system/components/ui/card';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { Textarea } from '@/design-system/components/ui/textarea';
import { cn } from '@/design-system/lib/utils';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import {
  useContentCollections,
  useCreateContentCollection,
  useUpdateContentCollection,
  useDeleteContentCollection,
  type ContentCollectionInput,
  type ContentCollectionView,
} from '@/modules/business/api/hooks/use-content';

const NEW_DRAFT: ContentCollectionInput = { label: '', description: '' };

function toDraft(c: ContentCollectionView): ContentCollectionInput {
  return { label: c.label, description: c.description ?? '' };
}

export default function ContentPage() {
  const { t } = useTranslation();
  const { hasTenant } = useTenantPath();
  const { data, isLoading, isError, refetch, isFetching } = useContentCollections();
  const createMutation = useCreateContentCollection();
  const updateMutation = useUpdateContentCollection();
  const deleteMutation = useDeleteContentCollection();

  const [selected, setSelected] = useState<ContentCollectionView | null>(null);
  const [draft, setDraft] = useState<ContentCollectionInput | null>(null);
  const [isNew, setIsNew] = useState(false);

  const collections = data?.items ?? [];
  const showSkeleton = !hasTenant || isLoading || (isFetching && !data);

  const openNew = () => { setSelected(null); setIsNew(true); setDraft({ ...NEW_DRAFT }); };
  const openCollection = (c: ContentCollectionView) => { setSelected(c); setIsNew(false); setDraft(toDraft(c)); };
  const closeDrawer = () => { setSelected(null); setDraft(null); setIsNew(false); };

  const onSave = async () => {
    if (!draft) return;
    if (!draft.label.trim()) { toast.error(t('content.errorLabelRequired')); return; }
    try {
      if (isNew) {
        await createMutation.mutateAsync(draft);
        toast.success(t('content.created'));
      } else if (selected) {
        await updateMutation.mutateAsync({ id: selected.id, input: draft });
        toast.success(t('content.updated'));
      }
      closeDrawer();
    } catch (e) {
      toast.error((e as Error).message || t('content.saveFailed'));
    }
  };

  const onDelete = async () => {
    if (!selected) return;
    try {
      await deleteMutation.mutateAsync(selected.id);
      toast.success(t('content.deleted'));
      closeDrawer();
    } catch (e) {
      toast.error((e as Error).message || t('content.deleteFailed'));
    }
  };

  const masterContent = (
    <div className="flex flex-col gap-4">
      {showSkeleton ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState title={t('content.errorTitle')} onRetry={() => void refetch()} />
      ) : collections.length === 0 ? (
        <EmptyState
          icon={<FolderOpen />}
          title={t('content.emptyTitle')}
          description={t('content.emptyDescription')}
          action={<Button onClick={openNew}><Plus className="size-4" />{t('content.addCollection')}</Button>}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left">
              <tr>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('content.columnName')}</th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium text-right">{t('content.columnItems')}</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => openCollection(c)}
                  className={cn(
                    'cursor-pointer border-b border-border last:border-b-0 transition-colors',
                    selected?.id === c.id ? 'bg-primary/5' : 'hover:bg-muted/30',
                  )}
                >
                  <td className="px-4 py-2.5 font-medium text-foreground">{c.label}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">{c.itemCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );

  return (
    <PageShell>
      <PageHeader
        title={t('content.title')}
        description={t('content.subtitle')}
        actions={<Button onClick={openNew}><Plus className="size-4" />{t('content.addCollection')}</Button>}
      />
      <DetailDrawer
        open={!!draft}
        onOpenChange={(o) => (o ? null : closeDrawer())}
        title={isNew ? t('content.newCollection') : selected?.label ?? ''}
        master={masterContent}
        footer={
          <div className="flex items-center justify-between gap-2">
            {!isNew && selected ? (
              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => void onDelete()} disabled={deleteMutation.isPending}>
                {t('common.delete')}
              </Button>
            ) : <span />}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={closeDrawer}>{t('common.cancel')}</Button>
              <Button onClick={() => void onSave()} disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? t('common.loading') : t('common.save')}
              </Button>
            </div>
          </div>
        }
      >
        {draft ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="coll-label">{t('content.fieldLabel')} *</Label>
              <Input id="coll-label" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="coll-description">{t('content.fieldDescription')}</Label>
              <Textarea id="coll-description" rows={3} value={draft.description ?? ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
          </div>
        ) : null}
      </DetailDrawer>
    </PageShell>
  );
}
