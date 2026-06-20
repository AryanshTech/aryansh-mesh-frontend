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
    pageViewport: 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
    section: 'flex flex-col gap-4',
  },
  auth: {
    shell:
      'flex min-h-svh w-full flex-col bg-background lg:h-svh lg:flex-row lg:overflow-hidden',
    panel:
      'auth-panel relative hidden shrink-0 flex-col justify-between overflow-x-hidden overflow-y-auto p-10 lg:flex lg:h-full lg:w-[min(100%,480px)] lg:max-w-[45%] lg:min-w-[320px] xl:p-14',
    formColumn:
      'auth-form-surface relative flex min-h-svh min-w-0 flex-1 flex-col bg-card lg:h-full lg:min-h-0 lg:overflow-y-auto lg:bg-muted/30',
    formMain:
      'flex w-full min-w-0 flex-1 items-center justify-center px-6 pb-12 pt-4 md:px-10 lg:pb-16',
    formCardWrap: 'w-full min-w-0 max-w-[420px]',
    title: 'text-3xl font-semibold text-foreground',
    subtitle: 'text-sm text-muted-foreground',
    /** @deprecated Use `auth.panel` */
    hero: 'auth-panel',
    /** @deprecated Use `auth.formColumn` */
    form: 'auth-form-surface',
  },
} as const;
