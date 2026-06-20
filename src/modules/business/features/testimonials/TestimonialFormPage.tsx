import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
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
import { Label } from '@/design-system/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/ui/select';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { Textarea } from '@/design-system/components/ui/textarea';
import { ImageUpload } from '@/shared/components/crm/ImageUpload';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import {
  useCreateTestimonial,
  useTestimonial,
  useUpdateTestimonial,
} from '@/modules/business/features/testimonials/use-testimonials';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import { queryKeys } from '@/modules/business/api/query-keys';
import { ApiError } from '@/modules/business/types/api';

const schema = z.object({
  author: z.string().min(1),
  quote: z.string().min(1),
  rating: z.coerce.number().min(1).max(5),
  status: z.enum(['draft', 'published', 'archived']),
});

type TestimonialFormValues = z.infer<typeof schema>;

export function TestimonialFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = 'new' } = useParams();
  const isNew = id === 'new';
  const { path, isWorkspace, tenantId } = useTenantScope();
  const { canEdit } = usePermissions();
  const queryClient = useQueryClient();
  const { data: testimonial, isLoading } = useTestimonial(id);
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial(id);

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(schema),
    values: {
      author: testimonial?.author ?? '',
      quote: testimonial?.quote ?? '',
      rating: testimonial?.rating ?? 5,
      status: (testimonial?.status as TestimonialFormValues['status']) ?? 'draft',
    },
  });

  async function onSubmit(values: TestimonialFormValues) {
    try {
      if (isNew) {
        await createTestimonial.mutateAsync(values);
        toast.success(t('testimonials.created'));
      } else {
        await updateTestimonial.mutateAsync(values);
        toast.success(t('testimonials.saved'));
      }
      navigate(path('/testimonials'));
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
        title={isNew ? t('testimonials.form.createTitle') : t('testimonials.form.title')}
        breadcrumbs={[
          ...(isWorkspace
            ? [{ label: t('admin.tenants.title'), href: '/admin/tenants' }]
            : []),
          { label: t('pages.testimonials'), href: path('/testimonials') },
          { label: isNew ? t('common.create') : testimonial?.author ?? '' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('testimonials.form.title')}</CardTitle>
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
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('testimonials.form.author')}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('testimonials.form.quote')}</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('testimonials.form.rating')}</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={5} {...field} disabled={!canEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('testimonials.table.status')}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!canEdit}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">{t('badges.draft')}</SelectItem>
                          <SelectItem value="published">{t('badges.published')}</SelectItem>
                          <SelectItem value="archived">{t('badges.archived')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {!isNew && (
                <div className="flex flex-col gap-2">
                  <Label>{t('testimonials.form.photo')}</Label>
                  <ImageUpload
                    endpoint={`/tenants/${tenantId}/testimonials/${id}/photo`}
                    currentUrl={testimonial?.photoUrl}
                    disabled={!canEdit}
                    onUploaded={() => {
                      void queryClient.invalidateQueries({
                        queryKey: queryKeys.tenant.testimonial(tenantId, id),
                      });
                    }}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link to={path('/testimonials')}>{t('common.cancel')}</Link>
                </Button>
                {canEdit && (
                  <Button
                    type="submit"
                    disabled={createTestimonial.isPending || updateTestimonial.isPending}
                  >
                    {createTestimonial.isPending || updateTestimonial.isPending
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
