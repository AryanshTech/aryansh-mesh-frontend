export const businessKeys = {
  all: (tenantId: string) => ['business', tenantId] as const,
  dashboard: (tenantId: string) => ['business', tenantId, 'dashboard'] as const,
  products: (tenantId: string, filters?: unknown) =>
    ['business', tenantId, 'products', filters ?? {}] as const,
  product: (tenantId: string, id: string) =>
    ['business', tenantId, 'products', id] as const,
  clients: (tenantId: string, filters?: unknown) =>
    ['business', tenantId, 'clients', filters ?? {}] as const,
  bookings: (tenantId: string) => ['business', tenantId, 'bookings'] as const,
  costs: (tenantId: string) => ['business', tenantId, 'costs'] as const,
  locations: (tenantId: string) => ['business', tenantId, 'locations'] as const,
  testimonials: (tenantId: string) => ['business', tenantId, 'testimonials'] as const,
  content: (tenantId: string) => ['business', tenantId, 'content'] as const,
  business: (tenantId: string) => ['business', tenantId, 'business'] as const,
  publishStatus: (tenantId: string) =>
    ['business', tenantId, 'publish', 'status'] as const,
};
