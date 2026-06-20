import { LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/design-system/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/design-system/components/ui/dropdown-menu';
import { useAuth } from '@/core/auth/use-auth';
import { ShellIconButton } from '@/shared/components/layout/ShellIconButton';

function userInitials(displayName?: string | null, email?: string | null): string {
  const source = displayName?.trim() || email?.trim() || '?';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function UserMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, profile, signOut } = useAuth();

  const displayName = session?.displayName ?? profile?.displayName;
  const email = session?.email ?? profile?.email ?? '';
  const initials = userInitials(displayName, email);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ShellIconButton className="rounded-full p-0" aria-label={t('shell.userMenu.label')}>
          <Avatar className="size-8 border-0">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </ShellIconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 shadow-floating">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            {displayName ? <p className="text-sm font-medium text-foreground">{displayName}</p> : null}
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings/account" className="cursor-pointer">
            <User className="size-4" />
            {t('shell.userMenu.account')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void handleSignOut()}>
          <LogOut className="size-4" />
          {t('shell.nav.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
