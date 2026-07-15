import type { BrandIdentity } from '@/modules/marketing/api/use-brand-identity';

export interface BrandContextInput {
  memoryMarkdown?: string | null;
  identity?: BrandIdentity | null;
  /** Soft cap for memory body (keeps prompts within model limits). */
  maxMemoryChars?: number;
}

function pickColors(identity: BrandIdentity | null | undefined): string {
  const colors = identity?.colors;
  if (!colors) return '';
  return [
    colors.primary && `primary ${colors.primary}`,
    colors.secondary && `secondary ${colors.secondary}`,
    colors.accent && `accent ${colors.accent}`,
    colors.background && `background ${colors.background}`,
    colors.surface && `surface ${colors.surface}`,
    colors.text && `text ${colors.text}`,
  ]
    .filter(Boolean)
    .join(', ');
}

function pickTypography(identity: BrandIdentity | null | undefined): string {
  const typography = identity?.typography;
  if (!typography) return '';
  return [
    typography.heading && `heading: ${typography.heading}`,
    typography.body && `body: ${typography.body}`,
    typography.caption && `caption: ${typography.caption}`,
    typography.rules && `rules: ${typography.rules}`,
  ]
    .filter(Boolean)
    .join('; ');
}

/**
 * Shared brand block for captions, images, comments, profiles, and recipes.
 * Brand memory is source of truth; Look/identity adds visual + structured fields.
 */
export function formatBrandContextForPrompt(input: BrandContextInput): string {
  const maxMemory = input.maxMemoryChars ?? 8000;
  const memory = (input.memoryMarkdown ?? '').trim();
  const identity = input.identity ?? null;
  const parts: string[] = [
    '## Brand context (mandatory)',
    'Follow this brand memory and visual identity for every output.',
    'Prefer brand memory when it conflicts with short identity fields.',
    'Do not invent another company, category, or product line.',
  ];

  if (memory) {
    const clipped =
      memory.length > maxMemory ? `${memory.slice(0, maxMemory)}\n…[truncated]` : memory;
    parts.push('', '### Brand memory', clipped);
  } else {
    parts.push('', '### Brand memory', '(Not set — use identity only if present; avoid generic filler.)');
  }

  if (identity) {
    parts.push('', '### Visual identity / Look');
    if (identity.visualStyle?.trim()) parts.push(`- Visual style: ${identity.visualStyle.trim()}`);
    if (identity.motionStyle?.trim()) parts.push(`- Motion: ${identity.motionStyle.trim()}`);
    const colorLine = pickColors(identity);
    if (colorLine) parts.push(`- Colors: ${colorLine}`);
    const typeLine = pickTypography(identity);
    if (typeLine) parts.push(`- Typography: ${typeLine}`);
    if (identity.voiceTone?.trim()) parts.push(`- Voice: ${identity.voiceTone.trim()}`);
    if (identity.mission?.trim()) parts.push(`- Mission: ${identity.mission.trim()}`);
    if (identity.vision?.trim()) parts.push(`- Vision: ${identity.vision.trim()}`);
    if (identity.audience?.trim()) parts.push(`- Audience: ${identity.audience.trim()}`);
    if (identity.values?.length) parts.push(`- Values: ${identity.values.join(', ')}`);
    if (identity.contentPillars?.length) {
      parts.push(`- Pillars: ${identity.contentPillars.join(', ')}`);
    }
    if (identity.doRules?.length) {
      parts.push(`- Do: ${identity.doRules.slice(0, 8).join('; ')}`);
    }
    if (identity.dontRules?.length) {
      parts.push(`- Don't: ${identity.dontRules.slice(0, 8).join('; ')}`);
    }
  } else {
    parts.push('', '### Visual identity / Look', '(Not set — infer carefully from brand memory Visual identity section if present.)');
  }

  return parts.join('\n');
}

export function withBrandContext(prompt: string, brandContext: string): string {
  const body = prompt.trim();
  const ctx = brandContext.trim();
  if (!ctx) return body;
  if (!body) return ctx;
  return `${body}\n\n${ctx}`;
}
