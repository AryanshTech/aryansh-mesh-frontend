import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useCreativeAssets, type CreativeAsset } from '@/modules/marketing/api/use-creative';
import { resolveCreativeAssetUrl } from '@/modules/marketing/api/resolve-creative-asset-url';
import {
  defaultBrandReferenceAssets,
  folderLabel,
  resolveAssetScope,
  resolveFolderPath,
  SCOPE_BRAND,
} from '@/modules/marketing/lib/asset-library';

interface Props {
  projectId: string;
  tenantId?: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}

export function BrandAssetPicker({
  projectId,
  tenantId,
  selectedIds,
  onChange,
  className,
}: Props) {
  const { t } = useTranslation();
  const { data } = useCreativeAssets(projectId, tenantId);
  const assets = data ?? [];

  const brandImages = useMemo(
    () =>
      assets
        .filter((a) => resolveAssetScope(a) === SCOPE_BRAND && a.assetType === 'IMAGE')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [assets],
  );

  const defaults = useMemo(() => defaultBrandReferenceAssets(assets), [assets]);
  const defaultIds = useMemo(() => new Set(defaults.map((d) => d.id)), [defaults]);

  const toggle = (asset: CreativeAsset) => {
    if (selectedIds.includes(asset.id)) {
      onChange(selectedIds.filter((id) => id !== asset.id));
    } else {
      onChange([...selectedIds, asset.id]);
    }
  };

  if (brandImages.length === 0) {
    return (
      <p className={cn('typo-eyebrow text-muted-foreground', className)}>
        {t('marketing.assets.pickerEmpty')}
      </p>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="typo-eyebrow text-muted-foreground">{t('marketing.assets.pickerTitle')}</p>
        <p className="typo-eyebrow text-faint">
          {t('marketing.assets.pickerHint', { count: defaults.length })}
        </p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {brandImages.slice(0, 16).map((asset) => {
          const url = resolveCreativeAssetUrl(asset.url);
          const active = selectedIds.includes(asset.id);
          const isDefault = defaultIds.has(asset.id);
          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => toggle(asset)}
              title={`${folderLabel(resolveFolderPath(asset))} · ${asset.label}`}
              className={cn(
                'relative size-16 shrink-0 overflow-hidden rounded-lg border transition-all',
                active
                  ? 'border-primary ring-2 ring-primary/40'
                  : 'border-border hover:border-hairline-strong',
              )}
            >
              {url ? (
                <img src={url} alt="" className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center bg-muted">
                  <ImageIcon className="size-4 text-muted-foreground" />
                </span>
              )}
              {isDefault ? (
                <span className="absolute bottom-0 inset-x-0 bg-background/80 px-0.5 text-center text-[9px] text-muted-foreground">
                  {t('marketing.assets.pickerAuto')}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
