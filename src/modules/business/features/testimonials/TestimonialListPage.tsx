import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquareQuote, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Button } from '@/design-system/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/design-system/components/ui/empty';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/components/ui/table';
import { ConfirmDialog } from '@/shared/components/crm/ConfirmDialog';
import { FeatureListShell } from '@/shared/components/crm/FeatureListShell';
import { StatusBadge } from '@/shared/components/crm/StatusBadge';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import {
  useDeleteTestimonial,
  useTestimonials,
} from '@/modules/business/features/testimonials/use-testimonials';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import { ApiError } from '@/modules/business/types/api';

export function TestimonialListPage() {
  const { t } = useTranslation();
  const { isWorkspace, path } = useTenantScope();
  const { canEdit } = usePermissions();
  const { data, isLoading, isError } = useTestimonials(0, 50);
  const deleteTestimonial = useDeleteTestimonial();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteTestimonial.mutateAsync(deleteId);
      toast.success(t('testimonials.deleted'));
      setDeleteId(null);
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
          <AlertDescription>{t('testimonials.loadError')}</AlertDescription>
        </Alert>
      </CrmPageShell>
    );
  }

  const items = data?.items ?? [];

  return (
    <CrmPageShell>
      <PageHeader
        title={t('pages.testimonials')}
        description={t('testimonials.subtitle')}
        breadcrumbs={
          isWorkspace
            ? [
                { label: t('admin.tenants.title'), href: '/admin/tenants' },
                { label: t('pages.testimonials') },
              ]
            : undefined
        }
        action={
          canEdit ? (
            <Button asChild>
              <Link to={path('/testimonials/new')}>
                <Plus className="size-4" />
                {t('empty.testimonialsCta')}
              </Link>
            </Button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquareQuote />
            </EmptyMedia>
            <EmptyTitle>{t('testimonials.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('empty.testimonialsMessage')}</EmptyDescription>
          </EmptyHeader>
          {canEdit && (
            <EmptyContent>
              <Button asChild>
                <Link to={path('/testimonials/new')}>{t('empty.testimonialsCta')}</Link>
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <FeatureListShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('testimonials.table.author')}</TableHead>
                <TableHead>{t('testimonials.table.rating')}</TableHead>
                <TableHead>{t('testimonials.table.status')}</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((testimonial) => (
                <TableRow key={testimonial.id}>
                  <TableCell className="font-medium">{testimonial.author}</TableCell>
                  <TableCell>{testimonial.rating}/5</TableCell>
                  <TableCell>
                    <StatusBadge status={testimonial.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={path(`/testimonials/${testimonial.id}`)}>
                          {t('common.edit')}
                        </Link>
                      </Button>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(testimonial.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </FeatureListShell>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t('testimonials.deleteTitle')}
        description={t('testimonials.deleteDescription')}
        onConfirm={() => void handleDelete()}
        loading={deleteTestimonial.isPending}
      />
    </CrmPageShell>
  );
}
