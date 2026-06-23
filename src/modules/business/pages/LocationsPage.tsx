import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Plus, MapPin } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CardGridSkeleton } from '@/shared/components/Skeletons';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { cn } from '@/design-system/lib/utils';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import {
  useLocations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
  type LocationInput,
  type LocationView,
} from '@/modules/business/api/hooks/use-locations';

const NEW_DRAFT: LocationInput = {
  name: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
};

function toDraft(l: LocationView): LocationInput {
  return {
    name: l.name,
    street: l.street ?? '',
    city: l.city ?? '',
    state: l.state ?? '',
    postalCode: l.postalCode ?? '',
    country: l.country ?? '',
    phone: l.phone ?? '',
  };
}

export default function LocationsPage() {
  const { t } = useTranslation();
  const { hasTenant } = useTenantPath();
  const { data, isLoading, isError, refetch, isFetching } = useLocations();
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  const [selected, setSelected] = useState<LocationView | null>(null);
  const [draft, setDraft] = useState<LocationInput | null>(null);
  const [isNew, setIsNew] = useState(false);

  const locations = data?.items ?? [];
  const showSkeleton = !hasTenant || isLoading || (isFetching && !data);

  const openNew = () => { setSelected(null); setIsNew(true); setDraft({ ...NEW_DRAFT }); };
  const openLocation = (l: LocationView) => { setSelected(l); setIsNew(false); setDraft(toDraft(l)); };
  const closeDrawer = () => { setSelected(null); setDraft(null); setIsNew(false); };

  const onSave = async () => {
    if (!draft) return;
    if (!draft.name.trim()) { toast.error(t('locations.errorNameRequired')); return; }
    try {
      if (isNew) {
        await createMutation.mutateAsync(draft);
        toast.success(t('locations.created'));
      } else if (selected) {
        await updateMutation.mutateAsync({ id: selected.id, input: draft });
        toast.success(t('locations.updated'));
      }
      closeDrawer();
    } catch (e) {
      toast.error((e as Error).message || t('locations.saveFailed'));
    }
  };

  const onDelete = async () => {
    if (!selected) return;
    try {
      await deleteMutation.mutateAsync(selected.id);
      toast.success(t('locations.deleted'));
      closeDrawer();
    } catch (e) {
      toast.error((e as Error).message || t('locations.deleteFailed'));
    }
  };

  const masterContent = (
    <div className="flex flex-col gap-4">
      {showSkeleton ? (
        <CardGridSkeleton />
      ) : isError ? (
        <ErrorState title={t('locations.errorTitle')} onRetry={() => void refetch()} />
      ) : locations.length === 0 ? (
        <EmptyState
          icon={<MapPin />}
          title={t('locations.emptyTitle')}
          description={t('locations.emptyDescription')}
          action={<Button onClick={openNew}><Plus className="size-4" />{t('locations.addLocation')}</Button>}
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {locations.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => openLocation(l)}
              className={cn(
                'group flex flex-col gap-3 rounded-xl border bg-card p-4 text-left transition-all duration-150',
                'hover:border-hairline-strong hover:shadow-card',
                selected?.id === l.id ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border',
              )}
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <MapPin className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="typo-card-title text-foreground truncate">{l.name}</p>
                {l.addressLine ? (
                  <p className="typo-body-sm text-muted-foreground truncate">{l.addressLine}</p>
                ) : null}
                {l.phone ? (
                  <p className="typo-body-sm text-muted-foreground truncate">{l.phone}</p>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <PageShell>
      <PageHeader
        title={t('locations.title')}
        description={t('locations.subtitle')}
        actions={<Button onClick={openNew}><Plus className="size-4" />{t('locations.addLocation')}</Button>}
      />
      <DetailDrawer
        open={!!draft}
        onOpenChange={(o) => (o ? null : closeDrawer())}
        title={isNew ? t('locations.newLocation') : selected?.name ?? ''}
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
              <Label htmlFor="loc-name">{t('locations.fieldName')} *</Label>
              <Input id="loc-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="loc-street">{t('locations.fieldStreet')}</Label>
              <Input id="loc-street" value={draft.street ?? ''} onChange={(e) => setDraft({ ...draft, street: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="loc-city">{t('locations.fieldCity')}</Label>
                <Input id="loc-city" value={draft.city ?? ''} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="loc-state">{t('locations.fieldState')}</Label>
                <Input id="loc-state" value={draft.state ?? ''} onChange={(e) => setDraft({ ...draft, state: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="loc-postal">{t('locations.fieldPostalCode')}</Label>
                <Input id="loc-postal" value={draft.postalCode ?? ''} onChange={(e) => setDraft({ ...draft, postalCode: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="loc-country">{t('locations.fieldCountry')}</Label>
                <Input id="loc-country" value={draft.country ?? ''} onChange={(e) => setDraft({ ...draft, country: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="loc-phone">{t('locations.fieldPhone')}</Label>
              <Input id="loc-phone" value={draft.phone ?? ''} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            </div>
          </div>
        ) : null}
      </DetailDrawer>
    </PageShell>
  );
}
