import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { useCreateAdminTenant } from '@/modules/admin/api/use-admin-tenant-detail';

export default function TenantCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createMutation = useCreateAdminTenant();

  const [form, setForm] = useState({ name: '', slug: '', legalName: '' });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }
    try {
      const tenant = await createMutation.mutateAsync({
        name: form.name.trim(),
        slug: form.slug.trim(),
        legalName: form.legalName.trim() || undefined,
      });
      toast.success('Tenant created');
      void navigate(`/admin/tenants/${tenant.id}`);
    } catch (e) {
      toast.error((e as Error).message || 'Failed to create tenant');
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={t('admin.tenantCreateTitle')}
        description={t('admin.tenantCreateSubtitle')}
      />
      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-4 max-w-md">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="t-name">Name *</Label>
          <Input
            id="t-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="t-slug">Slug *</Label>
          <Input
            id="t-slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="t-legal">Legal Name</Label>
          <Input
            id="t-legal"
            value={form.legalName}
            onChange={(e) => setForm((f) => ({ ...f, legalName: e.target.value }))}
          />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating…' : 'Create Tenant'}
          </Button>
          <Button type="button" variant="outline" onClick={() => void navigate('/admin/tenants')}>
            Cancel
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
