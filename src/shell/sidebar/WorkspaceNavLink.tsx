import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { layout } from '@/design-system/tokens/layout';
import { typographyClasses } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/components/ui/button';
import {
  isNavItemActive,
  type NavItemDef,
} from '@/shell/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/design-system/components/ui/tooltip';

export function WorkspaceNavLink({
  item,
  basePath,
  currentPath,
  isCollapsed,
  onNavigate,
}: {
  item: NavItemDef;
  basePath: string;
  currentPath: string;
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const href = basePath
    ? item.path
      ? `${basePath}/${item.path.replace(/^\//, '')}`
      : basePath
    : item.path;
  const isActive = isNavItemActive(currentPath, item, basePath);
  const c = layout.sidebar;
  const label = t(item.labelKey);

  const linkButton = (
    <Button
      variant="ghost"
      asChild
      className={cn(
        'group relative h-auto min-h-9 w-full justify-start rounded-md border border-transparent px-3 py-1.5',
        isActive ? c.itemActive : c.item,
        isCollapsed && 'justify-center rounded-md px-2',
      )}
    >
      <Link
        to={href}
        aria-current={isActive ? 'page' : undefined}
        aria-label={isCollapsed ? label : undefined}
        onClick={onNavigate}
      >
        <div className={cn('flex items-center gap-2.5', isCollapsed && 'justify-center')}>
          <Icon
            className={cn(
              'size-4 shrink-0',
              isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
            )}
          />
          {!isCollapsed ? (
            <span className={cn(typographyClasses.button, isActive && 'text-foreground')}>{label}</span>
          ) : null}
        </div>
      </Link>
    </Button>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkButton}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return linkButton;
}
