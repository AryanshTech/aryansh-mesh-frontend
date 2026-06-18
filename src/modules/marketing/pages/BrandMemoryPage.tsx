import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { brandMemoriesApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { PageShell } from '@/modules/marketing/components/layout/page-shell';
import { t } from '@/core/i18n';
import type { BrandMemoryResponse } from '@/modules/marketing/types/api';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Textarea } from '@/design-system/components/ui/textarea';
import { Skeleton } from '@/design-system/components/ui/skeleton';

export function BrandMemoryPage() {
  const { projectId = '' } = useParams();
  const { getToken, canWrite } = useAuth();
  const [current, setCurrent] = useState<BrandMemoryResponse | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetchWithRetry(
        (token) => brandMemoriesApi.getCurrent(token, projectId),
        getToken
      );
      setCurrent(res);
      setContent(res?.contentMarkdown ?? '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [projectId, getToken]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const created = await apiFetchWithRetry(
        (token) =>
          brandMemoriesApi.create(token, projectId, { contentMarkdown: content }),
        getToken
      );
      setCurrent(created);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      scrollable
      title={t('brandMemory.title')}
      description={t('brandMemory.subtitle')}
      headerActions={
        <Badge variant="outline" className="gap-1.5">
          <span className="size-2 animate-pulse rounded-full bg-green-500" />
          {t('brandMemory.live')}
        </Badge>
      }
    >
      {loading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('brandMemory.editorTitle')}</CardTitle>
            {current && (
              <Badge variant="secondary">
                {t('brandMemory.version', { version: current.version })}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('brandMemory.placeholder')}
              rows={20}
              className="font-mono text-sm"
              disabled={!canWrite}
            />
            {canWrite && (
              <Button onClick={() => void handleSave()} disabled={saving || !content.trim()}>
                {saving ? t('brandMemory.saving') : t('brandMemory.saveVersion')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
