import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuth } from '@/core/auth/use-auth';
import { getAuthErrorKey } from '@/core/auth/auth-errors';
import { getPostLoginPath } from '@/modules/business/navigation';
import { ApiError } from '@/modules/business/types/api';
import { Alert, AlertDescription } from '@/design-system/components/ui/alert';
import { Button } from '@/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/design-system/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/design-system/components/ui/form';
import { Input } from '@/design-system/components/ui/input';

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
  const inviteToken = searchParams.get('inviteToken');

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginForm) {
    setSubmitting(true);
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
          toast.error(t('auth.errors.noMembership'));
        } else if (error.status === 503) {
          toast.error(t('invite.indexBuilding'));
        } else if (inviteToken && error.status === 403) {
          toast.error(error.message || t('invite.emailMismatch'));
        } else if (error.status === 403) {
          toast.error(t('errors.tenantSuspended'));
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error(t(getAuthErrorKey(error)));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.loginTitle')}</CardTitle>
          <CardDescription>{t('auth.loginSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Alert>
            <AlertDescription>{t('auth.inviteOnlyHint')}</AlertDescription>
          </Alert>
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.password')}</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? t('common.loading') : t('auth.signIn')}
              </Button>
              <Button variant="link" asChild className="w-full">
                <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">
            {t('auth.noAccount')}
          </p>
          <Button variant="outline" asChild className="w-full">
            <Link to="/accept-invite">{t('auth.acceptInviteCta')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
