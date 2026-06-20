import type { ReactNode } from 'react';
import { LayersIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { layout } from '@/design-system/tokens/layout';
import { ShellUtilityActions } from '@/shared/components/layout/ShellUtilityActions';
import { cn } from '@/design-system/lib/utils';

const FEATURE_KEYS = ['featureBusiness', 'featureMarketing', 'featureUnified'] as const;

type AuthShellProps = {
  children: ReactNode;
  className?: string;
};

export function AuthShell({ children, className }: AuthShellProps) {
  const { t } = useTranslation();

  return (
    <div className={layout.auth.shell}>
      <aside className={layout.auth.panel}>
        <div className="relative z-10 flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayersIcon className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">{t('common.appName')}</p>
            <p className="text-xs text-muted-foreground">{t('auth.panelTagline')}</p>
          </div>
        </div>

        <div className="relative z-10 flex w-full min-w-0 max-w-md flex-1 flex-col justify-center gap-8 py-8">
          <div className="flex w-full min-w-0 flex-col gap-4">
            <h2 className={layout.auth.title}>{t('auth.panelHeadline')}</h2>
            <p className={layout.auth.subtitle}>{t('auth.panelQuote')}</p>
          </div>

          <ul className="flex w-full min-w-0 flex-col gap-3">
            {FEATURE_KEYS.map((key) => (
              <li
                key={key}
                className="flex w-full min-w-0 items-start gap-3 text-sm text-muted-foreground"
              >
                <span
                  className="auth-feature-dot mt-1.5 size-1.5 shrink-0 rounded-full"
                  aria-hidden
                />
                <span className="min-w-0 flex-1 break-words">{t(`auth.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 shrink-0 text-xs text-muted-foreground">
          {t('auth.panelAttribution')}
        </p>
      </aside>

      <div className={layout.auth.formColumn}>
        <header className="flex w-full shrink-0 items-center justify-between border-b border-border px-6 py-4 md:px-10 lg:border-0">
          <div className="flex min-w-0 flex-col gap-0.5 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                <LayersIcon className="size-4" aria-hidden />
              </div>
              <span className="text-xs font-medium text-foreground">{t('common.appName')}</span>
            </div>
            <p className="pl-[46px] text-xs text-muted-foreground">{t('auth.panelTagline')}</p>
          </div>
          <ShellUtilityActions className="ml-auto shrink-0" showLocaleText />
        </header>

        <main className={cn(layout.auth.formMain, className)}>{children}</main>
      </div>
    </div>
  );
}
