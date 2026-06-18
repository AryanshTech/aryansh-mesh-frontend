export const fontFamily =
  "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif";

export const typography = {
  displayXxl: {
    fontSize: '56px',
    fontWeight: 300,
    lineHeight: 1.03,
    letterSpacing: '-1.4px',
  },
  displayXl: {
    fontSize: '48px',
    fontWeight: 300,
    lineHeight: 1.15,
    letterSpacing: '-0.96px',
  },
  displayLg: {
    fontSize: '32px',
    fontWeight: 300,
    lineHeight: 1.1,
    letterSpacing: '-0.64px',
  },
  displayMd: {
    fontSize: '26px',
    fontWeight: 300,
    lineHeight: 1.12,
    letterSpacing: '-0.26px',
  },
  headingLg: {
    fontSize: '22px',
    fontWeight: 300,
    lineHeight: 1.1,
    letterSpacing: '-0.22px',
  },
  headingMd: {
    fontSize: '20px',
    fontWeight: 300,
    lineHeight: 1.4,
    letterSpacing: '-0.2px',
  },
  headingSm: {
    fontSize: '18px',
    fontWeight: 300,
    lineHeight: 1.4,
    letterSpacing: '0',
  },
  bodyLg: {
    fontSize: '16px',
    fontWeight: 300,
    lineHeight: 1.4,
    letterSpacing: '0',
  },
  bodyMd: {
    fontSize: '15px',
    fontWeight: 300,
    lineHeight: 1.4,
    letterSpacing: '0',
  },
  bodyTabular: {
    fontSize: '14px',
    fontWeight: 300,
    lineHeight: 1.4,
    letterSpacing: '-0.42px',
  },
  buttonMd: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1,
    letterSpacing: '0',
  },
  buttonSm: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1,
    letterSpacing: '0',
  },
  caption: {
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: '-0.39px',
  },
  micro: {
    fontSize: '11px',
    fontWeight: 300,
    lineHeight: 1.4,
    letterSpacing: '0',
  },
  microCap: {
    fontSize: '10px',
    fontWeight: 400,
    lineHeight: 1.15,
    letterSpacing: '0.1px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 300,
    lineHeight: 1.1,
    letterSpacing: '-0.24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 300,
    lineHeight: 1.4,
    letterSpacing: '0',
  },
  label: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: '0',
  },
} as const;

/** Tailwind class strings for components ported from Marketing Hub */
export const typographyClasses = {
  caption: 'text-xs text-muted-foreground',
  pageTitle: 'text-2xl font-light tracking-tight text-foreground',
  pageSubtitle: 'text-sm text-muted-foreground',
  sectionTitle: 'text-lg font-light',
  headingSm: 'text-lg font-light',
} as const;

export type TypographyToken = keyof typeof typography;
