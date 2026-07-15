import type { SocialPlatform } from '@/modules/marketing/api/use-social-posts';

const CADENCE = '### Cadence';

export type ProfilePlatform = Extract<SocialPlatform, 'LINKEDIN' | 'INSTAGRAM' | 'X'>;

export interface PlatformProfile {
  field1: string;
  field2: string;
  field3: string;
  cadenceDays: number;
}

const META: Record<
  ProfilePlatform,
  { section: string; h1: string; h2: string; h3: string; placeholders: [string, string, string] }
> = {
  LINKEDIN: {
    section: '## LinkedIn profile',
    h1: '### Headline',
    h2: '### About',
    h3: '### Tagline',
    placeholders: [
      '_Add your LinkedIn headline_',
      '_Add your LinkedIn About section_',
      '_Optional short tagline_',
    ],
  },
  INSTAGRAM: {
    section: '## Instagram profile',
    h1: '### Name',
    h2: '### Bio',
    h3: '### Highlights',
    placeholders: ['_Display name / handle_', '_Bio_', '_Highlights note_'],
  },
  X: {
    section: '## X profile',
    h1: '### Display name',
    h2: '### Bio',
    h3: '### Pinned',
    placeholders: ['_Display name_', '_Bio_', '_Pinned post note_'],
  },
};

function extractBetween(markdown: string, start: string, endMarkers: string[]): string {
  const idx = markdown.indexOf(start);
  if (idx < 0) return '';
  const after = markdown.slice(idx + start.length);
  let end = after.length;
  for (const marker of endMarkers) {
    const at = after.indexOf(marker);
    if (at >= 0 && at < end) end = at;
  }
  return after.slice(0, end).trim();
}

export function parsePlatformProfile(
  platform: ProfilePlatform,
  markdown: string | null | undefined,
): PlatformProfile {
  const meta = META[platform];
  const text = markdown ?? '';
  if (!text.includes(meta.section)) {
    return { field1: '', field2: '', field3: '', cadenceDays: 7 };
  }
  const cadenceRaw = extractBetween(text, CADENCE, [meta.h1, meta.h2, meta.h3, '\n## ']);
  const cadenceDays = Number.parseInt(cadenceRaw.replace(/\D/g, ''), 10);
  return {
    field1: extractBetween(text, meta.h1, [meta.h2, meta.h3, CADENCE, '\n## ']),
    field2: extractBetween(text, meta.h2, [meta.h3, meta.h1, CADENCE, '\n## ']),
    field3: extractBetween(text, meta.h3, [meta.h1, meta.h2, CADENCE, '\n## ']),
    cadenceDays: Number.isFinite(cadenceDays) && cadenceDays > 0 ? cadenceDays : 7,
  };
}

export function upsertPlatformProfile(
  platform: ProfilePlatform,
  existingMarkdown: string,
  profile: PlatformProfile,
): string {
  const meta = META[platform];
  const section = [
    meta.section,
    '',
    `_Updated ${new Date().toLocaleDateString()}_`,
    '',
    meta.h1,
    '',
    profile.field1.trim() || meta.placeholders[0],
    '',
    meta.h2,
    '',
    profile.field2.trim() || meta.placeholders[1],
    '',
    meta.h3,
    '',
    profile.field3.trim() || meta.placeholders[2],
    '',
    CADENCE,
    '',
    String(profile.cadenceDays > 0 ? profile.cadenceDays : 7),
    '',
  ].join('\n');

  const trimmed = existingMarkdown.trim();
  if (!trimmed) return section;

  const idx = trimmed.indexOf(meta.section);
  if (idx >= 0) {
    const rest = trimmed.slice(idx + meta.section.length);
    const nextSection = rest.search(/\n## /);
    const before = trimmed.slice(0, idx).trimEnd();
    const after = nextSection >= 0 ? rest.slice(nextSection + 1).trimStart() : '';
    return [before, section, after].filter(Boolean).join('\n\n');
  }

  return `${trimmed}\n\n${section}`;
}

export function buildPlatformProfilePrompt(
  platform: ProfilePlatform,
  input: {
    mission?: string | null;
    vision?: string | null;
    audience?: string | null;
    voiceTone?: string | null;
    pillars?: string[];
  },
): string {
  const label =
    platform === 'LINKEDIN' ? 'LinkedIn' : platform === 'INSTAGRAM' ? 'Instagram' : 'X';
  const blocks =
    platform === 'LINKEDIN'
      ? [
          'FIELD1 (Headline): max ~220 characters, benefit-led',
          'FIELD2 (About): 3–5 short paragraphs, scannable',
          'FIELD3 (Tagline): one line',
        ]
      : platform === 'INSTAGRAM'
        ? [
            'FIELD1 (Name): display name / handle vibe',
            'FIELD2 (Bio): Instagram bio, concise',
            'FIELD3 (Highlights): short note for story highlights themes',
          ]
        : [
            'FIELD1 (Display name)',
            'FIELD2 (Bio): X bio under 160 chars feel',
            'FIELD3 (Pinned): note for a pinned post angle',
          ];

  const parts = [
    `Write ${label} profile copy for our brand.`,
    '',
    'Return exactly three labeled blocks:',
    ...blocks.map((b) => `- ${b}`),
    '',
    'Format:',
    'FIELD1: ...',
    'FIELD2: ...',
    'FIELD3: ...',
    '',
    'Brand context:',
  ];
  if (input.mission?.trim()) parts.push(`- Mission: ${input.mission.trim()}`);
  if (input.vision?.trim()) parts.push(`- Vision: ${input.vision.trim()}`);
  if (input.audience?.trim()) parts.push(`- Audience: ${input.audience.trim()}`);
  if (input.voiceTone?.trim()) parts.push(`- Voice: ${input.voiceTone.trim()}`);
  if (input.pillars?.length) parts.push(`- Pillars: ${input.pillars.join(', ')}`);
  parts.push('', 'No hashtag spam. Platform-native tone.');
  return parts.join('\n');
}

export function parsePlatformProfileReply(text: string): Omit<PlatformProfile, 'cadenceDays'> {
  const field1 =
    text.match(/FIELD1:\s*([\s\S]*?)(?=\nFIELD2:|\nFIELD3:|$)/i)?.[1]?.trim() ?? '';
  const field2 =
    text.match(/FIELD2:\s*([\s\S]*?)(?=\nFIELD3:|\nFIELD1:|$)/i)?.[1]?.trim() ?? '';
  const field3 =
    text.match(/FIELD3:\s*([\s\S]*?)(?=\nFIELD1:|\nFIELD2:|$)/i)?.[1]?.trim() ?? '';
  if (field1 || field2 || field3) return { field1, field2, field3 };
  return { field1: '', field2: text.trim(), field3: '' };
}

export function getCadenceDays(
  platform: ProfilePlatform,
  markdown: string | null | undefined,
): number {
  return parsePlatformProfile(platform, markdown).cadenceDays;
}

export function addDaysIso(from: Date, days: number): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Re-export LinkedIn helpers for any leftover imports. */
export {
  parsePlatformProfile as parseLinkedInProfileCompat,
};
