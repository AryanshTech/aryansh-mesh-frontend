import { PageShell } from '@/shared/components/PageShell';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { Sparkles } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description?: string;
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <PageShell>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={<Sparkles />}
        title="Coming soon"
        description="This module is scaffolded — full implementation lands in the next iteration."
      />
    </PageShell>
  );
}
