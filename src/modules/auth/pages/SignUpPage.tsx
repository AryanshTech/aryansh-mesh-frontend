import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const schema = z.object({
  name: z.string().min(2),
  businessName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export default function SignUpPage() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', businessName: '', email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      await signUp(values);
      toast.success(t('auth.accountCreated'));
      navigate('/onboarding', { replace: true });
    } catch (e) {
      setError((e as Error).message ?? t('auth.signUpFailed'));
    } finally {
      setSubmitting(false);
    }
  };

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

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
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
