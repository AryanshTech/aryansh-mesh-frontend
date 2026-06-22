const RECENT_TENANTS_KEY = 'aryansh_recent_tenants';
const RECENT_COMPANIES_KEY = 'aryansh_recent_companies';
const MAX_RECENT_TENANTS = 5;
const MAX_RECENT_COMPANIES = 3;

export type RecentTenant = {
  id: string;
  name: string;
  lastPath?: string;
};

export type RecentCompany = {
  id: string;
  name: string;
};

function readJson<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJson<T>(key: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(items));
}

export function readRecentTenants(): RecentTenant[] {
  return readJson<RecentTenant>(RECENT_TENANTS_KEY);
}

export function recordRecentTenant(tenant: RecentTenant): void {
  const items = readRecentTenants().filter((entry) => entry.id !== tenant.id);
  items.unshift(tenant);
  writeJson(RECENT_TENANTS_KEY, items.slice(0, MAX_RECENT_TENANTS));
}

export function getRecentTenantPath(tenantId: string): string {
  const entry = readRecentTenants().find((item) => item.id === tenantId);
  return entry?.lastPath ?? `/admin/tenants/${tenantId}`;
}

export function readRecentCompanies(): RecentCompany[] {
  return readJson<RecentCompany>(RECENT_COMPANIES_KEY);
}

export function recordRecentCompany(company: RecentCompany): void {
  const items = readRecentCompanies().filter((entry) => entry.id !== company.id);
  items.unshift(company);
  writeJson(RECENT_COMPANIES_KEY, items.slice(0, MAX_RECENT_COMPANIES));
}
