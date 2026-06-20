import { useMemo } from 'react';
import { PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { layout } from '@/design-system/tokens/layout';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/design-system/components/ui/command';
import {
  useHeaderActionsList,
  useSetShellToolbarHost,
  useShellSearchSlot,
} from '@/shell/HeaderActionsContext';
import { useCommandNavLinks } from '@/shell/use-filtered-nav';
import { UserMenu } from '@/shell/UserMenu';
import { ShellIconButton } from '@/shared/components/layout/ShellIconButton';
import { ShellUtilityActions } from '@/shared/components/layout/ShellUtilityActions';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/design-system/components/ui/tooltip';

type ShellHeaderProps = {
  isCollapsed: boolean;
  isMobileNav?: boolean;
  mobileNavOpen?: boolean;
  pageTitle: string;
  pageSubtitle?: string;
  commandOpen: boolean;
  onToggleSidebar: () => void;
  onOpenCommand: () => void;
  onCloseCommand: () => void;
};

export function ShellHeader({
  isCollapsed,
  isMobileNav = false,
  mobileNavOpen = false,
  pageTitle,
  pageSubtitle,
  commandOpen,
  onToggleSidebar,
  onOpenCommand,
  onCloseCommand,
}: ShellHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageActions = useHeaderActionsList();
  const shellSearch = useShellSearchSlot();
  const setShellToolbarHost = useSetShellToolbarHost();
  const navLinks = useCommandNavLinks();
  const sh = layout.shellHeader;

  const sidebarToggleLabel = isMobileNav
    ? mobileNavOpen
      ? t('shell.closeNavigation')
      : t('shell.openNavigation')
    : isCollapsed
      ? t('shell.expandSidebar')
      : t('shell.collapseSidebar');

  const SidebarToggleIcon = isMobileNav
    ? mobileNavOpen
      ? PanelLeftClose
      : PanelLeftOpen
    : isCollapsed
      ? PanelLeftOpen
      : PanelLeftClose;

  const commandItems = useMemo(
    () =>
      navLinks.map((link) => ({
        ...link,
        label: t(link.labelKey),
        description: t(link.descriptionKey, { defaultValue: link.to }),
      })),
    [navLinks, t],
  );

  return (
    <>
      <header className="shell-header">
        <div className={sh.colLeft}>
          <ShellIconButton
            onClick={onToggleSidebar}
            aria-label={sidebarToggleLabel}
            aria-expanded={isMobileNav ? mobileNavOpen : undefined}
          >
            <SidebarToggleIcon />
          </ShellIconButton>
          <div className="min-w-0">
            <h1 className={sh.title}>{pageTitle}</h1>
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
                  className="pl-9"
                />
              </div>
            </div>
          ) : (
            <div className={sh.searchCluster}>
              <div className={cn(sh.searchFieldWrap, 'w-full')}>
                <Search className={sh.searchIcon} />
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full justify-start pl-9 pr-3 text-muted-foreground hover:text-foreground"
                  onClick={onOpenCommand}
                  aria-label={t('shell.commandPalette.open')}
                >
                  <span className="flex-1 truncate text-left text-sm">
                    {t('shell.commandPalette.placeholder')}
                  </span>
                  <CommandShortcut className="hidden sm:inline-flex">⌘K</CommandShortcut>
                </Button>
              </div>
              <div ref={setShellToolbarHost} className={sh.toolbarHost} />
            </div>
          )}
        </div>

        <div className={sh.colRight}>
          {isMobileNav && !shellSearch ? (
            <ShellIconButton
              onClick={onOpenCommand}
              aria-label={t('shell.commandPalette.open')}
            >
              <Search className="size-4" />
            </ShellIconButton>
          ) : null}
          {pageActions.map((action) => {
            const Icon = action.icon;
            return (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <ShellIconButton
                    onClick={action.onSelect}
                    aria-label={action.label}
                    aria-pressed={action.pressed ? true : undefined}
                    className={cn(action.pressed && 'bg-primary/10 text-primary')}
                  >
                    <Icon className="size-4" />
                  </ShellIconButton>
                </TooltipTrigger>
                <TooltipContent side="bottom">{action.label}</TooltipContent>
              </Tooltip>
            );
          })}
          <UserMenu />
          <ShellUtilityActions />
        </div>
      </header>

      <CommandDialog
        open={commandOpen}
        onOpenChange={(open) => !open && onCloseCommand()}
        title={t('shell.commandPalette.title')}
        description={t('shell.commandPalette.description')}
      >
        <CommandInput placeholder={t('shell.commandPalette.placeholder')} />
        <CommandList>
          <CommandEmpty>{t('shell.commandPalette.noMatches')}</CommandEmpty>
          <CommandGroup>
            {commandItems.map((link) => (
              <CommandItem
                key={link.to}
                value={`${link.label} ${link.description} ${link.to}`}
                onSelect={() => {
                  navigate(link.to);
                  onCloseCommand();
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
