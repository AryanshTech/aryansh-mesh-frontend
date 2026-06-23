import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/design-system/components/ui/button';

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas px-6 text-center">
      <div className="space-y-2">
        <p className="typo-eyebrow-upper text-muted-foreground">404</p>
        <h1 className="typo-display-md text-foreground">
          {t('common.notFoundTitle', 'Page not found')}
        </h1>
        <p className="typo-body text-muted-foreground max-w-md">
          {t('common.notFoundDescription', "The page you're looking for doesn't exist or has moved.")}
        </p>
      </div>
      <Button asChild>
        <Link to="/dashboard">{t('common.backToDashboard', 'Back to dashboard')}</Link>
      </Button>
    </div>
  );
}
