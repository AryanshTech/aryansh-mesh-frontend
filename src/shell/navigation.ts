import type { LucideIcon } from 'lucide-react';
import {
  Blocks,
  Brain,
  Building2,
  CalendarClock,
  Clapperboard,
  ClipboardList,
  DollarSign,
  FileText,
  LayoutDashboard,
  MapPin,
  Megaphone,
  MessageSquareQuote,
  MessagesSquare,
  Package,
  Rocket,
  ScanSearch,
  Settings,
  Link2,
  UserSquare2,
  Users,
} from 'lucide-react';

export type NavRequirement =
  | 'business'
  | 'marketing'
  | 'platform_admin'
  | 'manage_team'
  | 'workspace_tenant';

export type ProductZone = 'business' | 'marketing' | 'platform';

export type NavItemDef = {
  id: string;
  path: string;
  labelKey: string;
  icon: LucideIcon;
  requires?: NavRequirement[];
  /** Match prefix for active state (defaults to path) */
  matchPrefix?: string;
};

export type NavSectionDef = {
  id: string;
  labelKey: string;
  items: NavItemDef[];
  requires?: NavRequirement[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
};

export const BUSINESS_OVERVIEW_NAV: NavItemDef[] = [
  { id: 'dashboard', path: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
];

export const BUSINESS_CATALOG_NAV: NavItemDef[] = [
  { id: 'products', path: '/products', labelKey: 'nav.products', icon: Package, matchPrefix: '/products' },
  { id: 'content', path: '/content', labelKey: 'nav.content', icon: Blocks, matchPrefix: '/content' },
  {
    id: 'testimonials',
    path: '/testimonials',
    labelKey: 'nav.testimonials',
    icon: MessageSquareQuote,
    matchPrefix: '/testimonials',
  },
];

export const BUSINESS_OPERATIONS_NAV: NavItemDef[] = [
  { id: 'clients', path: '/clients', labelKey: 'nav.clients', icon: Users, matchPrefix: '/clients' },
  { id: 'bookings', path: '/bookings', labelKey: 'nav.bookings', icon: CalendarClock },
  { id: 'locations', path: '/locations', labelKey: 'nav.locations', icon: MapPin, matchPrefix: '/locations' },
  { id: 'costs', path: '/costs', labelKey: 'nav.costs', icon: DollarSign, matchPrefix: '/costs' },
];

export const BUSINESS_WEBSITE_NAV: NavItemDef[] = [
  { id: 'profile', path: '/profile', labelKey: 'nav.profile', icon: Building2 },
  { id: 'publish', path: '/publish', labelKey: 'nav.publish', icon: Rocket },
  { id: 'connect', path: '/connect', labelKey: 'nav.connect', icon: Link2 },
];

/** Flat list of all business routes (11 modules). */
export const BUSINESS_ALL_NAV: NavItemDef[] = [
  ...BUSINESS_OVERVIEW_NAV,
  ...BUSINESS_CATALOG_NAV,
  ...BUSINESS_OPERATIONS_NAV,
  ...BUSINESS_WEBSITE_NAV,
];

/** @deprecated Use BUSINESS_ALL_NAV — kept for backward-compatible imports. */
export const BUSINESS_COMMAND_NAV: NavItemDef[] = BUSINESS_ALL_NAV;

export const CORE_NAV: NavItemDef[] = [
  ...BUSINESS_OVERVIEW_NAV,
  { id: 'profile', path: '/profile', labelKey: 'nav.profile', icon: Building2 },
  { id: 'locations', path: '/locations', labelKey: 'nav.locations', icon: MapPin },
  ...BUSINESS_CATALOG_NAV,
];

export const OPERATIONS_NAV: NavItemDef[] = [
  ...BUSINESS_OPERATIONS_NAV,
  { id: 'publish', path: '/publish', labelKey: 'nav.publish', icon: Rocket },
  { id: 'connect', path: '/connect', labelKey: 'nav.connect', icon: Link2 },
];

export const BUSINESS_NAV_SECTIONS: NavSectionDef[] = [
  {
    id: 'overview',
    labelKey: 'shell.sections.overview',
    items: BUSINESS_OVERVIEW_NAV,
    requires: ['business'],
  },
  {
    id: 'catalog',
    labelKey: 'shell.sections.catalog',
    items: BUSINESS_CATALOG_NAV,
    requires: ['business'],
  },
  {
    id: 'operations',
    labelKey: 'shell.sections.operations',
    items: BUSINESS_OPERATIONS_NAV,
    requires: ['business'],
  },
  {
    id: 'website',
    labelKey: 'shell.sections.website',
    items: BUSINESS_WEBSITE_NAV,
    requires: ['business'],
  },
];

export const MARKETING_NAV: NavItemDef[] = [
  { id: 'marketing-overview', path: '/marketing', labelKey: 'nav.marketingOverview', icon: Megaphone },
  {
    id: 'marketing-companies',
    path: '/marketing/companies',
    labelKey: 'nav.companies',
    icon: Building2,
    matchPrefix: '/marketing/companies',
  },
];

export const MARKETING_PROJECT_OVERVIEW_NAV: NavItemDef[] = [
  { id: 'project-dashboard', path: '', labelKey: 'nav.projectDashboard', icon: LayoutDashboard },
  { id: 'onboarding', path: 'onboarding', labelKey: 'nav.onboarding', icon: ClipboardList },
];

export const MARKETING_PROJECT_INTELLIGENCE_NAV: NavItemDef[] = [
  { id: 'spy', path: 'spy', labelKey: 'nav.spy', icon: ScanSearch },
  { id: 'brand-memory', path: 'brand-memory', labelKey: 'nav.brandMemory', icon: Brain },
];

export const MARKETING_PROJECT_CONTENT_NAV: NavItemDef[] = [
  { id: 'studio', path: 'studio', labelKey: 'nav.studio', icon: Clapperboard },
  { id: 'marketing-content', path: 'content', labelKey: 'nav.marketingContent', icon: FileText },
  { id: 'creative', path: 'creative', labelKey: 'nav.creative', icon: Package },
  { id: 'social', path: 'social', labelKey: 'nav.social', icon: CalendarClock },
];

export const MARKETING_PROJECT_PIPELINE_NAV: NavItemDef[] = [
  { id: 'crm', path: 'crm', labelKey: 'nav.crm', icon: Users },
  { id: 'workspace', path: 'workspace', labelKey: 'nav.workspace', icon: MessagesSquare },
];

export const MARKETING_PROJECT_SECTIONS: NavSectionDef[] = [
  {
    id: 'project-overview',
    labelKey: 'shell.sections.marketingOverview',
    items: MARKETING_PROJECT_OVERVIEW_NAV,
  },
  {
    id: 'intelligence',
    labelKey: 'shell.sections.intelligence',
    items: MARKETING_PROJECT_INTELLIGENCE_NAV,
    defaultCollapsed: true,
  },
  {
    id: 'content',
    labelKey: 'shell.sections.content',
    items: MARKETING_PROJECT_CONTENT_NAV,
  },
  {
    id: 'pipeline',
    labelKey: 'shell.sections.pipeline',
    items: MARKETING_PROJECT_PIPELINE_NAV,
    defaultCollapsed: true,
  },
];

/** Flat project nav — derived from grouped sections. */
export const MARKETING_PROJECT_NAV: NavItemDef[] = MARKETING_PROJECT_SECTIONS.flatMap(
  (section) => section.items,
);

export const ADMIN_NAV: NavItemDef[] = [
  {
    id: 'tenants',
    path: '/admin/tenants',
    labelKey: 'nav.tenants',
    icon: Building2,
    matchPrefix: '/admin/tenants',
  },
  { id: 'marketing-users', path: '/marketing/admin/users', labelKey: 'nav.marketingUsers', icon: Users },
];

export const PLATFORM_HUB_NAV: NavItemDef[] = [
  {
    id: 'hub-home',
    path: '/admin/tenants',
    labelKey: 'shell.adminHub.hubHome',
    icon: LayoutDashboard,
    matchPrefix: '/admin/tenants',
  },
  {
    id: 'all-businesses',
    path: '/admin/tenants',
    labelKey: 'shell.adminHub.viewAllBusinesses',
    icon: Building2,
    matchPrefix: '/admin/tenants',
  },
  {
    id: 'agency-marketing',
    path: '/marketing',
    labelKey: 'nav.marketingOverview',
    icon: Megaphone,
    matchPrefix: '/marketing',
  },
];

export const SETTINGS_NAV: NavItemDef[] = [
  { id: 'team', path: '/settings/team', labelKey: 'nav.team', icon: UserSquare2, requires: ['manage_team'] },
  { id: 'account', path: '/settings/account', labelKey: 'nav.account', icon: Settings },
];

export const NAV_SECTIONS: NavSectionDef[] = [
  ...BUSINESS_NAV_SECTIONS,
  {
    id: 'marketing',
    labelKey: 'nav.sections.marketing',
    items: MARKETING_NAV,
    requires: ['marketing'],
    collapsible: true,
  },
  { id: 'admin', labelKey: 'nav.sections.admin', items: ADMIN_NAV, requires: ['platform_admin'] },
  { id: 'settings', labelKey: 'nav.sections.settings', items: SETTINGS_NAV },
];

function toWorkspaceRelativeItems(items: NavItemDef[]): NavItemDef[] {
  return items.map((item) => ({
    ...item,
    path: item.path.replace(/^\//, ''),
    matchPrefix: item.matchPrefix?.replace(/^\//, ''),
  }));
}

function toWorkspaceRelativeSections(sections: NavSectionDef[]): NavSectionDef[] {
  return sections.map((section) => ({
    ...section,
    items: toWorkspaceRelativeItems(section.items),
  }));
}

/** Business module nav for admin tenant workspace routes (`/admin/tenants/:id/workspace/*`). */
export const BUSINESS_WORKSPACE_SECTIONS: NavSectionDef[] = [
  ...toWorkspaceRelativeSections(BUSINESS_NAV_SECTIONS),
  {
    id: 'settings',
    labelKey: 'nav.sections.settings',
    items: toWorkspaceRelativeItems(SETTINGS_NAV),
  },
];

/** @deprecated Use BUSINESS_WORKSPACE_SECTIONS */
export const BUSINESS_WORKSPACE_COMMAND_NAV: NavItemDef[] = toWorkspaceRelativeItems(BUSINESS_ALL_NAV);

export function resolveActiveZone(pathname: string, isPlatformOperator: boolean): ProductZone {
  if (pathname.startsWith('/marketing')) {
    return 'marketing';
  }
  if (isPlatformOperator && pathname.startsWith('/admin')) {
    return 'platform';
  }
  return 'business';
}

export function zoneLabelKey(zone: ProductZone): string {
  switch (zone) {
    case 'business':
      return 'shell.zone.business';
    case 'marketing':
      return 'shell.zone.marketing';
    case 'platform':
      return 'shell.zone.platform';
    default: {
      const _exhaustive: never = zone;
      return _exhaustive;
    }
  }
}

export function zoneHomePath(zone: ProductZone): string {
  switch (zone) {
    case 'business':
      return '/dashboard';
    case 'marketing':
      return '/marketing';
    case 'platform':
      return '/admin/tenants';
    default: {
      const _exhaustive: never = zone;
      return _exhaustive;
    }
  }
}

export function isNavItemActive(currentPath: string, item: NavItemDef, basePath = ''): boolean {
  const fullPath = basePath
    ? item.path
      ? `${basePath}/${item.path.replace(/^\//, '')}`
      : basePath
    : item.path;
  const rawPrefix = item.matchPrefix ?? fullPath;
  const prefix = basePath
    ? rawPrefix.startsWith('/')
      ? rawPrefix
      : `${basePath}/${rawPrefix.replace(/^\//, '')}`
    : rawPrefix;
  if (item.path === '' && basePath) {
    return currentPath === basePath || currentPath === `${basePath}/`;
  }
  return currentPath === fullPath || currentPath.startsWith(`${prefix}/`) || currentPath === prefix;
}

export function isMarketingProjectSectionActive(
  currentPath: string,
  section: NavSectionDef,
  basePath: string,
): boolean {
  return section.items.some((item) => isNavItemActive(currentPath, item, basePath));
}

export function buildProjectNavPath(projectId: string, segment: string): string {
  const base = `/marketing/projects/${projectId}`;
  return segment ? `${base}/${segment}` : base;
}

export function buildTenantWorkspacePath(tenantId: string, suffix = 'dashboard'): string {
  return `/admin/tenants/${tenantId}/workspace/${suffix.replace(/^\//, '')}`;
}

export type PageMetaRouteDef = {
  prefix: string;
  titleKey: string;
  subtitleKey?: string;
};

const PAGE_META_SUBTITLES: Partial<Record<string, string>> = {
  '/profile': 'business.subtitle',
  '/products': 'products.subtitle',
  '/costs': 'costs.subtitle',
  '/clients': 'clients.subtitle',
  '/locations': 'locations.subtitle',
  '/testimonials': 'testimonials.subtitle',
  '/content': 'content.subtitle',
  '/bookings': 'bookings.subtitle',
  '/publish': 'publish.subtitle',
  '/connect': 'connect.subtitle',
  '/settings/team': 'team.subtitle',
  '/settings/account': 'account.subtitle',
  '/onboarding': 'onboarding.subtitle',
};

const PAGE_META_TITLE_KEYS: Partial<Record<string, string>> = {
  '/dashboard': 'pages.dashboard',
  '/profile': 'pages.business',
  '/products': 'pages.products',
  '/costs': 'pages.costs',
  '/clients': 'pages.clients',
  '/locations': 'pages.locations',
  '/testimonials': 'pages.testimonials',
  '/content': 'pages.content',
  '/bookings': 'pages.bookings',
  '/publish': 'pages.publish',
  '/connect': 'pages.connect',
  '/settings/team': 'pages.team',
  '/settings/account': 'pages.account',
  '/onboarding': 'pages.onboarding',
};

function navItemsToPageMeta(items: NavItemDef[]): PageMetaRouteDef[] {
  return items
    .filter((item) => item.path.startsWith('/'))
    .map((item) => ({
      prefix: item.matchPrefix ?? item.path,
      titleKey: PAGE_META_TITLE_KEYS[item.path] ?? item.labelKey,
      subtitleKey: PAGE_META_SUBTITLES[item.path],
    }));
}

/** Longest-prefix match table for shell page titles (static routes). */
export const PAGE_META_ROUTES: PageMetaRouteDef[] = [
  ...navItemsToPageMeta(BUSINESS_ALL_NAV),
  ...navItemsToPageMeta(MARKETING_NAV),
  ...navItemsToPageMeta(ADMIN_NAV),
  ...navItemsToPageMeta(SETTINGS_NAV),
  { prefix: '/admin/tenants', titleKey: 'admin.tenants.title' },
  { prefix: '/marketing/admin/users', titleKey: 'nav.marketingUsers' },
].sort((a, b) => b.prefix.length - a.prefix.length);
