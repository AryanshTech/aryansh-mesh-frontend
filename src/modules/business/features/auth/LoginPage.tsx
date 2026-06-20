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
import { AuthShell } from '@/shell/AuthShell';
import { appColors } from '@/design-system/tokens/colors';
import { cn } from '@/design-system/lib/utils';
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

const inputClassName =
  'h-11 rounded-md border border-hairline-strong bg-surface-1 text-ink shadow-sm placeholder:text-ink-tertiary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20';

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
      <div className="w-full max-w-[420px]">
        <div className="mb-8 space-y-2">
          <h1 className={cn(appColors.auth.title, 'text-3xl')}>
            {t('auth.welcomeTitle')}
          </h1>
          <p className={appColors.auth.subtitle}>
            {t('auth.welcomeSubtitle')}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {formError && (
              <Alert variant="destructive" className="rounded-xl border-destructive/20 bg-destructive/5">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-foreground">{t('auth.email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder={t('auth.emailPlaceholder')}
                      className={inputClassName}
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
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <FormLabel className="text-sm font-medium text-foreground">{t('auth.password')}</FormLabel>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {t('auth.forgotPassword')}
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      autoComplete="current-password"
                      className={inputClassName}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" className="mt-1 h-11 w-full" disabled={submitting}>
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

        <p className={cn('mt-8 text-center text-sm', appColors.text.muted)}>
          {t('auth.noAccount')}{' '}
          <Link to="/accept-invite" className={cn('font-medium', appColors.text.link)}>
            {t('auth.acceptInviteCta')}
          </Link>
        </p>

        <p className={cn('mt-6 text-center text-xs leading-relaxed', appColors.text.muted)}>
          {t('auth.signInFootnote')}
        </p>
      </div>
    </AuthShell>
  );
}
