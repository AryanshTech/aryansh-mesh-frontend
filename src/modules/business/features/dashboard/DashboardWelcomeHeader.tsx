import { useTranslation } from 'react-i18next';
import { Button } from '@/design-system/components/ui/button';
import { LinearPageHeader } from '@/shared/components/linear';

type DashboardWelcomeHeaderProps = {
  hasLiveSignals: boolean;
};

export function DashboardWelcomeHeader({ hasLiveSignals }: DashboardWelcomeHeaderProps) {
  const { t } = useTranslation();

  return (
    <LinearPageHeader
      title={t('dashboard.welcome.title')}
      description={t('dashboard.welcome.subtitle')}
      actions={
        <div className="flex items-center gap-3">
          {hasLiveSignals ? (
            <span className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgb(var(--rgb-primary)/0.5)]" />
              {t('dashboard.liveSignals')}
            </span>
          ) : null}
          <Button variant="outline" size="sm" className="h-8">
            {t('dashboard.exportReport')}
          </Button>
        </div>
      }
    />
  );
}
