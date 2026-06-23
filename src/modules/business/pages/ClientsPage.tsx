import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Plus, Users } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { ListSkeleton } from '@/shared/components/Skeletons';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { Textarea } from '@/design-system/components/ui/textarea';
import { Card } from '@/design-system/components/ui/card';
import { cn } from '@/design-system/lib/utils';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  type ClientInput,
  type ClientView,
} from '@/modules/business/api/hooks/use-clients';

const NEW_DRAFT: ClientInput = { name: '', email: '', phone: '', company: '', notes: '' };

function toDraft(c: ClientView): ClientInput {
  return {
    name: c.name,
    email: c.email ?? '',
    phone: c.phone ?? '',
    company: c.company ?? '',
    notes: c.notes ?? '',
  };
}

export default function ClientsPage() {
  const { t } = useTranslation();
  const { hasTenant } = useTenantPath();
  const { data, isLoading, isError, refetch, isFetching } = useClients();
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();

  const [selected, setSelected] = useState<ClientView | null>(null);
  const [draft, setDraft] = useState<ClientInput | null>(null);
  const [isNew, setIsNew] = useState(false);

  const clients = data?.items ?? [];
  const showSkeleton = !hasTenant || isLoading || (isFetching && !data);

  const openNew = () => { setSelected(null); setIsNew(true); setDraft({ ...NEW_DRAFT }); };
  const openClient = (c: ClientView) => { setSelected(c); setIsNew(false); setDraft(toDraft(c)); };
  const closeDrawer = () => { setSelected(null); setDraft(null); setIsNew(false); };

  const onSave = async () => {
    if (!draft) return;
    if (!draft.name.trim()) { toast.error(t('clients.errorNameRequired')); return; }
    try {
      if (isNew) {
        await createMutation.mutateAsync(draft);
        toast.success(t('clients.created'));
      } else if (selected) {
        await updateMutation.mutateAsync({ id: selected.id, input: draft });
        toast.success(t('clients.updated'));
      }
      closeDrawer();
    } catch (e) {
      toast.error((e as Error).message || t('clients.saveFailed'));
    }
  };

  const onDelete = async () => {
    if (!selected) return;
    try {
      await deleteMutation.mutateAsync(selected.id);
      toast.success(t('clients.deleted'));
      closeDrawer();
    } catch (e) {
      toast.error((e as Error).message || t('clients.deleteFailed'));
    }
  };

  const masterContent = (
    <div className="flex flex-col gap-4">
      {showSkeleton ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState title={t('clients.errorTitle')} onRetry={() => void refetch()} />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title={t('clients.emptyTitle')}
          description={t('clients.emptyDescription')}
          action={<Button onClick={openNew}><Plus className="size-4" />{t('clients.addClient')}</Button>}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left">
              <tr>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('clients.fieldName')}</th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('clients.fieldCompany')}</th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('clients.fieldEmail')}</th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('clients.fieldPhone')}</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => openClient(c)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openClient(c); } }}
                  className={cn(
                    'cursor-pointer border-b border-border last:border-b-0 transition-colors outline-none focus:bg-muted/40',
                    selected?.id === c.id ? 'bg-primary/5' : 'hover:bg-muted/30',
                  )}
                >
                  <td className="px-4 py-2.5 font-medium text-foreground">{c.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.company ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.email ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.phone ?? '—'}</td>
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
        title={t('clients.title')}
        description={t('clients.subtitle')}
        actions={<Button onClick={openNew}><Plus className="size-4" />{t('clients.addClient')}</Button>}
      />
      <DetailDrawer
        open={!!draft}
        onOpenChange={(o) => (o ? null : closeDrawer())}
        title={isNew ? t('clients.newClient') : selected?.name ?? ''}
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
              <Label htmlFor="c-name">{t('clients.fieldName')} *</Label>
              <Input id="c-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-company">{t('clients.fieldCompany')}</Label>
              <Input id="c-company" value={draft.company ?? ''} onChange={(e) => setDraft({ ...draft, company: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-email">{t('clients.fieldEmail')}</Label>
              <Input id="c-email" type="email" value={draft.email ?? ''} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-phone">{t('clients.fieldPhone')}</Label>
              <Input id="c-phone" value={draft.phone ?? ''} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-notes">{t('clients.fieldNotes')}</Label>
              <Textarea id="c-notes" rows={3} value={draft.notes ?? ''} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
            </div>
          </div>
        ) : null}
      </DetailDrawer>
    </PageShell>
  );
}
