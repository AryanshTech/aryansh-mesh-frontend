import { Languages, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocale, setLocale } from '@/core/i18n';
import { useTheme } from '@/core/theme/ThemeProvider';
import { ShellIconButton } from '@/shared/components/layout/ShellIconButton';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/components/ui/button';

type ShellUtilityActionsProps = {
  className?: string;
  showLocaleText?: boolean;
};

export function ShellUtilityActions({
  className,
  showLocaleText = false,
}: ShellUtilityActionsProps) {
  const { t } = useTranslation();
  const locale = getLocale();
  const { resolved, setMode } = useTheme();
  const ThemeIcon = resolved === 'dark' ? Sun : Moon;

  return (
    <div className={cn('flex shrink-0 items-center gap-1', className)}>
      <ShellIconButton
        onClick={() => setMode(resolved === 'dark' ? 'light' : 'dark')}
        aria-label={resolved === 'dark' ? t('shell.theme.light') : t('shell.theme.dark')}
      >
        <ThemeIcon className="size-4" aria-hidden />
      </ShellIconButton>
      {showLocaleText ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-10 px-3 text-xs text-muted-foreground"
          onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
          aria-label={t('common.locale.toggle')}
        >
          {locale === 'en' ? t('common.locale.fr') : t('common.locale.en')}
        </Button>
      ) : (
        <ShellIconButton
          onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
          aria-label={t('common.locale.toggle')}
        >
          <Languages className="size-4" aria-hidden />
        </ShellIconButton>
      )}
    </div>
  );
}
