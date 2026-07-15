import type { CreativeAsset } from '@/modules/marketing/api/use-creative';

export const SCOPE_BRAND = 'brand' as const;
export const SCOPE_GENERATED = 'generated' as const;

export type AssetScope = typeof SCOPE_BRAND | typeof SCOPE_GENERATED;

export const BRAND_STARTER_FOLDERS = [
  '/Brand/Logos',
  '/Brand/Product',
  '/Brand/People',
  '/Brand/Video',
] as const;

export type BrandFolderPath = (typeof BRAND_STARTER_FOLDERS)[number];

export const BRAND_FOLDER_LABELS: Record<BrandFolderPath, string> = {
  '/Brand/Logos': 'Logos',
  '/Brand/Product': 'Product',
  '/Brand/People': 'People',
  '/Brand/Video': 'Video',
};

export function metaString(asset: CreativeAsset, key: string): string {
  const value = asset.metadata?.[key];
  return typeof value === 'string' ? value.trim() : '';
}

export function resolveAssetScope(asset: CreativeAsset): AssetScope {
  const scope = metaString(asset, 'scope').toLowerCase();
  if (scope === SCOPE_BRAND) return SCOPE_BRAND;
  return SCOPE_GENERATED;
}

export function resolveFolderPath(asset: CreativeAsset): string {
  const folder = metaString(asset, 'folderPath');
  if (folder) return folder.startsWith('/') ? folder : `/${folder}`;
  if (resolveAssetScope(asset) === SCOPE_BRAND) return '/Brand/Product';
  return asset.runId ? `/Generated/${asset.runId}` : '/Generated';
}

export function isBrandFolder(path: string): path is BrandFolderPath {
  return (BRAND_STARTER_FOLDERS as readonly string[]).includes(path);
}

export function folderLabel(path: string): string {
  if (isBrandFolder(path)) return BRAND_FOLDER_LABELS[path];
  if (path === '/Generated') return 'All generated';
  if (path.startsWith('/Generated/')) return 'Run outputs';
  return path.split('/').filter(Boolean).pop() ?? path;
}

/** Default set for Nano Banana / agents: 1 logo + up to 2 product shots. */
export function defaultBrandReferenceAssets(assets: CreativeAsset[]): CreativeAsset[] {
  const brandImages = assets
    .filter((a) => resolveAssetScope(a) === SCOPE_BRAND && a.assetType === 'IMAGE')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const picked: CreativeAsset[] = [];
  const logo = brandImages.find((a) => resolveFolderPath(a) === '/Brand/Logos');
  if (logo) picked.push(logo);
  for (const a of brandImages.filter((x) => resolveFolderPath(x) === '/Brand/Product')) {
    if (picked.some((p) => p.id === a.id)) continue;
    picked.push(a);
    if (picked.filter((p) => resolveFolderPath(p) === '/Brand/Product').length >= 2) break;
  }
  return picked;
}

export function brandAssetsInFolder(assets: CreativeAsset[], folder: string): CreativeAsset[] {
  return assets
    .filter((a) => resolveAssetScope(a) === SCOPE_BRAND && resolveFolderPath(a) === folder)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function generatedAssets(assets: CreativeAsset[]): CreativeAsset[] {
  return assets
    .filter((a) => resolveAssetScope(a) === SCOPE_GENERATED)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
