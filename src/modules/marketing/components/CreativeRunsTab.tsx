import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Plus,
  PlayCircle,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { ListSkeleton } from '@/shared/components/Skeletons';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { Button } from '@/design-system/components/ui/button';
import { Card } from '@/design-system/components/ui/card';
import { Input } from '@/design-system/components/ui/input';
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
  useCreativeRecipes,
  useCreativeAssets,
  useUploadCreativeAsset,
  type CreativeRun,
  type RunStatus,
} from '@/modules/marketing/api/use-creative';
import { resolveCreativeAssetUrl } from '@/modules/marketing/api/resolve-creative-asset-url';

interface Props {
  projectId: string;
  tenantId?: string;
  initialRunId?: string;
  onRunSelected?: (runId: string) => void;
  onNeedRecipes?: () => void;
}

const STEPPER: RunStatus[] = [
  'READY_TO_RUN_LOCALLY',
  'RUNNING_LOCALLY',
  'UPLOADED',
  'APPROVED',
];

function statusTone(status: RunStatus): 'default' | 'info' | 'warning' | 'success' | 'danger' {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    case 'RUNNING_LOCALLY':
    case 'UPLOADED':
      return 'info';
    case 'READY_TO_RUN_LOCALLY':
      return 'warning';
    default:
      return 'default';
  }
}

function stepIndex(status: RunStatus): number {
  if (status === 'APPROVED') return 3;
  if (status === 'UPLOADED') return 2;
  if (status === 'RUNNING_LOCALLY') return 1;
  if (status === 'REJECTED') return 2;
  return 0;
}

export function CreativeRunsTab({
  projectId,
  tenantId,
  initialRunId,
  onRunSelected,
  onNeedRecipes,
}: Props) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useCreativeRuns(projectId, tenantId);
  const { data: recipesData } = useCreativeRecipes(projectId, tenantId);
  const { data: assetsData } = useCreativeAssets(projectId, tenantId);
  const createMutation = useCreateCreativeRun(projectId, tenantId);
  const updateMutation = useUpdateCreativeRun(projectId, tenantId);
  const uploadMutation = useUploadCreativeAsset(projectId, tenantId);

  const [selected, setSelected] = useState<CreativeRun | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newRunRecipeId, setNewRunRecipeId] = useState('');
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLabel, setUploadLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { scheduleOpen, triggerProps } = useFormDialogOpen();
  const appliedInitial = useRef<string | null>(null);

  const runs = data ?? [];
  const recipes = recipesData ?? [];
  const assets = assetsData ?? [];

  const recipeById = useMemo(() => {
    const map = new Map(recipes.map((r) => [r.id, r]));
    return map;
  }, [recipes]);

  const selectedRecipe = selected ? recipeById.get(selected.recipeId) : undefined;
  const linkedAssets = useMemo(() => {
    if (!selected) return [];
    return assets.filter(
      (a) => a.runId === selected.id || selected.assetIds?.includes(a.id),
    );
  }, [assets, selected]);

  useEffect(() => {
    if (!initialRunId || !runs.length) return;
    if (appliedInitial.current === initialRunId && selected?.id === initialRunId) return;
    const match = runs.find((r) => r.id === initialRunId);
    if (match) {
      appliedInitial.current = initialRunId;
      setSelected(match);
    }
  }, [initialRunId, runs, selected?.id]);

  useEffect(() => {
    if (!selected) {
      setNotes('');
      setSummary('');
      return;
    }
    setNotes(selected.localExecutorNotes ?? '');
    setSummary(selected.resultSummary ?? '');
  }, [selected?.id, selected?.localExecutorNotes, selected?.resultSummary]);

  const selectRun = (run: CreativeRun) => {
    setSelected(run);
    onRunSelected?.(run.id);
  };

  const onCreate = async () => {
    if (!newRunRecipeId) return;
    try {
      const run = await createMutation.mutateAsync({ recipeId: newRunRecipeId });
      toast.success(t('marketing.runs.created'));
      setCreateOpen(false);
      setNewRunRecipeId('');
      selectRun(run);
    } catch (e) {
      toast.error((e as Error).message || t('marketing.runs.saveFailed'));
    }
  };

  const onUpdate = async (patch: {
    status?: RunStatus;
    localExecutorNotes?: string;
    resultSummary?: string;
  }) => {
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
    if (recipes.length === 0) {
      onNeedRecipes?.();
      return;
    }
    setCreateOpen(false);
    scheduleOpen(() => {
      setNewRunRecipeId(recipes[0]?.id ?? '');
      setCreateOpen(true);
    });
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('marketing.recipes.copied', { label }));
    } catch {
      toast.error(t('marketing.recipes.copyFailed'));
    }
  };

  const onUpload = async () => {
    if (!selected || !uploadFile || !uploadLabel.trim()) {
      toast.error(t('marketing.assets.fileRequired'));
      return;
    }
    try {
      await uploadMutation.mutateAsync({
        file: uploadFile,
        label: uploadLabel.trim(),
        runId: selected.id,
      });
      toast.success(t('marketing.assets.uploaded'));
      setUploadOpen(false);
      setUploadFile(null);
      setUploadLabel('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      toast.error((e as Error).message || t('marketing.assets.uploadFailed'));
    }
  };

  const listContent = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="typo-body-sm text-muted-foreground max-w-xl">{t('marketing.runs.intro')}</p>
        <Button {...triggerProps} onClick={openCreate}>
          <Plus className="size-4" />
          {t('marketing.runs.create')}
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
          description={
            recipes.length === 0
              ? t('marketing.runs.emptyNoRecipes')
              : t('marketing.runs.emptyDescription')
          }
          action={
            <Button {...triggerProps} onClick={openCreate}>
              <Plus className="size-4" />
              {recipes.length === 0 ? t('marketing.runs.goCreateRecipes') : t('marketing.runs.create')}
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left">
              <tr>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">
                  {t('marketing.runs.columnRecipe')}
                </th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">
                  {t('marketing.runs.columnStatus')}
                </th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => requestAnimationFrame(() => selectRun(r))}
                  className={cn(
                    'cursor-pointer border-b border-border last:border-b-0 transition-colors',
                    selected?.id === r.id ? 'bg-primary/5' : 'hover:bg-muted/30',
                  )}
                >
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    {recipeById.get(r.recipeId)?.title ?? r.recipeId}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge
                      label={t(`marketing.runs.status.${r.status}`)}
                      tone={statusTone(r.status)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );

  const currentStep = selected ? stepIndex(selected.status) : 0;

  return (
    <>
      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={
          selected
            ? t('marketing.runs.kitTitle', {
                recipe: recipeById.get(selected.recipeId)?.title ?? selected.recipeId,
              })
            : ''
        }
        master={listContent}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {selected && selected.status !== 'APPROVED' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void onUpdate({ status: 'APPROVED' })}
                  disabled={updateMutation.isPending}
                >
                  <Check className="size-3.5" />
                  {t('marketing.runs.markApproved')}
                </Button>
              ) : null}
              {selected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUploadLabel('');
                    setUploadFile(null);
                    scheduleOpen(() => setUploadOpen(true));
                  }}
                >
                  <Upload className="size-3.5" />
                  {t('marketing.runs.uploadResult')}
                </Button>
              ) : null}
            </div>
            <Button variant="outline" onClick={() => setSelected(null)}>
              {t('common.close')}
            </Button>
          </div>
        }
      >
        {selected ? (
          <div key={selected.id} className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              {STEPPER.map((status, index) => (
                <span
                  key={status}
                  className={cn(
                    'inline-flex items-center rounded-full border px-2.5 py-1 typo-eyebrow',
                    index <= currentStep
                      ? 'border-primary/30 bg-primary/5 text-foreground'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  {index + 1}. {t(`marketing.runs.status.${status}`)}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label>{t('marketing.runs.fieldResultSummary')}</Label>
                {summary ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void copyText(summary, t('marketing.runs.fieldResultSummary'))}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                ) : null}
              </div>
              {summary.trim() ? (
                <Card className="p-4 max-h-[28rem] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                    {summary}
                  </pre>
                </Card>
              ) : (
                <Card className="p-4">
                  <p className="typo-body-sm text-muted-foreground">
                    {t('marketing.runs.noOutputYet')}
                  </p>
                </Card>
              )}
              <Textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                onBlur={() => {
                  if (summary !== (selected.resultSummary ?? '')) {
                    void onUpdate({ resultSummary: summary });
                  }
                }}
                placeholder={t('marketing.runs.summaryPlaceholder')}
              />
            </div>

            {selected.sourcePrompt ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label>{t('marketing.runs.fieldSourcePrompt')}</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      void copyText(selected.sourcePrompt, t('marketing.runs.fieldSourcePrompt'))
                    }
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
                <Card className="p-3 max-h-48 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-xs text-foreground">
                    {selected.sourcePrompt}
                  </pre>
                </Card>
              </div>
            ) : null}

            {selectedRecipe?.setupCommands?.length ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label>{t('marketing.recipes.setupCommands')}</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      void copyText(
                        selectedRecipe.setupCommands.join('\n'),
                        t('marketing.recipes.setupCommands'),
                      )
                    }
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
                <Card className="p-3">
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {selectedRecipe.setupCommands.join('\n')}
                  </pre>
                </Card>
              </div>
            ) : null}

            {selectedRecipe?.runCommands?.length ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label>{t('marketing.recipes.runCommands')}</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      void copyText(
                        selectedRecipe.runCommands.join('\n'),
                        t('marketing.recipes.runCommands'),
                      )
                    }
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
                <Card className="p-3">
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {selectedRecipe.runCommands.join('\n')}
                  </pre>
                </Card>
              </div>
            ) : null}

            {selectedRecipe?.expectedOutputs?.length ? (
              <div className="flex flex-col gap-2">
                <Label>{t('marketing.recipes.expectedOutputs')}</Label>
                <Card className="p-3">
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {selectedRecipe.expectedOutputs.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </Card>
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <Label>{t('marketing.runs.linkedAssets')}</Label>
              {linkedAssets.length === 0 ? (
                <p className="typo-body-sm text-muted-foreground">{t('marketing.runs.noAssets')}</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {linkedAssets.map((asset) => {
                    const src = resolveCreativeAssetUrl(asset.url);
                    return (
                      <Card key={asset.id} className="overflow-hidden p-0">
                        {asset.assetType === 'IMAGE' && src ? (
                          <img src={src} alt={asset.label} className="aspect-video w-full object-cover" />
                        ) : (
                          <div className="aspect-video flex items-center justify-center bg-muted">
                            <ImageIcon className="size-6 text-muted-foreground" />
                          </div>
                        )}
                        <p className="p-2 typo-body-sm truncate">{asset.label}</p>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="run-notes">{t('marketing.runs.fieldNotes')}</Label>
              <Textarea
                id="run-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => {
                  if (notes !== (selected.localExecutorNotes ?? '')) {
                    void onUpdate({ localExecutorNotes: notes });
                  }
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t('marketing.runs.columnStatus')}</Label>
              <Select
                value={selected.status}
                onValueChange={(v) => void onUpdate({ status: v as RunStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      'PLANNED',
                      'READY_TO_RUN_LOCALLY',
                      'RUNNING_LOCALLY',
                      'UPLOADED',
                      'APPROVED',
                      'REJECTED',
                    ] as RunStatus[]
                  ).map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`marketing.runs.status.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            <p className="typo-body-sm text-muted-foreground">{t('marketing.runs.createHint')}</p>
            <div className="flex flex-col gap-1.5">
              <Label>{t('marketing.runs.fieldRecipe')}</Label>
              <Select value={newRunRecipeId} onValueChange={setNewRunRecipeId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('marketing.runs.selectRecipe')} />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => void onCreate()}
              disabled={createMutation.isPending || !newRunRecipeId}
            >
              {createMutation.isPending ? t('marketing.runs.generating') : t('marketing.runs.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </FormDialog>

      <FormDialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('marketing.runs.uploadResult')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="run-upload-file">{t('marketing.assets.fieldFile')} *</Label>
              <Input
                id="run-upload-file"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,application/zip"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="run-upload-label">{t('marketing.assets.fieldLabel')} *</Label>
              <Input
                id="run-upload-label"
                value={uploadLabel}
                onChange={(e) => setUploadLabel(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setUploadOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={() => void onUpload()} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? t('common.loading') : t('marketing.assets.upload')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </FormDialog>
    </>
  );
}
