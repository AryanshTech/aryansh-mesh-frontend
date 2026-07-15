/**
 * Append user revise feedback into brand memory so future generations learn from it.
 */

const FEEDBACK_SECTION = '## Generation feedback (learned)';

const STRONG_SIGNAL =
  /\b(too|don't|dont|never|always|shorter|longer|remove|avoid|stop|instead|without|less|more|not|no more|cut|drop|rewrite|salesy|fluff|generic|hashtag|preamble|formal|casual)\b/i;

/** True when feedback is substantive enough to persist. */
export function isStrongGenerationFeedback(feedback: string | null | undefined): boolean {
  const t = (feedback ?? '').trim();
  if (t.length < 20) return false;
  if (t.length >= 40) return true;
  return STRONG_SIGNAL.test(t);
}

export function appendGenerationFeedbackToMemory(
  existingMarkdown: string,
  input: {
    feedback: string;
    surface: string;
    /** Optional channel / platform label */
    channel?: string;
  },
): string {
  const note = input.feedback.trim();
  if (!note) return existingMarkdown.trim();

  const when = new Date().toISOString().slice(0, 10);
  const where = [input.surface, input.channel].filter(Boolean).join(' · ');
  const bullet = `- [${when} · ${where}] ${note}`;

  const trimmed = existingMarkdown.trim();
  const blockIntro = [
    FEEDBACK_SECTION,
    '',
    'Apply these preferences on every future caption, profile, image, and video plan for this brand.',
    '',
  ].join('\n');

  if (!trimmed) {
    return `${blockIntro}${bullet}\n`;
  }

  const idx = trimmed.indexOf(FEEDBACK_SECTION);
  if (idx < 0) {
    return `${trimmed}\n\n${blockIntro}${bullet}\n`;
  }

  const rest = trimmed.slice(idx + FEEDBACK_SECTION.length);
  const nextSection = rest.search(/\n## /);
  const before = trimmed.slice(0, idx).trimEnd();
  const existingBody = (nextSection >= 0 ? rest.slice(0, nextSection) : rest).trimEnd();
  const after = nextSection >= 0 ? rest.slice(nextSection + 1).trimStart() : '';

  // Keep newest feedback first; cap to last 12 bullets.
  const lines = existingBody
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.startsWith('- '));
  const nextLines = [bullet, ...lines.filter((l) => l !== bullet)].slice(0, 12);
  const section = `${FEEDBACK_SECTION}\n\nApply these preferences on every future caption, profile, image, and video plan for this brand.\n\n${nextLines.join('\n')}\n`;

  return [before, section, after].filter(Boolean).join('\n\n');
}
