import { useTranslation } from 'react-i18next';
import { Label } from '@/design-system/components/ui/label';
import { typographyClasses } from '@/design-system/tokens/typography';
import { ImageGalleryTile } from '@/shared/components/ImageGalleryTile';
import { ImageUpload } from '@/shared/components/ImageUpload';

export function entityImageUrls(
  images?: Array<Record<string, unknown>> | null,
  fallbackUrl?: string | null,
): string[] {
  if (images?.length) {
    const fromImages = images
      .map((image) => (typeof image.url === 'string' ? image.url : null))
      .filter((url): url is string => Boolean(url));
    if (fromImages.length > 0) return fromImages;
  }
  return fallbackUrl ? [fallbackUrl] : [];
}

export function toImagePayload(urls: string[]): Array<{ url: string; order: number }> {
  return urls.map((url, order) => ({ url, order }));
}

interface EditableImagesSectionProps {
  isNew: boolean;
  entityId?: string;
  entityName?: string;
  imageUrls: string[];
  uploadEndpoint?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved?: (url: string) => void | Promise<void>;
  onImageReplaced?: (oldUrl: string, newUrl: string) => void | Promise<void>;
  /** Single photo entities hide the add zone once an image exists. */
  mode?: 'single' | 'multiple';
  labelKey: string;
  hintKey: string;
  afterSaveKey: string;
  disabled?: boolean;
}

export function EditableImagesSection({
  isNew,
  entityId,
  entityName,
  imageUrls,
  uploadEndpoint,
  onImageUploaded,
  onImageRemoved,
  onImageReplaced,
  mode = 'multiple',
  labelKey,
  hintKey,
  afterSaveKey,
  disabled = false,
}: EditableImagesSectionProps) {
  const { t } = useTranslation();
  const canManage = !disabled && !isNew && !!entityId && !!uploadEndpoint;
  const showAddZone =
    canManage && (mode === 'multiple' || imageUrls.length === 0);

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4">
      <Label>{t(labelKey)}</Label>
      {isNew || !entityId ? (
        <p className={typographyClasses.caption + ' text-muted-foreground'}>
          {t(afterSaveKey)}
        </p>
      ) : (
        <>
          <p className={typographyClasses.caption + ' text-muted-foreground'}>
            {t(hintKey)}
          </p>
          {imageUrls.length > 0 && uploadEndpoint ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {imageUrls.map((url, index) => (
                <ImageGalleryTile
                  key={`${url}-${index}`}
                  url={url}
                  alt={entityName ?? ''}
                  uploadEndpoint={uploadEndpoint}
                  disabled={!canManage}
                  onReplaced={async (oldUrl, newUrl) => {
                    if (onImageReplaced) {
                      await onImageReplaced(oldUrl, newUrl);
                    } else {
                      onImageUploaded(newUrl);
                    }
                  }}
                  onRemoved={onImageRemoved}
                />
              ))}
            </div>
          ) : null}
          {showAddZone && uploadEndpoint ? (
            <ImageUpload
              endpoint={uploadEndpoint}
              variant="add"
              disabled={disabled}
              onUploaded={onImageUploaded}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
