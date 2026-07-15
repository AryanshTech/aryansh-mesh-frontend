import type { BrandIdentity } from '@/modules/marketing/api/use-brand-identity';

export function buildBrandImagePromptRequest(input: {
  channel: string;
  topic: string;
  caption?: string;
  identity: BrandIdentity | null;
}): string {
  const { channel, topic, caption, identity } = input;
  const colors = identity?.colors;
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

  const parts = [
    `Write ONE ready-to-paste image-generation prompt for a ${channel} post.`,
    '',
    `Topic: ${topic.trim()}`,
  ];
  if (caption?.trim()) {
    parts.push('', 'Caption to support visually:', caption.trim());
  }
  parts.push('', 'Brand kit (follow closely):');
  if (identity?.visualStyle) parts.push(`- Visual style: ${identity.visualStyle}`);
  if (identity?.motionStyle) parts.push(`- Motion / energy: ${identity.motionStyle}`);
  if (identity?.voiceTone) parts.push(`- Mood / tone: ${identity.voiceTone}`);
  if (identity?.audience) parts.push(`- Audience: ${identity.audience}`);
  if (colorLine) parts.push(`- Colors: ${colorLine}`);
  if (identity?.typography?.heading) parts.push(`- Heading type feel: ${identity.typography.heading}`);
  if (identity?.doRules?.length) parts.push(`- Do: ${identity.doRules.slice(0, 4).join('; ')}`);
  if (identity?.dontRules?.length) parts.push(`- Don't: ${identity.dontRules.slice(0, 4).join('; ')}`);
  if (!identity) {
    parts.push('- No brand kit saved yet — use clean, premium product photography.');
  }
  parts.push(
    '',
    'Constraints:',
    channel.toLowerCase().includes('instagram')
      ? '- Aspect: 1:1 square Instagram feed'
      : '- Aspect: platform-native, clean framing',
    '- No watermarks, no unreadable micro-text, no fake logos',
    '- Describe subject, setting, lighting, lens, and color grade',
    '- Return ONLY the image prompt — no preamble',
  );
  return parts.join('\n');
}
