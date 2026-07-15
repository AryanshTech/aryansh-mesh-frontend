import {
  formatBrandContextForPrompt,
  withBrandContext,
} from '@/modules/marketing/lib/brand-context';
import type { BrandIdentity } from '@/modules/marketing/api/use-brand-identity';

export type VideoPlanFormat = 'product_reel' | 'founders';
export type VideoPlanScope = 'whole_product' | 'feature';
export type VideoPlanAspect = 'landscape' | 'reel';

export interface VideoPlanBrief {
  format: VideoPlanFormat;
  scope: VideoPlanScope;
  featureName?: string;
  aspect: VideoPlanAspect;
  brief: string;
  lengthSeconds?: number;
}

export function isVideoRecipe(recipe?: {
  assetType?: string | null;
  toolType?: string | null;
  channel?: string | null;
  title?: string | null;
  promptMarkdown?: string | null;
} | null): boolean {
  if (!recipe) return false;
  const asset = (recipe.assetType ?? '').toUpperCase();
  if (asset === 'VIDEO' || asset === 'REMOTION_PROJECT') return true;
  const tool = (recipe.toolType ?? '').toLowerCase();
  if (tool.includes('remotion') || tool === 'video') return true;
  const channel = (recipe.channel ?? '').toLowerCase();
  if (channel.includes('video') || channel.includes('remotion') || channel.includes('reel') || channel.includes('founder')) {
    return true;
  }
  const blob = `${recipe.title ?? ''}\n${recipe.promptMarkdown ?? ''}`.toLowerCase();
  return (
    blob.includes('remotion') ||
    blob.includes('video script package') ||
    blob.includes('founders video') ||
    blob.includes('product reel')
  );
}

export function isVideoRun(
  run?: { sourcePrompt?: string | null; resultSummary?: string | null } | null,
  recipe?: Parameters<typeof isVideoRecipe>[0],
): boolean {
  if (isVideoRecipe(recipe)) return true;
  if (!run) return false;
  const blob = `${run.sourcePrompt ?? ''}\n${run.resultSummary ?? ''}`.toLowerCase();
  return (
    blob.includes('remotion') ||
    blob.includes('## video script package') ||
    blob.includes('## founders video script') ||
    blob.includes('video / reel plan') ||
    blob.includes('product reel')
  );
}

export function buildVideoPlanPrompt(
  input: VideoPlanBrief,
  brand?: { memoryMarkdown?: string | null; identity?: BrandIdentity | null },
): string {
  const length =
    input.lengthSeconds ??
    (input.format === 'founders' ? 60 : 35);
  const aspectLabel =
    input.aspect === 'reel' ? 'Reel 9:16 (1080×1920)' : 'Landscape 16:9 (1920×1080)';
  const scopeLine =
    input.scope === 'feature'
      ? `Scope: Particular feature — ${input.featureName?.trim() || '(name the feature from the brief)'}`
      : 'Scope: Whole product';

  const parts: string[] = [];
  if (input.format === 'founders') {
    parts.push(
      'Plan a founders dialogue video package for our brand (Remotion + ElevenLabs dual VO).',
      '',
      scopeLine,
      `Aspect: ${aspectLabel}`,
      `Target length: ~${length} seconds`,
      '',
      'Brief / inputs:',
      input.brief.trim(),
      '',
      'Return a single markdown document with exactly these H2 sections:',
      '## Founders video script',
      '## Interstitial prompts',
      '## Remotion generation prompt',
      '',
      'Follow the founders-video skill. No preamble. No code fence around the whole document.',
    );
  } else {
    parts.push(
      'Plan a product / feature Remotion video for our brand.',
      '',
      scopeLine,
      `Aspect: ${aspectLabel}`,
      `Target length: ~${length} seconds`,
      '',
      'Brief / inputs:',
      input.brief.trim(),
      '',
      'Return a single markdown document with exactly these H2 sections:',
      '## Video script package',
      '## Remotion generation prompt',
      '',
      'Follow the remotion-product-video skill. No preamble. No code fence around the whole document.',
    );
  }

  const brandContext = formatBrandContextForPrompt({
    memoryMarkdown: brand?.memoryMarkdown,
    identity: brand?.identity ?? null,
  });
  return withBrandContext(parts.join('\n'), brandContext);
}

export function videoPlanTitle(input: VideoPlanBrief): string {
  if (input.format === 'founders') {
    return 'Founders video plan';
  }
  if (input.scope === 'feature' && input.featureName?.trim()) {
    return `Feature reel — ${input.featureName.trim()}`;
  }
  return input.aspect === 'reel' ? 'Product reel plan' : 'Product video plan';
}

export interface MarkdownSection {
  heading: string;
  body: string;
}

/** Split markdown on H2 headings (`## `). Leading content without H2 becomes untitled. */
export function splitMarkdownSections(markdown: string): MarkdownSection[] {
  const text = markdown.trim();
  if (!text) return [];
  const lines = text.split('\n');
  const sections: MarkdownSection[] = [];
  let heading = '';
  let bodyLines: string[] = [];

  const push = () => {
    const body = bodyLines.join('\n').trim();
    if (!heading && !body) return;
    sections.push({ heading: heading || 'Package', body });
  };

  for (const line of lines) {
    const match = /^##\s+(.+)$/.exec(line);
    if (match) {
      push();
      heading = match[1].trim();
      bodyLines = [];
    } else {
      bodyLines.push(line);
    }
  }
  push();
  return sections;
}

export function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
