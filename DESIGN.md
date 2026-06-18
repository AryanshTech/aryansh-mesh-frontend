# AryanshMesh — Design System

> Adapted from Stripe-inspired [DESIGN-stripe.md](/Users/yashmehta/Downloads/DESIGN-stripe.md).
> Register: **product** (Impeccable product register). Motion: Emil design-engineering principles.

---

## Principles

1. **Design serves the task** — familiar app patterns (sidebar, tables, forms). No marketing hero mesh inside authenticated product chrome.
2. **Indigo is for action** — `#533afd` on primary buttons, links, focus rings only. Body text uses ink navy.
3. **Thin type in chrome, readable body** — Inter 300 on headings in auth/marketing moments; 400 on buttons and captions. Fixed rem scale in app UI (no fluid clamp on labels).
4. **shadcn only** — all primitives from `design-system/components/ui/`. Customize via variants and CSS variables, not parallel component libraries.
5. **Motion conveys state** — 150–250ms ease-out on overlays; no animation on sidebar toggle or command palette; `prefers-reduced-motion` required.

---

## Color tokens

Source of truth: `aryansh-mesh/src/design-system/tokens/colors.ts` (Phase 2). Values match Business Manager today.

| Token | Hex | Use |
|-------|-----|-----|
| `primary` | `#533afd` | Primary CTA, link emphasis, focus ring |
| `primaryDeep` | `#4434d4` | Hover on primary, tag text |
| `primaryPress` | `#2e2b8c` | Button `:active` / pressed |
| `primarySoft` | `#665efd` | Chart accents, subtle highlights |
| `primaryMuted` | `#b9b9f9` | Soft tag background |
| `brandDark` | `#1c1e54` | Sidebar chrome, featured dark surfaces |
| `ink` | `#0d253d` | Primary body text (≥4.5:1 on canvas) |
| `inkSecondary` | `#273951` | Secondary text |
| `inkMute` | `#64748d` | Captions, table headers |
| `onPrimary` | `#ffffff` | Text on indigo / brand dark |
| `canvas` | `#ffffff` | Main content background |
| `canvasSoft` | `#f6f9fc` | Page background, alternate bands |
| `canvasCream` | `#f5e9d4` | Optional warm callout bands (sparse) |
| `hairline` | `#e3e8ee` | Card and table borders |
| `hairlineInput` | `#a8c3de` | Default input border |
| `success` | `#059669` | Success states |
| `warning` | `#D97706` | Warning states |
| `error` | `#DC2626` | Error states |

### CSS variables (shadcn / Tailwind)

Map HSL equivalents in `globals.css` for shadcn semantic slots:

- `--background` → canvas soft
- `--foreground` → ink
- `--primary` → primary indigo
- `--sidebar` → brand dark
- `--sidebar-foreground` → on primary
- `--border` → hairline
- `--ring` → primary

Contrast: bump `inkMute` toward `inkSecondary` if placeholder or helper text fails 4.5:1 on `canvasSoft`.

---

## Typography

**Font stack:** `Inter, "SF Pro Display", system-ui, sans-serif` (Sohne substitute).

| Token | Size | Weight | Line height | Letter spacing | Use |
|-------|------|--------|-------------|----------------|-----|
| `displayXxl` | 3.5rem | 300 | 1.03 | -0.025em | Auth hero headline only |
| `displayXl` | 3rem | 300 | 1.15 | -0.02em | Auth sub-hero |
| `displayLg` | 2rem | 300 | 1.1 | -0.02em | Empty states, marketing moments |
| `headingLg` | 1.375rem | 300 | 1.1 | -0.01em | Page titles |
| `headingMd` | 1.25rem | 300 | 1.4 | -0.01em | Section titles |
| `headingSm` | 1.125rem | 300 | 1.4 | 0 | Card titles |
| `bodyLg` | 1rem | 300 | 1.4 | 0 | Lead paragraphs |
| `bodyMd` | 0.9375rem | 300 | 1.4 | 0 | Default UI body |
| `bodyTabular` | 0.875rem | 300 | 1.4 | -0.03em | Money, counts (`font-feature-settings: "tnum"`) |
| `buttonMd` | 1rem | 400 | 1 | 0 | Button labels |
| `buttonSm` | 0.875rem | 400 | 1 | 0 | Compact buttons |
| `caption` | 0.8125rem | 400 | 1.4 | -0.03em | Helpers, table labels |
| `micro` | 0.6875rem | 300 | 1.4 | 0 | Fine print |

**Rules:**

- Cap hero/display at 6rem max in auth layouts.
- Use `text-wrap: balance` on h1–h3 where supported.
- Tabular figures on any currency, booking count, or deal amount cell.
- No all-caps body copy; uppercase only for micro labels ≤4 words.

---

## Spacing and radius

| Spacing | Value |
|---------|-------|
| xxs | 2px |
| xs | 4px |
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 24px |
| xxl | 32px |
| huge | 64px |

| Radius | Value | Use |
|--------|-------|-----|
| xs | 4px | Tags |
| sm | 6px | Inputs |
| md | 8px | Compact cards |
| lg | 12px | Cards, panels |
| xl | 16px | Large panels |
| pill | 9999px | Buttons, chips |

---

## Elevation

| Level | Shadow | Use |
|-------|--------|-----|
| 0 | none | Flat surfaces |
| 1 | `0 1px 3px rgba(0,55,112,0.08)` | Cards on white |
| 2 | `0 8px 24px rgba(0,55,112,0.08), 0 2px 6px rgba(0,55,112,0.04)` | Dialogs, floating panels |

Auth pages may use an SVG gradient mesh in the hero band only (optional Phase 2 asset). Product chrome does not use gradient mesh backgrounds.

---

## shadcn component rules

Style: **new-york**. Install via `components.json` at repo root.

| Component | Customization |
|-----------|---------------|
| `Button` | `rounded-full`; variants: `default` (primary pill), `secondary` (outline primary), `onDark`; `:active:scale-[0.97]`; transition `transform 160ms cubic-bezier(0.23, 1, 0.32, 1)` |
| `Input` / `Textarea` | `rounded-sm`; border `hairlineInput`; focus ring primary |
| `Card` | `rounded-lg`; border hairline; shadow level 1 optional |
| `Sidebar` | Background `brandDark`; foreground `onPrimary`; no glassmorphism |
| `Dialog` / `Sheet` | Enter 200ms ease-out; exit 150ms; `transform-origin` from Radix vars on popovers |
| `Table` | Tabular nums on numeric columns |
| `Badge` | Pill shape; soft primary variant for tags |

**Banned:** gradient text, side-stripe card accents, decorative glass cards, identical icon+heading card grids as default layout.

---

## Motion

| Interaction | Duration | Easing | Notes |
|-------------|----------|--------|-------|
| Button press | 160ms | ease-out | `scale(0.97)` on `:active` |
| Dropdown / select | 150–200ms | `cubic-bezier(0.23, 1, 0.32, 1)` | ease-out enter |
| Modal / drawer | 200–300ms | ease-out enter | No bounce |
| Sidebar collapse | 0ms | — | No animation |
| Command palette | 0ms | — | No animation |
| Toast | 200ms | ease | Sonner defaults |
| Page load | — | — | Skeletons, not staggered section reveals |

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Popover entry: start `scale(0.97)` + `opacity: 0`, not `scale(0)`.

---

## Layout

- **App shell:** fixed sidebar (brand dark) + scrollable main (`canvas` / `canvasSoft`).
- **Page max width:** prose blocks 65–75ch; tables may span full content width.
- **Z-index scale:** dropdown 50 → sticky 40 → modal backdrop 100 → modal 110 → toast 120 → tooltip 130.
- **Responsive:** sidebar collapses to sheet on `< md`; tables scroll horizontally or switch to card list on mobile.

---

## Marketing Hub migration note

Legacy Marketing Hub uses a dark full-page theme (`#090909`). Mesh **replaces** that with the light product shell above. Studio density (kanban, mindmap, tables) is preserved; only surfaces and tokens change.

---

## File locations (Phase 2)

```
aryansh-mesh/src/design-system/
├── tokens/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radius.ts
│   └── motion.ts
├── styles/
│   └── globals.css
└── components/ui/          # shadcn only
```

All colors and font sizes in tokens files. All copy in `locales/en.json` and `locales/fr.json`.
