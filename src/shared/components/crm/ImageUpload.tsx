import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/design-system/components/ui/button';
import { api } from '@/core/api/client';
import { ApiError } from '@/modules/business/types/api';
import { cn } from '@/design-system/lib/utils';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface ImageUploadProps {
  endpoint: string;
  onUploaded: (url: string) => void;
  disabled?: boolean;
  currentUrl?: string | null;
  className?: string;
}

export function ImageUpload({
  endpoint,
  onUploaded,
  disabled = false,
  currentUrl,
  className,
}: ImageUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setPreview(currentUrl ?? null);
  }, [currentUrl]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(t('errors.invalidFileType'));
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        toast.error(t('errors.uploadTooLarge'));
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.upload<{
          url?: string;
          logoUrl?: string;
          photoUrl?: string;
          images?: Array<{ url?: string }>;
        }>(endpoint, formData);
        const imagesUrl = response.images?.at(-1)?.url;
        const url = response.url ?? response.logoUrl ?? response.photoUrl ?? imagesUrl;
        if (!url) {
          throw new Error('No URL in upload response');
        }
        onUploaded(url);
        setPreview(url);
        toast.success(t('upload.success'));
      } catch (error) {
        setPreview(currentUrl ?? null);
        if (error instanceof ApiError) {
          toast.error(error.message);
        } else {
          toast.error(t('errors.network'));
        }
      } finally {
        setUploading(false);
        URL.revokeObjectURL(objectUrl);
      }
    },
    [currentUrl, endpoint, onUploaded, t],
  );

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) {
      void uploadFile(file);
    }
  }

  function clearPreview() {
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(event) => {
          if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
            inputRef.current?.click();
          }
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (!disabled) handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          'relative flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors',
          dragOver && 'border-primary bg-primary/5',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt=""
              className="max-h-40 rounded-md object-contain"
            />
            {!disabled && !uploading && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute -right-2 -top-2 size-7"
                onClick={(event) => {
                  event.stopPropagation();
                  clearPreview();
                }}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            {uploading ? (
              <Loader2 className="size-8 animate-spin" />
            ) : (
              <ImagePlus className="size-8" />
            )}
            <p className="text-sm">{t('upload.dropzone')}</p>
            <p className="text-xs">{t('upload.hint')}</p>
          </div>
        )}
        {uploading && preview && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60">
            <Loader2 className="size-6 animate-spin" />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}
