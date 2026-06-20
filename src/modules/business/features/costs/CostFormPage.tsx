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
import { useCost, useCreateCost, useUpdateCost } from '@/modules/business/features/costs/use-costs';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import { ApiError } from '@/modules/business/types/api';

const schema = z.object({
  label: z.string().min(1),
  amount: z.coerce.number().min(0),
  currency: z.string().optional(),
  category: z.string().optional(),
  date: z.string().optional(),
  notes: z.string().optional(),
});

type CostFormValues = z.infer<typeof schema>;

export function CostFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = 'new' } = useParams();
  const isNew = id === 'new';
  const { path, isWorkspace } = useTenantScope();
  const { canEdit } = usePermissions();
  const { data: cost, isLoading } = useCost(id);
  const createCost = useCreateCost();
  const updateCost = useUpdateCost(id);

  const form = useForm<CostFormValues>({
    resolver: zodResolver(schema),
    values: {
      label: cost?.label ?? '',
      amount: cost?.amount ?? 0,
      currency: cost?.currency ?? 'CAD',
      category: cost?.category ?? '',
      date: cost?.date ? cost.date.slice(0, 10) : '',
      notes: cost?.notes ?? '',
    },
  });

  async function onSubmit(values: CostFormValues) {
    try {
      const payload = {
        ...values,
        date: values.date ? new Date(values.date).toISOString() : undefined,
      };
      if (isNew) {
        await createCost.mutateAsync(payload);
        toast.success(t('costs.created'));
      } else {
        await updateCost.mutateAsync(payload);
        toast.success(t('costs.saved'));
      }
      navigate(path('/costs'));
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
        title={isNew ? t('costs.form.createTitle') : t('costs.form.title')}
        breadcrumbs={[
          ...(isWorkspace
            ? [{ label: t('admin.tenants.title'), href: '/admin/tenants' }]
            : []),
          { label: t('pages.costs'), href: path('/costs') },
          { label: isNew ? t('common.create') : cost?.label ?? '' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('costs.form.title')}</CardTitle>
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
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('costs.form.label')}</FormLabel>
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('costs.form.amount')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} disabled={!canEdit} />
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
                      <FormLabel>{t('costs.form.currency')}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!canEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('costs.form.category')}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!canEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('costs.form.date')}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={!canEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('costs.form.notes')}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link to={path('/costs')}>{t('common.cancel')}</Link>
                </Button>
                {canEdit && (
                  <Button
                    type="submit"
                    disabled={createCost.isPending || updateCost.isPending}
                  >
                    {createCost.isPending || updateCost.isPending
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
