import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/design-system/components/ui/button';
import { cn } from '@/design-system/lib/utils';
import {
  ApiError,
  uploadImageFile,
  validateImageFile,
  ACCEPTED_IMAGE_TYPES,
} from '@/shared/lib/upload-image';

interface ImageGalleryTileProps {
  url: string;
  alt: string;
  uploadEndpoint: string;
  onReplaced: (oldUrl: string, newUrl: string) => void | Promise<void>;
  onRemoved?: (url: string) => void | Promise<void>;
  disabled?: boolean;
}

export function ImageGalleryTile({
  url,
  alt,
  uploadEndpoint,
  onReplaced,
  onRemoved,
  disabled = false,
}: ImageGalleryTileProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleReplace(file: File) {
    const validationError = validateImageFile(file, t);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    try {
      const newUrl = await uploadImageFile(uploadEndpoint, file);
      await onReplaced(url, newUrl);
      toast.success(t('upload.success'));
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t('errors.network'));
      }
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  async function handleRemove() {
    if (!onRemoved) return;
    setRemoving(true);
    try {
      await onRemoved(url);
      toast.success(t('upload.removed'));
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t('upload.removeFailed'));
      }
    } finally {
      setRemoving(false);
    }
  }

  const busy = uploading || removing;

  return (
    <div className="group relative aspect-video overflow-hidden rounded-md border border-border">
      <img src={url} alt={alt} className="size-full object-cover" />
      {!disabled && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center gap-2 bg-background/70 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100',
            busy && 'opacity-100',
          )}
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin text-foreground" />
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => inputRef.current?.click()}
              >
                <ImagePlus className="size-3.5" />
                {t('upload.replace')}
              </Button>
              {onRemoved ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => void handleRemove()}
                >
                  <Trash2 className="size-3.5" />
                  {t('upload.remove')}
                </Button>
              ) : null}
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="hidden"
        disabled={disabled || busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleReplace(file);
          }
        }}
      />
    </div>
  );
}
