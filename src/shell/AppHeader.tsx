import { useTranslation } from 'react-i18next';
import { setLocale, getLocale } from '@/core/i18n';
import { Button } from '@/design-system/components/ui/button';

export function AppHeader() {
  const { t } = useTranslation();
  const locale = getLocale();

  return (
    <div className="flex flex-1 items-center justify-between">
      <span className="text-sm text-muted-foreground">{t('common.appName')}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
      >
        {locale === 'en' ? t('common.locale.fr') : t('common.locale.en')}
      </Button>
    </div>
  );
}
