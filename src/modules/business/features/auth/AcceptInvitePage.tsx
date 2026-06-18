import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Button } from '@/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/design-system/components/ui/card';

export function AcceptInvitePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const signUpHref = token ? `/signup?token=${encodeURIComponent(token)}` : '/signup';
  const loginHref = token
    ? `/login?inviteToken=${encodeURIComponent(token)}`
    : '/login';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.acceptInviteTitle')}</CardTitle>
          <CardDescription>{t('auth.acceptInviteSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!token ? (
            <Alert variant="destructive">
              <AlertTitle>{t('invite.missingTokenTitle')}</AlertTitle>
              <AlertDescription>{t('invite.missingToken')}</AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertDescription>{t('invite.acceptInstructions')}</AlertDescription>
            </Alert>
          )}
          <Button asChild className="w-full" disabled={!token}>
            <Link to={signUpHref}>{t('auth.createAccount')}</Link>
          </Button>
          <Button variant="outline" asChild className="w-full" disabled={!token}>
            <Link to={loginHref}>{t('invite.signInToAccept')}</Link>
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t pt-6">
          <Button variant="link" asChild className="w-full">
            <Link to="/login">{t('auth.alreadyHaveAccount')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
