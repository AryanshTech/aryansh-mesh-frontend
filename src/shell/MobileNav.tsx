import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/design-system/components/ui/sheet';
import { useAuth } from '@/core/auth/use-auth';
import { NAV_ITEMS, SECTION_LABELS, resolveActiveNavTo, type NavSection } from '@/shell/navigation';
import { cn } from '@/design-system/lib/utils';

const SECTIONS: NavSection[] = ['workspace', 'content', 'marketing', 'admin'];

export function MobileNav() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isAdmin = user?.role === 'PLATFORM_ADMIN';

  const activeTo = resolveActiveNavTo(NAV_ITEMS, location.pathname, location.search);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={t('shell.openMenu')}
          className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
        >
          <Menu className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] p-0">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
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

          <nav className="flex-1 overflow-y-auto px-2 py-3">
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
                              'group relative flex items-center gap-2 rounded-md px-2.5 py-2 typo-body-sm font-medium transition-colors',
                              active
                                ? 'bg-primary/10 text-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                          >
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
