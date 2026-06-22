# Stitch token extract — Intuitive Immersive Product Design

Source: `business-dashboard.html` and sibling screen HTML exports (project `4566503762483749210`).

**Canonical implementation:** `src/design-system/styles/globals.css` (colors, radius, fonts) + `.typo-*` utilities. TypeScript alias map: `src/design-system/tokens/typography.ts`.

## Colors (dark — canonical in mockups)

| Token | Hex | RGB | Role |
|---|---|---|---|
| canvas | `#010102` | 1 1 2 | App background |
| surface-1 | `#0f1011` | 15 16 17 | Cards, inputs, active nav |
| surface-2 | `#141516` | 20 21 22 | Hover surfaces |
| surface-3 | `#18191a` | 24 25 26 | Nested panels, avatars |
| surface-4 | `#191a1b` | 25 26 27 | Elevated nested |
| hairline | `#23252a` | 35 37 42 | Borders |
| primary | `#5e6ad2` | 94 106 210 | Brand accent |
| primary-hover | `#828fff` | 130 143 255 | Button hover |
| ink | `#f7f8f8` | 247 248 248 | Primary text |
| ink-muted | `#d0d6e0` | 208 214 224 | Secondary text |
| ink-subtle / ink-tertiary | `#8a8f98` / `#62666d` | 138 143 152 / 98 102 109 | Tertiary / labels |

Mapped in `globals.css` dark theme (`--rgb-*` + shadcn semantic vars).

## Typography (Linear 13-step scale)

All sizes live in CSS only — use `.typo-*` classes or `typographyClasses` keys. Font stacks: Inter (display/text), JetBrains Mono (mono).

| Class | Size | Weight | Use |
|---|---|---|---|
| `.typo-display-xl` | 80px | 600 | Marketing hero |
| `.typo-display-lg` | 56px | 600 | Content studio article title |
| `.typo-display-md` | 40px | 600 | Large stats |
| `.typo-headline` | 28px | 600 | Page titles |
| `.typo-card-title` | 22px | 500 | Card / section titles |
| `.typo-subhead` | 20px | 400 | Stat values, subheads |
| `.typo-body-lg` | 18px | 400 | Lead copy |
| `.typo-body` | 16px | 400 | Default body |
| `.typo-body-sm` | 14px | 400 | Secondary body, table cells |
| `.typo-caption` | 12px | 400 | Helper text, meta |
| `.typo-button` | 14px | 500 | Buttons, nav items |
| `.typo-eyebrow` | 13px | 500 | Labels |
| `.typo-eyebrow-upper` | 13px | 500 | Table headers, section labels (uppercase) |
| `.typo-mono` | 13px | 400 | Code, SKU, timestamps |
| `.typo-tabular` | — | — | Tabular nums modifier |

## Layout

| Element | Value |
|---|---|
| Header height | 56px (`h-14`) |
| Sidebar width | 240px (`w-60`) |
| Main padding | 32px (`p-8`) |
| Section gap | 32px (`space-y-8`) |
| Content max width | 1280px (`max-w-7xl`) |
| Stat grid gap | 16px |
| Border radius sm/md/lg/card | 6 / 8 / 12 / 12px |

## Component patterns

- **Active nav:** `bg-card border border-border/50` — not primary tint fill
- **Active nav icon:** `text-primary`
- **Stat card:** icon + delta row, `typo-caption` label, `typo-subhead typo-tabular` value
- **Status pill:** `rounded-full bg-muted border typo-caption`
- **AI insight:** `border border-primary/20` compact card
- **Product toggle:** underline `border-b border-primary` on active tab

## Delta vs prior implementation

| Area | Before | Stitch / Linear |
|---|---|---|
| Sidebar width | 256px | 240px |
| Page title | 32px in header | 28px headline in page content |
| Header | Page title left | Brand + product tabs |
| Active nav | primary/10 fill | card + hairline border |
| Main max width | 1600px | 1280px |
| Card radius | 24px override | 12px (`--radius-card`) |
| Typography source | typography.ts inline sizes | globals.css `.typo-*` only |
