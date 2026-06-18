import type { ChatCommandHint } from '@/modules/marketing/types/api';

export interface AutocompleteItem {
  token: string;
  label: string;
  description?: string;
}

export function buildAutocompleteItems(
  query: string,
  commands: ChatCommandHint[],
  savedLabels: string[]
): AutocompleteItem[] {
  const needle = query.toLowerCase().replace(/^@/, '');

  const commandItems: AutocompleteItem[] = commands
    .filter((c) => c.token.toLowerCase().includes(needle))
    .map((c) => ({
      token: c.token,
      label: c.label,
      description: c.description,
    }));

  const labelItems: AutocompleteItem[] = savedLabels
    .filter((label) => label.toLowerCase().includes(needle))
    .map((label) => ({
      token: `@${label}`,
      label,
      description: 'Saved output',
    }));

  return [...commandItems, ...labelItems].slice(0, 8);
}
