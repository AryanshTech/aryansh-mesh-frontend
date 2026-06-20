import { Check, Languages, Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocale, setLocale } from '@/core/i18n';
import { useTheme } from '@/core/theme/ThemeProvider';
import type { ThemeMode } from '@/core/theme/tokens';
import { ShellIconButton } from '@/shared/components/layout/ShellIconButton';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/design-system/components/ui/dropdown-menu';

type ShellUtilityActionsProps = {
  className?: string;
  showLocaleText?: boolean;
};

const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system'];

function ThemeModeIcon({ mode, resolved }: { mode: ThemeMode; resolved: 'light' | 'dark' }) {
  if (mode === 'system') return <Monitor className="size-4" aria-hidden />;
  if (mode === 'dark' || resolved === 'dark') return <Moon className="size-4" aria-hidden />;
  return <Sun className="size-4" aria-hidden />;
}

export function ShellUtilityActions({
  className,
  showLocaleText = false,
}: ShellUtilityActionsProps) {
  const { t } = useTranslation();
  const locale = getLocale();
  const { mode, resolved, setMode } = useTheme();

  const themeLabels: Record<ThemeMode, string> = {
    light: t('shell.theme.light'),
    dark: t('shell.theme.dark'),
    system: t('shell.theme.system'),
  };

  return (
    <div className={cn('flex shrink-0 items-center gap-1', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ShellIconButton aria-label={t('shell.theme.menu')}>
            <ThemeModeIcon mode={mode} resolved={resolved} />
          </ShellIconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[10rem]">
          {THEME_MODES.map((themeMode) => (
            <DropdownMenuItem key={themeMode} onClick={() => setMode(themeMode)}>
              {themeMode === 'light' ? (
                <Sun className="size-4" aria-hidden />
              ) : themeMode === 'dark' ? (
                <Moon className="size-4" aria-hidden />
              ) : (
                <Monitor className="size-4" aria-hidden />
              )}
              <span className="flex-1">{themeLabels[themeMode]}</span>
              {mode === themeMode ? <Check className="size-4 text-primary" aria-hidden /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
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
