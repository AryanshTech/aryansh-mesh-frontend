import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
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
import { ApiError } from '@/core/api/client';
import { useCreateAdminTenant } from '@/modules/admin/api/use-admin-tenant-detail';
import { slugify } from '@/modules/admin/lib/slugify';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default function TenantCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createMutation = useCreateAdminTenant();

  const [form, setForm] = useState({
    name: '',
    slug: '',
    currency: 'CAD',
    timezone: 'America/Toronto',
  });
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (slugTouched || !form.name) return;
    setForm((current) => ({ ...current, slug: slugify(form.name) }));
  }, [form.name, slugTouched]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = form.name.trim();
    const slug = form.slug.trim();
    const currency = form.currency.trim().toUpperCase();
    const timezone = form.timezone.trim();

    if (!name) {
      toast.error(t('admin.tenantForm.nameRequired'));
      return;
    }
    if (!slug || !SLUG_PATTERN.test(slug)) {
      toast.error(t('admin.tenantForm.slugInvalid'));
      return;
    }
    if (currency.length !== 3) {
      toast.error(t('admin.tenantForm.currencyInvalid'));
      return;
    }
    if (!timezone) {
      toast.error(t('admin.tenantForm.timezoneRequired'));
      return;
    }

    try {
      const tenant = await createMutation.mutateAsync({ name, slug, currency, timezone });
      toast.success(t('admin.tenantForm.created'));
      void navigate(`/admin/tenants/${tenant.id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error(t('admin.tenantForm.slugConflict'));
        return;
      }
      toast.error((error as Error).message || t('admin.tenantForm.createFailed'));
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={t('admin.tenantCreateTitle')}
        description={t('admin.tenantCreateSubtitle')}
      />
      <form onSubmit={(e) => void onSubmit(e)} className="flex max-w-md flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="t-name">{t('admin.tenantForm.name')}</Label>
          <Input
            id="t-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="t-slug">{t('admin.tenantForm.slug')}</Label>
          <Input
            id="t-slug"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }));
            }}
          />
          <p className="text-xs text-muted-foreground">{t('admin.tenantForm.slugHint')}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="t-currency">{t('admin.tenantForm.currency')}</Label>
          <Select
            value={form.currency}
            onValueChange={(value) => setForm((f) => ({ ...f, currency: value }))}
          >
            <SelectTrigger id="t-currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CAD">CAD</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="INR">INR</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="t-timezone">{t('admin.tenantForm.timezone')}</Label>
          <Input
            id="t-timezone"
            value={form.timezone}
            placeholder="America/Toronto"
            onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
          />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? t('common.loading') : t('admin.tenantForm.submit')}
          </Button>
          <Button type="button" variant="outline" onClick={() => void navigate('/admin/tenants')}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
