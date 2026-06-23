import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Plus, Receipt } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { ListSkeleton } from '@/shared/components/Skeletons';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { Card } from '@/design-system/components/ui/card';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import { cn } from '@/design-system/lib/utils';
import {
  useCosts,
  useCreateCost,
  useUpdateCost,
  useDeleteCost,
  type CostInput,
  type CostView,
} from '@/modules/business/api/hooks/use-costs';

type CostDraft = Omit<CostInput, 'amount'> & { amountDisplay: string };

function toDraft(c: CostView): CostDraft {
  return {
    label: c.label,
    amountDisplay: c.amount.toFixed(2),
    currency: c.currency,
    date: c.date ? c.date.slice(0, 10) : '',
    category: c.category ?? '',
    notes: c.notes ?? '',
  };
}

function fromDraft(d: CostDraft): CostInput {
  return {
    label: d.label.trim(),
    amount: parseFloat(d.amountDisplay || '0') || 0,
    currency: d.currency,
    date: d.date,
    category: d.category?.trim() || undefined,
    notes: d.notes?.trim() || undefined,
  };
}

const NEW_COST_DRAFT: CostDraft = {
  label: '',
  amountDisplay: '',
  currency: 'CAD',
  date: new Date().toISOString().slice(0, 10),
  category: '',
  notes: '',
};

export default function CostsPage() {
  const { t } = useTranslation();
  const { hasTenant } = useTenantPath();
  const { data, isLoading, isError, refetch, isFetching } = useCosts();
  const createMutation = useCreateCost();
  const updateMutation = useUpdateCost();
  const deleteMutation = useDeleteCost();

  const [selected, setSelected] = useState<CostView | null>(null);
  const [draft, setDraft] = useState<CostDraft | null>(null);
  const [isNew, setIsNew] = useState(false);

  const costs = data?.items ?? [];
  const showSkeleton = !hasTenant || isLoading || (isFetching && !data);

  const openNew = () => { setSelected(null); setIsNew(true); setDraft({ ...NEW_COST_DRAFT }); };
  const openCost = (c: CostView) => { setSelected(c); setIsNew(false); setDraft(toDraft(c)); };
  const closeDrawer = () => { setSelected(null); setDraft(null); setIsNew(false); };

  const onSave = async () => {
    if (!draft) return;
    if (!draft.label.trim()) { toast.error(t('costs.errorLabelRequired')); return; }
    const input = fromDraft(draft);
    try {
      if (isNew) {
        await createMutation.mutateAsync(input);
        toast.success(t('costs.created'));
      } else if (selected) {
        await updateMutation.mutateAsync({ id: selected.id, input });
        toast.success(t('costs.updated'));
      }
      closeDrawer();
    } catch (e) {
      toast.error((e as Error).message || t('costs.saveFailed'));
    }
  };

  const onDelete = async () => {
    if (!selected) return;
    try {
      await deleteMutation.mutateAsync(selected.id);
      toast.success(t('costs.deleted'));
      closeDrawer();
    } catch (e) {
      toast.error((e as Error).message || t('costs.deleteFailed'));
    }
  };

  const masterContent = (
    <div className="flex flex-col gap-4">
      {showSkeleton ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState title={t('costs.errorTitle')} onRetry={() => void refetch()} />
      ) : costs.length === 0 ? (
        <EmptyState
          icon={<Receipt />}
          title={t('costs.emptyTitle')}
          description={t('costs.emptyDescription')}
          action={<Button onClick={openNew}><Plus className="size-4" />{t('costs.addCost')}</Button>}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left">
              <tr>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('costs.fieldLabel')}</th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('costs.fieldCategory')}</th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('costs.fieldDate')}</th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium text-right">{t('costs.fieldAmount')}</th>
              </tr>
            </thead>
            <tbody>
              {costs.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => openCost(c)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCost(c); } }}
                  className={cn(
                    'cursor-pointer border-b border-border last:border-b-0 transition-colors outline-none focus:bg-muted/40',
                    selected?.id === c.id ? 'bg-primary/5' : 'hover:bg-muted/30',
                  )}
                >
                  <td className="px-4 py-2.5 font-medium text-foreground">{c.label}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.category ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{c.date ? c.date.slice(0, 10) : '—'}</td>
                  <td className="px-4 py-2.5 text-right text-foreground tabular-nums">
                    {c.currency} {c.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );

  return (
    <PageShell>
      <PageHeader
        title={t('costs.title')}
        description={t('costs.subtitle')}
        actions={<Button onClick={openNew}><Plus className="size-4" />{t('costs.addCost')}</Button>}
      />
      <DetailDrawer
        open={!!draft}
        onOpenChange={(o) => (o ? null : closeDrawer())}
        title={isNew ? t('costs.newCost') : selected?.label ?? ''}
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
              <Label htmlFor="cost-label">{t('costs.fieldLabel')} *</Label>
              <Input id="cost-label" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
            </div>
            <div className="grid grid-cols-[1fr_100px] gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cost-amount">{t('costs.fieldAmount')}</Label>
                <Input id="cost-amount" inputMode="decimal" value={draft.amountDisplay} onChange={(e) => setDraft({ ...draft, amountDisplay: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cost-currency">{t('costs.fieldCurrency')}</Label>
                <Input id="cost-currency" value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value.toUpperCase() })} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cost-date">{t('costs.fieldDate')}</Label>
              <Input id="cost-date" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cost-category">{t('costs.fieldCategory')}</Label>
              <Input id="cost-category" value={draft.category ?? ''} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
            </div>
          </div>
        ) : null}
      </DetailDrawer>
    </PageShell>
  );
}
