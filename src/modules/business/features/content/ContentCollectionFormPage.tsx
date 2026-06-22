import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
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
  useContentCollection,
  useCreateContentCollection,
  useUpdateContentCollection,
} from '@/modules/business/features/content/use-content-collections';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import { queryKeys } from '@/modules/business/api/query-keys';
import { ApiError } from '@/modules/business/types/api';
import { typographyClasses, mutedBodySm } from '@/design-system/tokens/typography';
import { cn } from '@/design-system/lib/utils';

const itemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  value: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  sortOrder: z.coerce.number().optional(),
});

const schema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['draft', 'published']),
  sortOrder: z.coerce.number().optional(),
  items: z.array(itemSchema),
});

type ContentCollectionFormValues = z.infer<typeof schema>;

function newItemId() {
  return `item_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export function ContentCollectionFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id = 'new' } = useParams();
  const isNew = id === 'new';
  const { path, isWorkspace, tenantId } = useTenantScope();
  const { canEdit } = usePermissions();
  const { data: collection, isLoading } = useContentCollection(id);
  const createCollection = useCreateContentCollection();
  const updateCollection = useUpdateContentCollection(id);

  const form = useForm<ContentCollectionFormValues>({
    resolver: zodResolver(schema),
    values: {
      key: collection?.key ?? '',
      label: collection?.label ?? '',
      description: collection?.description ?? '',
      status: (collection?.status === 'published' ? 'published' : 'draft') as 'draft' | 'published',
      sortOrder: collection?.sortOrder ?? 0,
      items: collection?.items?.length
        ? collection.items.map((item) => ({
            id: item.id,
            title: item.title,
            value: item.value ?? '',
            description: item.description ?? '',
            imageUrl: item.imageUrl ?? '',
            sortOrder: item.sortOrder ?? 0,
          }))
        : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  async function onSubmit(values: ContentCollectionFormValues) {
    try {
      const payload = {
        key: values.key,
        label: values.label,
        description: values.description || '',
        status: values.status,
        sortOrder: values.sortOrder ?? 0,
        items: values.items.map((item, index) => ({
          id: item.id || newItemId(),
          title: item.title,
          value: item.value ?? '',
          description: item.description ?? '',
          imageUrl: item.imageUrl ?? '',
          sortOrder: item.sortOrder ?? index,
        })),
      };

      if (isNew) {
        const created = await createCollection.mutateAsync(payload);
        toast.success(t('content.created'));
        navigate(path(`/content/${created.id}`));
      } else {
        await updateCollection.mutateAsync(payload);
        toast.success(t('content.saved'));
        navigate(path('/content'));
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t('errors.network'));
      }
    }
  }

  function invalidateCollection() {
    if (!isNew) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tenant.contentCollection(tenantId, id),
      });
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
        title={isNew ? t('content.form.createTitle') : t('content.form.title')}
        breadcrumbs={[
          ...(isWorkspace
            ? [{ label: t('admin.tenants.title'), href: '/admin/tenants' }]
            : []),
          { label: t('pages.content'), href: path('/content') },
          { label: isNew ? t('common.create') : collection?.label ?? '' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('content.form.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {!canEdit && (
            <Alert className="mb-4">
              <AlertDescription>{t('common.readOnly')}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('content.form.label')}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!canEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('content.form.key')}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!canEdit} placeholder="prices" />
                      </FormControl>
                      <p className={typographyClasses.caption}>{t('content.form.keyHint')}</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('content.form.collectionDescription')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={!canEdit} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('content.form.status')}</FormLabel>
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
                          <SelectItem value="draft">{t('content.form.statusDraft')}</SelectItem>
                          <SelectItem value="published">{t('content.form.statusPublished')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('content.form.sortOrder')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} disabled={!canEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t('content.form.items')}</Label>
                  {canEdit && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        append({
                          id: newItemId(),
                          title: '',
                          value: '',
                          description: '',
                          imageUrl: '',
                          sortOrder: fields.length,
                        })
                      }
                    >
                      <Plus className="size-4" />
                      {t('content.form.addItem')}
                    </Button>
                  )}
                </div>

                {fields.length === 0 ? (
                  <p className={mutedBodySm}>{t('content.form.noItems')}</p>
                ) : (
                  fields.map((field, index) => {
                    const itemId = form.watch(`items.${index}.id`);
                    const imageUrl = form.watch(`items.${index}.imageUrl`);
                    return (
                      <Card key={field.id}>
                        <CardHeader className="flex flex-row items-center justify-between py-3">
                          <CardTitle className={typographyClasses.button}>
                            {t('content.form.itemNumber', { number: index + 1 })}
                          </CardTitle>
                          {canEdit && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.title`}
                            render={({ field: itemField }) => (
                              <FormItem>
                                <FormLabel>{t('content.form.itemTitle')}</FormLabel>
                                <FormControl>
                                  <Input {...itemField} disabled={!canEdit} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${index}.value`}
                            render={({ field: itemField }) => (
                              <FormItem>
                                <FormLabel>{t('content.form.itemValue')}</FormLabel>
                                <FormControl>
                                  <Input {...itemField} disabled={!canEdit} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${index}.description`}
                            render={({ field: itemField }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>{t('content.form.itemDescription')}</FormLabel>
                                <FormControl>
                                  <Textarea {...itemField} disabled={!canEdit} rows={2} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {!isNew && itemId && canEdit && (
                            <div className="md:col-span-2">
                              <Label>{t('content.form.itemImage')}</Label>
                              <ImageUpload
                                endpoint={`/tenants/${tenantId}/content-collections/${id}/items/${itemId}/image`}
                                currentUrl={imageUrl}
                                disabled={!canEdit}
                                onUploaded={(url) => {
                                  form.setValue(`items.${index}.imageUrl`, url);
                                  invalidateCollection();
                                }}
                              />
                            </div>
                          )}
                          {isNew && (
                            <p className={cn('md:col-span-2', typographyClasses.caption)}>
                              {t('content.form.saveBeforeImage')}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>

              <div className="flex gap-2">
                {canEdit && (
                  <Button type="submit" disabled={createCollection.isPending || updateCollection.isPending}>
                    {t('common.save')}
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link to={path('/content')}>{t('common.cancel')}</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </CrmPageShell>
  );
}
