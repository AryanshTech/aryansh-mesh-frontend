/** Typography class bundles — Tailwind text sizes only (no type-* utilities). */
export const typographyClasses = {
  displayXl: 'text-5xl font-semibold tracking-tight',
  headingLg: 'text-3xl font-semibold tracking-tight',
  headingMd: 'text-xl font-semibold',
  labelSm: 'text-sm font-medium',
  monoEyebrow: 'text-xs font-medium uppercase font-mono',
  bodyLg: 'text-base',
  bodyMd: 'text-sm',
  bodySm: 'text-xs',
  buttonLg: 'text-base font-medium',
  buttonMd: 'text-sm font-medium',
  code: 'text-sm font-mono',
  pageTitle: 'text-xl font-semibold text-foreground',
  pageSubtitle: 'text-sm text-muted-foreground',
  sectionTitle: 'text-xl font-semibold',
} as const;

export type TypographyClass = keyof typeof typographyClasses;
