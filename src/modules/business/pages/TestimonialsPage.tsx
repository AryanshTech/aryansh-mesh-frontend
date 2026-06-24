import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Star, Quote } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CardGridSkeleton } from '@/shared/components/Skeletons';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import {
  EditableImagesSection,
  entityImageUrls,
} from '@/shared/components/EditableImagesSection';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { Textarea } from '@/design-system/components/ui/textarea';
import { cn } from '@/design-system/lib/utils';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import {
  useTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
  type TestimonialInput,
  type TestimonialView,
} from '@/modules/business/api/hooks/use-testimonials';

const NEW_DRAFT: TestimonialInput = { author: '', quote: '', rating: 5 };

function toDraft(t: TestimonialView): TestimonialInput {
  return { author: t.author, quote: t.quote, rating: t.rating ?? 5 };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn('size-3.5', i < rating ? 'fill-warning text-warning' : 'text-muted-foreground')}
        />
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { hasTenant, tenantId, path: tenantPath } = useTenantPath();
  const { data, isLoading, isError, refetch, isFetching } = useTestimonials();
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();

  const [selected, setSelected] = useState<TestimonialView | null>(null);
  const [draft, setDraft] = useState<TestimonialInput | null>(null);
  const [isNew, setIsNew] = useState(false);

  const testimonials = data?.items ?? [];
  const showSkeleton = !hasTenant || isLoading || (isFetching && !data);

  const openNew = () => { setSelected(null); setIsNew(true); setDraft({ ...NEW_DRAFT }); };
  const openTestimonial = (item: TestimonialView) => { setSelected(item); setIsNew(false); setDraft(toDraft(item)); };
  const closeDrawer = () => { setSelected(null); setDraft(null); setIsNew(false); };

  const onSave = async () => {
    if (!draft) return;
    if (!draft.author.trim() || !draft.quote.trim()) { toast.error(t('testimonials.errorRequired')); return; }
    try {
      if (isNew) {
        await createMutation.mutateAsync(draft);
        toast.success(t('testimonials.created'));
      } else if (selected) {
        await updateMutation.mutateAsync({ id: selected.id, input: draft });
        toast.success(t('testimonials.updated'));
      }
      closeDrawer();
    } catch (e) {
      toast.error((e as Error).message || t('testimonials.saveFailed'));
    }
  };

  const onPhotoUploaded = (url: string) => {
    if (!tenantId) return;
    void queryClient.invalidateQueries({ queryKey: ['business', tenantId, 'testimonials'] });
    if (selected) {
      setSelected({
        ...selected,
        photoUrl: url,
      });
    }
  };

  const onPhotoRemoved = async () => {
    if (!selected || !tenantId) return;
    await updateMutation.mutateAsync({
      id: selected.id,
      input: { photoUrl: null },
    });
    void queryClient.invalidateQueries({ queryKey: ['business', tenantId, 'testimonials'] });
    setSelected({
      ...selected,
      photoUrl: null,
    });
  };

  const onPhotoReplaced = async (_oldUrl: string, newUrl: string) => {
    onPhotoUploaded(newUrl);
  };

  const onDelete = async () => {
    if (!selected) return;
    try {
      await deleteMutation.mutateAsync(selected.id);
      toast.success(t('testimonials.deleted'));
      closeDrawer();
    } catch (e) {
      toast.error((e as Error).message || t('testimonials.deleteFailed'));
    }
  };

  const masterContent = (
    <div className="flex flex-col gap-4">
      {showSkeleton ? (
        <CardGridSkeleton />
      ) : isError ? (
        <ErrorState title={t('testimonials.errorTitle')} onRetry={() => void refetch()} />
      ) : testimonials.length === 0 ? (
        <EmptyState
          icon={<Quote />}
          title={t('testimonials.emptyTitle')}
          description={t('testimonials.emptyDescription')}
          action={<Button onClick={openNew}><Plus className="size-4" />{t('testimonials.addTestimonial')}</Button>}
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {testimonials.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openTestimonial(item)}
              className={cn(
                'group flex flex-col gap-3 rounded-xl border bg-card p-4 text-left transition-all duration-150',
                'hover:border-hairline-strong hover:shadow-card',
                selected?.id === item.id ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border',
              )}
            >
              {item.rating != null ? <StarRating rating={item.rating} /> : null}
              <p className="typo-body-sm text-muted-foreground line-clamp-4 italic">"{item.quote}"</p>
              <p className="typo-card-title text-foreground">— {item.author}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <PageShell>
      <PageHeader
        title={t('testimonials.title')}
        description={t('testimonials.subtitle')}
        actions={<Button onClick={openNew}><Plus className="size-4" />{t('testimonials.addTestimonial')}</Button>}
      />
      <DetailDrawer
        open={!!draft}
        onOpenChange={(o) => (o ? null : closeDrawer())}
        title={isNew ? t('testimonials.newTestimonial') : selected?.author ?? ''}
        master={masterContent}
        footer={
          <div className="flex items-center justify-between gap-2">
            {!isNew && selected ? (
              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => void onDelete()} disabled={deleteMutation.isPending}>
                {t('common.delete')}
              </Button>
            ) : <span />}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={closeDrawer}>{t('common.cancel')}</Button>
              <Button onClick={() => void onSave()} disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? t('common.loading') : t('common.save')}
              </Button>
            </div>
          </div>
        }
      >
        {draft ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="test-author">{t('testimonials.fieldAuthor')} *</Label>
              <Input id="test-author" value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="test-quote">{t('testimonials.fieldQuote')} *</Label>
              <Textarea id="test-quote" rows={4} value={draft.quote} onChange={(e) => setDraft({ ...draft, quote: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="test-rating">{t('testimonials.fieldRating')}</Label>
              <Input
                id="test-rating"
                type="number"
                min={1}
                max={5}
                value={draft.rating ?? ''}
                onChange={(e) => setDraft({ ...draft, rating: e.target.value ? parseInt(e.target.value, 10) : undefined })}
              />
            </div>
            <EditableImagesSection
              isNew={isNew}
              entityId={selected?.id}
              entityName={selected?.author}
              imageUrls={entityImageUrls(null, selected?.photoUrl)}
              mode="single"
              uploadEndpoint={
                selected && tenantPath
                  ? `${tenantPath}/testimonials/${selected.id}/photo`
                  : undefined
              }
              onImageUploaded={onPhotoUploaded}
              onImageRemoved={async () => {
                await onPhotoRemoved();
              }}
              onImageReplaced={onPhotoReplaced}
              labelKey="testimonials.fieldPhoto"
              hintKey="testimonials.photoHint"
              afterSaveKey="testimonials.photoAfterSave"
            />
          </div>
        ) : null}
      </DetailDrawer>
    </PageShell>
  );
}
