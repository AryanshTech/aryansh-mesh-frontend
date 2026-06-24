import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/core/api/client';
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

// Recipes
export function useCreativeRecipes(projectId: string | undefined) {
  return useQuery({
    queryKey: creativeKeys.recipes(projectId ?? ''),
    queryFn: () =>
      api.get<CreativeRecipe[] | { items?: CreativeRecipe[] }>(
        `/projects/${projectId!}/creative/recipes`,
      ),
    enabled: !!projectId,
    select: normalizeList,
  });
}

export function useCreateCreativeRecipe(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreativeRecipeInput) =>
      api.post<CreativeRecipe>(`/projects/${projectId}/creative/recipes`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: creativeKeys.recipes(projectId) });
    },
  });
}

export function useGenerateLocalPackage(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LocalPackageInput) =>
      api.post<CreativeRecipe>(`/projects/${projectId}/creative/local-packages`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: creativeKeys.recipes(projectId) });
    },
  });
}

// Runs
export function useCreativeRuns(projectId: string | undefined) {
  return useQuery({
    queryKey: creativeKeys.runs(projectId ?? ''),
    queryFn: () =>
      api.get<CreativeRun[] | { items?: CreativeRun[] }>(
        `/projects/${projectId!}/creative/runs`,
      ),
    enabled: !!projectId,
    select: normalizeList,
  });
}

export function useCreateCreativeRun(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreativeRunInput) =>
      api.post<CreativeRun>(`/projects/${projectId}/creative/runs`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: creativeKeys.runs(projectId) });
    },
  });
}

export function useUpdateCreativeRun(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ runId, input }: { runId: string; input: CreativeRunPatchInput }) =>
      api.patch<CreativeRun>(`/projects/${projectId}/creative/runs/${runId}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: creativeKeys.runs(projectId) });
    },
  });
}

// Assets
export function useCreativeAssets(projectId: string | undefined) {
  return useQuery({
    queryKey: creativeKeys.assets(projectId ?? ''),
    queryFn: () =>
      api.get<CreativeAsset[] | { items?: CreativeAsset[] }>(
        `/projects/${projectId!}/creative/assets`,
      ),
    enabled: !!projectId,
    select: normalizeList,
  });
}

export function useCreateCreativeAssetFromUrl(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreativeAssetUrlInput) =>
      api.post<CreativeAsset>(`/projects/${projectId}/creative/assets`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: creativeKeys.assets(projectId) });
    },
  });
}

export function useUploadCreativeAsset(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreativeAssetUploadInput) => {
      const form = new FormData();
      form.append('file', input.file);
      form.append('label', input.label);
      if (input.runId) form.append('runId', input.runId);
      if (input.assetType) form.append('assetType', input.assetType);
      return api.upload<CreativeAsset>(
        `/projects/${projectId}/creative/assets/upload`,
        form,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: creativeKeys.assets(projectId) });
      void qc.invalidateQueries({ queryKey: creativeKeys.runs(projectId) });
    },
  });
}

export function useUpdateCreativeAssetStatus(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ assetId, approvalStatus }: { assetId: string; approvalStatus: ApprovalStatus }) =>
      api.patch<CreativeAsset>(
        `/projects/${projectId}/creative/assets/${assetId}/status`,
        { approvalStatus },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: creativeKeys.assets(projectId) });
      void qc.invalidateQueries({ queryKey: creativeKeys.runs(projectId) });
      void qc.invalidateQueries({ queryKey: ['marketing', 'brand-memory', projectId] });
    },
  });
}
