import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { useAuth } from '@/core/auth/use-auth';
import { NAV_ITEMS, SECTION_LABELS, type NavSection } from '@/shell/navigation';
import { cn } from '@/design-system/lib/utils';
import { useShellCommandPalette } from '@/shell/CommandPaletteContext';

const SECTIONS: NavSection[] = ['workspace', 'content', 'marketing', 'admin'];

export function Sidebar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { open: openPalette } = useShellCommandPalette();
  const location = useLocation();

  const isAdmin = user?.role === 'PLATFORM_ADMIN';

  const matchingItems = NAV_ITEMS.filter(
    (it) => location.pathname === it.to || location.pathname.startsWith(it.to + '/'),
  );
  const activeTo = matchingItems.reduce<string | null>(
    (best, it) => (best === null || it.to.length > best.length ? it.to : best),
    null,
  );

  return (
    <aside className="hidden md:flex h-screen w-[220px] shrink-0 flex-col border-r border-border bg-canvas">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <div className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
          <span className="typo-eyebrow font-bold leading-none">AM</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="typo-body-sm font-semibold text-foreground leading-tight">
            {t('common.appName')}
          </span>
          <span className="typo-eyebrow-upper text-muted-foreground">
            {t('shell.zoneBusiness')}
          </span>
        </div>
      </div>

      {/* Inline search */}
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={openPalette}
          className="flex w-full items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Search className="size-3.5" />
          <span className="flex-1 truncate">{t('shell.searchPlaceholder')}</span>
          <kbd className="rounded border border-border bg-canvas px-1.5 py-0.5 typo-eyebrow font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Sections */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {SECTIONS.map((section) => {
          const items = NAV_ITEMS.filter((item) => {
            if (item.section !== section) return false;
            if (item.requireRole === 'PLATFORM_ADMIN' && !isAdmin) return false;
            return true;
          });
          if (items.length === 0) return null;
          return (
            <div key={section} className="mb-4">
              <div className="px-2.5 pb-1.5 typo-eyebrow-upper text-faint">
                {t(SECTION_LABELS[section])}
              </div>
              <ul className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = activeTo === item.to;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        className={cn(
                          'group relative flex items-center gap-2 rounded-md px-2.5 py-1.5 typo-body-sm font-medium transition-colors',
                          active
                            ? 'bg-primary/10 text-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {active ? (
                          <span className="absolute left-0 top-1/2 h-4 -translate-y-1/2 w-0.5 rounded-r-full bg-primary" />
                        ) : null}
                        <Icon className="size-4 shrink-0" />
                        <span className="truncate">{t(item.labelKey)}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      {user ? (
        <div className="border-t border-border px-3 py-2.5 flex items-center gap-2.5">
          <div className="grid size-7 place-items-center rounded-full bg-muted typo-caption font-semibold text-foreground">
            {user.name?.charAt(0)?.toUpperCase() ?? user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate typo-caption font-medium text-foreground">
              {user.name ?? user.email}
            </div>
            <div className="truncate typo-eyebrow-upper text-muted-foreground">
              {user.role}
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
