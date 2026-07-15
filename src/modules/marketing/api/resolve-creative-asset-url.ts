import { resolveApiV1BaseUrl } from '@/core/api/config';

/** Turn GCS object paths / gs:// URIs into browser-loadable public media URLs. */
export function resolveCreativeAssetUrl(url: string | null | undefined): string {
  if (!url?.trim()) return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  let path = trimmed;
  const gsMatch = /^gs:\/\/[^/]+\/(.+)$/.exec(trimmed);
  if (gsMatch) path = gsMatch[1];

  if (!path || path.includes('..')) return '';
  return `${resolveApiV1BaseUrl()}/public/media?path=${encodeURIComponent(path)}`;
}
