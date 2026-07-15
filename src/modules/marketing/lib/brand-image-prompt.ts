import type { BrandIdentity } from '@/modules/marketing/api/use-brand-identity';
import {
  formatBrandContextForPrompt,
  withBrandContext,
} from '@/modules/marketing/lib/brand-context';

export function buildBrandImagePromptRequest(input: {
  channel: string;
  topic: string;
  caption?: string;
  identity: BrandIdentity | null;
  memoryMarkdown?: string | null;
}): string {
  const { channel, topic, caption, identity, memoryMarkdown } = input;

  const parts = [
    `Write ONE ready-to-paste image-generation prompt for a ${channel} post.`,
    '',
    `Topic: ${topic.trim()}`,
  ];
  if (caption?.trim()) {
    parts.push('', 'Caption to support visually:', caption.trim());
  }
  parts.push(
    '',
    'Constraints:',
    channel.toLowerCase().includes('instagram')
      ? '- Aspect: 1:1 square Instagram feed'
      : '- Aspect: platform-native, clean framing',
    '- Match brand visual style, colors, and mood from brand context below',
    '- No watermarks, no unreadable micro-text, no fake logos',
    '- Describe subject, setting, lighting, lens, and color grade',
    '- Return ONLY the image prompt — no preamble',
  );

  const brandContext = formatBrandContextForPrompt({
    memoryMarkdown,
    identity,
    maxMemoryChars: 4000,
  });
  return withBrandContext(parts.join('\n'), brandContext);
}

/** Short visual kit appended to Nano Banana prompts so pixels match Look. */
export function formatVisualKitForImagePrompt(identity: BrandIdentity | null | undefined): string {
  if (!identity) return '';
  const colors = identity.colors;
  const colorLine = colors
    ? [
        colors.primary && `primary ${colors.primary}`,
        colors.secondary && `secondary ${colors.secondary}`,
        colors.accent && `accent ${colors.accent}`,
        colors.background && `background ${colors.background}`,
      ]
        .filter(Boolean)
        .join(', ')
    : '';
  const bits = [
    identity.visualStyle?.trim() && `style: ${identity.visualStyle.trim()}`,
    colorLine && `colors: ${colorLine}`,
    identity.typography?.heading?.trim() && `type feel: ${identity.typography.heading.trim()}`,
    identity.motionStyle?.trim() && `energy: ${identity.motionStyle.trim()}`,
  ].filter(Boolean);
  if (!bits.length) return '';
  return `Brand visual kit — ${bits.join('; ')}.`;
}
