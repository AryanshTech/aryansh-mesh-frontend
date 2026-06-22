import { typographyClasses } from '@/design-system/tokens/typography';

/** Shell and page layout class bundles — shadcn token names only. */
export const layout = {
  sidebar: {
    container: 'bg-background text-foreground border-r border-border w-60',
    item: `rounded-md ${typographyClasses.button} text-muted-foreground hover:bg-card hover:text-foreground transition-colors`,
    itemActive:
      'rounded-md border border-border/50 bg-card font-medium text-foreground shadow-none hover:bg-card hover:text-foreground',
    sectionLabel: `${typographyClasses.eyebrowUpper} text-muted-foreground`,
    footer: 'mt-auto shrink-0 border-t border-border pb-3 pt-3',
    brandSubtitle: `${typographyClasses.caption} text-muted-foreground`,
  },
  shellHeader: {
    colLeft: 'shell-header__left flex min-w-0 items-center gap-2',
    colCenter: 'shell-header__center hidden md:block',
    colRight: 'shell-header__right flex shrink-0 items-center justify-end gap-2',
    title: typographyClasses.button,
    subtitle: `hidden truncate ${typographyClasses.caption} text-muted-foreground sm:block`,
    searchCluster: 'shell-header__search relative flex w-full items-center',
    searchFieldWrap: 'relative flex w-full items-center',
    searchIcon: 'pointer-events-none absolute left-3 size-4 text-muted-foreground',
    toolbarHost: 'flex items-center justify-center gap-2',
    skipLink:
      'sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-sm focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:text-foreground focus:shadow-whisper focus:outline-none focus:ring-2 focus:ring-ring',
  },
  pageShell: {
    constrained: 'mx-auto flex w-full max-w-7xl animate-fade-in-up flex-col gap-8 p-8',
    viewport: 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
    threeColumn: 'mr-80 flex min-h-0 min-w-0 flex-1 flex-col gap-8 overflow-y-auto p-8 scrollbar-linear',
  },
  dashboard: {
    page: 'flex w-full flex-col gap-8 animate-fade-in-up',
    pageViewport: 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
    section: 'flex flex-col gap-6',
    bentoGrid: 'grid grid-cols-12 gap-4',
    splitPane: 'flex min-h-0 flex-1 overflow-hidden',
  },
  linear: {
    hairlineCard: 'rounded-card border border-border bg-card',
    statCard: 'rounded-card border border-border bg-card p-5 hover:bg-muted transition-colors flex flex-col justify-between',
    queueItemActive: 'border-l-[3px] border-l-primary bg-muted',
    queueItem: 'rounded-card-inner border border-transparent hover:bg-muted/50 transition-colors cursor-pointer',
    insightBanner: 'rounded-card border border-border border-l-2 border-l-primary bg-card p-6',
    filterChip: `flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1 ${typographyClasses.caption} hover:bg-muted transition-colors cursor-pointer`,
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
    title: `${typographyClasses.headline} text-foreground`,
    subtitle: `${typographyClasses.bodySm} text-muted-foreground`,
  },
} as const;
