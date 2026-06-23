import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useShellCommandPalette } from '@/shell/CommandPaletteContext';
import { UserMenu } from '@/shell/UserMenu';
import { BusinessSelector } from '@/shell/BusinessSelector';
import { MobileNav } from '@/shell/MobileNav';
import { NAV_ITEMS } from '@/shell/navigation';
import { ChevronRight, Search } from 'lucide-react';
import { useHeaderActions } from '@/shell/HeaderActionsContext';

export function Header() {
  const { t } = useTranslation();
  const { open } = useShellCommandPalette();
  const location = useLocation();
  const { actions, title } = useHeaderActions();

  const active = NAV_ITEMS.find(
    (it) => it.to === location.pathname || location.pathname.startsWith(it.to + '/'),
  );

  const breadcrumbTitle = title ?? (active ? t(active.labelKey) : t('common.appName'));

  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-canvas px-4 md:px-6">
      <MobileNav />
      <nav className="flex min-w-0 flex-1 items-center gap-1.5 typo-body-sm">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
          {t('common.appName')}
        </Link>
        <ChevronRight className="size-3 text-faint hidden sm:inline" />
        <span className="font-medium text-foreground truncate">{breadcrumbTitle}</span>
      </nav>

      <button
        type="button"
        onClick={open}
        className="hidden w-56 shrink-0 items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex lg:w-64"
      >
        <Search className="size-3.5" />
        <span className="flex-1 truncate">{t('shell.searchPlaceholder')}</span>
        <kbd className="rounded border border-border bg-canvas px-1.5 py-0.5 typo-eyebrow font-medium">
          ⌘K
        </kbd>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <BusinessSelector />
        {actions}
        <UserMenu />
      </div>
    </header>
  );
}
