import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { useAuth } from '@/core/auth/use-auth';
import { resolveLandingPath } from '@/core/auth/landing';
import { ApiError } from '@/core/api/client';
import { useInvitePreview } from '@/modules/marketing/api/use-invite-preview';

const inviteSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.passwordMismatch',
    path: ['confirmPassword'],
  });

const signupSchema = z.object({
  name: z.string().min(2),
  businessName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

type InviteFormValues = z.infer<typeof inviteSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignUpPage() {
  const { t } = useTranslation();
  const { signUp, login, acceptInvite } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token') ?? '';
  const isInviteFlow = inviteToken.length > 0;
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const inviteQuery = useInvitePreview(isInviteFlow ? inviteToken : undefined);

  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', businessName: '', email: '', password: '' },
  });

  useEffect(() => {
    if (inviteQuery.data?.email) {
      inviteForm.setValue('email', inviteQuery.data.email);
    }
  }, [inviteQuery.data?.email, inviteForm]);

  async function authenticateAndAcceptInvite(email: string, password: string) {
    try {
      await signUp({ email, password, name: email.split('@')[0] ?? email });
    } catch (err) {
      if (err instanceof ApiError && (err.status === 409 || err.code === 'EMAIL_EXISTS')) {
        await login({ email, password });
      } else {
        throw err;
      }
    }
    return acceptInvite(inviteToken);
  }

  const onInviteSubmit = async (values: InviteFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const user = await authenticateAndAcceptInvite(
        values.email.trim().toLowerCase(),
        values.password,
      );
      toast.success(t('auth.accountCreated'));
      navigate(resolveLandingPath(user), { replace: true });
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setError(t('invite.emailMismatch'));
      } else {
        setError((e as Error).message ?? t('auth.signUpFailed'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onSignupSubmit = async (values: SignupFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const user = await signUp(values);
      toast.success(t('auth.accountCreated'));
      navigate(resolveLandingPath(user), { replace: true });
    } catch (e) {
      setError((e as Error).message ?? t('auth.signUpFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const inviteInvalid =
    isInviteFlow &&
    inviteQuery.isError &&
    !inviteQuery.isLoading &&
    (!(inviteQuery.error instanceof ApiError) || inviteQuery.error.status === 404);

  const loginHref = inviteToken
    ? `/auth/login?inviteToken=${encodeURIComponent(inviteToken)}`
    : '/auth/login';

  if (isInviteFlow) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 shadow-floating">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
            AM
          </div>
          <div className="text-center">
            <h1 className="typo-display-md text-foreground">{t('auth.signUpTitle')}</h1>
            <p className="typo-body-sm text-muted-foreground mt-1">
              {t('auth.inviteSubtitle')}
            </p>
          </div>
        </div>

        {inviteInvalid ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>{t('invite.missingTokenTitle')}</AlertTitle>
            <AlertDescription>{t('invite.missingToken')}</AlertDescription>
          </Alert>
        ) : null}

        {inviteQuery.data ? (
          <Alert className="mb-4">
            <AlertDescription>
              {t('invite.signUpForTenant', { tenant: inviteQuery.data.tenantName })}
            </AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {inviteQuery.isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form
            onSubmit={inviteForm.handleSubmit(onInviteSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-email">{t('auth.email')}</Label>
              <Input
                id="invite-email"
                type="email"
                autoComplete="email"
                readOnly={Boolean(inviteQuery.data?.email)}
                aria-invalid={!!inviteForm.formState.errors.email}
                {...inviteForm.register('email')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-password">{t('auth.password')}</Label>
              <Input
                id="invite-password"
                type="password"
                autoComplete="new-password"
                {...inviteForm.register('password')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-confirm">{t('auth.confirmPassword')}</Label>
              <Input
                id="invite-confirm"
                type="password"
                autoComplete="new-password"
                {...inviteForm.register('confirmPassword')}
              />
              {inviteForm.formState.errors.confirmPassword ? (
                <p className="text-xs text-destructive">
                  {t('auth.passwordMismatch')}
                </p>
              ) : null}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={submitting || inviteInvalid}
            >
              {submitting ? t('common.loading') : t('auth.createAccount')}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t('auth.haveAccount')}{' '}
          <Link to={loginHref} className="text-primary hover:underline">
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = signupForm;

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-floating">
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
          AM
        </div>
        <div className="text-center">
          <h1 className="typo-display-md text-foreground">{t('auth.signUpTitle')}</h1>
          <p className="typo-body-sm text-muted-foreground mt-1">
            {t('auth.signUpSubtitle')}
          </p>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit(onSignupSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">{t('auth.fullName')}</Label>
          <Input id="name" {...register('name')} aria-invalid={!!errors.name} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="businessName">{t('auth.businessName')}</Label>
          <Input
            id="businessName"
            {...register('businessName')}
            aria-invalid={!!errors.businessName}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            aria-invalid={!!errors.email}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            aria-invalid={!!errors.password}
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? t('common.loading') : t('auth.createAccount')}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {t('auth.haveAccount')}{' '}
        <Link to="/auth/login" className="text-primary hover:underline">
          {t('auth.signIn')}
        </Link>
      </p>
    </div>
  );
}
