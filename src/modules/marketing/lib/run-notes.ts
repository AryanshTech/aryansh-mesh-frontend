const IMAGE_MARK = '===IMAGE===';
const COMMENTS_MARK = '===COMMENTS===';
const BRIEF_MARK = '===BRIEF===';

export type GenerationFormat = 'single' | 'week';

export interface GenerationBrief {
  topic: string;
  angle: string;
  audience: string;
  cta: string;
  tone: string;
  format: GenerationFormat;
}

export interface RunNotes {
  imageBrief: string;
  comments: string;
  brief: GenerationBrief;
}

export function emptyGenerationBrief(): GenerationBrief {
  return {
    topic: '',
    angle: '',
    audience: '',
    cta: '',
    tone: '',
    format: 'single',
  };
}

function parseBriefJson(raw: string): GenerationBrief {
  const base = emptyGenerationBrief();
  if (!raw.trim()) return base;
  try {
    const parsed = JSON.parse(raw) as Partial<GenerationBrief>;
    return {
      topic: String(parsed.topic ?? '').trim(),
      angle: String(parsed.angle ?? '').trim(),
      audience: String(parsed.audience ?? '').trim(),
      cta: String(parsed.cta ?? '').trim(),
      tone: String(parsed.tone ?? '').trim(),
      format: parsed.format === 'week' ? 'week' : 'single',
    };
  } catch {
    return { ...base, topic: raw.trim() };
  }
}

function sliceSection(text: string, startMark: string, marks: string[]): string {
  const start = text.indexOf(startMark);
  if (start < 0) return '';
  const bodyStart = start + startMark.length;
  let end = text.length;
  for (const mark of marks) {
    if (mark === startMark) continue;
    const idx = text.indexOf(mark, bodyStart);
    if (idx >= 0 && idx < end) end = idx;
  }
  return text.slice(bodyStart, end).trim();
}

/** Split stored executor notes into image prompt, comments, and generation brief. */
export function parseRunNotes(raw: string | null | undefined): RunNotes {
  const text = raw ?? '';
  if (!text.trim()) {
    return { imageBrief: '', comments: '', brief: emptyGenerationBrief() };
  }

  const hasMarks =
    text.includes(IMAGE_MARK) || text.includes(COMMENTS_MARK) || text.includes(BRIEF_MARK);

  if (!hasMarks) {
    return { imageBrief: text, comments: '', brief: emptyGenerationBrief() };
  }

  const marks = [IMAGE_MARK, COMMENTS_MARK, BRIEF_MARK];
  return {
    imageBrief: sliceSection(text, IMAGE_MARK, marks),
    comments: sliceSection(text, COMMENTS_MARK, marks),
    brief: parseBriefJson(sliceSection(text, BRIEF_MARK, marks)),
  };
}

export function serializeRunNotes(notes: RunNotes): string {
  const parts: string[] = [];
  if (notes.imageBrief.trim()) {
    parts.push(`${IMAGE_MARK}\n${notes.imageBrief.trim()}`);
  }
  if (notes.comments.trim()) {
    parts.push(`${COMMENTS_MARK}\n${notes.comments.trim()}`);
  }
  const brief = notes.brief ?? emptyGenerationBrief();
  const hasBrief =
    brief.topic || brief.angle || brief.audience || brief.cta || brief.tone || brief.format === 'week';
  if (hasBrief) {
    parts.push(`${BRIEF_MARK}\n${JSON.stringify(brief)}`);
  }
  return parts.join('\n\n');
}

export function briefFromRecipe(goal?: string | null, title?: string | null): GenerationBrief {
  const brief = emptyGenerationBrief();
  const source = (goal || title || '').trim();
  if (!source) return brief;
  const parts = source.split(/\s+[—–-]\s+/);
  brief.topic = (parts[0] || source).trim();
  if (parts.length > 1) brief.angle = parts.slice(1).join(' — ').trim();
  if (/mon[–-]fri|week|queue|5[- ]day/i.test(source)) brief.format = 'week';
  return brief;
}
