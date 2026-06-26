/** Gateway root URL without `/api/v1` suffix. */
export function resolveGatewayOrigin(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
  if (!raw) return '';
  if (raw.endsWith('/api/v1')) return raw.slice(0, -'/api/v1'.length);
  return raw;
}

/** Public API base — `/api/v1` on same origin when env is unset (Vite proxy). */
export function resolveApiV1BaseUrl(): string {
  const origin = resolveGatewayOrigin();
  if (!origin) return '/api/v1';
  return `${origin}/api/v1`;
}
