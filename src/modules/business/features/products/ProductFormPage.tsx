import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/design-system/components/ui/alert';
import { Button } from '@/design-system/components/ui/button';
import {
  Card,
  CardContent,
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
import { useCreateProduct, useProduct, useUpdateProduct } from '@/modules/business/features/products/use-products';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/modules/business/api/query-keys';
import { ApiError } from '@/modules/business/types/api';

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.coerce.number().min(0),
  cost: z.coerce.number().min(0).optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
});

type ProductFormValues = z.infer<typeof schema>;

export function ProductFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = 'new' } = useParams();
  const isNew = id === 'new';
  const { path, isWorkspace, tenantId } = useTenantScope();
  const { canEdit } = usePermissions();
  const { data: product, isLoading } = useProduct(id);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(id);
  const queryClient = useQueryClient();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    values: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      sku: product?.sku ?? '',
      price: product?.price ?? 0,
      cost: product?.cost ?? 0,
      category: product?.category ?? '',
      status: (product?.status as ProductFormValues['status']) ?? 'draft',
    },
  });

  async function onSubmit(values: ProductFormValues) {
    try {
      if (isNew) {
        await createProduct.mutateAsync(values);
        toast.success(t('products.created'));
      } else {
        await updateProduct.mutateAsync(values);
        toast.success(t('products.saved'));
      }
      navigate(path('/products'));
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
        title={isNew ? t('products.form.createTitle') : t('products.form.title')}
        breadcrumbs={[
          ...(isWorkspace
            ? [{ label: t('admin.tenants.title'), href: '/business/admin/tenants' }]
            : []),
          { label: t('pages.products'), href: path('/products') },
          { label: isNew ? t('common.create') : product?.name ?? '' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('products.form.title')}</CardTitle>
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
                    <FormLabel>{t('products.form.name')}</FormLabel>
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
                    <FormLabel>{t('products.form.description')}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('products.form.sku')}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!canEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('products.form.category')}</FormLabel>
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('products.form.price')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} disabled={!canEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('products.form.cost')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} disabled={!canEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('products.table.status')}</FormLabel>
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
              {!isNew && (
                <div className="flex flex-col gap-2">
                  <Label>{t('products.form.images')}</Label>
                  <ImageUpload
                    endpoint={`/tenants/${tenantId}/products/${id}/images`}
                    disabled={!canEdit}
                    currentUrl={
                      product?.images?.[0]?.url as string | undefined
                    }
                    onUploaded={() => {
                      void queryClient.invalidateQueries({
                        queryKey: queryKeys.tenant.product(tenantId, id),
                      });
                    }}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link to={path('/products')}>{t('common.cancel')}</Link>
                </Button>
                {canEdit && (
                  <Button
                    type="submit"
                    disabled={createProduct.isPending || updateProduct.isPending}
                  >
                    {createProduct.isPending || updateProduct.isPending
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
