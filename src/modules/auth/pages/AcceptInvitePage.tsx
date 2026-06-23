import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/design-system/components/ui/button';
import { Alert, AlertDescription } from '@/design-system/components/ui/alert';
import { api } from '@/core/api/client';

export default function AcceptInvitePage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const missingToken = !token;
  const displayError = error ?? (missingToken ? t('auth.inviteMissing') : null);

  const accept = async () => {
    if (!token) {
      setError(t('auth.inviteMissing'));
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/accept-invite', { token });
      toast.success(t('auth.inviteAccepted'));
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError((e as Error).message ?? t('auth.inviteFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-floating text-center">
      <h1 className="typo-display-md text-foreground mb-2">{t('auth.inviteTitle')}</h1>
      <p className="typo-body-sm text-muted-foreground mb-5">
        {t('auth.inviteSubtitle')}
      </p>
      {displayError ? (
        <Alert variant="destructive" className="mb-4 text-left">
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      ) : null}
      <Button onClick={accept} disabled={submitting || missingToken} className="w-full">
        {submitting ? t('common.loading') : t('auth.acceptInvite')}
      </Button>
    </div>
  );
}
