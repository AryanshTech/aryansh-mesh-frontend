import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CalendarIcon,
  EyeIcon,
  FileTextIcon,
  FolderKanbanIcon,
  MessageSquareIcon,
  PenLineIcon,
  UsersIcon,
} from 'lucide-react';
import { agentJobsApi, onboardingApi, projectsApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { AgentPipelineViz } from '@/modules/marketing/components/studio/AgentPipelineViz';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { PageHeader } from '@/shared/components/crm/PageHeader';
import { t } from '@/core/i18n';
import type { AgentJobResponse, OnboardingStatus, ProjectResponse } from '@/modules/marketing/types/api';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import { cn } from '@/design-system/lib/utils';

const GTM_STEPS = [
  { key: 'onboarding', path: 'onboarding', statusKey: 'onboarding' as const },
  { key: 'spy', path: 'spy', statusKey: 'spy' as const },
  { key: 'brandMemory', path: 'brand-memory', statusKey: 'brandMemory' as const },
  { key: 'content', path: 'content', statusKey: 'content' as const },
  { key: 'social', path: 'social', statusKey: 'social' as const },
  { key: 'crm', path: 'crm', statusKey: 'crm' as const },
] as const;

const QUICK_ACTIONS = [
  { key: 'runSpy', workflow: 'RUN_SPY' as const, icon: EyeIcon },
  { key: 'writeBlog', workflow: 'WRITE_BLOG_POST' as const, icon: MessageSquareIcon },
  { key: 'scheduleSocial', workflow: 'SCHEDULE_SOCIAL_WEEK' as const, icon: CalendarIcon },
] as const;

function stepComplete(status: OnboardingStatus, index: number): boolean {
  if (status === 'COMPLETE') return true;
  if (status === 'NOT_STARTED') return false;
  return index < 2;
}

export function ProjectDashboardPage() {
  const { projectId = '' } = useParams();
  const { getToken, canWrite } = useAuth();
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [jobs, setJobs] = useState<AgentJobResponse[]>([]);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>('NOT_STARTED');
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [projectRes, statusRes, jobsRes] = await Promise.all([
        apiFetchWithRetry((token) => projectsApi.get(token, projectId), getToken),
        apiFetchWithRetry((token) => onboardingApi.getStatus(token, projectId), getToken),
        apiFetchWithRetry((token) => agentJobsApi.list(token, projectId), getToken),
      ]);
      setProject(projectRes);
      setOnboardingStatus(statusRes.status);
      setJobs(jobsRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [projectId, getToken]);

  const handleTrigger = async (workflow: typeof QUICK_ACTIONS[number]['workflow']) => {
    setTriggering(workflow);
    try {
      await apiFetchWithRetry(
        (token) => agentJobsApi.trigger(token, projectId, { workflowId: workflow }),
        getToken
      );
      await load();
    } finally {
      setTriggering(null);
    }
  };

  const recentJobs = jobs.slice(0, 5);

  return (
    <CrmPageShell>
      <PageHeader
        title={project?.name ?? t('projectDashboard.title')}
        description={t('projectDashboard.subtitle')}
      />
      {loading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t('projectDashboard.agentPipeline')}</CardTitle>
            </CardHeader>
            <CardContent>
              <AgentPipelineViz jobs={jobs} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('projectDashboard.gtmChain')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2">
                {GTM_STEPS.map((step, index) => {
                  const done = stepComplete(onboardingStatus, index);
                  return (
                    <div key={step.key} className="flex items-center gap-2">
                      <Link
                        to={`/marketing/projects/${projectId}/${step.path}`}
                        className={cn(
                          'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
                          done
                            ? 'border-primary/30 bg-primary/10'
                            : 'border-border hover:bg-secondary'
                        )}
                      >
                        <span
                          className={cn(
                            'size-2 rounded-full',
                            done ? 'bg-primary' : 'bg-muted-foreground'
                          )}
                        />
                        {t(`projectDashboard.steps.${step.key}`)}
                      </Link>
                      {index < GTM_STEPS.length - 1 && (
                        <span className="text-muted-foreground">→</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('projectDashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map(({ key, workflow, icon: Icon }) => (
              <Button
                key={key}
                size="sm"
                disabled={!canWrite || triggering === workflow}
                onClick={() => void handleTrigger(workflow)}
              >
                <Icon data-icon="inline-start" />
                {triggering === workflow
                  ? t('projectDashboard.running')
                  : t(`projectDashboard.actions.${key}`)}
              </Button>
            ))}
          </CardContent>
        </Card>

        <div className="spotlight-card p-6">
          <h3 className="font-display text-lg font-semibold">
            {t('projectDashboard.cadenceTitle')}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('projectDashboard.cadenceDescription')}
          </p>
          <div className="mt-4 flex gap-2">
            <Badge variant="secondary">{t('projectDashboard.cadenceBlog')}</Badge>
            <Badge variant="secondary">{t('projectDashboard.cadenceSocial')}</Badge>
            <Badge variant="secondary">{t('projectDashboard.cadenceSpy')}</Badge>
          </div>
          <Button className="mt-4" variant="outline" size="sm" asChild>
            <Link to={`/marketing/projects/${projectId}/social`}>
              <CalendarIcon data-icon="inline-start" />
              {t('projectDashboard.viewCalendar')}
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('projectDashboard.recentJobs')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : recentJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('projectDashboard.noJobs')}
            </p>
          ) : (
            <ul className="space-y-2">
              {recentJobs.map((job) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <span>{t(`workflows.${job.workflowId}`)}</span>
                  <Badge variant="outline">{t(`jobStatus.${job.status}`)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/marketing/projects/${projectId}/studio`}>
            <FolderKanbanIcon data-icon="inline-start" />
            {t('nav.studio')}
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/marketing/projects/${projectId}/workspace`}>
            <PenLineIcon data-icon="inline-start" />
            {t('projectDashboard.openWorkspace')}
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/marketing/projects/${projectId}/onboarding`}>
            <FileTextIcon data-icon="inline-start" />
            {t('nav.onboarding')}
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/marketing/projects/${projectId}/crm`}>
            <UsersIcon data-icon="inline-start" />
            {t('nav.crm')}
          </Link>
        </Button>
      </div>
    </CrmPageShell>
  );
}
