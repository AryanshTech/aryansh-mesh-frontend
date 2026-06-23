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

const ROLES = ['TENANT_OWNER', 'TENANT_ADMIN', 'TENANT_EDITOR', 'TENANT_VIEWER'];

export default function TenantDetailPage() {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();

  const { data: tenant, isLoading, isError, refetch } = useAdminTenantDetail(tenantId);
  const updateMutation = useUpdateAdminTenant(tenantId ?? '');

  const [detailForm, setDetailForm] = useState({ name: '', legalName: '', status: 'active' });

  useEffect(() => {
    if (tenant) {
      setDetailForm({ name: tenant.name, legalName: tenant.legalName ?? '', status: tenant.status ?? 'active' });
    }
  }, [tenant]);

  const onSaveDetails = async () => {
    if (!detailForm.name.trim()) { toast.error('Name is required'); return; }
    try {
      await updateMutation.mutateAsync({
        name: detailForm.name.trim(),
        legalName: detailForm.legalName.trim() || undefined,
        status: detailForm.status,
      });
      toast.success('Tenant updated');
    } catch (e) {
      toast.error((e as Error).message || 'Failed to update tenant');
    }
  };

  const { data: membersData, isLoading: membersLoading, isError: membersError, refetch: refetchMembers } =
    useMembers(tenantId);
  const inviteMutation = useInviteMember(tenantId ?? '');
  const removeMutation = useRemoveMember(tenantId ?? '');

  const [inviteForm, setInviteForm] = useState<InviteInput>({ email: '', role: 'TENANT_EDITOR' });
  const members = membersData?.items ?? [];

  const onInvite = async () => {
    if (!inviteForm.email.trim()) { toast.error('Email is required'); return; }
    try {
      await inviteMutation.mutateAsync(inviteForm);
      toast.success('Invitation sent');
      setInviteForm({ email: '', role: 'TENANT_EDITOR' });
    } catch (e) {
      toast.error((e as Error).message || 'Failed to invite member');
    }
  };

  const onRemove = async (uid: string) => {
    try {
      await removeMutation.mutateAsync(uid);
      toast.success('Member removed');
    } catch (e) {
      toast.error((e as Error).message || 'Failed to remove member');
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
        <ErrorState title="Failed to load tenant" onRetry={() => void refetch()} />
      ) : (
        <Tabs defaultValue="details" className="flex flex-col gap-4">
          <TabsList className="w-fit">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex flex-col gap-4 max-w-md">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="td-name">Name *</Label>
              <Input id="td-name" value={detailForm.name} onChange={(e) => setDetailForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="td-legal">Legal Name</Label>
              <Input id="td-legal" value={detailForm.legalName} onChange={(e) => setDetailForm((f) => ({ ...f, legalName: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={detailForm.status} onValueChange={(v) => setDetailForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => void onSaveDetails()} disabled={updateMutation.isPending} className="self-start">
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </TabsContent>

          <TabsContent value="members" className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="typo-card-title text-foreground">Invite Member</p>
              <div className="flex flex-col gap-3 max-w-md">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="inv-email">Email</Label>
                  <Input id="inv-email" type="email" value={inviteForm.email} onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Role</Label>
                  <Select value={inviteForm.role} onValueChange={(v) => setInviteForm((f) => ({ ...f, role: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => void onInvite()} disabled={inviteMutation.isPending} className="self-start">
                  <UserPlus className="size-4" />
                  {inviteMutation.isPending ? 'Inviting…' : 'Send Invite'}
                </Button>
              </div>
            </div>

            {membersLoading ? (
              <ListSkeleton rows={3} />
            ) : membersError ? (
              <ErrorState title="Failed to load members" onRetry={() => void refetchMembers()} />
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card max-w-lg">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/30 text-left">
                    <tr>
                      <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">Email</th>
                      <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">Role</th>
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
