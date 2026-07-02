import type { SocialPlatform } from '@/modules/marketing/api/use-social-posts';

export interface SocialComposeBrief {
  platform: SocialPlatform;
  topic: string;
  brief?: string;
}

export function buildSocialDraftContent({ platform, topic, brief }: SocialComposeBrief): string {
  const platformLabel = platform.replace(/_/g, ' ');
  const lines = [`Topic: ${topic.trim()}`];
  if (brief?.trim()) lines.push(`Brief: ${brief.trim()}`);
  lines.push('', `[Draft your ${platformLabel} post here — use brand memory for tone and structure.]`);
  return lines.join('\n');
}

export function buildSocialAiPrompt({ platform, topic, brief }: SocialComposeBrief): string {
  const platformLabel = platform.replace(/_/g, ' ');
  const parts = [
    `Draft a ${platformLabel} post for our brand.`,
    '',
    `Topic: ${topic.trim()}`,
  ];
  if (brief?.trim()) parts.push(`Brief: ${brief.trim()}`);
  parts.push(
    '',
    'Use our brand memory and identity for voice, tone, and structure.',
    `If brand memory includes a "${platformLabel} post style" section, follow it exactly.`,
    'Return only the post copy ready to publish.',
  );
  return parts.join('\n');
}

export function buildThreadTitle(platform: SocialPlatform, topic: string): string {
  const label = platform === 'X' ? 'X' : platform.charAt(0) + platform.slice(1).toLowerCase();
  return `${label} — ${topic.trim()}`;
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
