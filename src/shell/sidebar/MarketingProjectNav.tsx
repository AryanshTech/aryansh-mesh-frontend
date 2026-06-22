import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { layout } from '@/design-system/tokens/layout';
import { typographyClasses } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/design-system/components/ui/collapsible';
import {
  isMarketingProjectSectionActive,
  isNavItemActive,
  MARKETING_PROJECT_SECTIONS,
  type NavItemDef,
} from '@/shell/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/design-system/components/ui/tooltip';
import { Link } from 'react-router-dom';

function ProjectNavLink({
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
  const isActive = isNavItemActive(currentPath, item, basePath);
  const c = layout.sidebar;
  const label = t(item.labelKey);
  const href = item.path ? `${basePath}/${item.path}` : basePath;

  const linkButton = (
    <Button
      variant="ghost"
      asChild
      className={cn(
        'group relative h-auto min-h-10 w-full justify-start rounded-md border border-transparent px-2 py-2',
        isActive ? c.itemActive : c.item,
        isCollapsed && 'justify-center px-2',
      )}
    >
      <Link
        to={href}
        aria-current={isActive ? 'page' : undefined}
        aria-label={isCollapsed ? label : undefined}
        onClick={onNavigate}
      >
        {isActive && !isCollapsed ? (
          <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
        ) : null}
        <div className={cn('flex items-center gap-2.5', isCollapsed && 'justify-center')}>
          <Icon
            className={cn(
              'size-4 shrink-0',
              isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
            )}
          />
          {!isCollapsed ? (
            <span className={cn(typographyClasses.button, isActive && 'text-primary')}>{label}</span>
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

type MarketingProjectNavProps = {
  basePath: string;
  currentPath: string;
  isCollapsed: boolean;
  onNavigate?: () => void;
};

export function MarketingProjectNav({
  basePath,
  currentPath,
  isCollapsed,
  onNavigate,
}: MarketingProjectNavProps) {
  const { t } = useTranslation();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      for (const section of MARKETING_PROJECT_SECTIONS) {
        if (isMarketingProjectSectionActive(currentPath, section, basePath)) {
          next[section.id] = true;
        } else if (next[section.id] === undefined) {
          next[section.id] = !section.defaultCollapsed;
        }
      }
      return next;
    });
  }, [currentPath, basePath]);

  if (isCollapsed) {
    return (
      <div className="flex flex-col gap-0.5">
        {MARKETING_PROJECT_SECTIONS.flatMap((section) =>
          section.items.map((item) => (
            <ProjectNavLink
              key={item.id}
              item={item}
              basePath={basePath}
              currentPath={currentPath}
              isCollapsed
              onNavigate={onNavigate}
            />
          )),
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {MARKETING_PROJECT_SECTIONS.map((section) => {
        const isOpen = openSections[section.id] ?? !section.defaultCollapsed;
        const sectionActive = isMarketingProjectSectionActive(currentPath, section, basePath);

        if (!section.defaultCollapsed && section.items.length <= 2) {
          return (
            <div key={section.id} className="flex flex-col gap-0.5">
              <p className={cn(layout.sidebar.sectionLabel, 'px-2 py-1')}>{t(section.labelKey)}</p>
              {section.items.map((item) => (
                <ProjectNavLink
                  key={item.id}
                  item={item}
                  basePath={basePath}
                  currentPath={currentPath}
                  isCollapsed={false}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          );
        }

        return (
          <Collapsible
            key={section.id}
            open={isOpen}
            onOpenChange={(open) => setOpenSections((prev) => ({ ...prev, [section.id]: open }))}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'h-auto w-full justify-between rounded-md px-2 py-1.5',
                  typographyClasses.eyebrowUpper,
                  sectionActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <span>{t(section.labelKey)}</span>
                <ChevronRight className={cn('size-3.5 transition-transform', isOpen && 'rotate-90')} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-0.5 pl-1">
              {section.items.map((item) => (
                <ProjectNavLink
                  key={item.id}
                  item={item}
                  basePath={basePath}
                  currentPath={currentPath}
                  isCollapsed={false}
                  onNavigate={onNavigate}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
