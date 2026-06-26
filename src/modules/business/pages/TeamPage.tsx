import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/design-system/components/ui/dialog';
import { Badge } from '@/design-system/components/ui/badge';
import { useTenantPath } from '@/modules/business/api/use-tenant-path';
import { useMembers, useInviteMember } from '@/modules/marketing/api/use-members';
import { toastInviteResult } from '@/modules/business/lib/invite-toast';

const ROLES = ['TENANT_ADMIN', 'TENANT_EDITOR', 'TENANT_VIEWER'] as const;

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(ROLES),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export default function TeamPage() {
  const { t } = useTranslation();
  const { tenantId, hasTenant } = useTenantPath();
  const { data, isLoading, isError, refetch } = useMembers(tenantId);
  const inviteMutation = useInviteMember(tenantId);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'TENANT_EDITOR' },
  });

  const onInvite = async (values: InviteFormValues) => {
    try {
      const result = await inviteMutation.mutateAsync({
        email: values.email.trim(),
        role: values.role,
      });
      await toastInviteResult(t, values.email.trim(), result);
      form.reset();
      setDialogOpen(false);
    } catch (e) {
      toast.error((e as Error).message || t('team.inviteFailed'));
    }
  };

  if (!hasTenant) {
    return (
      <PageShell>
        <PageHeader title={t('team.title')} description={t('team.noTenant')} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title={t('team.title')}
        description={t('team.subtitle')}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="size-4" />
                {t('team.invite')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('team.invite')}</DialogTitle>
                <DialogDescription>{t('team.inviteHint')}</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit(onInvite)}
                className="flex flex-col gap-4"
                noValidate
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="team-email">{t('auth.email')}</Label>
                  <Input id="team-email" type="email" {...form.register('email')} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>{t('team.table.role')}</Label>
                  <Select
                    value={form.watch('role')}
                    onValueChange={(v) => form.setValue('role', v as InviteFormValues['role'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {t(`team.roles.${role}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending ? t('common.loading') : t('team.sendInvite')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : isError ? (
        <ErrorState title={t('team.loadError')} onRetry={() => void refetch()} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left">
              <tr>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">
                  {t('team.table.email')}
                </th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">
                  {t('team.table.role')}
                </th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">
                  {t('team.table.joined')}
                </th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    {t('team.emptyHint')}
                  </td>
                </tr>
              ) : (
                (data?.items ?? []).map((member) => (
                  <tr key={member.uid} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-2.5 text-foreground">{member.email}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="secondary">{member.role}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {member.joinedAt
                        ? new Date(member.joinedAt).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
