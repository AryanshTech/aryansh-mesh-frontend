import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/design-system/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';

/** Bounce page after API public LinkedIn OAuth callback. */
export default function LinkedInCallbackPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const status = params.get('status');
  const message = params.get('message');
  const ok = status === 'success' || params.get('linkedin') === 'connected';
  const error = status === 'error' ? message : params.get('error') || params.get('linkedin_error');

  useEffect(() => {
    if (ok) toast.success(t('marketing.linkedin.oauthConnectedToast'));
    if (error) toast.error(error);
  }, [ok, error, t]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-8">
      <Alert variant={ok ? 'default' : 'destructive'}>
        <AlertTitle>
          {ok ? t('marketing.linkedin.oauthConnectedToast') : t('marketing.linkedin.oauthFailedTitle')}
        </AlertTitle>
        <AlertDescription>
          {ok
            ? t('marketing.linkedin.oauthConnectedBody')
            : error || t('marketing.linkedin.oauthFailedBody')}
        </AlertDescription>
      </Alert>
      <Button asChild>
        <Link to="/marketing">{t('marketing.linkedin.backToMarketing')}</Link>
      </Button>
      <Button type="button" variant="outline" onClick={() => navigate(-1)}>
        {t('common.back')}
      </Button>
    </div>
  );
}
