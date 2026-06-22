/** Typography class names — values defined in globals.css `.typo-*` utilities only. */
export const typographyClasses = {
  displayXl: 'typo-display-xl',
  displayLg: 'typo-display-lg',
  displayMd: 'typo-display-md',
  headline: 'typo-headline',
  cardTitle: 'typo-card-title',
  subhead: 'typo-subhead',
  bodyLg: 'typo-body-lg',
  body: 'typo-body',
  bodySm: 'typo-body-sm',
  caption: 'typo-caption',
  button: 'typo-button',
  eyebrow: 'typo-eyebrow',
  eyebrowUpper: 'typo-eyebrow-upper',
  mono: 'typo-mono',
  tabular: 'typo-tabular',
} as const;

export type TypographyClass = keyof typeof typographyClasses;

/** Muted body copy helper */
export const mutedBodySm = `${typographyClasses.bodySm} text-muted-foreground` as const;
