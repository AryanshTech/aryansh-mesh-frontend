import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent } from '@/design-system/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/design-system/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/design-system/components/ui/form';
import { Input } from '@/design-system/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/components/ui/select';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/components/ui/table';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/design-system/components/ui/empty';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { useInviteMember, useTeamMembers } from '@/modules/business/features/settings/use-team';
import { usePermissions } from '@/core/permissions/use-permissions';
import { useTenantScope } from '@/modules/business/hooks/use-tenant-scope';
import { ApiError } from '@/modules/business/types/api';
import type { Role } from '@/modules/business/types/auth';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['tenant_admin', 'tenant_editor', 'tenant_viewer']),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export function TeamPage() {
  const { t } = useTranslation();
  const { isWorkspace } = useTenantScope();
  const { canManageTeam } = usePermissions();
  const { data, isLoading, isError } = useTeamMembers();
  const inviteMember = useInviteMember();
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'tenant_editor' },
  });

  async function onInvite(values: InviteFormValues) {
    try {
      const result = await inviteMember.mutateAsync({
        email: values.email,
        role: values.role as Role,
      });
      if (result.emailSent) {
        toast.success(
          result.resent
            ? t('team.inviteResent', { email: values.email })
            : t('team.inviteSentEmail', { email: values.email }),
        );
      } else {
        toast.success(result.resent ? t('team.inviteResentLink') : t('team.inviteSent'));
      }
      if (result.acceptUrl) {
        void navigator.clipboard.writeText(result.acceptUrl);
        toast.message(t('team.inviteLinkCopied'));
      }
      form.reset();
      setDialogOpen(false);
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
          <AlertDescription>{t('team.loadError')}</AlertDescription>
        </Alert>
      </CrmPageShell>
    );
  }

  const members = data?.items ?? [];

  return (
    <CrmPageShell>
      <PageHeader
        title={t('pages.team')}
        description={t('team.subtitle')}
        breadcrumbs={
          isWorkspace
            ? [
                { label: t('admin.tenants.title'), href: '/business/admin/tenants' },
                { label: t('pages.team') },
              ]
            : undefined
        }
        action={
          canManageTeam ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>{t('team.invite')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('team.invite')}</DialogTitle>
                  <DialogDescription>{t('team.inviteHint')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onInvite)}
                    className="flex flex-col gap-4"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.email')}</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('team.table.role')}</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="tenant_admin">
                                {t('team.roles.admin')}
                              </SelectItem>
                              <SelectItem value="tenant_editor">
                                {t('team.roles.editor')}
                              </SelectItem>
                              <SelectItem value="tenant_viewer">
                                {t('team.roles.viewer')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={inviteMember.isPending}>
                      {inviteMember.isPending ? t('common.loading') : t('team.sendInvite')}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <Empty className="border-0 py-8">
              <EmptyHeader>
                <EmptyTitle>{t('empty.teamMessage')}</EmptyTitle>
                <EmptyDescription>{t('team.emptyHint')}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('team.table.email')}</TableHead>
                  <TableHead>{t('team.table.role')}</TableHead>
                  <TableHead>{t('team.table.joined')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.uid}>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{member.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {member.joinedAt
                        ? new Date(member.joinedAt).toLocaleDateString()
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </CrmPageShell>
  );
}
