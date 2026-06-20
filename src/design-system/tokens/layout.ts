/** Shell and page layout class bundles — shadcn token names only. */
export const layout = {
  layout: {
    background: 'bg-background',
    surface: 'bg-card',
    surfaceAlt: 'bg-muted',
    card: 'bg-card border border-border',
    cardElevated: 'bg-card border border-border shadow-whisper',
    border: 'border-border',
    mainContentMax: 'mx-auto w-full max-w-[1600px]',
    overlay: 'bg-[rgb(var(--rgb-overlay)/var(--overlay-alpha,0.58))]',
  },
  text: {
    primary: 'text-foreground',
    secondary: 'text-muted-foreground',
    muted: 'text-muted-foreground',
    link: 'text-primary hover:text-primary/90',
  },
  sidebar: {
    container: 'bg-card text-foreground border-r border-border',
    item: 'text-muted-foreground hover:bg-muted hover:text-foreground',
    itemActive:
      'bg-primary/10 font-medium text-primary shadow-none hover:bg-primary/15 hover:text-primary',
    itemActiveCollapsed:
      'border-transparent bg-primary/10 font-medium text-primary shadow-none hover:bg-primary/15 hover:text-primary',
    sectionLabel: 'text-xs font-medium uppercase font-mono text-muted-foreground',
    footer: 'mt-auto shrink-0 border-t border-border pb-3 pt-3',
  },
  shellHeader: {
    colLeft: 'shell-header__left flex min-w-0 items-center gap-2',
    colCenter: 'shell-header__center hidden md:block',
    colRight: 'shell-header__right flex shrink-0 items-center justify-end gap-2',
    title: 'truncate text-xl font-semibold text-foreground',
    subtitle: 'hidden truncate text-xs text-muted-foreground sm:block',
    searchCluster: 'shell-header__search relative flex w-full items-center',
    searchFieldWrap: 'relative flex w-full items-center',
    searchIcon: 'pointer-events-none absolute left-3 size-4 text-muted-foreground',
    toolbarHost: 'flex items-center justify-center gap-2',
    skipLink:
      'sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:text-foreground focus:shadow-whisper focus:outline-none focus:ring-2 focus:ring-ring',
  },
  dashboard: {
    page: 'flex w-full flex-col gap-6 animate-fade-in-up',
    section: 'flex flex-col gap-4',
  },
  auth: {
    panel: 'auth-panel',
    hero: 'auth-panel',
    form: 'auth-form-surface',
    title: 'text-3xl font-semibold text-foreground',
    subtitle: 'text-sm text-muted-foreground',
  },
} as const;

/** @deprecated Use `layout` from `@/design-system/tokens/layout` */
export const appColors = layout;
