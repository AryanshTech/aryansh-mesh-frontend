export const fontFamily =
  "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif";

export const fontFamilyMono =
  "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace";

/** Linear-inspired type scale */
export const typography = {
  displayXl: {
    fontSize: '80px',
    fontWeight: 600,
    lineHeight: 1.05,
    letterSpacing: '-3px',
  },
  displayLg: {
    fontSize: '56px',
    fontWeight: 600,
    lineHeight: 1.1,
    letterSpacing: '-1.8px',
  },
  displayMd: {
    fontSize: '40px',
    fontWeight: 600,
    lineHeight: 1.15,
    letterSpacing: '-1px',
  },
  headline: {
    fontSize: '28px',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.6px',
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: 500,
    lineHeight: 1.25,
    letterSpacing: '-0.4px',
  },
  subhead: {
    fontSize: '20px',
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: '-0.2px',
  },
  bodyLg: {
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '-0.1px',
  },
  body: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '-0.05px',
  },
  bodySm: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0',
  },
  caption: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: '0',
  },
  button: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.2,
    letterSpacing: '0',
  },
  eyebrow: {
    fontSize: '13px',
    fontWeight: 500,
    lineHeight: 1.3,
    letterSpacing: '0.4px',
  },
  mono: {
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.4px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '-0.1px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0',
  },
} as const;

export const typographyClasses = {
  displayMd: 'type-display-md',
  headline: 'type-headline',
  cardTitle: 'type-card-title',
  subhead: 'type-subhead',
  body: 'type-body',
  bodySm: 'type-body-sm',
  caption: 'type-caption text-ink-subtle',
  button: 'type-button',
  eyebrow: 'type-eyebrow',
  pageTitle: 'type-headline text-xl font-semibold tracking-tight text-ink',
  pageSubtitle: 'type-body-sm text-ink-subtle',
  sectionTitle: 'type-card-title text-base',
} as const;

export type TypographyToken = keyof typeof typography;
