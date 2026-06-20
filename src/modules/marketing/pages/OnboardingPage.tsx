import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { onboardingApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { t } from '@/core/i18n';
import type { OnboardingStatus } from '@/modules/marketing/types/api';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Textarea } from '@/design-system/components/ui/textarea';
import { Skeleton } from '@/design-system/components/ui/skeleton';

export function OnboardingPage() {
  const { projectId = '' } = useParams();
  const { getToken, canWrite } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus>('NOT_STARTED');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetchWithRetry(
        (token) => onboardingApi.getStatus(token, projectId),
        getToken
      );
      setStatus(res.status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [projectId, getToken]);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      const res = await apiFetchWithRetry(
        (token) => onboardingApi.answer(token, projectId, { answer }),
        getToken
      );
      setStatus(res.status);
      setAnswer('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CrmPageShell>
      <PageHeader
        title={t('onboarding.title')}
        description={t('onboarding.subtitle')}
      />
      {loading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('onboarding.statusTitle')}</CardTitle>
            <Badge variant={status === 'COMPLETE' ? 'default' : 'secondary'}>
              {t(`onboardingStatus.${status}`)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('onboarding.prompt')}
            </p>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t('onboarding.placeholder')}
              rows={6}
              disabled={!canWrite || status === 'COMPLETE'}
            />
            {canWrite && status !== 'COMPLETE' && (
              <Button
                onClick={() => void handleSubmit()}
                disabled={submitting || !answer.trim()}
              >
                {submitting ? t('onboarding.submitting') : t('onboarding.submit')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </CrmPageShell>
  );
}
