import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { layout } from '@/design-system/tokens/layout';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/components/ui/button';

type SidebarContextHeaderProps = {
  backTo: string;
  backLabelKey: string;
  title: string;
  subtitle?: string;
  isCollapsed: boolean;
  onNavigate?: () => void;
};

export function SidebarContextHeader({
  backTo,
  backLabelKey,
  title,
  subtitle,
  isCollapsed,
  onNavigate,
}: SidebarContextHeaderProps) {
  const { t } = useTranslation();

  if (isCollapsed) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="mb-2 size-10 shrink-0"
        asChild
        title={t(backLabelKey)}
      >
        <Link to={backTo} onClick={onNavigate} aria-label={t(backLabelKey)}>
          <ArrowLeft className="size-4" />
        </Link>
      </Button>
    );
  }

  return (
    <div className="mb-3 flex flex-col gap-2 border-b border-border pb-3">
      <Button
        variant="ghost"
        asChild
        className="h-auto w-full justify-start gap-1.5 px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Link to={backTo} onClick={onNavigate}>
          <ArrowLeft className="size-3.5 shrink-0" />
          {t(backLabelKey)}
        </Link>
      </Button>
      <div className="min-w-0 px-2">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        {subtitle ? (
          <p className={cn(layout.sidebar.sectionLabel, 'mt-0.5 normal-case')}>{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
