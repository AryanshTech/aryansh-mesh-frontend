import { useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/ui/select';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { useCreateTenant } from '@/modules/business/features/admin/use-tenants';
import { slugify } from '@/modules/business/navigation';
import { ApiError } from '@/modules/business/types/api';

const schema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  currency: z.string().length(3),
  timezone: z.string().min(1).max(64),
});

type CreateTenantForm = z.infer<typeof schema>;

export function TenantCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createTenant = useCreateTenant();

  const form = useForm<CreateTenantForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      slug: '',
      currency: 'CAD',
      timezone: 'America/Toronto',
    },
  });

  const name = form.watch('name');

  useEffect(() => {
    if (name && !form.formState.dirtyFields.slug) {
      form.setValue('slug', slugify(name));
    }
  }, [name, form]);

  async function onSubmit(values: CreateTenantForm) {
    try {
      const tenant = await createTenant.mutateAsync({
        ...values,
        currency: values.currency.toUpperCase(),
      });
      toast.success(t('admin.tenants.created'));
      navigate(`/business/admin/tenants/${tenant.id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          form.setError('slug', { message: t('admin.tenants.errors.slugConflict') });
        }
        toast.error(error.message);
      } else {
        toast.error(t('errors.network'));
      }
    }
  }

  return (
    <CrmPageShell>
      <PageHeader
        title={t('admin.tenants.create')}
        breadcrumbs={[
          { label: t('admin.tenants.title'), href: '/business/admin/tenants' },
          { label: t('admin.tenants.create') },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.tenants.create')}</CardTitle>
          <CardDescription>{t('admin.tenants.createDescription')}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.tenants.form.name')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.tenants.form.slug')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.tenants.form.currency')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.tenants.form.timezone')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/business/admin/tenants')}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={createTenant.isPending}>
                {createTenant.isPending ? t('common.loading') : t('admin.tenants.form.submit')}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </CrmPageShell>
  );
}
