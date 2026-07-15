export interface QueuePost {
  day: string;
  type: string;
  copy: string;
  visualSuggestion: string;
}

function extractJsonObject(text: string): unknown | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    /* fall through */
  }
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(trimmed.slice(start, end + 1));
  } catch {
    return null;
  }
}

function fromPromptPack(raw: unknown): QueuePost[] {
  if (!raw || typeof raw !== 'object') return [];
  const root = raw as Record<string, unknown>;
  const pack = (root.PROMPT_PACK ?? root.prompt_pack ?? root) as Record<string, unknown>;
  const posts = (pack.posts ?? pack.Posts) as unknown;
  if (!Array.isArray(posts)) return [];
  return posts
    .map((p) => {
      if (!p || typeof p !== 'object') return null;
      const row = p as Record<string, unknown>;
      const copy = String(row.copy ?? row.caption ?? row.text ?? '').trim();
      if (!copy) return null;
      return {
        day: String(row.day ?? row.Day ?? '').trim() || 'Post',
        type: String(row.type ?? row.Type ?? '').trim() || 'Post',
        copy,
        visualSuggestion: String(
          row.visual_suggestion ?? row.visualSuggestion ?? row.image ?? '',
        ).trim(),
      } satisfies QueuePost;
    })
    .filter((p): p is QueuePost => !!p);
}

function fromDelimited(text: string): QueuePost[] {
  const chunks = text.split(/---POST---/i).map((c) => c.trim()).filter(Boolean);
  if (chunks.length < 2) return [];
  return chunks
    .map((chunk) => {
      const day = chunk.match(/^Day:\s*(.+)$/im)?.[1]?.trim() ?? 'Post';
      const type = chunk.match(/^Type:\s*(.+)$/im)?.[1]?.trim() ?? 'Post';
      const copy =
        chunk.match(/Caption:\s*([\s\S]*?)(?=\nImage:|$)/i)?.[1]?.trim() ??
        chunk.match(/Copy:\s*([\s\S]*?)(?=\nImage:|$)/i)?.[1]?.trim() ??
        '';
      const visualSuggestion =
        chunk.match(/Image:\s*([\s\S]*?)$/i)?.[1]?.trim() ??
        chunk.match(/Visual:\s*([\s\S]*?)$/i)?.[1]?.trim() ??
        '';
      if (!copy) return null;
      return { day, type, copy, visualSuggestion } satisfies QueuePost;
    })
    .filter((p): p is QueuePost => !!p);
}

/** Detect Mon–Fri / multi-post packs and return structured posts. */
export function parseQueuePosts(text: string | null | undefined): QueuePost[] {
  if (!text?.trim()) return [];
  const fromJson = fromPromptPack(extractJsonObject(text));
  if (fromJson.length) return fromJson;
  return fromDelimited(text);
}

export function isQueuePackText(text: string | null | undefined): boolean {
  return parseQueuePosts(text).length >= 2;
}

export function formatQueuePostsAsMarkdown(posts: QueuePost[]): string {
  return posts
    .map(
      (p) =>
        `---POST---\nDay: ${p.day}\nType: ${p.type}\nCaption:\n${p.copy}\nImage:\n${p.visualSuggestion || '(none)'}`,
    )
    .join('\n\n');
}

export function buildCaptionGenerationPrompt(basePrompt: string, channel: string): string {
  const looksLikeQueue =
    /mon[–-]fri|monday|week(ly)?|queue|5[- ]day|five[- ]day/i.test(basePrompt);

  if (looksLikeQueue) {
    return [
      basePrompt.trim(),
      '',
      `Write a ${channel} content pack for marketers — NOT a nested JSON object named PROMPT_PACK.`,
      'Return ONLY posts in this exact plain-text format (repeat for each day):',
      '',
      '---POST---',
      'Day: Monday',
      'Type: Hook',
      'Caption:',
      '<ready-to-publish post copy only — no hashtag spam, max 3 hashtags>',
      'Image:',
      '<one short visual direction for the image>',
      '',
      'Requirements:',
      '- One post per day Mon–Fri (or as requested)',
      '- Caption must be paste-ready for the platform',
      '- No JSON, no code fences, no preamble',
      '- Never say "Here is your post" or wrap copy in **LinkedIn Post Copy**',
    ].join('\n');
  }

  return [
    basePrompt.trim(),
    '',
    `Return ONLY the ready-to-publish ${channel} post body.`,
    'Hard rules:',
    '- First character is the start of the post (hook line) — no preamble',
    '- Do NOT write "Here is…", "Ready-to-publish", "**LinkedIn Post Copy**", or markdown titles',
    '- Do NOT use markdown bold/italics or code fences',
    '- Max 3 hashtags total, at the end only',
    '- Short paragraphs with white space; concrete and on-brief',
  ].join('\n');
}

/**
 * Strip model preamble / wrappers so captions are paste-ready.
 */
export function cleanSocialCaption(text: string | null | undefined): string {
  if (!text?.trim()) return '';
  let t = text.trim();

  t = t.replace(/^```(?:markdown|md|text|plain)?\s*/i, '').replace(/\s*```$/i, '');

  // Drop common assistant preambles (first 1–3 lines).
  t = t.replace(
    /^(?:here(?:'s| is)|below is|ready[- ]to[- ]publish)[^\n]*\n+/i,
    '',
  );
  t = t.replace(
    /^(?:the )?(?:ready[- ]to[- ]publish )?(?:linkedin |instagram |x )?post(?: copy)?[:\s]*\n*/i,
    '',
  );
  t = t.replace(/^\*\*[^*]*post[^*]*\*\*\s*\n*/i, '');
  t = t.replace(/^#{1,3}\s+[^\n]*post[^\n]*\n+/i, '');
  t = t.replace(/^---+\s*\n*/g, '');
  t = t.replace(/\n*---+\s*$/g, '');

  // Unwrap bold/italic markdown for paste-ready social copy.
  t = t.replace(/\*\*([^*]+)\*\*/g, '$1');
  t = t.replace(/(^|[^\w*])\*([^*\n]+)\*(?=[^\w*]|$)/g, '$1$2');

  // Cap trailing hashtags to 3.
  const lines = t.trim().split('\n');
  if (lines.length) {
    const last = lines[lines.length - 1].trim();
    if (/^#\w/.test(last) || (/#\w/.test(last) && last.split(/\s+/).every((w) => w.startsWith('#')))) {
      const tags = last.match(/#\w[\w]*/g) ?? [];
      if (tags.length > 3) {
        lines[lines.length - 1] = tags.slice(0, 3).join(' ');
        t = lines.join('\n');
      }
    }
  }

  return t.trim();
}
