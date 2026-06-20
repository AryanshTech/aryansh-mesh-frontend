import { useTranslation } from 'react-i18next';
import { layout } from '@/design-system/tokens/layout';
import { cn } from '@/design-system/lib/utils';
import { BUSINESS_WORKSPACE_SECTIONS, type NavSectionDef } from '@/shell/navigation';
import { WorkspaceNavLink } from '@/shell/sidebar/WorkspaceNavLink';

function WorkspaceNavSection({
  section,
  basePath,
  currentPath,
  isCollapsed,
  onNavigate,
}: {
  section: NavSectionDef;
  basePath: string;
  currentPath: string;
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-0.5">
      {!isCollapsed ? (
        <p className={cn(layout.sidebar.sectionLabel, 'px-2 py-1.5')}>{t(section.labelKey)}</p>
      ) : null}
      {section.items.map((item) => (
        <WorkspaceNavLink
          key={item.id}
          item={item}
          basePath={basePath}
          currentPath={currentPath}
          isCollapsed={isCollapsed}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

type BusinessWorkspaceNavProps = {
  basePath: string;
  currentPath: string;
  isCollapsed: boolean;
  onNavigate?: () => void;
};

export function BusinessWorkspaceNav({
  basePath,
  currentPath,
  isCollapsed,
  onNavigate,
}: BusinessWorkspaceNavProps) {
  return (
    <div className="flex flex-col gap-3">
      {BUSINESS_WORKSPACE_SECTIONS.map((section) => (
        <WorkspaceNavSection
          key={section.id}
          section={section}
          basePath={basePath}
          currentPath={currentPath}
          isCollapsed={isCollapsed}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
