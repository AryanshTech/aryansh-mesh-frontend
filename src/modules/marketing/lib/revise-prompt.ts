/**
 * Shared revision prompt: keep the same deliverable, incorporate optional feedback.
 */
export function buildRevisionPrompt(input: {
  /** What we are revising (e.g. "LinkedIn profile copy"). */
  deliverable: string;
  previousOutput: string;
  /** Optional user notes — may be empty. */
  feedback?: string | null;
  /** Exact format / constraints for the new output. */
  outputInstructions: string;
  /** Optional original brief / topic reminder. */
  taskReminder?: string | null;
}): string {
  const feedback = (input.feedback ?? '').trim();
  const parts = [
    `Revise the following ${input.deliverable}.`,
    'Keep the same brand, product, and audience. Improve the draft — do not invent a different company or category.',
    '',
  ];
  if (input.taskReminder?.trim()) {
    parts.push('Original request / brief:', input.taskReminder.trim(), '');
  }
  parts.push('Current draft:', input.previousOutput.trim(), '');
  if (feedback) {
    parts.push('User feedback (must incorporate):', feedback, '');
  } else {
    parts.push(
      'No specific feedback was given — produce a stronger alternate take: clearer, tighter, more on-brand.',
      '',
    );
  }
  parts.push('Output requirements:', input.outputInstructions.trim());
  return parts.join('\n');
}

export function formatProfileDraftForRevision(draft: {
  field1: string;
  field2: string;
  field3: string;
}): string {
  return [
    `FIELD1: ${draft.field1.trim()}`,
    `FIELD2: ${draft.field2.trim()}`,
    `FIELD3: ${draft.field3.trim()}`,
  ].join('\n');
}
