import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Check,
  Folder,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CardGridSkeleton } from '@/shared/components/Skeletons';
import { Button } from '@/design-system/components/ui/button';
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
  useUpdateCreativeAsset,
  useDeleteCreativeAsset,
  useUpdateCreativeAssetStatus,
  type CreativeAsset,
  type ApprovalStatus,
} from '@/modules/marketing/api/use-creative';
import { resolveCreativeAssetUrl } from '@/modules/marketing/api/resolve-creative-asset-url';
import {
  BRAND_STARTER_FOLDERS,
  brandAssetsInFolder,
  folderLabel,
  generatedAssets,
  isBrandFolder,
  resolveFolderPath,
  resolveAssetScope,
  SCOPE_BRAND,
  type BrandFolderPath,
} from '@/modules/marketing/lib/asset-library';

interface Props {
  projectId: string;
  tenantId?: string;
  initialRunId?: string;
}

type LibraryArea = 'brand' | 'generated';

function approvalTone(status: ApprovalStatus): 'success' | 'danger' | 'warning' {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'danger';
  return 'warning';
}

export function CreativeAssetsTab({ projectId, tenantId }: Props) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useCreativeAssets(projectId, tenantId);
  const uploadMutation = useUploadCreativeAsset(projectId, tenantId);
  const updateMutation = useUpdateCreativeAsset(projectId, tenantId);
  const deleteMutation = useDeleteCreativeAsset(projectId, tenantId);
  const statusMutation = useUpdateCreativeAssetStatus(projectId, tenantId);

  const [area, setArea] = useState<LibraryArea>('brand');
  const [folder, setFolder] = useState<BrandFolderPath>('/Brand/Logos');
  const [selected, setSelected] = useState<CreativeAsset | null>(null);
  const [query, setQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLabel, setUploadLabel] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { scheduleOpen, triggerProps } = useFormDialogOpen();

  const assets = data ?? [];
  const visible = useMemo(() => {
    const list =
      area === 'brand' ? brandAssetsInFolder(assets, folder) : generatedAssets(assets);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((a) => a.label.toLowerCase().includes(q));
  }, [assets, area, folder, query]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const path of BRAND_STARTER_FOLDERS) {
      counts[path] = brandAssetsInFolder(assets, path).length;
    }
    return counts;
  }, [assets]);

  const resetUpload = () => {
    setUploadFile(null);
    setUploadLabel('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openUpload = () => {
    setUploadOpen(false);
    scheduleOpen(() => setUploadOpen(true));
  };

  const onUpload = async () => {
    if (!uploadFile) {
      toast.error(t('marketing.assets.fileRequired'));
      return;
    }
    const label = uploadLabel.trim() || uploadFile.name;
    try {
      await uploadMutation.mutateAsync({
        file: uploadFile,
        label,
        scope: SCOPE_BRAND,
        folderPath: folder,
        assetType: uploadFile.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
      });
      toast.success(t('marketing.assets.uploaded'));
      setUploadOpen(false);
      resetUpload();
      setArea('brand');
    } catch (e) {
      toast.error((e as Error).message || t('marketing.assets.uploadFailed'));
    }
  };

  const onRename = async () => {
    if (!selected || !renameValue.trim()) return;
    try {
      const updated = await updateMutation.mutateAsync({
        assetId: selected.id,
        input: { label: renameValue.trim() },
      });
      setSelected(updated);
      toast.success(t('marketing.assets.renamed'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.assets.renameFailed'));
    }
  };

  const onMove = async (nextFolder: string) => {
    if (!selected || !isBrandFolder(nextFolder)) return;
    try {
      const updated = await updateMutation.mutateAsync({
        assetId: selected.id,
        input: {
          runId: null,
          metadata: { scope: SCOPE_BRAND, folderPath: nextFolder },
        },
      });
      setSelected(updated);
      setFolder(nextFolder);
      setArea('brand');
      toast.success(t('marketing.assets.moved'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.assets.moveFailed'));
    }
  };

  const onDelete = async () => {
    if (!selected) return;
    try {
      await deleteMutation.mutateAsync(selected.id);
      setSelected(null);
      toast.success(t('marketing.assets.deleted'));
    } catch (e) {
      toast.error((e as Error).message || t('marketing.assets.deleteFailed'));
    }
  };

  const onApproval = async (approvalStatus: ApprovalStatus) => {
    if (!selected) return;
    try {
      const updated = await statusMutation.mutateAsync({
        assetId: selected.id,
        approvalStatus,
      });
      setSelected(updated);
      toast.success(
        t(`marketing.assets.status${approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}`),
      );
    } catch (e) {
      toast.error((e as Error).message || t('marketing.assets.statusUpdateFailed'));
    }
  };

  const selectAsset = (asset: CreativeAsset) => {
    setSelected(asset);
    setRenameValue(asset.label);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-border bg-muted/30 p-1">
          <button
            type="button"
            className={cn(
              'rounded-lg px-3 py-1.5 typo-body-sm transition-colors',
              area === 'brand' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
            )}
            onClick={() => setArea('brand')}
          >
            {t('marketing.assets.areaBrand')}
          </button>
          <button
            type="button"
            className={cn(
              'rounded-lg px-3 py-1.5 typo-body-sm transition-colors',
              area === 'generated'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground',
            )}
            onClick={() => setArea('generated')}
          >
            {t('marketing.assets.areaGenerated')}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('marketing.assets.searchPlaceholder')}
            className="w-48"
          />
          {area === 'brand' ? (
            <Button {...triggerProps} onClick={openUpload}>
              <Upload className="size-4" />
              {t('marketing.assets.upload')}
            </Button>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          'grid gap-4',
          area === 'brand' ? 'lg:grid-cols-[200px_minmax(0,1fr)]' : 'grid-cols-1',
        )}
      >
        {area === 'brand' ? (
          <aside className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-3">
            <p className="mb-1 px-2 typo-eyebrow text-muted-foreground">
              {t('marketing.assets.folders')}
            </p>
            {BRAND_STARTER_FOLDERS.map((path) => (
              <button
                key={path}
                type="button"
                onClick={() => setFolder(path)}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left typo-body-sm transition-colors',
                  folder === path
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Folder className="size-3.5" />
                  {folderLabel(path)}
                </span>
                <span className="typo-eyebrow text-faint">{folderCounts[path] ?? 0}</span>
              </button>
            ))}
          </aside>
        ) : null}

        <div className="flex min-w-0 flex-col gap-3">
          <p className="typo-eyebrow text-muted-foreground">
            {area === 'brand'
              ? folderLabel(folder)
              : t('marketing.assets.areaGenerated')}
          </p>

          {isLoading ? (
            <CardGridSkeleton />
          ) : isError ? (
            <ErrorState title={t('marketing.assets.errorTitle')} onRetry={() => void refetch()} />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={<ImageIcon />}
              title={t('marketing.assets.emptyTitle')}
              description={
                area === 'brand'
                  ? t('marketing.assets.emptyBrandDescription')
                  : t('marketing.assets.emptyGeneratedDescription')
              }
              action={
                area === 'brand' ? (
                  <Button {...triggerProps} onClick={openUpload}>
                    <Upload className="size-4" />
                    {t('marketing.assets.upload')}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
              {visible.map((a) => {
                const previewUrl = resolveCreativeAssetUrl(a.url);
                const isVideo = a.assetType === 'VIDEO';
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => selectAsset(a)}
                    className={cn(
                      'flex flex-col gap-2 rounded-xl border bg-card p-3 text-left transition-all',
                      'hover:border-hairline-strong hover:shadow-card',
                      selected?.id === a.id
                        ? 'border-primary/50 ring-1 ring-primary/30'
                        : 'border-border',
                    )}
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
                      {a.assetType === 'IMAGE' && previewUrl ? (
                        <img src={previewUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          {isVideo ? (
                            <Video className="size-8 text-muted-foreground" />
                          ) : (
                            <ImageIcon className="size-8 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                    <p className="line-clamp-2 typo-body-sm font-medium text-foreground">{a.label}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="typo-eyebrow text-muted-foreground">
                        {t(`marketing.assets.types.${a.assetType}`)}
                      </span>
                      {resolveAssetScope(a) === 'generated' ? (
                        <StatusBadge
                          label={t(
                            `marketing.assets.status${a.approvalStatus.charAt(0).toUpperCase() + a.approvalStatus.slice(1)}`,
                          )}
                          tone={approvalTone(a.approvalStatus)}
                        />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selected ? (
        <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
              {(() => {
                const previewUrl = resolveCreativeAssetUrl(selected.url);
                if (selected.assetType === 'IMAGE' && previewUrl) {
                  return (
                    <img
                      src={previewUrl}
                      alt={selected.label}
                      className="max-h-80 w-full rounded-xl object-contain bg-muted"
                    />
                  );
                }
                if (selected.assetType === 'VIDEO' && previewUrl) {
                  return (
                    <video src={previewUrl} controls className="max-h-80 w-full rounded-xl bg-muted" />
                  );
                }
                return (
                  <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
                    <ImageIcon className="size-10 text-muted-foreground" />
                  </div>
                );
              })()}
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="asset-rename">{t('marketing.assets.fieldLabel')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="asset-rename"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={updateMutation.isPending || renameValue.trim() === selected.label}
                    onClick={() => void onRename()}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>
              </div>
              <p className="typo-eyebrow text-muted-foreground">
                {folderLabel(resolveFolderPath(selected))}
              </p>
              {resolveAssetScope(selected) === SCOPE_BRAND || area === 'brand' ? (
                <div className="flex flex-col gap-1.5">
                  <Label>{t('marketing.assets.moveTo')}</Label>
                  <Select
                    value={
                      isBrandFolder(resolveFolderPath(selected))
                        ? resolveFolderPath(selected)
                        : folder
                    }
                    onValueChange={(v) => void onMove(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAND_STARTER_FOLDERS.map((path) => (
                        <SelectItem key={path} value={path}>
                          {folderLabel(path)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              {resolveAssetScope(selected) === 'generated' ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-success border-success/30"
                    disabled={selected.approvalStatus === 'approved' || statusMutation.isPending}
                    onClick={() => void onApproval('approved')}
                  >
                    <Check className="size-4" />
                    {t('marketing.assets.approve')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-destructive border-destructive/30"
                    disabled={selected.approvalStatus === 'rejected' || statusMutation.isPending}
                    onClick={() => void onApproval('rejected')}
                  >
                    <X className="size-4" />
                    {t('marketing.assets.reject')}
                  </Button>
                </div>
              ) : null}
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => void onDelete()}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  {t('marketing.assets.delete')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setSelected(null)}>
                  {t('common.close')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <FormDialog
        open={uploadOpen}
        onOpenChange={(open) => {
          setUploadOpen(open);
          if (!open) resetUpload();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('marketing.assets.uploadTo', { folder: folderLabel(folder) })}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="a-file">{t('marketing.assets.fieldFile')} *</Label>
              <Input
                id="a-file"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setUploadFile(file);
                  if (file && !uploadLabel.trim()) setUploadLabel(file.name.replace(/\.[^.]+$/, ''));
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="a-label">{t('marketing.assets.fieldLabel')}</Label>
              <Input
                id="a-label"
                value={uploadLabel}
                onChange={(e) => setUploadLabel(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setUploadOpen(false);
                resetUpload();
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={() => void onUpload()} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {t('marketing.assets.upload')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </FormDialog>
    </div>
  );
}
