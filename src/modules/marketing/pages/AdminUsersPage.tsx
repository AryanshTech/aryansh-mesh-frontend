import { useEffect, useState } from 'react';
import { ShieldIcon, UsersIcon } from 'lucide-react';
import { platformTeamApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { DataTableCard } from '@/modules/marketing/components/dashboard/data-table-card';
import { StatCard } from '@/modules/marketing/components/dashboard/stat-card';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { formatDateTime, t } from '@/core/i18n';
import { Badge } from '@/design-system/components/ui/badge';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/components/ui/table';

type PlatformTeamMember = {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  active: boolean;
};

export function AdminUsersPage() {
  const { getToken } = useAuth();
  const [members, setMembers] = useState<PlatformTeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetchWithRetry(
        (token) => platformTeamApi.list(token),
        getToken
      );
      setMembers(res.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [getToken]);

  return (
    <CrmPageShell>
      <PageHeader description={t('admin.subtitle')} />
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <StatCard
              title={t('admin.stats.team')}
              value={String(members.length)}
              icon={UsersIcon}
            />
            <StatCard
              title={t('admin.stats.admins')}
              value={String(members.filter((m) => m.active).length)}
              icon={ShieldIcon}
            />
          </div>
          <DataTableCard title={t('admin.table.title')}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.table.email')}</TableHead>
                  <TableHead>{t('admin.table.name')}</TableHead>
                  <TableHead>{t('admin.table.role')}</TableHead>
                  <TableHead>{t('admin.table.joined')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.uid}>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.displayName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">platform_team</Badge>
                    </TableCell>
                    <TableCell className="font-tabular">{formatDateTime(member.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTableCard>
        </>
      )}
    </CrmPageShell>
  );
}
