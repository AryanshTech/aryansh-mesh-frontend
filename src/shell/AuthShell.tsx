import type { ReactNode } from 'react';
import { LayersIcon, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocale, setLocale } from '@/core/i18n';
import { useTheme } from '@/core/theme/ThemeProvider';
import { appColors } from '@/design-system/tokens/colors';
import { Button } from '@/design-system/components/ui/button';
import { cn } from '@/design-system/lib/utils';

const FEATURE_KEYS = ['featureBusiness', 'featureMarketing', 'featureUnified'] as const;

type AuthShellProps = {
  children: ReactNode;
  className?: string;
};

export function AuthShell({ children, className }: AuthShellProps) {
  const { t } = useTranslation();
  const locale = getLocale();
  const { resolved, setMode } = useTheme();
  const ThemeIcon = resolved === 'dark' ? Sun : Moon;

  return (
    <div className={cn('grid min-h-svh bg-canvas lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]')}>
      <aside
        className={cn(
          'auth-panel relative hidden flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14',
        )}
      >
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayersIcon className="size-5" aria-hidden />
          </div>
          <div>
            <p className="type-body-sm font-semibold text-ink">{t('common.appName')}</p>
            <p className="type-caption text-ink-subtle">{t('auth.panelTagline')}</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="type-headline text-ink">{t('auth.panelHeadline')}</h2>
            <p className="type-body-sm text-ink-muted">{t('auth.panelQuote')}</p>
          </div>

          <ul className="flex flex-col gap-3">
            {FEATURE_KEYS.map((key) => (
              <li key={key} className="flex items-start gap-3 type-body-sm text-ink-muted">
                <span className="auth-feature-dot mt-1.5 size-1.5 shrink-0 rounded-full" aria-hidden />
                <span>{t(`auth.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 type-caption text-ink-subtle">{t('auth.panelAttribution')}</p>
      </aside>

      <div className={cn('auth-form-surface relative flex min-h-svh flex-col')}>
        <header className="flex items-center justify-between px-6 py-5 md:px-10">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <LayersIcon className="size-4" aria-hidden />
            </div>
            <span className="type-body-sm font-medium text-ink">{t('common.appName')}</span>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-ink-subtle"
              onClick={() => setMode(resolved === 'dark' ? 'light' : 'dark')}
              aria-label={resolved === 'dark' ? t('shell.theme.light') : t('shell.theme.dark')}
            >
              <ThemeIcon className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs text-ink-subtle"
              onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
              aria-label={t('common.locale.toggle')}
            >
              {locale === 'en' ? t('common.locale.fr') : t('common.locale.en')}
            </Button>
          </div>
        </header>

        <main
          className={cn(
            'flex flex-1 items-center justify-center px-6 pb-12 pt-2 md:px-10 lg:pb-16',
            className,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
