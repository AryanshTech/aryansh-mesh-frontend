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

/** Slice only the platform profile block so brand-kit headings cannot collide. */
function extractProfileSection(markdown: string, sectionHeading: string): string {
  const text = markdown ?? '';
  const idx = text.indexOf(sectionHeading);
  if (idx < 0) return '';
  const fromHeading = text.slice(idx);
  // Next H2 after this section (not the opening heading itself).
  const rest = fromHeading.slice(sectionHeading.length);
  const next = rest.search(/\n## /);
  return (next >= 0 ? fromHeading.slice(0, sectionHeading.length + next) : fromHeading).trim();
}

/**
 * Extract body after an exact `### Heading` line inside a scoped block.
 * Avoids prefix collisions (e.g. `### Tagline` vs brand-kit `### Taglines / hooks`).
 */
function extractField(section: string, heading: string, endHeadings: string[]): string {
  const lines = section.split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === heading) {
      start = i + 1;
      break;
    }
  }
  if (start < 0) return '';

  const endSet = new Set(endHeadings.map((h) => h.trim()));
  let end = lines.length;
  for (let i = start; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (endSet.has(trimmed) || /^##\s/.test(trimmed)) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join('\n').trim();
}

function stripPlaceholder(value: string, placeholders: string[]): string {
  const v = value.trim();
  if (!v) return '';
  if (placeholders.some((p) => p === v)) return '';
  // Italic placeholder lines from older saves.
  if (/^_[^_]+_$/.test(v) && v.toLowerCase().includes('add your')) return '';
  return v;
}

export function parsePlatformProfile(
  platform: ProfilePlatform,
  markdown: string | null | undefined,
): PlatformProfile {
  const meta = META[platform];
  const section = extractProfileSection(markdown ?? '', meta.section);
  if (!section) {
    return { field1: '', field2: '', field3: '', cadenceDays: 7 };
  }
  const endMarkers = [meta.h1, meta.h2, meta.h3, CADENCE];
  const cadenceRaw = extractField(section, CADENCE, endMarkers);
  const cadenceDays = Number.parseInt(cadenceRaw.replace(/\D/g, ''), 10);
  return {
    field1: stripPlaceholder(
      extractField(section, meta.h1, endMarkers),
      meta.placeholders,
    ),
    field2: stripPlaceholder(
      extractField(section, meta.h2, endMarkers),
      meta.placeholders,
    ),
    field3: stripPlaceholder(
      extractField(section, meta.h3, endMarkers),
      meta.placeholders,
    ),
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
    visualStyle?: string | null;
    /** Full brand memory markdown — source of truth for who the brand is. */
    brandMemoryMarkdown?: string | null;
  },
): string {
  const label =
    platform === 'LINKEDIN' ? 'LinkedIn' : platform === 'INSTAGRAM' ? 'Instagram' : 'X';
  const blocks =
    platform === 'LINKEDIN'
      ? [
          'FIELD1 (Headline): max ~220 characters, benefit-led, names what we actually sell',
          'FIELD2 (About): 3–5 short paragraphs, scannable, grounded in brand memory',
          'FIELD3 (Tagline): one line matching brand hooks / positioning',
        ]
      : platform === 'INSTAGRAM'
        ? [
            'FIELD1 (Name): display name / handle vibe from the real brand',
            'FIELD2 (Bio): Instagram bio, concise, on-brand',
            'FIELD3 (Highlights): short note for story highlights themes',
          ]
        : [
            'FIELD1 (Display name) matching the real brand',
            'FIELD2 (Bio): X bio under 160 chars feel',
            'FIELD3 (Pinned): note for a pinned post angle',
          ];

  const memory = (input.brandMemoryMarkdown ?? '').trim().slice(0, 10000);
  const parts = [
    `Write ${label} profile copy for THIS brand only.`,
    '',
    'Hard rules:',
    '- Brand memory + visual identity below are the source of truth (product, audience, voice, look).',
    '- Do NOT invent a different company, category, or product line.',
    '- Do NOT write lifestyle / fashion / consumer-goods copy unless brand memory says that.',
    '- Follow Voice & tone, Messaging, Do, and Don\'t from brand memory when present.',
    '- If brand memory and short identity fields conflict, prefer brand memory.',
    '',
    'Return exactly three labeled blocks:',
    ...blocks.map((b) => `- ${b}`),
    '',
    'Format:',
    'FIELD1: ...',
    'FIELD2: ...',
    'FIELD3: ...',
    '',
  ];

  if (memory) {
    parts.push('## Brand memory (source of truth)', memory, '');
  }

  parts.push('## Look / identity (use with memory)');
  if (input.visualStyle?.trim()) parts.push(`- Visual style: ${input.visualStyle.trim()}`);
  if (input.mission?.trim()) parts.push(`- Mission: ${input.mission.trim()}`);
  if (input.vision?.trim()) parts.push(`- Vision: ${input.vision.trim()}`);
  if (input.audience?.trim()) parts.push(`- Audience: ${input.audience.trim()}`);
  if (input.voiceTone?.trim()) parts.push(`- Voice: ${input.voiceTone.trim()}`);
  if (input.pillars?.length) parts.push(`- Pillars: ${input.pillars.join(', ')}`);
  if (
    !memory &&
    !input.mission?.trim() &&
    !input.vision?.trim() &&
    !input.audience?.trim()
  ) {
    parts.push('- (No brand context provided — refuse generic lifestyle filler; ask for brand memory.)');
  }
  parts.push('', 'No hashtag spam. Platform-native tone. Return only FIELD1/FIELD2/FIELD3.');
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

const PROFILE_PLATFORMS: ProfilePlatform[] = ['LINKEDIN', 'INSTAGRAM', 'X'];

function profileHasContent(profile: PlatformProfile): boolean {
  const fields = [profile.field1, profile.field2, profile.field3].map((f) => f.trim());
  return fields.some((f) => f.length > 0 && !f.startsWith('_'));
}

/** Pull a full `## Heading …` block (until next `## ` or EOF). */
export function extractMarkdownSection(markdown: string, heading: string): string {
  const text = markdown ?? '';
  const idx = text.indexOf(heading);
  if (idx < 0) return '';
  const rest = text.slice(idx);
  const next = rest.search(/\n## /);
  return (next >= 0 ? rest.slice(0, next) : rest).trim();
}

function upsertRawSection(markdown: string, heading: string, sectionBody: string): string {
  const trimmed = markdown.trim();
  const body = sectionBody.trim();
  if (!body) return trimmed;
  if (!trimmed) return body;
  const idx = trimmed.indexOf(heading);
  if (idx < 0) return `${trimmed}\n\n${body}`;
  const rest = trimmed.slice(idx + heading.length);
  const nextSection = rest.search(/\n## /);
  const before = trimmed.slice(0, idx).trimEnd();
  const after = nextSection >= 0 ? rest.slice(nextSection + 1).trimStart() : '';
  return [before, body, after].filter(Boolean).join('\n\n');
}

/**
 * Merge an uploaded brand kit into existing memory without wiping LinkedIn/Instagram/X
 * profiles (or post-style sections) that were already configured.
 */
export function mergePreservingPlatformProfiles(
  incomingMarkdown: string,
  existingMarkdown: string | null | undefined,
): string {
  const existing = (existingMarkdown ?? '').trim();
  let merged = (incomingMarkdown ?? '').trim();
  if (!existing) return merged;
  if (!merged) return existing;

  for (const platform of PROFILE_PLATFORMS) {
    const existingProfile = parsePlatformProfile(platform, existing);
    if (!profileHasContent(existingProfile)) continue;
    // Always keep the live profile when the brand already configured it.
    merged = upsertPlatformProfile(platform, merged, existingProfile);
  }

  // Keep post-style blocks (used for caption generation) if the upload omitted them.
  for (const label of ['LinkedIn', 'Instagram', 'X'] as const) {
    const heading = `## ${label} post style`;
    const existingStyle = extractMarkdownSection(existing, heading);
    if (!existingStyle) continue;
    const incomingStyle = extractMarkdownSection(merged, heading);
    if (!incomingStyle.trim()) {
      merged = upsertRawSection(merged, heading, existingStyle);
    }
  }

  return merged;
}

/** Re-export LinkedIn helpers for any leftover imports. */
export {
  parsePlatformProfile as parseLinkedInProfileCompat,
};
