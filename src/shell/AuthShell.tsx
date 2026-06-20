import type { ReactNode } from 'react';
import { LayersIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
    <div className={cn('grid min-h-svh bg-background lg:grid-cols-2')}>
      <aside
        className={cn(
          'auth-panel relative hidden min-h-svh min-w-[320px] flex-col justify-between self-stretch overflow-hidden p-10 lg:flex xl:p-14',
        )}
      >
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayersIcon className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">{t('common.appName')}</p>
            <p className="text-xs text-muted-foreground">{t('auth.panelTagline')}</p>
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center gap-8 self-stretch py-8">
          <div className="flex max-w-md flex-col gap-4">
            <h2 className="text-3xl font-semibold text-foreground">{t('auth.panelHeadline')}</h2>
            <p className="text-sm text-muted-foreground">{t('auth.panelQuote')}</p>
          </div>

          <ul className="flex max-w-md flex-col gap-3">
            {FEATURE_KEYS.map((key) => (
              <li
                key={key}
                className="flex items-start gap-3 text-sm text-muted-foreground"
              >
                <span
                  className="auth-feature-dot mt-1.5 size-1.5 shrink-0 rounded-full"
                  aria-hidden
                />
                <span className="break-words">{t(`auth.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-muted-foreground">
          {t('auth.panelAttribution')}
        </p>
      </aside>

      <div className="auth-form-surface relative flex min-h-svh min-w-0 w-full flex-col bg-card lg:bg-muted/30">
        <header className="flex w-full items-center justify-between border-b border-border px-6 py-4 md:px-10 lg:border-0">
          <div className="flex flex-col gap-0.5 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                <LayersIcon className="size-4" aria-hidden />
              </div>
              <span className="text-xs font-medium text-foreground">{t('common.appName')}</span>
            </div>
            <p className="pl-[46px] text-xs text-muted-foreground">{t('auth.panelTagline')}</p>
          </div>
          <ShellUtilityActions className="ml-auto" showLocaleText />
        </header>

        <main
          className={cn(
            'flex w-full min-w-0 flex-1 items-center justify-center px-6 pb-12 pt-4 md:px-10 lg:pb-16',
            className,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
