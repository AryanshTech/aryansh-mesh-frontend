import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Languages, Moon, PanelLeftClose, PanelLeftOpen, Search, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { appColors } from '@/design-system/tokens/colors';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/design-system/components/ui/dialog';
import { useTheme } from '@/core/theme/ThemeProvider';
import { getLocale, setLocale } from '@/core/i18n';
import {
  useHeaderActionsList,
  useSetShellToolbarHost,
  useShellSearchSlot,
} from '@/shell/HeaderActionsContext';
import { useCommandNavLinks } from '@/shell/use-filtered-nav';

type ShellHeaderProps = {
  isCollapsed: boolean;
  pageTitle: string;
  pageSubtitle?: string;
  commandOpen: boolean;
  onToggleSidebar: () => void;
  onOpenCommand: () => void;
  onCloseCommand: () => void;
};

export function ShellHeader({
  isCollapsed,
  pageTitle,
  pageSubtitle,
  commandOpen,
  onToggleSidebar,
  onOpenCommand,
  onCloseCommand,
}: ShellHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { resolved, setMode } = useTheme();
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const pageActions = useHeaderActionsList();
  const shellSearch = useShellSearchSlot();
  const setShellToolbarHost = useSetShellToolbarHost();
  const navLinks = useCommandNavLinks();
  const sh = appColors.shellHeader;
  const ThemeIcon = resolved === 'dark' ? Sun : Moon;

  const filteredLinks = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return navLinks;
    return navLinks.filter((link) => {
      const label = t(link.labelKey).toLowerCase();
      const desc = t(link.descriptionKey, { defaultValue: '' }).toLowerCase();
      return label.includes(q) || desc.includes(q);
    });
  }, [filterQuery, navLinks, t]);

  useEffect(() => {
    if (!commandOpen) {
      setFilterQuery('');
      setSelectedIndex(0);
      return;
    }
    const id = window.requestAnimationFrame(() => {
      commandInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [commandOpen]);

  useEffect(() => {
    setSelectedIndex((i) => Math.min(i, Math.max(0, filteredLinks.length - 1)));
  }, [filterQuery, filteredLinks.length]);

  const handleCommandInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (filteredLinks.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredLinks.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const link = filteredLinks[selectedIndex];
      if (link) {
        navigate(link.to);
        onCloseCommand();
      }
    }
  };

  const toggleLocale = () => {
    setLocale(getLocale() === 'en' ? 'fr' : 'en');
  };

  const toggleTheme = () => {
    setMode(resolved === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <header className={sh.container}>
        <div className={sh.colLeft}>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-ink-subtle hover:bg-surface-2 hover:text-ink"
            onClick={onToggleSidebar}
            aria-label={isCollapsed ? t('shell.expandSidebar') : t('shell.collapseSidebar')}
          >
            {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>
          <div className="min-w-0">
            <p className={sh.title}>{pageTitle}</p>
            {pageSubtitle ? <p className={sh.subtitle}>{pageSubtitle}</p> : null}
          </div>
        </div>

        <div className={sh.colCenter}>
          {shellSearch ? (
            <div className={sh.searchCluster}>
              <div className={sh.searchFieldWrap}>
                <Search className={sh.searchIcon} />
                <Input
                  value={shellSearch.value}
                  onChange={(e) => shellSearch.onChange(e.target.value)}
                  placeholder={shellSearch.placeholder}
                  aria-label={shellSearch.ariaLabel ?? shellSearch.placeholder}
                  disabled={shellSearch.disabled}
                  className={sh.searchInput}
                />
              </div>
            </div>
          ) : (
            <div className={sh.searchCluster}>
              <div className={cn(sh.searchFieldWrap, 'w-full')}>
                <Search className={sh.searchIcon} />
                <button
                  type="button"
                  className={sh.commandTrigger}
                  onClick={onOpenCommand}
                  aria-label={t('shell.commandPalette.open')}
                >
                  <span className="min-w-0 flex-1 truncate">{t('shell.commandPalette.placeholder')}</span>
                  <kbd className={sh.commandTriggerShortcut}>⌘K</kbd>
                </button>
              </div>
              <div ref={setShellToolbarHost} className={sh.toolbarHost} />
            </div>
          )}
        </div>

        <div className={sh.colRight}>
          {pageActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                className={cn(sh.iconButton, action.pressed && sh.iconButtonActive)}
                onClick={action.onSelect}
                aria-label={action.label}
                aria-pressed={action.pressed ? true : undefined}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
          <button type="button" className={sh.iconButton} onClick={toggleLocale} aria-label={t('common.locale.toggle')}>
            <Languages className="size-4" />
          </button>
          <button
            type="button"
            className={sh.iconButton}
            onClick={toggleTheme}
            aria-label={resolved === 'dark' ? t('shell.theme.light') : t('shell.theme.dark')}
          >
            <ThemeIcon className="size-4" />
          </button>
        </div>
      </header>

      <Dialog open={commandOpen} onOpenChange={(open) => !open && onCloseCommand()}>
        <DialogContent className="gap-3 p-4 sm:max-w-lg">
          <DialogHeader className="sr-only">
            <DialogTitle>{t('shell.commandPalette.title')}</DialogTitle>
            <DialogDescription>{t('shell.commandPalette.description')}</DialogDescription>
          </DialogHeader>
          <Input
            ref={commandInputRef}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            onKeyDown={handleCommandInputKeyDown}
            placeholder={t('shell.commandPalette.placeholder')}
            data-command-palette-input="true"
            className="h-11"
          />
          <div className="grid max-h-[min(50vh,24rem)] gap-1 overflow-y-auto">
            {filteredLinks.length === 0 ? (
              <p className="py-4 text-center text-sm text-ink-subtle">{t('shell.commandPalette.noMatches')}</p>
            ) : (
              filteredLinks.map((link, index) => (
                <button
                  key={link.to}
                  type="button"
                  className={cn(sh.commandPaletteRow, index === selectedIndex && sh.commandPaletteRowSelected)}
                  onClick={() => {
                    navigate(link.to);
                    onCloseCommand();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-semibold text-ink">{t(link.labelKey)}</p>
                    <p className="text-xs text-ink-subtle">
                      {t(link.descriptionKey, { defaultValue: link.to })}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
