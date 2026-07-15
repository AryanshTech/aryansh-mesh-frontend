import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Check, X } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CardGridSkeleton } from '@/shared/components/Skeletons';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { Button } from '@/design-system/components/ui/button';
import { Card } from '@/design-system/components/ui/card';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
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
  useCreativeAssets,
  useUploadCreativeAsset,
  useUpdateCreativeAssetStatus,
  useCreativeRuns,
  useCreativeRecipes,
  type CreativeAsset,
  type AssetType,
  type ApprovalStatus,
} from '@/modules/marketing/api/use-creative';
import { resolveCreativeAssetUrl } from '@/modules/marketing/api/resolve-creative-asset-url';

interface Props {
  projectId: string;
  tenantId?: string;
  initialRunId?: string;
}

const ASSET_TYPES: AssetType[] = ['IMAGE', 'VIDEO', 'REMOTION_PROJECT', 'PROMPT_PACK', 'OTHER'];

function approvalTone(status: ApprovalStatus): 'success' | 'danger' | 'warning' {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'danger';
  return 'warning';
}

export function CreativeAssetsTab({ projectId, tenantId, initialRunId }: Props) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useCreativeAssets(projectId, tenantId);
  const { data: runsData } = useCreativeRuns(projectId, tenantId);
  const { data: recipesData } = useCreativeRecipes(projectId, tenantId);
  const uploadMutation = useUploadCreativeAsset(projectId, tenantId);
  const statusMutation = useUpdateCreativeAssetStatus(projectId, tenantId);

  const [selected, setSelected] = useState<CreativeAsset | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLabel, setUploadLabel] = useState('');
  const [uploadType, setUploadType] = useState<AssetType | ''>('');
  const [uploadRunId, setUploadRunId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { scheduleOpen, triggerProps } = useFormDialogOpen();

  const assets = data ?? [];
  const runs = runsData ?? [];
  const recipes = recipesData ?? [];
  const recipeTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of recipes) map.set(r.id, r.title);
    return map;
  }, [recipes]);
  const runLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of runs) {
      const title = recipeTitleById.get(r.recipeId) ?? r.recipeId.slice(0, 8);
      map.set(r.id, `${title} · ${r.status}`);
    }
    return map;
  }, [runs, recipeTitleById]);

  useEffect(() => {
    if (initialRunId) setUploadRunId(initialRunId);
  }, [initialRunId]);

  const resetUpload = () => {
    setUploadFile(null);
    setUploadLabel('');
    setUploadType('');
    setUploadRunId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onUpload = async () => {
    if (!uploadFile || !uploadLabel.trim()) {
      toast.error(t('marketing.assets.fileRequired'));
      return;
    }
    try {
      await uploadMutation.mutateAsync({
        file: uploadFile,
        label: uploadLabel.trim(),
        runId: uploadRunId || undefined,
        assetType: uploadType || undefined,
      });
      toast.success(t('marketing.assets.uploaded'));
      setUploadOpen(false);
      resetUpload();
    } catch (e) {
      toast.error((e as Error).message || t('marketing.assets.uploadFailed'));
    }
  };

  const onApproval = async (assetId: string, approvalStatus: ApprovalStatus) => {
    try {
      const updated = await statusMutation.mutateAsync({ assetId, approvalStatus });
      if (selected?.id === assetId) {
        setSelected(updated);
      }
      toast.success(t(`marketing.assets.status${approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}`));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.assets.statusUpdateFailed'));
    }
  };

  const openUpload = () => {
    setUploadOpen(false);
    scheduleOpen(() => setUploadOpen(true));
  };

  const listContent = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <Button {...triggerProps} onClick={openUpload}>
          <Upload className="size-4" />{t('marketing.assets.upload')}
        </Button>
      </div>

      {isLoading ? (
        <CardGridSkeleton />
      ) : isError ? (
        <ErrorState title={t('marketing.assets.errorTitle')} onRetry={() => void refetch()} />
      ) : assets.length === 0 ? (
        <EmptyState
          icon={<ImageIcon />}
          title={t('marketing.assets.emptyTitle')}
          description={t('marketing.assets.emptyDescription')}
          action={
            <Button {...triggerProps} onClick={openUpload}>
              <Upload className="size-4" />{t('marketing.assets.upload')}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
          {assets.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => requestAnimationFrame(() => setSelected(a))}
              className={cn(
                'group flex flex-col gap-3 rounded-xl border bg-card p-4 text-left transition-all duration-150',
                'hover:border-hairline-strong hover:shadow-card',
                selected?.id === a.id ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border',
              )}
            >
              {(() => {
                const previewUrl = resolveCreativeAssetUrl(a.url);
                return a.assetType === 'IMAGE' && previewUrl ? (
                <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                  <img src={previewUrl} alt={a.label} className="size-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video w-full overflow-hidden rounded-md bg-muted flex items-center justify-center">
                  <ImageIcon className="size-8 text-muted-foreground" />
                </div>
              );
              })()}
              <div className="flex items-center justify-between gap-2">
                <p className="typo-card-title text-foreground line-clamp-1">{a.label}</p>
                <StatusBadge label={t(`marketing.assets.status${a.approvalStatus.charAt(0).toUpperCase() + a.approvalStatus.slice(1)}`)} tone={approvalTone(a.approvalStatus)} />
              </div>
              <p className="typo-body-sm text-muted-foreground">{t(`marketing.assets.types.${a.assetType}`)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
        title={selected?.label ?? ''}
        master={listContent}
        footer={
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="text-success border-success/30 hover:bg-success/10"
                disabled={!selected || selected.approvalStatus === 'approved' || statusMutation.isPending}
                onClick={() => selected && void onApproval(selected.id, 'approved')}
              >
                <Check className="size-4" />{t('marketing.assets.approve')}
              </Button>
              <Button
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                disabled={!selected || selected.approvalStatus === 'rejected' || statusMutation.isPending}
                onClick={() => selected && void onApproval(selected.id, 'rejected')}
              >
                <X className="size-4" />{t('marketing.assets.reject')}
              </Button>
            </div>
            <Button variant="outline" onClick={() => setSelected(null)}>{t('common.close')}</Button>
          </div>
        }
      >
        {selected ? (
          <div className="flex flex-col gap-4">
            {(() => {
              const previewUrl = resolveCreativeAssetUrl(selected.url);
              if (selected.assetType === 'IMAGE' && previewUrl) {
                return (
                  <Card className="overflow-hidden p-0">
                    <img src={previewUrl} alt={selected.label} className="w-full object-contain" />
                  </Card>
                );
              }
              if (selected.assetType === 'VIDEO' && previewUrl) {
                return (
                  <Card className="overflow-hidden p-0">
                    <video src={previewUrl} controls className="w-full" />
                  </Card>
                );
              }
              if (previewUrl) {
                return (
                  <Card className="p-3">
                    <a href={previewUrl} target="_blank" rel="noreferrer" className="text-primary break-all underline">
                      {previewUrl}
                    </a>
                  </Card>
                );
              }
              return null;
            })()}
            <Card className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="typo-eyebrow-upper text-faint">{t('marketing.assets.fieldType')}</span>
                <span className="typo-body-sm text-foreground">{t(`marketing.assets.types.${selected.assetType}`)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="typo-eyebrow-upper text-faint">{t('marketing.assets.columnApproval')}</span>
                <StatusBadge label={selected.approvalStatus} tone={approvalTone(selected.approvalStatus)} />
              </div>
              {selected.runId ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="typo-eyebrow-upper text-faint">{t('marketing.assets.fieldRunId')}</span>
                  <span className="typo-body-sm text-foreground text-right">
                    {runLabelById.get(selected.runId) ?? selected.runId}
                  </span>
                </div>
              ) : null}
            </Card>
          </div>
        ) : null}
      </DetailDrawer>

      <FormDialog
        open={uploadOpen}
        onOpenChange={(open) => {
          setUploadOpen(open);
          if (!open) resetUpload();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('marketing.assets.upload')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="a-file">{t('marketing.assets.fieldFile')} *</Label>
              <Input
                id="a-file"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,application/zip"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="a-label">{t('marketing.assets.fieldLabel')} *</Label>
              <Input id="a-label" value={uploadLabel} onChange={(e) => setUploadLabel(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="a-type">{t('marketing.assets.fieldType')}</Label>
              <Select value={uploadType} onValueChange={(v) => setUploadType(v as AssetType)}>
                <SelectTrigger id="a-type"><SelectValue placeholder={t('marketing.assets.autoDetect')} /></SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((a) => (
                    <SelectItem key={a} value={a}>{t(`marketing.assets.types.${a}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {runs.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="a-run">{t('marketing.assets.fieldRunId')}</Label>
                <Select value={uploadRunId} onValueChange={setUploadRunId}>
                  <SelectTrigger id="a-run"><SelectValue placeholder={t('marketing.assets.noRun')} /></SelectTrigger>
                  <SelectContent>
                    {runs.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {runLabelById.get(r.id) ?? r.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => { setUploadOpen(false); resetUpload(); }}>
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={() => void onUpload()} disabled={uploadMutation.isPending}>
              <Upload className="size-4" />
              {uploadMutation.isPending ? t('common.loading') : t('marketing.assets.upload')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </FormDialog>
    </>
  );
}
