import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/design-system/components/ui/dropdown-menu';
import { useAuth } from '@/core/auth/use-auth';

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="grid size-7 place-items-center rounded-full bg-muted typo-caption font-semibold text-foreground transition-colors hover:bg-accent"
          aria-label={t('shell.userMenu')}
        >
          {user.name?.charAt(0)?.toUpperCase() ?? user.email.charAt(0).toUpperCase()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user.name ?? user.email}</span>
            <span className="typo-caption text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en')}
        >
          {i18n.language === 'en' ? 'Français' : 'English'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            logout();
            navigate('/auth/login');
          }}
        >
          <LogOut className="size-3.5" />
          {t('shell.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
