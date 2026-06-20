import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/core/auth/use-auth';
import { getAuthErrorKey } from '@/core/auth/auth-errors';
import { getPostLoginPath } from '@/modules/business/navigation';
import { ApiError } from '@/modules/business/types/api';
import { layout } from '@/design-system/tokens/layout';
import { AuthShell } from '@/shell/AuthShell';
import { AuthFormCard } from '@/shared/components/layout/AuthFormCard';
import { Alert, AlertDescription } from '@/design-system/components/ui/alert';
import { Button } from '@/design-system/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/design-system/components/ui/form';
import { Input } from '@/design-system/components/ui/input';
import { PasswordInput } from '@/design-system/components/ui/password-input';
import { Spinner } from '@/design-system/components/ui/spinner';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, acceptInvite } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const inviteToken = searchParams.get('inviteToken');

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginForm) {
    setSubmitting(true);
    setFormError(null);
    try {
      let session;
      if (inviteToken) {
        session = await signIn(values.email, values.password);
        session = await acceptInvite(inviteToken);
      } else {
        session = await signIn(values.email, values.password);
      }
      const redirect = searchParams.get('redirect');
      navigate(redirect ?? getPostLoginPath(session), { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          setFormError(t('auth.errors.noMembership'));
        } else if (error.status === 503) {
          setFormError(t('invite.indexBuilding'));
        } else if (inviteToken && error.status === 403) {
          setFormError(error.message || t('invite.emailMismatch'));
        } else if (error.status === 403) {
          setFormError(t('errors.tenantSuspended'));
        } else if (error.code === 'INVALID_CREDENTIALS' || error.status === 401) {
          setFormError(t('auth.errors.invalidCredential'));
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError(t(getAuthErrorKey(error)));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className={layout.auth.formCardWrap}>
        <AuthFormCard
          title={t('auth.welcomeTitle')}
          description={t('auth.welcomeSubtitle')}
          footer={
            <>
              <p className="text-center text-sm text-muted-foreground">
                {t('auth.noAccount')}{' '}
                <Button variant="link" size="sm" asChild className="h-auto p-0">
                  <Link to="/accept-invite">{t('auth.acceptInviteCta')}</Link>
                </Button>
              </p>
              <p className="text-center text-xs text-muted-foreground leading-relaxed">
                {t('auth.signInFootnote')}
              </p>
            </>
          }
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full min-w-0 flex-col gap-4">
              {formError ? (
                <Alert variant="subtle-destructive">
                  <AlertDescription className="text-destructive">{formError}</AlertDescription>
                </Alert>
              ) : null}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.email')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder={t('auth.emailPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-2">
                      <FormLabel>{t('auth.password')}</FormLabel>
                      <Button variant="link" size="sm" asChild className="h-auto shrink-0 p-0 text-xs">
                        <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
                      </Button>
                    </div>
                    <FormControl>
                      <PasswordInput autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant="pill"
                size="pill"
                className="w-full shrink-0"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner />
                    {t('auth.signingIn')}
                  </>
                ) : (
                  t('auth.signIn')
                )}
              </Button>
            </form>
          </Form>
        </AuthFormCard>
      </div>
    </AuthShell>
  );
}
