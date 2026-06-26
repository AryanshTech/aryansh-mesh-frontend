import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { normalizeList } from '@/modules/marketing/api/marketing-utils';

export type AssetType = 'IMAGE' | 'VIDEO' | 'REMOTION_PROJECT' | 'PROMPT_PACK' | 'OTHER';
export type ToolType = string;
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type RunStatus =
  | 'PLANNED'
  | 'READY_TO_RUN_LOCALLY'
  | 'RUNNING_LOCALLY'
  | 'UPLOADED'
  | 'APPROVED'
  | 'REJECTED';

export interface CreativeRecipe {
  id: string;
  projectId: string;
  title: string;
  goal: string;
  channel: string;
  assetType: AssetType;
  toolType: ToolType;
  promptMarkdown: string;
  setupCommands: string[];
  runCommands: string[];
  expectedOutputs: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreativeRecipeInput {
  title: string;
  goal: string;
  channel: string;
  assetType: AssetType;
  toolType: ToolType;
  promptMarkdown?: string;
  setupCommands?: string[];
  runCommands?: string[];
  expectedOutputs?: string[];
}

export interface LocalPackageInput {
  goal: string;
  channel: string;
  assetType: AssetType;
  toolType: ToolType;
}

export interface CreativeRun {
  id: string;
  projectId: string;
  recipeId: string;
  status: RunStatus;
  localExecutorNotes: string;
  assetIds: string[];
  sourcePrompt: string;
  resultSummary: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreativeRunInput {
  recipeId: string;
}

export interface CreativeRunPatchInput {
  status?: RunStatus;
  localExecutorNotes?: string;
  resultSummary?: string;
}

export interface CreativeAsset {
  id: string;
  projectId: string;
  runId: string | null;
  assetType: AssetType;
  label: string;
  url: string;
  attachmentId: string | null;
  approvalStatus: ApprovalStatus;
  metadata: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreativeAssetUrlInput {
  runId?: string;
  assetType: AssetType;
  label: string;
  url: string;
  attachmentId?: string;
  metadata?: Record<string, unknown>;
}

export interface CreativeAssetUploadInput {
  file: File;
  label: string;
  runId?: string;
  assetType?: AssetType;
}

export const creativeKeys = {
  recipes: (projectId: string) => ['marketing', 'creative', 'recipes', projectId] as const,
  runs: (projectId: string) => ['marketing', 'creative', 'runs', projectId] as const,
  assets: (projectId: string) => ['marketing', 'creative', 'assets', projectId] as const,
};

function creativeRoot(projectId: string, tenantId?: string): string {
  return tenantId
    ? `/tenants/${tenantId}/marketing/creative`
    : `/projects/${projectId}/creative`;
}

// Recipes
export function useCreativeRecipes(projectId: string | undefined, tenantId?: string) {
  return useQuery({
    queryKey: creativeKeys.recipes(projectId ?? ''),
    queryFn: () =>
      api.get<CreativeRecipe[] | { items?: CreativeRecipe[] }>(
        `${creativeRoot(projectId!, tenantId)}/recipes`,
      ),
    enabled: !!projectId,
    select: normalizeList,
  });
}

export function useCreateCreativeRecipe(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreativeRecipeInput) =>
      api.post<CreativeRecipe>(`${creativeRoot(projectId, tenantId)}/recipes`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: creativeKeys.recipes(projectId) });
    },
  });
}

export function useGenerateLocalPackage(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LocalPackageInput) =>
      api.post<CreativeRecipe>(`${creativeRoot(projectId, tenantId)}/local-packages`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: creativeKeys.recipes(projectId) });
    },
  });
}

// Runs
export function useCreativeRuns(projectId: string | undefined, tenantId?: string) {
  return useQuery({
    queryKey: creativeKeys.runs(projectId ?? ''),
    queryFn: () =>
      api.get<CreativeRun[] | { items?: CreativeRun[] }>(
        `${creativeRoot(projectId!, tenantId)}/runs`,
      ),
    enabled: !!projectId,
    select: normalizeList,
  });
}

export function useCreateCreativeRun(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreativeRunInput) =>
      api.post<CreativeRun>(`${creativeRoot(projectId, tenantId)}/runs`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: creativeKeys.runs(projectId) });
    },
  });
}

export function useUpdateCreativeRun(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ runId, input }: { runId: string; input: CreativeRunPatchInput }) =>
      api.patch<CreativeRun>(`${creativeRoot(projectId, tenantId)}/runs/${runId}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: creativeKeys.runs(projectId) });
    },
  });
}

// Assets
export function useCreativeAssets(projectId: string | undefined, tenantId?: string) {
  return useQuery({
    queryKey: creativeKeys.assets(projectId ?? ''),
    queryFn: () =>
      api.get<CreativeAsset[] | { items?: CreativeAsset[] }>(
        `${creativeRoot(projectId!, tenantId)}/assets`,
      ),
    enabled: !!projectId,
    select: normalizeList,
  });
}

export function useCreateCreativeAssetFromUrl(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreativeAssetUrlInput) =>
      api.post<CreativeAsset>(`${creativeRoot(projectId, tenantId)}/assets`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: creativeKeys.assets(projectId) });
    },
  });
}

export function useUploadCreativeAsset(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreativeAssetUploadInput) => {
      const form = new FormData();
      form.append('file', input.file);
      form.append('label', input.label);
      if (input.runId) form.append('runId', input.runId);
      if (input.assetType) form.append('assetType', input.assetType);
      return api.upload<CreativeAsset>(
        `${creativeRoot(projectId, tenantId)}/assets/upload`,
        form,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: creativeKeys.assets(projectId) });
      void qc.invalidateQueries({ queryKey: creativeKeys.runs(projectId) });
    },
  });
}

export function useUpdateCreativeAssetStatus(projectId: string, tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ assetId, approvalStatus }: { assetId: string; approvalStatus: ApprovalStatus }) =>
      api.patch<CreativeAsset>(
        `${creativeRoot(projectId, tenantId)}/assets/${assetId}/status`,
        { approvalStatus },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: creativeKeys.assets(projectId) });
      void qc.invalidateQueries({ queryKey: creativeKeys.runs(projectId) });
      void qc.invalidateQueries({ queryKey: ['marketing', 'brand-memory', projectId] });
    },
  });
}
