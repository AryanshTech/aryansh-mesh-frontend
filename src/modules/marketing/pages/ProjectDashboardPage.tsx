import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Calendar,
  Eye,
  FileText,
  FolderKanban,
  MessageSquare,
  PenLine,
  Radar,
  Rocket,
  Users,
  Video,
} from 'lucide-react';
import { agentJobsApi, onboardingApi, projectsApi } from '@/modules/marketing/api/endpoints';
import { apiFetchWithRetry, useAuth } from '@/core/auth/auth-context';
import { CrmPageShell } from '@/shared/components/crm/CrmPageShell';
import { LinearAiPanel, LinearPageHeader, LinearPhaseStrip } from '@/shared/components/linear';
import { useShellRightRail } from '@/shell/ShellRightRailContext';
import { safeT, t } from '@/core/i18n';
import type { AgentJobResponse, OnboardingStatus, ProjectResponse } from '@/modules/marketing/types/api';
import { Badge } from '@/design-system/components/ui/badge';
import { Button } from '@/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/components/ui/card';
import { Skeleton } from '@/design-system/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/components/ui/table';
import { typographyClasses } from '@/design-system/tokens/typography';
import { layout } from '@/design-system/tokens/layout';
import { cn } from '@/design-system/lib/utils';

const QUICK_ACTIONS = [
  { key: 'runSpy', workflow: 'RUN_SPY' as const, icon: Eye },
  { key: 'writeBlog', workflow: 'WRITE_BLOG_POST' as const, icon: MessageSquare },
  { key: 'scheduleSocial', workflow: 'SCHEDULE_SOCIAL_WEEK' as const, icon: Calendar },
] as const;

const CALENDAR_EVENTS = [
  { id: '1', titleKey: 'linear.project.linkedinPost', time: '09:00 AM' },
  { id: '2', titleKey: 'linear.project.twitterSpace', time: '04:30 PM' },
] as const;

function stepComplete(status: OnboardingStatus, index: number): boolean {
  if (status === 'COMPLETE') return true;
  if (status === 'NOT_STARTED') return false;
  return index < 2;
}

export function ProjectDashboardPage() {
  const { projectId = '' } = useParams();
  const { getToken, canWrite } = useAuth();
  const { setContent } = useShellRightRail();
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [jobs, setJobs] = useState<AgentJobResponse[]>([]);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>('NOT_STARTED');
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'workflow' | 'analytics'>('workflow');

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

  useEffect(() => {
    setContent(<LinearAiPanel projectName={project?.name} />);
    return () => setContent(null);
  }, [project?.name, setContent]);

  const handleTrigger = async (workflow: (typeof QUICK_ACTIONS)[number]['workflow']) => {
    setTriggering(workflow);
    try {
      await apiFetchWithRetry(
        (token) => agentJobsApi.trigger(token, projectId, { workflowId: workflow }),
        getToken,
      );
      await load();
    } finally {
      setTriggering(null);
    }
  };

  const phases = useMemo(
    () => [
      { id: 'spy', phase: t('linear.project.phaseLabel', { n: 1 }), title: t('linear.project.phases.spy'), status: t('linear.project.activeMonitoring'), icon: Eye, active: stepComplete(onboardingStatus, 0), progress: stepComplete(onboardingStatus, 0) ? 100 : 20 },
      { id: 'write', phase: t('linear.project.phaseLabel', { n: 2 }), title: t('linear.project.phases.write'), status: t('linear.project.draftsPending', { count: 4 }), icon: FileText, active: stepComplete(onboardingStatus, 1), progress: stepComplete(onboardingStatus, 1) ? 75 : 0 },
      { id: 'film', phase: t('linear.project.phaseLabel', { n: 3 }), title: t('linear.project.phases.film'), status: t('linear.project.scheduledWed'), icon: Video, active: false, progress: 0 },
      { id: 'publish', phase: t('linear.project.phaseLabel', { n: 4 }), title: t('linear.project.phases.publish'), status: t('linear.project.calendarLocked'), icon: Rocket, active: false, progress: 0 },
    ],
    [onboardingStatus],
  );

  const recentJobs = jobs.slice(0, 5);

  return (
    <CrmPageShell mode="threeColumn">
      <LinearPageHeader
        title={project?.name ?? t('projectDashboard.subtitle')}
        description={t('projectDashboard.subtitle')}
        actions={<Button size="sm">{t('linear.shell.create')}</Button>}
      />
      <nav className="flex items-center gap-4 border-b border-border pb-4" aria-label={t('linear.project.subNav')}>
        {(['workflow', 'analytics'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              typographyClasses.button,
              'border-b pb-1 transition-colors',
              activeTab === tab
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t(`linear.project.${tab}Tab`)}
          </button>
        ))}
      </nav>

      {loading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <>
          <LinearPhaseStrip phases={phases} />

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 flex flex-col gap-6 lg:col-span-7">
              <Card className={layout.linear.hairlineCard}>
                <CardHeader dense className="flex-row items-center justify-between border-b border-border bg-muted/30">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Radar className="text-primary" />
                    {t('linear.project.competitorRadar')}
                  </CardTitle>
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                    {t('linear.project.realtime')}
                  </Badge>
                </CardHeader>
                <CardContent dense>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { label: t('linear.project.competitorA'), action: t('linear.project.counterStrategy') },
                      { label: t('linear.project.redditCommunity'), action: t('linear.project.otmSignal') },
                    ].map(({ label, action }) => (
                      <div key={label} className="rounded-md border border-border bg-muted/30 p-4">
                        <p className={typographyClasses.button}>{label}</p>
                        <p className={cn('mt-2', mutedBodySm)}>{t('linear.project.radarSnippet')}</p>
                        <button type="button" className={cn('mt-3', typographyClasses.caption, 'text-primary hover:underline')}>
                          {action}
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className={layout.linear.hairlineCard}>
                <CardHeader dense className="flex-row items-center justify-between border-b border-border">
                  <CardTitle className="text-sm">{t('linear.project.writingQueue')}</CardTitle>
                  <Button variant="link" size="sm" className="h-auto p-0" asChild>
                    <Link to={`/marketing/projects/${projectId}/content`}>{t('linear.project.reviewAll')}</Link>
                  </Button>
                </CardHeader>
                <CardContent dense className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className={typographyClasses.eyebrowUpper}>{t('linear.project.assetName')}</TableHead>
                        <TableHead className={typographyClasses.eyebrowUpper}>{t('linear.project.tone')}</TableHead>
                        <TableHead className={typographyClasses.eyebrowUpper}>{t('linear.project.status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentJobs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-muted-foreground">
                            {t('projectDashboard.noJobs')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentJobs.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell className="font-medium">
                              {safeT(`workflows.${job.workflowId}`, job.workflowId)}
                            </TableCell>
                            <TableCell>{t('linear.project.thoughtLeader')}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{safeT(`jobStatus.${job.status}`, job.status)}</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-5">
              <Card className={cn(layout.linear.hairlineCard, 'h-full')}>
                <CardHeader dense className="flex-row items-center justify-between border-b border-border bg-muted/30">
                  <CardTitle className="text-sm">{t('linear.project.socialCalendar')}</CardTitle>
                  <span className={typographyClasses.eyebrowUpper}>{t('linear.project.weekLabel')}</span>
                </CardHeader>
                <CardContent dense className="flex flex-col gap-4">
                  <div className="rounded-lg border border-border bg-muted/20 p-4">
                    <p className={cn(typographyClasses.eyebrowUpper, 'text-primary')}>{t('linear.project.calendarDay')}</p>
                    <div className="mt-4 space-y-3">
                      {CALENDAR_EVENTS.map((event) => (
                        <div key={event.id} className="rounded-md border border-border bg-card p-3">
                          <p className={typographyClasses.button}>{t(event.titleKey)}</p>
                          <p className={typographyClasses.caption}>{event.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/20 p-6 text-center">
                    <p className={typographyClasses.eyebrowUpper}>{t('linear.project.publishDensity')}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{t('linear.project.peakEngagement')}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_ACTIONS.map(({ key, workflow, icon: Icon }) => (
                      <Button
                        key={key}
                        size="sm"
                        variant="outline"
                        disabled={!canWrite || triggering === workflow}
                        onClick={() => void handleTrigger(workflow)}
                      >
                        <Icon data-icon="inline-start" />
                        {t(`projectDashboard.actions.${key}`)}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/marketing/projects/${projectId}/studio`}>
                <FolderKanban data-icon="inline-start" />
                {t('nav.studio')}
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/marketing/projects/${projectId}/workspace`}>
                <PenLine data-icon="inline-start" />
                {t('projectDashboard.openWorkspace')}
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/marketing/projects/${projectId}/crm`}>
                <Users data-icon="inline-start" />
                {t('nav.crm')}
              </Link>
            </Button>
          </div>
        </>
      )}
    </CrmPageShell>
  );
}
