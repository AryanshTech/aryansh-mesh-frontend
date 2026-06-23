import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { Alert, AlertDescription } from '@/design-system/components/ui/alert';
import { api } from '@/core/api/client';

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      await api.post('/auth/password-reset', values, { skipAuth: true });
      setSent(true);
      toast.success(t('auth.resetSent'));
    } catch (e) {
      setError((e as Error).message ?? t('auth.resetFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-floating">
      <div className="mb-6 flex flex-col items-center gap-3">
        <h1 className="typo-display-md text-foreground">{t('auth.forgotTitle')}</h1>
        <p className="typo-body-sm text-muted-foreground text-center">
          {t('auth.forgotSubtitle')}
        </p>
      </div>

      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {sent ? (
        <Alert className="mb-4">
          <AlertDescription>{t('auth.resetSentDescription')}</AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? t('common.loading') : t('auth.sendResetLink')}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link to="/auth/login" className="text-primary hover:underline">
          {t('common.back')} {t('auth.signIn').toLowerCase()}
        </Link>
      </p>
    </div>
  );
}
