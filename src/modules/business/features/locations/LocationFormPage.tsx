import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/design-system/components/ui/alert';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Checkbox } from '@/design-system/components/ui/checkbox';
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
import { ImageUpload } from '@/shared/components/crm/ImageUpload';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import {
  useCreateLocation,
  useLocation,
  useUpdateLocation,
} from '@/modules/business/features/locations/use-locations';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import { queryKeys } from '@/modules/business/api/query-keys';
import { ApiError } from '@/modules/business/types/api';
import { typographyClasses } from '@/design-system/tokens/typography';

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  latitude: z.coerce.number().optional().or(z.literal('')),
  longitude: z.coerce.number().optional().or(z.literal('')),
  phone: z.string().optional(),
  primary: z.boolean().optional(),
  sortOrder: z.coerce.number().optional(),
  status: z.enum(['draft', 'published']),
});

type LocationFormValues = z.infer<typeof schema>;

export function LocationFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id = 'new' } = useParams();
  const isNew = id === 'new';
  const { path, isWorkspace, tenantId } = useTenantScope();
  const { canEdit } = usePermissions();
  const { data: location, isLoading } = useLocation(id);
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation(id);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(schema),
    values: {
      name: location?.name ?? '',
      slug: location?.slug ?? '',
      street: location?.street ?? '',
      city: location?.city ?? '',
      state: location?.state ?? '',
      postalCode: location?.postalCode ?? '',
      country: location?.country ?? '',
      latitude: location?.latitude ?? '',
      longitude: location?.longitude ?? '',
      phone: location?.phone ?? '',
      primary: location?.primary ?? false,
      sortOrder: location?.sortOrder ?? 0,
      status: (location?.status === 'published' ? 'published' : 'draft') as 'draft' | 'published',
    },
  });

  async function onSubmit(values: LocationFormValues) {
    try {
      const payload = {
        name: values.name,
        slug: values.slug || undefined,
        street: values.street || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        postalCode: values.postalCode || undefined,
        country: values.country || undefined,
        latitude: values.latitude === '' ? undefined : Number(values.latitude),
        longitude: values.longitude === '' ? undefined : Number(values.longitude),
        phone: values.phone || undefined,
        primary: values.primary,
        sortOrder: values.sortOrder,
        status: values.status,
      };
      if (isNew) {
        const created = await createLocation.mutateAsync(payload);
        toast.success(t('locations.created'));
        navigate(path(`/locations/${created.id}`));
      } else {
        await updateLocation.mutateAsync(payload);
        toast.success(t('locations.saved'));
        navigate(path('/locations'));
      }
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

  const images = location?.images ?? [];

  return (
    <CrmPageShell>
      <PageHeader
        title={isNew ? t('locations.form.createTitle') : t('locations.form.title')}
        breadcrumbs={[
          ...(isWorkspace
            ? [{ label: t('admin.tenants.title'), href: '/admin/tenants' }]
            : []),
          { label: t('pages.locations'), href: path('/locations') },
          { label: isNew ? t('common.create') : location?.name ?? '' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('locations.form.title')}</CardTitle>
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
                    <FormLabel>{t('locations.form.name')}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!canEdit} />
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
                    <FormLabel>{t('locations.form.slug')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('locations.form.slugHint')} {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('locations.form.phone')}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!canEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('locations.form.sortOrder')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} disabled={!canEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('locations.form.address')}</Label>
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
                <Label>{t('locations.form.coordinates')}</Label>
                <p className={typographyClasses.caption}>{t('locations.form.coordinatesHint')}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('locations.form.latitude')}</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('locations.form.longitude')}</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="primary"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!canEdit}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{t('locations.form.primary')}</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('locations.table.status')}</FormLabel>
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isNew && (
                <div className="flex flex-col gap-3">
                  <Label>{t('locations.form.images')}</Label>
                  <p className={typographyClasses.caption}>{t('locations.form.imagesHint')}</p>
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {images.map((image, index) => (
                        <img
                          key={`${image.url as string}-${index}`}
                          src={image.url as string}
                          alt={(image.alt as string) || location?.name || ''}
                          className="aspect-video rounded-md border object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <ImageUpload
                    endpoint={`/tenants/${tenantId}/locations/${id}/images`}
                    disabled={!canEdit}
                    onUploaded={() => {
                      void queryClient.invalidateQueries({
                        queryKey: queryKeys.tenant.location(tenantId, id),
                      });
                    }}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link to={path('/locations')}>{t('common.cancel')}</Link>
                </Button>
                {canEdit && (
                  <Button
                    type="submit"
                    disabled={createLocation.isPending || updateLocation.isPending}
                  >
                    {createLocation.isPending || updateLocation.isPending
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
