import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthShell } from '@/shell/AuthShell';
import { AuthFormCard } from '@/shared/components/layout/AuthFormCard';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Button } from '@/design-system/components/ui/button';

export function AcceptInvitePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const signUpHref = token ? `/signup?token=${encodeURIComponent(token)}` : '/signup';
  const loginHref = token
    ? `/login?inviteToken=${encodeURIComponent(token)}`
    : '/login';

  return (
    <AuthShell>
      <div className="w-full max-w-[420px]">
        <AuthFormCard
          title={t('auth.acceptInviteTitle')}
          description={t('auth.acceptInviteSubtitle')}
          footer={
            <Button variant="link" size="sm" asChild className="w-full">
              <Link to="/login">{t('auth.alreadyHaveAccount')}</Link>
            </Button>
          }
        >
          <div className="flex flex-col gap-4">
            {!token ? (
              <Alert variant="subtle-destructive">
                <AlertTitle>{t('invite.missingTokenTitle')}</AlertTitle>
                <AlertDescription>{t('invite.missingToken')}</AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertDescription>{t('invite.acceptInstructions')}</AlertDescription>
              </Alert>
            )}
            <Button variant="pill" size="pill" asChild className="w-full" disabled={!token}>
              <Link to={signUpHref}>{t('auth.createAccount')}</Link>
            </Button>
            <Button variant="pill-outline" size="pill" asChild className="w-full" disabled={!token}>
              <Link to={loginHref}>{t('invite.signInToAccept')}</Link>
            </Button>
          </div>
        </AuthFormCard>
      </div>
    </AuthShell>
  );
}
