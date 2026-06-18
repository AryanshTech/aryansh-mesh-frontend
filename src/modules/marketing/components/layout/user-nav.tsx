import { useNavigate } from 'react-router-dom';
import { ChevronsUpDownIcon, LanguagesIcon, LogOutIcon } from 'lucide-react';
import { useAuth } from '@/core/auth/auth-context';
import { useLocale } from '@/modules/marketing/contexts/locale-context';
import { Avatar, AvatarFallback } from '@/design-system/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/design-system/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/design-system/components/ui/sidebar';

function initials(email: string): string {
  const part = email.split('@')[0] ?? email;
  return part.slice(0, 2).toUpperCase();
}

export function UserNav() {
  const { profile, session, signOut } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const navigate = useNavigate();

  const me = profile ?? (session ? { email: session.email, role: session.accessLevel === 'platform_admin' ? 'ADMIN' : session.accessLevel === 'platform_team' ? 'MEMBER' : 'VIEWER' } : null);

  if (!me?.email) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'fr' : 'en');
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {initials(me.email)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{me.email}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {t(`roles.${me.role}`)}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {initials(me.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{me.email}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {t(`roles.${me.role}`)}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleLocale}>
              <LanguagesIcon />
              {locale === 'en' ? t('nav.localeFr') : t('nav.localeEn')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOutIcon />
              {t('nav.signOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
