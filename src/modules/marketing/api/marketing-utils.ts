/** Normalize list endpoints that may return a bare array or `{ items }`. */
export function normalizeList<T>(raw: T[] | { items?: T[] } | null | undefined): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return raw.items ?? [];
}

export function resolveEntityId(
  entity: { id?: string; companyId?: string; projectId?: string } | null | undefined,
  preferredKey: 'companyId' | 'projectId',
): string {
  if (!entity) return '';
  const preferred = entity[preferredKey];
  if (preferred) return preferred;
  return entity.id ?? '';
}
