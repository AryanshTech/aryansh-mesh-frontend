import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Package,
  Users,
  Calendar,
  Receipt,
  MapPin,
  MessageSquareQuote,
  Newspaper,
  Send,
  Building2,
  Link2,
  ShieldCheck,
  UsersRound,
  Palette,
  CalendarDays,
  Image as ImageIcon,
  Linkedin,
  Instagram,
  AtSign,
} from 'lucide-react';

export type NavSection = 'workspace' | 'content' | 'marketing' | 'admin';

export interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  section: NavSection;
  /** When set, only users with role >= this can see it */
  requireRole?: 'PLATFORM_ADMIN';
}

export const NAV_ITEMS: NavItem[] = [
  // Workspace
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, section: 'workspace' },
  { to: '/products', labelKey: 'nav.products', icon: Package, section: 'workspace' },
  { to: '/clients', labelKey: 'nav.clients', icon: Users, section: 'workspace' },
  { to: '/bookings', labelKey: 'nav.bookings', icon: Calendar, section: 'workspace' },
  { to: '/costs', labelKey: 'nav.costs', icon: Receipt, section: 'workspace' },
  { to: '/settings/team', labelKey: 'nav.team', icon: UsersRound, section: 'workspace' },

  // Content
  { to: '/locations', labelKey: 'nav.locations', icon: MapPin, section: 'content' },
  { to: '/testimonials', labelKey: 'nav.testimonials', icon: MessageSquareQuote, section: 'content' },
  { to: '/content', labelKey: 'nav.content', icon: Newspaper, section: 'content' },
  { to: '/publish', labelKey: 'nav.publish', icon: Send, section: 'content' },
  { to: '/connect', labelKey: 'nav.connect', icon: Link2, section: 'content' },
  { to: '/business', labelKey: 'nav.business', icon: Building2, section: 'content' },

  // Marketing — deep links into workspace tabs
  { to: '/marketing?tab=brand', labelKey: 'nav.marketingBrand', icon: Palette, section: 'marketing' },
  {
    to: '/marketing?tab=social&platform=LINKEDIN',
    labelKey: 'nav.marketingLinkedIn',
    icon: Linkedin,
    section: 'marketing',
  },
  {
    to: '/marketing?tab=social&platform=INSTAGRAM',
    labelKey: 'nav.marketingInstagram',
    icon: Instagram,
    section: 'marketing',
  },
  {
    to: '/marketing?tab=social&platform=X',
    labelKey: 'nav.marketingX',
    icon: AtSign,
    section: 'marketing',
  },
  {
    to: '/marketing?tab=calendar',
    labelKey: 'nav.marketingCalendar',
    icon: CalendarDays,
    section: 'marketing',
  },
  {
    to: '/marketing?tab=assets',
    labelKey: 'nav.marketingAssets',
    icon: ImageIcon,
    section: 'marketing',
  },

  // Admin
  {
    to: '/admin/tenants',
    labelKey: 'nav.tenants',
    icon: ShieldCheck,
    section: 'admin',
    requireRole: 'PLATFORM_ADMIN',
  },
];

export const SECTION_LABELS: Record<NavSection, string> = {
  workspace: 'nav.section.workspace',
  content: 'nav.section.content',
  marketing: 'nav.section.marketing',
  admin: 'nav.section.admin',
};

export function parseNavTo(to: string): {
  pathname: string;
  tab: string | null;
  platform: string | null;
} {
  const [pathname, query = ''] = to.split('?');
  const params = new URLSearchParams(query);
  return {
    pathname,
    tab: params.get('tab'),
    platform: params.get('platform'),
  };
}

/** Resolve which nav item is active, including /marketing?tab=&platform= deep links. */
export function resolveActiveNavTo(
  items: NavItem[],
  pathname: string,
  search: string,
): string | null {
  const params = new URLSearchParams(search);
  const currentTab = params.get('tab');
  const currentPlatform = params.get('platform');

  const marketingItems = items.filter((it) => it.to.startsWith('/marketing'));
  if (pathname === '/marketing' || pathname.startsWith('/marketing/')) {
    const exact = marketingItems.find((it) => {
      const t = parseNavTo(it.to);
      if (t.tab !== (currentTab ?? 'brand')) return false;
      if (t.platform) return t.platform === currentPlatform;
      return currentTab !== 'social';
    });
    if (exact) return exact.to;
  }

  const matching = items.filter((it) => {
    if (it.to.startsWith('/marketing')) return false;
    const { pathname: p } = parseNavTo(it.to);
    return pathname === p || pathname.startsWith(`${p}/`);
  });
  return matching.reduce<string | null>(
    (best, it) => (best === null || it.to.length > best.length ? it.to : best),
    null,
  );
}

export function sectionContainsPath(
  section: NavSection,
  items: NavItem[],
  pathname: string,
  search: string,
): boolean {
  const active = resolveActiveNavTo(items, pathname, search);
  if (active) {
    const item = items.find((it) => it.to === active);
    return item?.section === section;
  }
  return items.some((it) => {
    if (it.section !== section) return false;
    const { pathname: p } = parseNavTo(it.to);
    return pathname === p || pathname.startsWith(`${p}/`);
  });
}
