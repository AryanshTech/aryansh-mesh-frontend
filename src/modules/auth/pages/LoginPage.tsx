import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { Alert, AlertDescription } from '@/design-system/components/ui/alert';
import { useAuth } from '@/core/auth/use-auth';
import { resolveLandingPath } from '@/core/auth/landing';
import { ApiError } from '@/core/api/client';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, acceptInvite } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('inviteToken');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectParam = searchParams.get('redirect');
  const from =
    redirectParam ??
    (location.state as { from?: string } | null)?.from ??
    '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      let user = await login(values);
      if (inviteToken) {
        user = await acceptInvite(inviteToken);
      }
      toast.success(t('auth.welcomeBack'));
      navigate(inviteToken ? resolveLandingPath(user) : from, { replace: true });
    } catch (e) {
      if (e instanceof ApiError && inviteToken && e.status === 403) {
        setError(e.message || t('invite.emailMismatch'));
      } else {
        const msg = (e as Error).message ?? t('auth.loginFailed');
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card rounded-2xl border border-border bg-card p-8 shadow-floating">
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
          AM
        </div>
        <div className="text-center">
          <h1 className="typo-display-md text-foreground">{t('auth.signInTitle')}</h1>
          <p className="typo-body-sm text-muted-foreground mt-1">
            {inviteToken ? t('invite.signInToAccept') : t('auth.signInSubtitle')}
          </p>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Link
              to="/auth/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          {errors.password ? (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? t('common.loading') : t('auth.signIn')}
        </Button>
      </form>
    </div>
  );
}
