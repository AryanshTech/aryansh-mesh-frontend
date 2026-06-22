import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { brandMemoriesApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageAsyncShell } from '@/shared/components/crm/PageAsyncShell';
import { LinearPageHeader } from '@/shared/components/linear';
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
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetchWithRetry(
        (token) => brandMemoriesApi.getCurrent(token, projectId),
        getToken
      );
      setCurrent(res);
      setContent(res?.contentMarkdown ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.network'));
    } finally {
      setLoading(false);
    }
  }, [projectId, getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const created = await apiFetchWithRetry(
        (token) =>
          brandMemoriesApi.create(token, projectId, { contentMarkdown: content }),
        getToken
      );
      setCurrent(created);
      toast.success(t('brandMemory.saveSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.network'));
    } finally {
      setSaving(false);
    }
  };

  const skeleton = <Skeleton className="h-96 w-full rounded-lg" />;

  return (
    <CrmPageShell>
      <LinearPageHeader
        title={t('brandMemory.title')}
        description={t('brandMemory.subtitle')}
        actions={
          <Badge variant="outline" className="gap-1.5">
            <span className="size-2 animate-pulse rounded-full bg-success" />
            {t('brandMemory.live')}
          </Badge>
        }
      />
      <PageAsyncShell
        loading={loading}
        error={error}
        errorDescription={error ?? undefined}
        onRetry={() => void load()}
        skeleton={skeleton}
      >
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
      </PageAsyncShell>
    </CrmPageShell>
  );
}
