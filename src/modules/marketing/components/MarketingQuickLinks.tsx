import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Brain, CalendarDays, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';

interface Props {
  projectId: string;
  className?: string;
}

interface QuickLink {
  to: string;
  icon: LucideIcon;
  labelKey: string;
}

export function MarketingQuickLinks({ projectId, className }: Props) {
  const { t } = useTranslation();

  const links: QuickLink[] = [
    {
      to: `/marketing?tab=brand&section=voice`,
      icon: Brain,
      labelKey: 'marketing.studio.types.memory.title',
    },
    {
      to: `/marketing?tab=calendar`,
      icon: CalendarDays,
      labelKey: 'marketing.studio.types.social.title',
    },
    {
      to: `/marketing/projects/${projectId}`,
      icon: MessageSquare,
      labelKey: 'marketing.studio.types.threads.title',
    },
  ];

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className="typo-eyebrow-upper text-faint">{t('marketing.workspace.quickLinks')}</p>
      <div className="flex flex-wrap gap-2">
        {links.map(({ to, icon: Icon, labelKey }) => (
          <Link
            key={to}
            to={to}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 typo-body-sm text-foreground transition-all hover:border-hairline-strong hover:shadow-card"
          >
            <Icon className="size-4 text-muted-foreground" />
            {t(labelKey)}
          </Link>
        ))}
      </div>
    </div>
  );
}
