import { t } from '@/core/i18n';
import type { AgentJobResponse, AgentJobStatus, WorkflowId } from '@/modules/marketing/types/api';
import { Badge } from '@/design-system/components/ui/badge';
import { cn } from '@/design-system/lib/utils';

const PIPELINE_STEPS = [
  { key: 'onboarding', workflowIds: ['SETUP_BRAND_CONTEXT'] as WorkflowId[] },
  { key: 'spy', workflowIds: ['RUN_SPY'] as WorkflowId[] },
  { key: 'brandMemory', workflowIds: ['UPDATE_BRAND_MEMORY'] as WorkflowId[] },
  {
    key: 'content',
    workflowIds: ['WRITE_BLOG_POST', 'CREATE_VIDEO_BRIEF'] as WorkflowId[],
  },
  { key: 'social', workflowIds: ['SCHEDULE_SOCIAL_WEEK'] as WorkflowId[] },
  { key: 'creative', workflowIds: ['CREATE_AD_CREATIVE'] as WorkflowId[] },
] as const;

function statusVariant(
  status: AgentJobStatus | null
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'COMPLETED':
      return 'default';
    case 'RUNNING':
    case 'QUEUED':
      return 'secondary';
    case 'FAILED':
      return 'destructive';
    case 'PARTIAL':
      return 'outline';
    default:
      return 'outline';
  }
}

function latestJobForStep(
  jobs: AgentJobResponse[],
  workflowIds: WorkflowId[]
): AgentJobResponse | null {
  const matches = jobs.filter((job) => workflowIds.includes(job.workflowId));
  if (matches.length === 0) return null;
  return matches.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  )[0];
}

interface AgentPipelineVizProps {
  jobs: AgentJobResponse[];
}

export function AgentPipelineViz({ jobs }: AgentPipelineVizProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PIPELINE_STEPS.map((step, index) => {
        const job = latestJobForStep(jobs, step.workflowIds);
        const status = job?.status ?? null;

        return (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={cn(
                'flex flex-col gap-1 rounded-lg border border-border bg-card px-3 py-2',
                status === 'COMPLETED' && 'border-primary/30 bg-primary/5',
                status === 'RUNNING' && 'border-ring/40',
                status === 'FAILED' && 'border-destructive/40'
              )}
            >
              <span className="text-sm font-medium">
                {t(`studio.pipeline.steps.${step.key}`)}
              </span>
              <Badge variant={statusVariant(status)}>
                {status
                  ? t(`jobStatus.${status}`)
                  : t('studio.pipeline.notStarted')}
              </Badge>
            </div>
            {index < PIPELINE_STEPS.length - 1 && (
              <span className="text-muted-foreground">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
