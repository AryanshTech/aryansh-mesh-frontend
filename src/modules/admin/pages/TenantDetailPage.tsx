import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { UserPlus, Trash2 } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { ErrorState } from '@/shared/components/ErrorState';
import { ListSkeleton } from '@/shared/components/Skeletons';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/components/ui/tabs';
import {
  useAdminTenantDetail,
  useUpdateAdminTenant,
} from '@/modules/admin/api/use-admin-tenant-detail';
import {
  useMembers,
  useInviteMember,
  useRemoveMember,
  type InviteInput,
} from '@/modules/marketing/api/use-members';
import { toastInviteResult } from '@/modules/business/lib/invite-toast';

const ROLES = ['TENANT_OWNER', 'TENANT_ADMIN', 'TENANT_EDITOR', 'TENANT_VIEWER'];

export default function TenantDetailPage() {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();

  const { data: tenant, isLoading, isError, refetch } = useAdminTenantDetail(tenantId);
  const updateMutation = useUpdateAdminTenant(tenantId ?? '');

  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (tenant) {
      setStatus(tenant.status ?? 'active');
    }
  }, [tenant]);

  const onSaveDetails = async () => {
    try {
      await updateMutation.mutateAsync({ status });
      toast.success(t('admin.tenantUpdated'));
    } catch (e) {
      toast.error((e as Error).message || t('admin.tenantUpdateFailed'));
    }
  };

  const { data: membersData, isLoading: membersLoading, isError: membersError, refetch: refetchMembers } =
    useMembers(tenantId);
  const inviteMutation = useInviteMember(tenantId ?? '');
  const removeMutation = useRemoveMember(tenantId ?? '');

  const [inviteForm, setInviteForm] = useState<InviteInput>({ email: '', role: 'TENANT_OWNER' });
  const members = membersData?.items ?? [];

  const onInvite = async () => {
    if (!inviteForm.email.trim()) {
      toast.error(t('team.emailRequired'));
      return;
    }
    try {
      const result = await inviteMutation.mutateAsync({
        email: inviteForm.email.trim(),
        role: inviteForm.role,
      });
      await toastInviteResult(t, inviteForm.email.trim(), result);
      setInviteForm({ email: '', role: 'TENANT_OWNER' });
    } catch (e) {
      toast.error((e as Error).message || t('team.inviteFailed'));
    }
  };

  const onRemove = async (uid: string) => {
    try {
      await removeMutation.mutateAsync(uid);
      toast.success(t('team.memberRemoved'));
    } catch (e) {
      toast.error((e as Error).message || t('team.removeFailed'));
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={t('admin.tenantDetailTitle')}
        description={tenant?.name ?? t('admin.tenantDetailSubtitle')}
      />
      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : isError ? (
        <ErrorState title={t('admin.tenantLoadFailed')} onRetry={() => void refetch()} />
      ) : (
        <Tabs defaultValue="details" className="flex flex-col gap-4">
          <TabsList className="w-fit">
            <TabsTrigger value="details">{t('admin.tabs.details')}</TabsTrigger>
            <TabsTrigger value="members">{t('admin.tabs.members')}</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex flex-col gap-4 max-w-md">
            <div className="flex flex-col gap-1.5">
              <Label>{t('admin.tenantForm.name')}</Label>
              <p className="text-sm text-foreground">{tenant?.name}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t('admin.tenantForm.slug')}</Label>
              <p className="text-sm text-muted-foreground">{tenant?.slug}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t('admin.tenantForm.status')}</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('admin.tenantStatus.active')}</SelectItem>
                  <SelectItem value="suspended">{t('admin.tenantStatus.suspended')}</SelectItem>
                  <SelectItem value="pending">{t('admin.tenantStatus.pending')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => void onSaveDetails()} disabled={updateMutation.isPending} className="self-start">
              {updateMutation.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </TabsContent>

          <TabsContent value="members" className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="typo-card-title text-foreground">{t('team.invite')}</p>
              <div className="flex flex-col gap-3 max-w-md">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="inv-email">{t('auth.email')}</Label>
                  <Input id="inv-email" type="email" value={inviteForm.email} onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>{t('team.table.role')}</Label>
                  <Select value={inviteForm.role} onValueChange={(v) => setInviteForm((f) => ({ ...f, role: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{t(`team.roles.${r}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => void onInvite()} disabled={inviteMutation.isPending} className="self-start">
                  <UserPlus className="size-4" />
                  {inviteMutation.isPending ? t('common.loading') : t('team.sendInvite')}
                </Button>
              </div>
            </div>

            {membersLoading ? (
              <ListSkeleton rows={3} />
            ) : membersError ? (
              <ErrorState title={t('team.loadError')} onRetry={() => void refetchMembers()} />
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card max-w-lg">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/30 text-left">
                    <tr>
                      <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('team.table.email')}</th>
                      <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">{t('team.table.role')}</th>
                      <th className="px-4 py-2.5 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.uid} className="border-b border-border last:border-b-0">
                        <td className="px-4 py-2.5 text-foreground">{m.email}</td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{m.role}</td>
                        <td className="px-4 py-2.5">
                          <button
                            type="button"
                            onClick={() => void onRemove(m.uid)}
                            disabled={removeMutation.isPending && removeMutation.variables === m.uid}
                            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={t('admin.removeMember')}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </PageShell>
  );
}
