import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/design-system/components/ui/alert';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/design-system/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Separator } from '@/design-system/components/ui/separator';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { AdminTenantQuickNav } from '@/modules/business/features/admin/AdminTenantQuickNav';
import { useInviteOwner } from '@/modules/business/features/admin/use-invite';
import { useTenant } from '@/modules/business/features/admin/use-tenants';
import { formatDate } from '@/modules/business/navigation';
import { getLocale } from '@/core/i18n';
import { typographyClasses, mutedBodySm } from '@/design-system/tokens/typography';
import { ApiError } from '@/modules/business/types/api';

const inviteSchema = z.object({
  email: z.string().email(),
});

type InviteForm = z.infer<typeof inviteSchema>;

export function TenantDetailPage() {
  const { id = '' } = useParams();
  const { t } = useTranslation();
  const locale = getLocale();
  const { data: tenant, isLoading, isError } = useTenant(id);
  const inviteOwner = useInviteOwner();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [acceptUrl, setAcceptUrl] = useState<string | null>(null);

  const form = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '' },
  });

  async function onInviteSubmit(values: InviteForm) {
    try {
      const result = await inviteOwner.mutateAsync({
        tenantId: id,
        email: values.email,
        role: 'tenant_owner',
      });
      setAcceptUrl(result.acceptUrl);
      setInviteOpen(false);
      if (result.emailSent) {
        toast.success(
          result.resent
            ? t('admin.tenants.detail.inviteResent', { email: values.email })
            : t('admin.tenants.detail.inviteSentEmail', { email: values.email }),
        );
      } else {
        toast.success(
          result.resent
            ? t('admin.tenants.detail.inviteResentLink', { email: values.email })
            : t('admin.tenants.detail.inviteSent'),
        );
      }
      form.reset();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t('errors.network'));
      }
    }
  }

  async function copyAcceptUrl() {
    if (!acceptUrl) return;
    await navigator.clipboard.writeText(acceptUrl);
    toast.success(t('admin.tenants.detail.inviteLinkCopied'));
  }

  if (isLoading) {
    return (
      <CrmPageShell>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </CrmPageShell>
    );
  }

  if (isError || !tenant) {
    return (
      <CrmPageShell>
        <Alert variant="destructive">
          <AlertTitle>{t('errors.notFound')}</AlertTitle>
          <AlertDescription>{t('admin.tenants.notFound')}</AlertDescription>
        </Alert>
      </CrmPageShell>
    );
  }

  return (
    <CrmPageShell>
      <PageHeader
        title={tenant.name}
        breadcrumbs={[
          { label: t('admin.tenants.title'), href: '/admin/tenants' },
          { label: tenant.name },
        ]}
        action={
          <Button asChild>
            <Link to={`/admin/tenants/${tenant.id}/workspace/dashboard`}>
              {t('admin.tenants.detail.manageTenant')}
            </Link>
          </Button>
        }
      />

      <AdminTenantQuickNav tenantId={tenant.id} />

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.tenants.detail.overview')}</CardTitle>
          <CardDescription>{tenant.slug}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailField label={t('admin.tenants.form.name')} value={tenant.name} />
            <DetailField label={t('admin.tenants.form.slug')} value={tenant.slug} />
            <DetailField
              label={t('admin.tenants.table.status')}
              value={<Badge variant="secondary">{tenant.status}</Badge>}
            />
            <DetailField label={t('admin.tenants.detail.plan')} value={tenant.plan} />
            <DetailField label={t('admin.tenants.form.currency')} value={tenant.currency} />
            <DetailField label={t('admin.tenants.form.timezone')} value={tenant.timezone} />
            <DetailField
              label={t('admin.tenants.detail.onboarding')}
              value={tenant.onboardingComplete ? t('common.yes') : t('common.no')}
            />
            <DetailField
              label={t('admin.tenants.table.createdAt')}
              value={formatDate(tenant.createdAt, locale)}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.tenants.detail.inviteOwner')}</CardTitle>
          <CardDescription>{t('admin.tenants.detail.inviteOwnerHint')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {acceptUrl && (
            <Alert>
              <AlertTitle>{t('admin.tenants.detail.inviteLinkTitle')}</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <span>{t('admin.tenants.detail.inviteLinkHint')}</span>
                <div className="flex gap-2">
                  <Input readOnly value={acceptUrl} />
                  <Button type="button" variant="outline" size="icon" onClick={() => void copyAcceptUrl()}>
                    <Copy className="size-4" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          <Button onClick={() => setInviteOpen(true)}>
            {t('admin.tenants.detail.inviteOwner')}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.tenants.detail.inviteOwner')}</DialogTitle>
            <DialogDescription>{t('admin.tenants.detail.inviteOwnerHint')}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onInviteSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.email')}</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={inviteOwner.isPending}>
                  {inviteOwner.isPending ? t('common.loading') : t('admin.tenants.detail.sendInvite')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </CrmPageShell>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className={mutedBodySm}>{label}</span>
      <span className={typographyClasses.button}>{value}</span>
    </div>
  );
}
