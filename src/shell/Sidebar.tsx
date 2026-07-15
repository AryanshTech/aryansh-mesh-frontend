import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search } from 'lucide-react';
import { useAuth } from '@/core/auth/use-auth';
import {
  NAV_ITEMS,
  SECTION_LABELS,
  resolveActiveNavTo,
  sectionContainsPath,
  type NavSection,
} from '@/shell/navigation';
import { cn } from '@/design-system/lib/utils';
import { useShellCommandPalette } from '@/shell/CommandPaletteContext';

const SECTIONS: NavSection[] = ['workspace', 'content', 'marketing', 'admin'];
const STORAGE_KEY = 'am.sidebar.sections';

type SectionOpenMap = Partial<Record<NavSection, boolean>>;

function loadSectionOpen(): SectionOpenMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SectionOpenMap;
  } catch {
    return {};
  }
}

function saveSectionOpen(map: SectionOpenMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function Sidebar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { open: openPalette } = useShellCommandPalette();
  const location = useLocation();

  const isAdmin = user?.role === 'PLATFORM_ADMIN';
  const activeTo = resolveActiveNavTo(NAV_ITEMS, location.pathname, location.search);

  const [openMap, setOpenMap] = useState<SectionOpenMap>(() => loadSectionOpen());

  useEffect(() => {
    // Auto-expand the section that contains the active route
    for (const section of SECTIONS) {
      if (sectionContainsPath(section, NAV_ITEMS, location.pathname, location.search)) {
        setOpenMap((prev) => {
          if (prev[section] === false) {
            const next = { ...prev, [section]: true };
            saveSectionOpen(next);
            return next;
          }
          return prev;
        });
      }
    }
  }, [location.pathname, location.search]);

  const isSectionOpen = (section: NavSection) => openMap[section] !== false;

  const toggleSection = (section: NavSection) => {
    setOpenMap((prev) => {
      const nextOpen = !(prev[section] !== false);
      const next = { ...prev, [section]: nextOpen };
      saveSectionOpen(next);
      return next;
    });
  };

  return (
    <aside className="hidden md:flex h-dvh w-[220px] shrink-0 flex-col border-r border-border bg-canvas">
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

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {SECTIONS.map((section) => {
          const items = NAV_ITEMS.filter((item) => {
            if (item.section !== section) return false;
            if (item.requireRole === 'PLATFORM_ADMIN' && !isAdmin) return false;
            return true;
          });
          if (items.length === 0) return null;
          const open = isSectionOpen(section);
          return (
            <div key={section} className="mb-4">
              <button
                type="button"
                onClick={() => toggleSection(section)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 typo-eyebrow-upper text-faint transition-colors hover:bg-muted hover:text-foreground"
              >
                <span>{t(SECTION_LABELS[section])}</span>
                <ChevronDown
                  className={cn(
                    'size-3.5 shrink-0 transition-transform',
                    open ? 'rotate-0' : '-rotate-90',
                  )}
                  aria-hidden
                />
              </button>
              {open ? (
                <ul className="mt-0.5 flex flex-col gap-0.5">
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
                            <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
                          ) : null}
                          <Icon className="size-4 shrink-0" />
                          <span className="truncate">{t(item.labelKey)}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}
      </nav>

      {user ? (
        <div className="flex items-center gap-2.5 border-t border-border px-3 py-2.5">
          <div className="grid size-7 place-items-center rounded-full bg-muted typo-caption font-semibold text-foreground">
            {user.name?.charAt(0)?.toUpperCase() ?? user.email.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate typo-caption font-medium text-foreground">
              {user.name ?? user.email}
            </div>
            <div className="truncate typo-eyebrow-upper text-muted-foreground">{user.role}</div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
