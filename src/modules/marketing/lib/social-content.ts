import type { SocialPlatform } from '@/modules/marketing/api/use-social-posts';
import type { GenerationBrief, GenerationFormat } from '@/modules/marketing/lib/run-notes';

export interface SocialComposeBrief {
  platform: SocialPlatform;
  topic: string;
  brief?: string;
  angle?: string;
  audience?: string;
  cta?: string;
  tone?: string;
  format?: GenerationFormat;
}

export function buildSocialDraftContent({ platform, topic, brief }: SocialComposeBrief): string {
  const platformLabel = platform.replace(/_/g, ' ');
  const lines = [`Topic: ${topic.trim()}`];
  if (brief?.trim()) lines.push(`Brief: ${brief.trim()}`);
  lines.push('', `[Draft your ${platformLabel} post here — use brand memory for tone and structure.]`);
  return lines.join('\n');
}

export function buildSocialAiPrompt({
  platform,
  topic,
  brief,
  angle,
  audience,
  cta,
  tone,
  format = 'single',
}: SocialComposeBrief): string {
  const platformLabel = platform.replace(/_/g, ' ');
  const parts = [
    format === 'week'
      ? `Draft a Mon–Fri ${platformLabel} content queue for our brand.`
      : `Draft a ${platformLabel} post for our brand.`,
    '',
    `Topic (required — write about this, do not invent a random topic): ${topic.trim()}`,
  ];
  if (angle?.trim()) parts.push(`Angle / key message: ${angle.trim()}`);
  if (brief?.trim()) parts.push(`Brief / details: ${brief.trim()}`);
  if (audience?.trim()) parts.push(`Audience: ${audience.trim()}`);
  if (cta?.trim()) parts.push(`Call to action: ${cta.trim()}`);
  if (tone?.trim()) parts.push(`Tone: ${tone.trim()}`);
  parts.push(
    '',
    'Follow the brand memory and visual identity block (appended separately) as source of truth.',
    `If brand memory includes a "${platformLabel} post style" section, follow it exactly.`,
    'Stay tightly on the given topic and angle — do not switch subjects.',
    'Do not invent another company, category, or product line.',
  );
  if (format === 'week') {
    parts.push(
      'Return five days Mon–Fri using ---POST--- blocks with Day, Type, Caption, and Image lines.',
      'No JSON and no PROMPT_PACK wrapper.',
    );
  } else {
    parts.push(
      'Return ONLY the post body ready to paste into the platform.',
      'No preamble ("Here is…"), no **Post Copy** title, no markdown fences, max 3 hashtags.',
    );
  }
  return parts.join('\n');
}

/** Build / refresh the Vertex prompt from the Create customization panel. */
export function buildPromptFromGenerationBrief(
  channel: string,
  brief: GenerationBrief,
): string {
  const platform = channelToSocialPlatform(channel);
  return buildSocialAiPrompt({
    platform,
    topic: brief.topic,
    angle: brief.angle,
    audience: brief.audience,
    cta: brief.cta,
    tone: brief.tone,
    format: brief.format,
  });
}

function channelToSocialPlatform(channel: string): SocialPlatform {
  const c = channel.trim().toLowerCase();
  if (c.includes('instagram')) return 'INSTAGRAM';
  if (c.includes('linkedin')) return 'LINKEDIN';
  if (c === 'x' || c.includes('twitter')) return 'X';
  if (c.includes('facebook')) return 'FACEBOOK';
  if (c.includes('youtube')) return 'YOUTUBE';
  return 'LINKEDIN';
}

export function buildThreadTitle(platform: SocialPlatform, topic: string): string {
  const label = platform === 'X' ? 'X' : platform.charAt(0) + platform.slice(1).toLowerCase();
  return `${label} — ${topic.trim()}`;
}

/** Prefer human titles over local-package metadata like "vertex prompt_pack…". */
export function displayRecipeTitle(recipe?: {
  title?: string | null;
  goal?: string | null;
  channel?: string | null;
} | null): string {
  if (!recipe) return 'Post';
  const title = recipe.title?.trim() ?? '';
  if (!title || /prompt[_ ]?pack|vertex|package for|local.?package/i.test(title)) {
    const goal = recipe.goal?.trim();
    if (goal) return goal.length > 72 ? `${goal.slice(0, 72)}…` : goal;
    return recipe.channel?.trim() || 'Post';
  }
  return title;
}

/** Draft LinkedIn engagement replies for a post (or a prospect's post). */
export function buildLinkedInCommentPrompt(input: {
  postCaption: string;
  context?: string;
}): string {
  const parts = [
    'You are our LinkedIn community manager for THIS brand only.',
    'Write 4 short, high-signal LinkedIn comment drafts we can post under relevant posts.',
    'Match voice, audience, and product from brand memory / identity (appended separately).',
    '',
    'Our post / thread context:',
    input.postCaption.trim(),
  ];
  if (input.context?.trim()) {
    parts.push('', 'Extra context:', input.context.trim());
  }
  parts.push(
    '',
    'Rules:',
    '- Professional, warm, specific — no generic “Great post!”',
    '- Stay on-brand; do not invent another company or category',
    '- 1–3 sentences each; ask a thoughtful question or add a useful insight',
    '- Match B2B LinkedIn norms; no hashtags in comments',
    '- Number them 1–4',
    '- Return only the comment drafts',
  );
  return parts.join('\n');
}

const STYLE_SECTION = /^## .+ post style/m;

export function appendPlatformStyleToMemory(
  existingMarkdown: string,
  platform: SocialPlatform,
  postContent: string,
): string {
  const platformLabel = platform === 'INSTAGRAM' ? 'Instagram' : platform === 'LINKEDIN' ? 'LinkedIn' : platform;
  const section = [
    `## ${platformLabel} post style`,
    '',
    `_Updated ${new Date().toLocaleDateString()}_`,
    '',
    'Use this tone and structure for future posts. For new content, only a topic and brief are needed.',
    '',
    '### Example',
    '',
    postContent.trim(),
    '',
  ].join('\n');

  const trimmed = existingMarkdown.trim();
  if (!trimmed) return section;

  const heading = `## ${platformLabel} post style`;
  const idx = trimmed.indexOf(heading);
  if (idx >= 0) {
    const rest = trimmed.slice(idx + heading.length);
    const nextSection = rest.search(/\n## /);
    const before = trimmed.slice(0, idx).trimEnd();
    const after = nextSection >= 0 ? rest.slice(nextSection + 1).trimStart() : '';
    return [before, section, after].filter(Boolean).join('\n\n');
  }

  if (STYLE_SECTION.test(trimmed)) {
    return `${trimmed}\n\n${section}`;
  }

  return `${trimmed}\n\n${section}`;
}
