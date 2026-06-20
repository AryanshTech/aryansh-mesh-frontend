import type { SocialPlatform } from '@/modules/marketing/types/api';

/** Linear-inspired hex tokens — source of truth for JS usage */
export const colors = {
  primary: '#5e6ad2',
  primaryHover: '#828fff',
  primaryFocus: '#5e69d1',
  onPrimary: '#ffffff',
  ink: '#f7f8f8',
  inkMuted: '#d0d6e0',
  inkSubtle: '#8a8f98',
  inkTertiary: '#62666d',
  canvas: '#010102',
  surface1: '#0f1011',
  surface2: '#141516',
  surface3: '#18191a',
  surface4: '#191a1b',
  hairline: '#23252a',
  hairlineStrong: '#34343a',
  hairlineTertiary: '#3e3e44',
  inverseCanvas: '#ffffff',
  inverseSurface1: '#f5f6f6',
  brandSecure: '#7a7fad',
  semanticSuccess: '#27a644',
  semanticError: '#dc2626',
  semanticWarning: '#d97706',
} as const;

export const colorsLight = {
  primary: '#5e6ad2',
  primaryHover: '#828fff',
  primaryFocus: '#5e69d1',
  onPrimary: '#ffffff',
  ink: '#000000',
  inkMuted: '#374151',
  inkSubtle: '#6b7280',
  inkTertiary: '#9ca3af',
  canvas: '#ffffff',
  surface1: '#f5f6f6',
  surface2: '#f6f7f7',
  surface3: '#f0f1f2',
  surface4: '#ebebee',
  hairline: '#e5e7eb',
  hairlineStrong: '#d1d5db',
  hairlineTertiary: '#bdc2c9',
} as const;

export type ColorToken = keyof typeof colors;

export const platformColors: Record<SocialPlatform, string> = {
  INSTAGRAM: '#E4405F',
  TIKTOK: '#00F2EA',
  LINKEDIN: '#0A66C2',
  PRODUCT_HUNT: '#DA552F',
  X: '#ffffff',
  YOUTUBE: '#FF0000',
  THREADS: '#000000',
  BLUESKY: '#0085FF',
  MASTODON: '#6364FF',
  FACEBOOK: '#1877F2',
  PINTEREST: '#E60023',
  REDDIT: '#FF4500',
};

/** Semantic Tailwind class bundles for shell and CRM pages */
export const appColors = {
  layout: {
    background: 'bg-canvas',
    surface: 'bg-surface-1',
    surfaceAlt: 'bg-surface-2',
    card: 'bg-surface-1 border border-hairline/60',
    cardElevated: 'bg-surface-1 border border-hairline shadow-sm',
    border: 'border-hairline',
    borderStrong: 'border-hairline-strong',
    mainContentMax: 'mx-auto w-full min-w-0 max-w-[1600px]',
    overlay: 'bg-[rgb(var(--rgb-overlay)/var(--overlay-alpha,0.58))]',
  },
  text: {
    primary: 'text-ink',
    secondary: 'text-ink-muted',
    muted: 'text-ink-subtle',
    link: 'text-primary hover:text-primary-hover',
  },
  sidebar: {
    container: 'bg-canvas text-ink border-r border-hairline',
    item: 'text-ink-subtle hover:bg-surface-1 hover:text-ink',
    itemActive:
      'border-l-2 border-l-primary bg-primary/10 font-medium text-primary shadow-none hover:bg-primary/[0.14] hover:text-primary',
    itemActiveCollapsed:
      'border-transparent bg-primary/10 font-medium text-primary shadow-none hover:bg-primary/[0.14] hover:text-primary',
    sectionLabel: 'text-xs font-medium uppercase tracking-wide text-ink-subtle',
    footer: 'mt-auto shrink-0 border-t border-hairline pb-3 pt-3',
  },
  shellHeader: {
    container:
      'sticky top-0 z-40 grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-hairline bg-canvas/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-canvas/80 md:px-4',
    colLeft: 'flex min-w-0 items-center gap-2',
    colCenter: 'flex min-w-0 justify-center px-2',
    colRight: 'flex shrink-0 items-center justify-end gap-1',
    title: 'truncate type-body-sm font-semibold text-ink',
    subtitle: 'hidden truncate type-caption text-ink-subtle sm:block',
    searchCluster: 'relative flex w-full max-w-md items-center justify-center',
    searchFieldWrap: 'relative flex w-full items-center',
    searchIcon: 'pointer-events-none absolute left-3 size-4 text-ink-subtle',
    searchInput: 'h-9 w-full rounded-md border border-hairline bg-surface-1 pl-9 pr-3 text-sm',
    commandTrigger:
      'flex h-9 w-full items-center gap-2 rounded-md border border-hairline bg-surface-1 px-3 text-left text-sm text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink',
    commandTriggerShortcut:
      'ml-auto hidden rounded border border-hairline bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-ink-subtle sm:inline',
    toolbarHost: 'flex min-w-0 items-center justify-center gap-2',
    iconButton:
      'inline-flex size-8 shrink-0 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus/50',
    iconButtonActive: 'bg-primary/10 text-primary',
    commandPaletteSectionLabel: 'px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-subtle',
    commandPaletteRow:
      'flex w-full items-center rounded-md px-2 py-2 text-left transition-colors hover:bg-surface-2',
    commandPaletteRowSelected: 'bg-surface-2',
    commandPaletteFooter: 'text-center text-xs text-ink-subtle',
  },
  dashboard: {
    page: 'mx-auto w-full min-w-0 max-w-[1600px]',
    metricCard: 'rounded-lg border border-hairline/60 bg-surface-1 p-4 shadow-sm',
    metricValue: 'text-2xl font-semibold tabular-nums text-ink',
    metricLabel: 'text-sm text-ink-subtle',
    section: 'flex flex-col gap-4',
  },
  auth: {
    panel: 'bg-surface-1',
    hero: 'auth-panel',
    form: 'auth-form-surface',
    title: 'type-headline text-ink',
    subtitle: 'type-body-sm text-ink-subtle',
  },
  card: {
    default: 'rounded-lg border border-hairline/60 bg-surface-1 text-ink shadow-sm',
    header: 'border-b border-hairline/60 px-6 py-4',
    title: 'type-card-title text-ink',
    description: 'type-body-sm text-ink-subtle',
  },
  button: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
    secondary: 'border border-hairline bg-surface-1 text-ink hover:bg-surface-2',
  },
  table: {
    wrapper: 'overflow-x-auto rounded-lg border border-hairline/60',
    header: 'border-b border-hairline bg-surface-2/40 text-xs font-medium uppercase tracking-wide text-ink-subtle',
    row: 'border-b border-hairline/60 hover:bg-surface-1/50',
    cell: 'px-4 py-3 text-sm text-ink',
  },
  publish: {
    hubCard: 'rounded-xl border border-hairline/60 bg-surface-1 p-6',
    statusBadge: 'rounded-full bg-surface-2 px-2 py-0.5 text-xs text-ink-muted',
  },
} as const;
