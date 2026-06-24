import { api, ApiError } from '@/core/api/client';

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export type UploadImageResponse = {
  url?: string;
  logoUrl?: string;
  photoUrl?: string;
  images?: Array<{ url?: string }>;
};

export function resolveUploadUrl(response: UploadImageResponse): string | null {
  const imagesUrl = response.images?.at(-1)?.url;
  return response.url ?? response.logoUrl ?? response.photoUrl ?? imagesUrl ?? null;
}

export async function uploadImageFile(
  endpoint: string,
  file: File,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.upload<UploadImageResponse>(endpoint, formData);
  const url = resolveUploadUrl(response);
  if (!url) {
    throw new Error('No URL in upload response');
  }
  return url;
}

export function validateImageFile(
  file: File,
  t: (key: string) => string,
): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return t('errors.invalidFileType');
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return t('errors.uploadTooLarge');
  }
  return null;
}

export { ApiError };
