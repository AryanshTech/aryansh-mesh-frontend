export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  admin: {
    tenants: (page: number, size: number) =>
      ['admin', 'tenants', { page, size }] as const,
    tenant: (id: string) => ['admin', 'tenants', id] as const,
  },
  tenant: {
    business: (tenantId: string) => ['tenant', tenantId, 'business'] as const,
    products: (tenantId: string, page: number, size: number) =>
      ['tenant', tenantId, 'products', { page, size }] as const,
    product: (tenantId: string, productId: string) =>
      ['tenant', tenantId, 'products', productId] as const,
    costs: (tenantId: string, page: number, size: number) =>
      ['tenant', tenantId, 'costs', { page, size }] as const,
    cost: (tenantId: string, costId: string) =>
      ['tenant', tenantId, 'costs', costId] as const,
    clients: (tenantId: string, page: number, size: number) =>
      ['tenant', tenantId, 'clients', { page, size }] as const,
    client: (tenantId: string, clientId: string) =>
      ['tenant', tenantId, 'clients', clientId] as const,
    locations: (tenantId: string, page: number, size: number) =>
      ['tenant', tenantId, 'locations', { page, size }] as const,
    location: (tenantId: string, locationId: string) =>
      ['tenant', tenantId, 'locations', locationId] as const,
    testimonials: (tenantId: string, page: number, size: number) =>
      ['tenant', tenantId, 'testimonials', { page, size }] as const,
    testimonial: (tenantId: string, testimonialId: string) =>
      ['tenant', tenantId, 'testimonials', testimonialId] as const,
    contentCollections: (tenantId: string, page: number, size: number) =>
      ['tenant', tenantId, 'content-collections', { page, size }] as const,
    contentCollection: (tenantId: string, collectionId: string) =>
      ['tenant', tenantId, 'content-collections', collectionId] as const,
    bookings: {
      list: (tenantId: string, page: number, size: number) =>
        ['tenant', tenantId, 'bookings', { page, size }] as const,
    },
    publish: {
      status: (tenantId: string) => ['tenant', tenantId, 'publish', 'status'] as const,
      latest: (tenantId: string) => ['tenant', tenantId, 'publish', 'latest'] as const,
    },
    dashboard: (tenantId: string) => ['tenant', tenantId, 'dashboard'] as const,
    team: (tenantId: string) => ['tenant', tenantId, 'team'] as const,
  },
};
