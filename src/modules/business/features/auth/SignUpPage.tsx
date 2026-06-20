import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuth } from '@/core/auth/use-auth';
import { authApi } from '@/core/api/auth-api';
import { getAuthErrorKey, isEmailExistsError } from '@/core/auth/auth-errors';
import { saveAuthTokens } from '@/core/auth/token-storage';
import { getPostLoginPath } from '@/modules/business/navigation';
import { api } from '@/core/api/client';
import { ApiError } from '@/modules/business/types/api';
import type { InvitePreviewResponse } from '@/modules/business/types/auth';
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
import { Skeleton } from '@/design-system/components/ui/skeleton';

const schema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    inviteToken: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.errors.passwordMismatch',
    path: ['confirmPassword'],
  });

type SignUpForm = z.infer<typeof schema>;

export function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { acceptInvite } = useAuth();
  const inviteToken = searchParams.get('token') ?? '';

  const inviteQuery = useQuery({
    queryKey: ['invite-preview', inviteToken],
    queryFn: () => api.get<InvitePreviewResponse>(`/public/invites/${inviteToken}`),
    enabled: inviteToken.length > 0,
    retry: false,
  });

  const form = useForm<SignUpForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      inviteToken,
    },
  });

  useEffect(() => {
    if (inviteToken) {
      form.setValue('inviteToken', inviteToken);
    }
  }, [form, inviteToken]);

  useEffect(() => {
    if (inviteQuery.data?.email) {
      form.setValue('email', inviteQuery.data.email);
    }
  }, [form, inviteQuery.data?.email]);

  async function authenticateAndAcceptInvite(email: string, password: string, token: string) {
    try {
      const response = await authApi.signUp(email, password);
      saveAuthTokens(response);
    } catch (error) {
      if (isEmailExistsError(error)) {
        const response = await authApi.login(email, password);
        saveAuthTokens(response);
      } else {
        throw error;
      }
    }
    return acceptInvite(token);
  }

  async function onSubmit(values: SignUpForm) {
    try {
      const session = await authenticateAndAcceptInvite(
        values.email.trim().toLowerCase(),
        values.password,
        values.inviteToken,
      );
      toast.success(t('auth.signUpSuccess'));
      navigate(getPostLoginPath(session), { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          toast.error(t('invite.emailMismatch'));
        } else if (error.status === 503) {
          toast.error(t('invite.indexBuilding'));
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error(t(getAuthErrorKey(error)));
      }
    }
  }

  const inviteInvalid =
    inviteToken.length > 0 &&
    inviteQuery.isError &&
    !inviteQuery.isLoading &&
    (!(inviteQuery.error instanceof ApiError) || inviteQuery.error.status === 404);
  const inviteIndexBuilding =
    inviteQuery.error instanceof ApiError && inviteQuery.error.status === 503;
  const invitePending = inviteToken.length > 0 && inviteQuery.isLoading;

  const loginHref = inviteToken
    ? `/login?inviteToken=${encodeURIComponent(inviteToken)}`
    : '/login';

  return (
    <AuthShell>
      <div className="w-full max-w-[420px]">
        <AuthFormCard
          title={t('auth.signUpTitle')}
          description={t('auth.signUpSubtitle')}
          footer={
            <Button variant="link" size="sm" asChild className="w-full">
              <Link to={loginHref}>{t('auth.alreadyHaveAccount')}</Link>
            </Button>
          }
        >
          <div className="flex flex-col gap-4">
            {inviteIndexBuilding ? (
              <Alert>
                <AlertDescription>{t('invite.indexBuilding')}</AlertDescription>
              </Alert>
            ) : null}
            {inviteInvalid ? (
              <Alert variant="subtle-destructive">
                <AlertTitle>{t('invite.missingTokenTitle')}</AlertTitle>
                <AlertDescription>{t('invite.missingToken')}</AlertDescription>
              </Alert>
            ) : null}
            {inviteQuery.data ? (
              <Alert>
                <AlertDescription>
                  {t('invite.signUpForTenant', { tenant: inviteQuery.data.tenantName })}
                </AlertDescription>
              </Alert>
            ) : null}
            {!inviteInvalid ? (
              <Alert>
                <AlertDescription>{t('auth.signUpInviteRequired')}</AlertDescription>
              </Alert>
            ) : null}
            {invitePending ? (
              <div className="flex flex-col gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="inviteToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.inviteToken')}</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly={Boolean(inviteToken)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            readOnly={Boolean(inviteQuery.data?.email)}
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
                        <FormLabel>{t('auth.password')}</FormLabel>
                        <FormControl>
                          <Input type="password" autoComplete="new-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                        <FormControl>
                          <Input type="password" autoComplete="new-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    variant="pill"
                    size="pill"
                    className="w-full"
                    disabled={form.formState.isSubmitting || inviteInvalid}
                  >
                    {form.formState.isSubmitting ? t('common.loading') : t('auth.createAccount')}
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
