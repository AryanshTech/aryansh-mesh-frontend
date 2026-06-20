import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuth } from '@/core/auth/use-auth';
import { getAuthErrorKey, isPasswordResetUserNotFound } from '@/core/auth/auth-errors';
import { AuthShell } from '@/shell/AuthShell';
import { AuthFormCard } from '@/shared/components/layout/AuthFormCard';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
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

const schema = z.object({
  email: z.string().email(),
});

type ForgotForm = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ForgotForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotForm) {
    setSubmitting(true);
    try {
      await resetPassword(values.email);
      setSent(true);
    } catch (error) {
      if (isPasswordResetUserNotFound(error)) {
        setSent(true);
        return;
      }
      toast.error(t(getAuthErrorKey(error)));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="w-full max-w-[420px]">
        <AuthFormCard
          title={t('auth.forgotPasswordTitle')}
          description={t('auth.forgotPasswordSubtitle')}
          footer={
            <Button variant="link" size="sm" asChild className="w-full">
              <Link to="/login">{t('common.back')}</Link>
            </Button>
          }
        >
          <div className="flex flex-col gap-4">
            {sent ? (
              <Alert>
                <AlertTitle>{t('auth.resetSentTitle')}</AlertTitle>
                <AlertDescription>{t('auth.resetSentDescription')}</AlertDescription>
              </Alert>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.email')}</FormLabel>
                        <FormControl>
                          <Input type="email" autoComplete="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" variant="pill" size="pill" className="w-full" disabled={submitting}>
                    {submitting ? t('common.loading') : t('auth.sendResetLink')}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </AuthFormCard>
      </div>
    </AuthShell>
  );
}
