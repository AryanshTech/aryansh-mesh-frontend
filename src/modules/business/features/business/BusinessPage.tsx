import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
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
import { Label } from '@/design-system/components/ui/label';
import { Textarea } from '@/design-system/components/ui/textarea';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { ImageUpload } from '@/shared/components/crm/ImageUpload';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { useBusinessProfile, useUpdateBusiness } from '@/modules/business/features/business/use-business';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import { ApiError } from '@/modules/business/types/api';

const schema = z.object({
  legalName: z.string().min(1),
  tagline: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  websiteUrl: z.string().optional(),
  allowedWebsiteOrigins: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
});

type BusinessForm = z.infer<typeof schema>;

export function BusinessPage() {
  const { t } = useTranslation();
  const { isWorkspace, tenantId } = useTenantScope();
  const { canEdit } = usePermissions();
  const { data, isLoading, isError } = useBusinessProfile();
  const updateBusiness = useUpdateBusiness();

  const form = useForm<BusinessForm>({
    resolver: zodResolver(schema),
    values: {
      legalName: data?.legalName ?? '',
      tagline: data?.tagline ?? '',
      description: data?.description ?? '',
      email: data?.email ?? '',
      phone: data?.phone ?? '',
      websiteUrl: data?.websiteUrl ?? '',
      allowedWebsiteOrigins: data?.allowedWebsiteOrigins?.join('\n') ?? '',
      street: data?.address?.street ?? '',
      city: data?.address?.city ?? '',
      state: data?.address?.state ?? '',
      postalCode: data?.address?.postalCode ?? '',
      country: data?.address?.country ?? '',
      facebook: data?.social?.facebook ?? '',
      instagram: data?.social?.instagram ?? '',
      linkedin: data?.social?.linkedin ?? '',
      twitter: data?.social?.twitter ?? '',
    },
  });

  async function onSubmit(values: BusinessForm) {
    try {
      await updateBusiness.mutateAsync({
        legalName: values.legalName,
        tagline: values.tagline || undefined,
        description: values.description || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        websiteUrl: values.websiteUrl || undefined,
        allowedWebsiteOrigins: values.allowedWebsiteOrigins
          ?.split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
        address: {
          street: values.street ?? '',
          city: values.city ?? '',
          state: values.state ?? '',
          postalCode: values.postalCode ?? '',
          country: values.country ?? '',
        },
        social: {
          facebook: values.facebook ?? '',
          instagram: values.instagram ?? '',
          linkedin: values.linkedin ?? '',
          twitter: values.twitter ?? '',
        },
      });
      toast.success(t('business.saved'));
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t('errors.network'));
      }
    }
  }

  if (isLoading) {
    return (
      <CrmPageShell>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </CrmPageShell>
    );
  }

  if (isError) {
    return (
      <CrmPageShell>
        <Alert variant="destructive">
          <AlertTitle>{t('errors.network')}</AlertTitle>
          <AlertDescription>{t('business.loadError')}</AlertDescription>
        </Alert>
      </CrmPageShell>
    );
  }

  return (
    <CrmPageShell>
      <PageHeader
        title={t('pages.business')}
        description={t('business.subtitle')}
        breadcrumbs={
          isWorkspace
            ? [
                { label: t('admin.tenants.title'), href: '/business/admin/tenants' },
                { label: t('pages.business') },
              ]
            : undefined
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('pages.business')}</CardTitle>
          <CardDescription>{t('business.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!canEdit && (
            <Alert className="mb-4">
              <AlertDescription>{t('common.readOnly')}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t('business.form.logo')}</Label>
                <ImageUpload
                  endpoint={`/tenants/${tenantId}/business/logo`}
                  currentUrl={data?.logoUrl}
                  disabled={!canEdit}
                  onUploaded={(url) => {
                    void updateBusiness.mutateAsync({ logoUrl: url });
                  }}
                />
              </div>
              <FormField
                control={form.control}
                name="legalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('business.form.legalName')}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!canEdit} />
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
                      <Input {...field} disabled={!canEdit} />
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
                      <Textarea rows={4} {...field} disabled={!canEdit} />
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
                      <FormLabel>{t('business.form.phone')}</FormLabel>
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
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('business.form.website')}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allowedWebsiteOrigins"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('business.form.allowedWebsiteOrigins')}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder={t('business.form.allowedWebsiteOriginsPlaceholder')}
                        {...field}
                        disabled={!canEdit}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      {t('business.form.allowedWebsiteOriginsHint')}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>{t('business.form.address')}</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>{t('business.form.street')}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('business.form.city')}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('business.form.state')}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('business.form.postalCode')}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('business.form.country')}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('business.form.social')}</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('business.form.facebook')}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('business.form.instagram')}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('business.form.linkedin')}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('business.form.twitter')}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {canEdit && (
                <Button type="submit" disabled={updateBusiness.isPending}>
                  {updateBusiness.isPending ? t('common.loading') : t('common.save')}
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </CrmPageShell>
  );
}
