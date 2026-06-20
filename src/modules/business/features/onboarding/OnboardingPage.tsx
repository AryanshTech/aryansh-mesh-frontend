import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Textarea } from '@/design-system/components/ui/textarea';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { useUpdateBusiness } from '@/modules/business/features/business/use-business';
import { useAuth } from '@/core/auth/use-auth';
import { ApiError } from '@/modules/business/types/api';

const schema = z.object({
  legalName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
});

type OnboardingForm = z.infer<typeof schema>;

export function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const updateBusiness = useUpdateBusiness();

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      legalName: '',
      email: '',
      phone: '',
      tagline: '',
      description: '',
    },
  });

  async function onSubmit(values: OnboardingForm) {
    try {
      await updateBusiness.mutateAsync({
        legalName: values.legalName,
        email: values.email || undefined,
        phone: values.phone || undefined,
        tagline: values.tagline || undefined,
        description: values.description || undefined,
        status: 'active',
      });
      await refreshSession();
      toast.success(t('onboarding.completeSuccess'));
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t('errors.network'));
      }
    }
  }

  return (
    <CrmPageShell>
      <PageHeader
        title={t('pages.onboarding')}
        description={t('onboarding.subtitle')}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('onboarding.title')}</CardTitle>
          <CardDescription>{t('onboarding.hint')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="legalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('onboarding.businessName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('business.form.tagline')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('business.form.description')}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.email')}</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('business.form.phone')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={updateBusiness.isPending}>
                {updateBusiness.isPending ? t('common.loading') : t('onboarding.complete')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </CrmPageShell>
  );
}
