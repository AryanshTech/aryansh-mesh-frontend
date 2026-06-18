import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  DollarSign,
  CalendarClock,
  LayoutDashboard,
  MapPin,
  MessageSquareQuote,
  Package,
  Rocket,
  Settings,
  Users,
  UserSquare2,
  Blocks,
} from 'lucide-react';
import { useAuth } from '@/core/auth/use-auth';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useActiveProduct } from '@/shell/use-active-product';
import { ProductSwitcher } from '@/shell/ProductSwitcher';
import { MarketingAppSidebar } from '@/modules/marketing/components/layout/app-sidebar';
import { setLocale, getLocale } from '@/core/i18n';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/design-system/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/design-system/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/design-system/components/ui/avatar';
import { Button } from '@/design-system/components/ui/button';

const businessNav = [
  { suffix: '/dashboard', key: 'business.nav.dashboard', icon: LayoutDashboard },
  { suffix: '/profile', key: 'business.nav.business', icon: Building2 },
  { suffix: '/locations', key: 'business.nav.locations', icon: MapPin },
  { suffix: '/products', key: 'business.nav.products', icon: Package },
  { suffix: '/costs', key: 'business.nav.costs', icon: DollarSign },
  { suffix: '/clients', key: 'business.nav.clients', icon: Users },
  { suffix: '/testimonials', key: 'business.nav.testimonials', icon: MessageSquareQuote },
  { suffix: '/content', key: 'business.nav.content', icon: Blocks },
  { suffix: '/bookings', key: 'business.nav.bookings', icon: CalendarClock },
  { suffix: '/publish', key: 'business.nav.publish', icon: Rocket },
  { suffix: '/settings/team', key: 'business.nav.team', icon: UserSquare2 },
  { suffix: '/settings/account', key: 'business.nav.account', icon: Settings },
] as const;

export function AppSidebar() {
  const product = useActiveProduct();
  if (product === 'marketing') {
    return <MarketingAppSidebar />;
  }

  const { t } = useTranslation();

  const location = useLocation();
  const { session, signOut } = useAuth();
  const { isSuperAdmin, canManageTeam, canAccessBusiness } = usePermissions();
  const locale = getLocale();

  const workspaceMatch = location.pathname.match(
    /^\/business\/admin\/tenants\/([^/]+)\/workspace(?:\/|$)/,
  );
  const workspaceTenantId = workspaceMatch?.[1];
  const workspaceBase = workspaceTenantId
    ? `/business/admin/tenants/${workspaceTenantId}/workspace`
    : null;

  const showBusinessNav = product === 'business' && canAccessBusiness && (!isSuperAdmin || Boolean(workspaceBase));
  const navPrefix = workspaceBase ?? '/business';
  const navItems = businessNav.filter(({ suffix }) => {
    if (suffix === '/settings/team' && !canManageTeam) return false;
    return true;
  });

  const initials = session?.displayName?.[0] ?? session?.email?.[0] ?? '?';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <ProductSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {showBusinessNav && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('business.nav.workspace')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map(({ suffix, key, icon: Icon }) => {
                  const href = `${navPrefix}${suffix}`;
                  const active = location.pathname === href || location.pathname.startsWith(`${href}/`);
                  return (
                    <SidebarMenuItem key={suffix}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link to={href}>
                          <Icon />
                          <span>{t(key)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('business.nav.platform')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith('/business/admin/tenants')}>
                    <Link to="/business/admin/tenants">
                      <Users />
                      <span>{t('business.nav.tenants')}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 px-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="truncate text-sm">{session?.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}>
              {t('common.locale.toggle')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void signOut()}>{t('shell.nav.logout')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
