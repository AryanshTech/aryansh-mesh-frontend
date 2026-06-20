import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import { useFilteredNavSections } from '@/shell/use-filtered-nav';
import { buildProjectNavPath, MARKETING_PROJECT_NAV } from '@/shell/navigation';
import { usePermissions } from '@/core/permissions/use-permissions';
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
  const { projectId } = useParams();
  const { canAccessMarketing } = usePermissions();
  const pageActions = useHeaderActionsList();
  const shellSearch = useShellSearchSlot();
  const setShellToolbarHost = useSetShellToolbarHost();
  const navSections = useFilteredNavSections();
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

  const commandSections = useMemo(() => {
    const sections = navSections.map((section) => ({
      id: section.id,
      heading: t(section.labelKey),
      items: section.items.map((item) => ({
        to: item.path,
        label: t(item.labelKey),
        description: t(`${item.labelKey}Description`, { defaultValue: item.path }),
      })),
    }));

    if (projectId && canAccessMarketing) {
      sections.push({
        id: 'project',
        heading: t('nav.sections.project'),
        items: MARKETING_PROJECT_NAV.map((item) => ({
          to: buildProjectNavPath(projectId, item.path),
          label: t(item.labelKey),
          description: t(`${item.labelKey}Description`, { defaultValue: item.path }),
        })),
      });
    }

    return sections;
  }, [navSections, projectId, canAccessMarketing, t]);

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
          {commandSections.map((section) => (
            <CommandGroup key={section.id} heading={section.heading}>
              {section.items.map((link) => (
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
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
