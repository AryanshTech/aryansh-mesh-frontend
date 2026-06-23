import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Building2 } from 'lucide-react';
import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CardGridSkeleton } from '@/shared/components/Skeletons';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { Button } from '@/design-system/components/ui/button';
import { Input } from '@/design-system/components/ui/input';
import { Label } from '@/design-system/components/ui/label';
import { cn } from '@/design-system/lib/utils';
import {
  useCompanies,
  useCreateCompany,
  type Company,
} from '@/modules/marketing/api/use-companies';

export default function CompaniesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useCompanies();
  const createMutation = useCreateCompany();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState('');

  const companies = data?.items ?? [];

  const onCreate = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    try {
      const company = await createMutation.mutateAsync({ name: name.trim() });
      toast.success('Company created');
      setDrawerOpen(false);
      setName('');
      void navigate(`/marketing/companies/${company.id}`);
    } catch (e) {
      toast.error((e as Error).message || 'Failed to create company');
    }
  };

  const masterContent = (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <CardGridSkeleton />
      ) : isError ? (
        <ErrorState title="Failed to load companies" onRetry={() => void refetch()} />
      ) : companies.length === 0 ? (
        <EmptyState
          icon={<Building2 />}
          title="No companies yet"
          description="Create a company to start managing marketing projects."
          action={<Button onClick={() => setDrawerOpen(true)}><Plus className="size-4" />Add Company</Button>}
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {companies.map((c: Company) => (
            <button
              key={c.id}
              type="button"
              onClick={() => void navigate(`/marketing/companies/${c.id}`)}
              className={cn(
                'flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left',
                'transition-all duration-150 hover:border-hairline-strong hover:shadow-card',
              )}
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Building2 className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="typo-card-title text-foreground truncate">{c.name}</p>
                <p className="typo-body-sm text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <PageShell>
      <PageHeader
        title={t('marketing.companiesTitle')}
        description={t('marketing.companiesSubtitle')}
        actions={<Button onClick={() => setDrawerOpen(true)}><Plus className="size-4" />Add Company</Button>}
      />
      <DetailDrawer
        open={drawerOpen}
        onOpenChange={(o) => { setDrawerOpen(o); if (!o) setName(''); }}
        title="New Company"
        master={masterContent}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => { setDrawerOpen(false); setName(''); }}>Cancel</Button>
            <Button onClick={() => void onCreate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="co-name">Company Name *</Label>
            <Input id="co-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
      </DetailDrawer>
    </PageShell>
  );
}
