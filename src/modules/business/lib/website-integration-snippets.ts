export interface WebsiteIntegrationContext {
  tenantName: string;
  tenantSlug: string;
  apiBase: string;
  embedOrigin: string;
}

export function buildEnvBlock({ tenantSlug, apiBase }: WebsiteIntegrationContext): string {
  return `# Vite / React
VITE_CRM_API_BASE_URL=${apiBase}
VITE_CRM_TENANT_SLUG=${tenantSlug}

# Next.js
NEXT_PUBLIC_CRM_API_BASE_URL=${apiBase}
NEXT_PUBLIC_CRM_TENANT_SLUG=${tenantSlug}

# Local dev (platform stack on your machine)
# VITE_CRM_API_BASE_URL=http://localhost:8090/api/v1
# Register http://localhost:5173 in Mesh → Business profile → Website domains`;
}

export function buildEmbedScript({ tenantSlug, apiBase, embedOrigin }: WebsiteIntegrationContext): string {
  return `<script src="${embedOrigin}/embed.js" data-slug="${tenantSlug}" data-api="${apiBase}"></script>`;
}

export function buildFetchSnippet({ tenantSlug, apiBase }: WebsiteIntegrationContext): string {
  return `const API_BASE = "${apiBase}";
const SLUG = "${tenantSlug}";

export async function fetchSnapshot() {
  const res = await fetch(\`\${API_BASE}/public/tenants/\${SLUG}/snapshot\`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(\`Snapshot failed (\${res.status})\`);
  return res.json();
}

export async function createBooking(booking) {
  const res = await fetch(\`\${API_BASE}/public/tenants/\${SLUG}/bookings\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  });
  if (!res.ok) throw new Error(\`Booking failed (\${res.status})\`);
  return res.json();
}`;
}

export function buildViteProxySnippet(): string {
  return `// vite.config.ts — local dev without CORS preflight
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8090", changeOrigin: true },
      "/embed.js": { target: "http://localhost:8090", changeOrigin: true },
    },
  },
});

// Then fetch: "/api/v1/public/tenants/your-slug/snapshot"`;
}

export function buildNextProxySnippet(): string {
  return `// next.config.js
async rewrites() {
  return [
    { source: "/api/:path*", destination: "http://localhost:8090/api/:path*" },
  ];
}`;
}

export function publicApiEndpoints(ctx: WebsiteIntegrationContext) {
  const { tenantSlug, apiBase } = ctx;
  return [
    {
      id: 'snapshot',
      method: 'GET',
      path: `${apiBase}/public/tenants/${tenantSlug}/snapshot`,
      purposeKey: 'publish.integration.endpoints.snapshot',
    },
    {
      id: 'availability',
      method: 'GET',
      path: `${apiBase}/public/tenants/${tenantSlug}/availability?date=YYYY-MM-DD`,
      purposeKey: 'publish.integration.endpoints.availability',
    },
    {
      id: 'bookings',
      method: 'POST',
      path: `${apiBase}/public/tenants/${tenantSlug}/bookings`,
      purposeKey: 'publish.integration.endpoints.bookings',
    },
  ] as const;
}

export function buildCorsExampleOrigins(): string {
  return `https://your-site.com
https://your-project.web.app
https://your-project.firebaseapp.com
http://localhost:5173
http://localhost:3000`;
}

export function buildDebugCurl(ctx: WebsiteIntegrationContext): string {
  return `# Verify snapshot
curl "${ctx.apiBase}/public/tenants/${ctx.tenantSlug}/snapshot"

# List allowed website origins (production gateway)
curl "${ctx.apiBase.replace('/api/v1', '')}/api/v1/public/cors-origins"

# Check CORS headers from a client origin
curl -i -H "Origin: https://your-site.com" \\
  "${ctx.apiBase}/public/tenants/${ctx.tenantSlug}/snapshot"`;
}
