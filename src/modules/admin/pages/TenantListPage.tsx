import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Building2 } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { ListSkeleton } from '@/shared/components/Skeletons';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/design-system/components/ui/button';
import { useAdminTenants } from '@/modules/admin/api/use-admin-tenants';

function statusTone(status: string) {
  if (status === 'active') return 'success' as const;
  if (status === 'inactive') return 'warning' as const;
  return 'default' as const;
}

export default function TenantListPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useAdminTenants();
  const tenants = Array.isArray(data) ? data : (data as any)?.items ?? [];

  return (
    <PageShell>
      <PageHeader
        title={t('admin.tenantsTitle')}
        description={t('admin.tenantsSubtitle')}
        actions={
          <Button asChild>
            <Link to="/admin/tenants/new">
              <Plus className="size-4" />
              New Tenant
            </Link>
          </Button>
        }
      />
      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <ErrorState title="Failed to load tenants" onRetry={() => void refetch()} />
      ) : tenants.length === 0 ? (
        <EmptyState
          icon={<Building2 />}
          title="No tenants yet"
          description="Create the first tenant to get started."
          action={
            <Button asChild>
              <Link to="/admin/tenants/new"><Plus className="size-4" />New Tenant</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left">
              <tr>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">Name</th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">Slug</th>
                <th className="px-4 py-2.5 typo-eyebrow-upper text-faint font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant: any) => (
                <tr key={tenant.id} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <Link
                      to={`/admin/tenants/${tenant.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {tenant.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{tenant.slug}</td>
                  <td className="px-4 py-2.5">
                    {tenant.status ? (
                      <StatusBadge label={tenant.status} tone={statusTone(tenant.status)} />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
