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
  LineChart,
  UsersRound,
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

  // Marketing
  { to: '/marketing', labelKey: 'nav.marketingOverview', icon: LineChart, section: 'marketing' },

  // Admin
  { to: '/admin/tenants', labelKey: 'nav.tenants', icon: ShieldCheck, section: 'admin', requireRole: 'PLATFORM_ADMIN' },
];

export const SECTION_LABELS: Record<NavSection, string> = {
  workspace: 'nav.section.workspace',
  content: 'nav.section.content',
  marketing: 'nav.section.marketing',
  admin: 'nav.section.admin',
};
