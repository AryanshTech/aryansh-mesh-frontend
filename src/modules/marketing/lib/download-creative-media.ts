import { getAccessToken } from '@/core/auth/token-storage';

/** Download a creative asset URL (public media or authenticated) to the user's machine. */
export async function downloadCreativeMedia(
  url: string,
  filename = 'creative-asset.png',
): Promise<void> {
  const trimmed = url.trim();
  if (!trimmed) throw new Error('No media URL');

  const headers: Record<string, string> = { Accept: '*/*' };
  const token = getAccessToken();
  if (token && !trimmed.includes('/public/media')) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(trimmed, { headers });
  if (!res.ok) {
    throw new Error(`Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const ext =
    blob.type === 'image/jpeg'
      ? 'jpg'
      : blob.type === 'image/webp'
        ? 'webp'
        : blob.type === 'video/mp4'
          ? 'mp4'
          : blob.type === 'image/png'
            ? 'png'
            : filename.includes('.')
              ? filename.split('.').pop()!
              : 'png';
  const base = filename.replace(/\.[^.]+$/, '') || 'creative-asset';
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = `${base}.${ext}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}
