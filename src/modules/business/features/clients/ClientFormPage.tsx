import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/design-system/components/ui/alert';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
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
import { Textarea } from '@/design-system/components/ui/textarea';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import {
  useClient,
  useCreateClient,
  useUpdateClient,
} from '@/modules/business/features/clients/use-clients';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import { ApiError } from '@/modules/business/types/api';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type ClientFormValues = z.infer<typeof schema>;

export function ClientFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = 'new' } = useParams();
  const isNew = id === 'new';
  const { path, isWorkspace } = useTenantScope();
  const { canEdit } = usePermissions();
  const { data: client, isLoading } = useClient(id);
  const createClient = useCreateClient();
  const updateClient = useUpdateClient(id);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(schema),
    values: {
      name: client?.name ?? '',
      email: client?.email ?? '',
      phone: client?.phone ?? '',
      company: client?.company ?? '',
      notes: client?.notes ?? '',
      tags: client?.tags?.join(', ') ?? '',
    },
  });

  async function onSubmit(values: ClientFormValues) {
    try {
      const payload = {
        name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        company: values.company || undefined,
        notes: values.notes || undefined,
        tags: values.tags
          ? values.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : undefined,
      };
      if (isNew) {
        await createClient.mutateAsync(payload);
        toast.success(t('clients.created'));
      } else {
        await updateClient.mutateAsync(payload);
        toast.success(t('clients.saved'));
      }
      navigate(path('/clients'));
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t('errors.network'));
      }
    }
  }

  if (!isNew && isLoading) {
    return (
      <CrmPageShell>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </CrmPageShell>
    );
  }

  return (
    <CrmPageShell>
      <PageHeader
        title={isNew ? t('clients.form.createTitle') : t('clients.form.title')}
        breadcrumbs={[
          ...(isWorkspace
            ? [{ label: t('admin.tenants.title'), href: '/admin/tenants' }]
            : []),
          { label: t('pages.clients'), href: path('/clients') },
          { label: isNew ? t('common.create') : client?.name ?? '' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('clients.form.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {!canEdit && (
            <Alert className="mb-4">
              <AlertDescription>{t('common.readOnly')}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clients.form.name')}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!canEdit} />
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
                        <Input type="email" {...field} disabled={!canEdit} />
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
                      <FormLabel>{t('clients.form.phone')}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!canEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clients.form.company')}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clients.form.tags')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('clients.form.tagsHint')}
                        {...field}
                        disabled={!canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('clients.form.notes')}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link to={path('/clients')}>{t('common.cancel')}</Link>
                </Button>
                {canEdit && (
                  <Button
                    type="submit"
                    disabled={createClient.isPending || updateClient.isPending}
                  >
                    {createClient.isPending || updateClient.isPending
                      ? t('common.loading')
                      : t('common.save')}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </CrmPageShell>
  );
}
