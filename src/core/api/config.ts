/**
 * Single API entry: gateway root in VITE_API_BASE_URL (no /api/v1 suffix).
 * Local dev: unset or http://localhost:8090 — or leave unset to use Vite proxy (/api → gateway).
 */
export function resolveGatewayOrigin(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
  if (!raw) {
    return '';
  }
  if (raw.endsWith('/api/v1')) {
    return raw.slice(0, -'/api/v1'.length);
  }
  return raw;
}

export function resolveApiV1BaseUrl(): string {
  const origin = resolveGatewayOrigin();
  if (!origin) {
    return '/api/v1';
  }
  return `${origin}/api/v1`;
}
