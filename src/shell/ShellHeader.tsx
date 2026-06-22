import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Bell, PanelLeftClose, PanelLeftOpen, Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { typographyClasses } from '@/design-system/tokens/typography';
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
} from '@/design-system/components/ui/command';
import {
  useHeaderActionsList,
  useSetShellToolbarHost,
  useShellSearchSlot,
} from '@/shell/HeaderActionsContext';
import { useFilteredNavSections } from '@/shell/use-filtered-nav';
import { buildProjectNavPath, MARKETING_PROJECT_SECTIONS } from '@/shell/navigation';
import { usePermissions } from '@/core/permissions/use-permissions';
import { UserMenu } from '@/shell/UserMenu';
import { ShellIconButton } from '@/shared/components/layout/ShellIconButton';
import { ShellUtilityActions } from '@/shared/components/layout/ShellUtilityActions';
import { ShellProductToggle } from '@/shared/components/layout/ShellProductToggle';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/design-system/components/ui/tooltip';

type ShellHeaderProps = {
  isCollapsed: boolean;
  isMobileNav?: boolean;
  mobileNavOpen?: boolean;
  commandOpen: boolean;
  onToggleSidebar: () => void;
  onOpenCommand: () => void;
  onCloseCommand: () => void;
};

export function ShellHeader({
  isCollapsed,
  isMobileNav = false,
  mobileNavOpen = false,
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
        items: MARKETING_PROJECT_SECTIONS.flatMap((section) =>
          section.items.map((item) => ({
            to: buildProjectNavPath(projectId, item.path),
            label: `${t(section.labelKey)} · ${t(item.labelKey)}`,
            description: t(`${item.labelKey}Description`, { defaultValue: item.path }),
          })),
        ),
      });
    }

    return sections;
  }, [navSections, projectId, canAccessMarketing, t]);

  return (
    <>
      <header className="shell-header">
        <div className="shell-header__left">
          <ShellIconButton
            onClick={onToggleSidebar}
            aria-label={sidebarToggleLabel}
            aria-expanded={isMobileNav ? mobileNavOpen : undefined}
            className="md:hidden"
          >
            <SidebarToggleIcon />
          </ShellIconButton>
          <Link to="/" className="shell-header__brand shrink-0">
            {t('common.appName')}
          </Link>
          <ShellProductToggle />
        </div>

        <div className="shell-header__center">
          {shellSearch ? (
            <div className={layout.shellHeader.searchFieldWrap}>
              <Search className={layout.shellHeader.searchIcon} />
              <Input
                value={shellSearch.value}
                onChange={(e) => shellSearch.onChange(e.target.value)}
                placeholder={shellSearch.placeholder}
                aria-label={shellSearch.ariaLabel ?? shellSearch.placeholder}
                disabled={shellSearch.disabled}
                className={cn('h-9 border-border bg-card pl-9', typographyClasses.bodySm)}
              />
            </div>
          ) : (
            <div className={layout.shellHeader.searchFieldWrap}>
              <Search className={layout.shellHeader.searchIcon} />
              <Input
                readOnly
                onClick={onOpenCommand}
                onFocus={onOpenCommand}
                placeholder={t('shell.commandPalette.placeholder')}
                aria-label={t('shell.commandPalette.open')}
                className={cn('h-9 cursor-pointer border-border bg-card pl-9 placeholder:text-muted-foreground', typographyClasses.bodySm)}
              />
            </div>
          )}
        </div>

        <div className="shell-header__right">
          <div ref={setShellToolbarHost} className={layout.shellHeader.toolbarHost} />
          <Button
            size="sm"
            className="hidden h-8 gap-1.5 sm:inline-flex"
            onClick={onOpenCommand}
          >
            <Plus className="size-4" />
            {t('linear.shell.create')}
          </Button>
          <div className="hidden h-4 w-px bg-border sm:block" aria-hidden />
          {pageActions.map((action) => {
            const Icon = action.icon;
            return (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <ShellIconButton
                    onClick={action.onSelect}
                    aria-label={action.label}
                    aria-pressed={action.pressed ? true : undefined}
                    className={cn(action.pressed && 'bg-card text-primary')}
                  >
                    <Icon className="size-4" />
                  </ShellIconButton>
                </TooltipTrigger>
                <TooltipContent side="bottom">{action.label}</TooltipContent>
              </Tooltip>
            );
          })}
          <ShellIconButton aria-label={t('shell.notifications')} className="hidden sm:inline-flex">
            <Bell className="size-4" />
          </ShellIconButton>
          <UserMenu />
          <ShellUtilityActions />
          {isMobileNav && !shellSearch ? (
            <ShellIconButton onClick={onOpenCommand} aria-label={t('shell.commandPalette.open')}>
              <Search className="size-4" />
            </ShellIconButton>
          ) : null}
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
