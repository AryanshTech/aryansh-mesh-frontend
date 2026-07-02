import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Plus, PlayCircle } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { ListSkeleton } from '@/shared/components/Skeletons';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { Button } from '@/design-system/components/ui/button';
import { Card } from '@/design-system/components/ui/card';
import { Label } from '@/design-system/components/ui/label';
import { Textarea } from '@/design-system/components/ui/textarea';
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/components/ui/dialog';
import { FormDialog, useFormDialogOpen } from '@/shared/components/FormDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/ui/select';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { cn } from '@/design-system/lib/utils';
import {
  useCreativeRuns,
  useCreateCreativeRun,
  useUpdateCreativeRun,
  type CreativeRun,
  type RunStatus,
} from '@/modules/marketing/api/use-creative';
import { useCreativeRecipes } from '@/modules/marketing/api/use-creative';

interface Props {
  projectId: string;
  tenantId?: string;
}

const RUN_STATUSES: RunStatus[] = [
  'PLANNED',
  'READY_TO_RUN_LOCALLY',
  'RUNNING_LOCALLY',
  'UPLOADED',
  'APPROVED',
  'REJECTED',
];

function statusTone(status: RunStatus): 'default' | 'info' | 'warning' | 'success' | 'danger' {
  switch (status) {
    case 'APPROVED': return 'success';
    case 'REJECTED': return 'danger';
    case 'RUNNING_LOCALLY':
    case 'UPLOADED': return 'info';
    case 'READY_TO_RUN_LOCALLY': return 'warning';
    default: return 'default';
  }
}

export function CreativeRunsTab({ projectId, tenantId }: Props) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useCreativeRuns(projectId, tenantId);
  const { data: recipesData } = useCreativeRecipes(projectId, tenantId);
  const createMutation = useCreateCreativeRun(projectId, tenantId);
  const updateMutation = useUpdateCreativeRun(projectId, tenantId);

  const [selected, setSelected] = useState<CreativeRun | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newRunRecipeId, setNewRunRecipeId] = useState<string>('');
  const { scheduleOpen, triggerProps } = useFormDialogOpen();

  const runs = data ?? [];
  const recipes = recipesData ?? [];
  const recipeById = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of recipes) map.set(r.id, r.title);
    return map;
  }, [recipes]);

  const onCreate = async () => {
    if (!newRunRecipeId) return;
    try {
      await createMutation.mutateAsync({ recipeId: newRunRecipeId });
      toast.success(t('marketing.runs.created'));
      setCreateOpen(false);
      setNewRunRecipeId('');
    } catch (e) {
      toast.error((e as Error).message || t('marketing.runs.saveFailed'));
    }
  };

  const onUpdate = async (patch: Partial<{ status: RunStatus; localExecutorNotes: string; resultSummary: string }>) => {
    if (!selected) return;
    try {
      const updated = await updateMutation.mutateAsync({ runId: selected.id, input: patch });
      setSelected(updated);
      toast.success(t('marketing.runs.updated'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.runs.updateFailed'));
    }
  };

  const openCreate = () => {
    setCreateOpen(false);
    scheduleOpen(() => {
      setNewRunRecipeId(recipes[0]?.id ?? '');
      setCreateOpen(true);
    });
  };

  const listContent = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <Button {...triggerProps} onClick={openCreate} disabled={recipes.length === 0}>
          <Plus className="size-4" />{t('marketing.runs.create')}
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState title={t('marketing.runs.errorTitle')} onRetry={() => void refetch()} />
      ) : runs.length === 0 ? (
        <EmptyState
          icon={<PlayCircle />}
          title={t('marketing.runs.emptyTitle')}
          description={t('marketing.runs.emptyDescription')}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left">
              <tr>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('marketing.runs.columnRecipe')}</th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('marketing.runs.columnStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => requestAnimationFrame(() => setSelected(r))}
                  className={cn(
                    'cursor-pointer border-b border-border last:border-b-0 transition-colors',
                    selected?.id === r.id ? 'bg-primary/5' : 'hover:bg-muted/30',
                  )}
                >
                  <td className="px-4 py-2.5 font-medium text-foreground">{recipeById.get(r.recipeId) ?? r.recipeId}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge label={t(`marketing.runs.status.${r.status}`)} tone={statusTone(r.status)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );

  return (
    <>
      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
        title={selected ? recipeById.get(selected.recipeId) ?? selected.recipeId : ''}
        master={listContent}
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelected(null)}>{t('common.close')}</Button>
          </div>
        }
      >
        {selected ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>{t('marketing.runs.columnStatus')}</Label>
              <Select value={selected.status} onValueChange={(v) => void onUpdate({ status: v as RunStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RUN_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{t(`marketing.runs.status.${s}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="run-notes">{t('marketing.runs.fieldNotes')}</Label>
              <Textarea
                id="run-notes"
                rows={4}
                defaultValue={selected.localExecutorNotes}
                onBlur={(e) => {
                  if (e.target.value !== selected.localExecutorNotes) {
                    void onUpdate({ localExecutorNotes: e.target.value });
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="run-summary">{t('marketing.runs.fieldResultSummary')}</Label>
              <Textarea
                id="run-summary"
                rows={3}
                defaultValue={selected.resultSummary}
                onBlur={(e) => {
                  if (e.target.value !== selected.resultSummary) {
                    void onUpdate({ resultSummary: e.target.value });
                  }
                }}
              />
            </div>
            {selected.sourcePrompt ? (
              <div className="flex flex-col gap-1.5">
                <Label>{t('marketing.runs.fieldSourcePrompt')}</Label>
                <Card className="p-3 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-xs text-foreground">{selected.sourcePrompt}</pre>
                </Card>
              </div>
            ) : null}
          </div>
        ) : null}
      </DetailDrawer>

      <FormDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setNewRunRecipeId('');
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('marketing.runs.create')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>{t('marketing.runs.fieldRecipe')}</Label>
              <Select value={newRunRecipeId} onValueChange={setNewRunRecipeId}>
                <SelectTrigger><SelectValue placeholder={t('marketing.runs.selectRecipe')} /></SelectTrigger>
                <SelectContent>
                  {recipes.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
            <Button type="button" onClick={() => void onCreate()} disabled={createMutation.isPending || !newRunRecipeId}>
              {createMutation.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </FormDialog>
    </>
  );
}
