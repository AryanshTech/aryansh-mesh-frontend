import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/design-system/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { useAuth } from '@/core/auth/use-auth';
import { resolveLandingPath } from '@/core/auth/landing';
import { ApiError } from '@/core/api/client';
import { useInvitePreview } from '@/modules/marketing/api/use-invite-preview';

export default function AcceptInvitePage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { status, user, acceptInvite, logout } = useAuth();
  const token = params.get('token');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailMismatch, setEmailMismatch] = useState(false);

  const preview = useInvitePreview(token ?? undefined);

  const signUpHref = token ? `/auth/signup?token=${encodeURIComponent(token)}` : '/auth/signup';
  const loginHref = token
    ? `/auth/login?inviteToken=${encodeURIComponent(token)}`
    : '/auth/login';

  useEffect(() => {
    if (status !== 'authenticated' || !token) return;

    const invitedEmail = preview.data?.email?.trim().toLowerCase();
    const signedInEmail = user?.email?.trim().toLowerCase();
    if (invitedEmail && signedInEmail && invitedEmail !== signedInEmail) {
      setEmailMismatch(true);
      setError(t('invite.emailMismatchSignedIn', { email: preview.data!.email }));
      return;
    }

    let cancelled = false;
    async function accept() {
      setSubmitting(true);
      setError(null);
      setEmailMismatch(false);
      try {
        const nextUser = await acceptInvite(token!);
        if (cancelled) return;
        toast.success(t('auth.inviteAccepted'));
        navigate(resolveLandingPath(nextUser), { replace: true });
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 403) {
          setEmailMismatch(true);
          setError(e.message || t('invite.emailMismatch'));
        } else if (e instanceof ApiError && e.status === 409) {
          setError(e.message || t('invite.alreadyHasBusiness'));
        } else {
          setError((e as Error).message ?? t('auth.inviteFailed'));
        }
      } finally {
        if (!cancelled) setSubmitting(false);
      }
    }

    void accept();
    return () => {
      cancelled = true;
    };
  }, [status, token, acceptInvite, navigate, t, preview.data?.email, user?.email]);

  if (!token) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 shadow-floating">
        <Alert variant="destructive">
          <AlertTitle>{t('invite.missingTokenTitle')}</AlertTitle>
          <AlertDescription>{t('invite.missingToken')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 shadow-floating text-center">
        <h1 className="typo-display-md text-foreground mb-2">{t('auth.inviteTitle')}</h1>
        <p className="typo-body-sm text-muted-foreground mb-5">
          {submitting ? t('invite.accepting') : t('invite.acceptInstructions')}
        </p>
        {error ? (
          <Alert variant="destructive" className="mb-4 text-left">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {emailMismatch ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              logout();
              navigate(loginHref, { replace: true });
            }}
          >
            {t('invite.signOutAndContinue')}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-floating">
      <div className="mb-6 text-center">
        <h1 className="typo-display-md text-foreground">{t('auth.inviteTitle')}</h1>
        <p className="typo-body-sm text-muted-foreground mt-1">{t('auth.inviteSubtitle')}</p>
      </div>

      {preview.data ? (
        <Alert className="mb-4">
          <AlertDescription>
            {t('invite.signUpForTenant', { tenant: preview.data.tenantName })}
          </AlertDescription>
        </Alert>
      ) : null}

      <Alert className="mb-4">
        <AlertDescription>{t('invite.acceptInstructions')}</AlertDescription>
      </Alert>

      <div className="flex flex-col gap-3">
        <Button asChild className="w-full">
          <Link to={signUpHref}>{t('auth.createAccount')}</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link to={loginHref}>{t('invite.signInToAccept')}</Link>
        </Button>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {t('auth.haveAccount')}{' '}
        <Link to={loginHref} className="text-primary hover:underline">
          {t('auth.signIn')}
        </Link>
      </p>
    </div>
  );
}
