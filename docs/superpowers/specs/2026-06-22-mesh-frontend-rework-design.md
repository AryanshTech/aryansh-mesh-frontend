# Aryansh Mesh Frontend — Full Rework Design Spec

**Date:** 2026-06-22  
**Status:** Approved for implementation  
**Backend:** `https://business-manager-api-446539388186.northamerica-northeast1.run.app` (monolith, single Cloud Run service)  
**Replaces:** `aryansh-mesh-frontend/` (existing codebase — full scratch rewrite, same repo directory)

---

## 1. Design decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| Visual theme | Dark Precision — near-black `#010102` canvas, `#0d0d11` card surface, `#1a1b1e` border, lavender `#5e6ad2` accent | Linear/Vercel DNA; power-user B2B feel |
| Shell | Persistent 220px sidebar (always labeled, no icon-rail collapse) + sticky 48px header | Standard CRM pattern; always-visible labels aid navigation |
| Content | Card ↔ List toggle on every list page, persisted to `localStorage` | User-controlled density preference |
| Detail panel | Right Sheet on < 1280px; auto-promotes to inline split-pane on ≥ 1280px | Responsive; no wasted horizontal space on wide screens |
| Component library | shadcn/ui new-york (already initialized) + Tailwind v4 | Existing primitives, no new dep |
| Architecture | Molecular (atoms → molecules → organisms → pages) | Clear boundaries, easy to test and replace parts |
| Motion | Emil Kowalski principles: ease-out custom curves, <300ms UI, stagger on lists, `prefers-reduced-motion` gate | Feels alive without being distracting |
| i18n | EN + FR keys in `locales/en.json` / `locales/fr.json` | Required by existing blueprint |

---

## 2. Backend API (monolith — single base URL)

**Base:** `https://business-manager-api-446539388186.northamerica-northeast1.run.app/api/v1`  
**Local dev:** `http://localhost:8080/api/v1`  
**Vite proxy:** `/api` → `http://localhost:8080`

All authenticated routes require `Authorization: Bearer <jwt>`.

### Auth

| Method | Path | Auth |
|---|---|---|
| POST | `/auth/login` | No |
| POST | `/auth/signup` | No |
| POST | `/auth/refresh` | No |
| POST | `/auth/password-reset` | No |
| POST | `/auth/session` | Bearer |
| POST | `/auth/accept-invite` | Bearer |
| GET | `/me` | Bearer |

### Business (tenant-scoped)

All under `/tenants/{tenantId}/`:

| Domain | Endpoints |
|---|---|
| Dashboard | `GET /dashboard` |
| Business profile | `GET /business`, `PUT /business`, `POST /business/logo` |
| Products | `GET /products`, `GET /products/{id}`, `POST /products`, `PATCH /products/{id}`, `DELETE /products/{id}`, `POST /products/{id}/images` |
| Clients | `GET /clients`, `GET /clients/{id}`, `POST /clients`, `PATCH /clients/{id}`, `DELETE /clients/{id}` |
| Bookings | `GET /bookings` |
| Costs | `GET /costs`, `POST /costs`, `PATCH /costs/{id}`, `DELETE /costs/{id}` |
| Locations | `GET /locations`, CRUD, `POST /locations/{id}/images` |
| Testimonials | `GET /testimonials`, CRUD, `POST /testimonials/{id}/photos` |
| Content | `GET /content-collections`, CRUD, item CRUD |
| Publish | `GET /publish/status`, `POST /publish`, `GET /publish/latest` |

### Admin

| Endpoints |
|---|
| `GET /admin/tenants`, `POST /admin/tenants`, `GET /admin/tenants/{id}`, `PATCH /admin/tenants/{id}` |

### Marketing

| Domain | Endpoints |
|---|---|
| Companies | `GET /companies`, `POST /companies`, `GET /companies/{id}`, `PUT /companies/{id}`, `DELETE /companies/{id}` |
| Projects | `GET /companies/{id}/projects`, `POST /companies/{id}/projects`, `GET /projects/{id}`, `PUT /projects/{id}`, `GET/PUT /projects/{id}/brief` |
| Threads | `GET /projects/{id}/threads`, `POST /projects/{id}/threads`, `GET /threads/{id}` |
| Messages | `GET /threads/{id}/messages`, `POST /threads/{id}/messages` (SSE stream) |
| Brand Memory | `GET/POST /projects/{id}/brand-memories`, `GET /brand-memories/current`, `PUT /brand-memories/{id}/current` |
| Social Posts | `GET/POST /projects/{id}/social-posts`, `GET/PUT /{id}`, `POST /{id}/approve`, `POST /{id}/reject`, `POST /{id}/schedule` |

### Public (no auth)

| Endpoints |
|---|
| `GET /public/tenants/{slug}/snapshot` |
| `GET /public/tenants/{slug}/availability?date=YYYY-MM-DD` |
| `POST /public/tenants/{slug}/bookings` |

---

## 3. Project structure — Molecular Architecture

```
aryansh-mesh-frontend/       ← same repo, full scratch replace
├── index.html
├── vite.config.ts
├── components.json           (shadcn config — keep existing)
├── locales/
│   ├── en.json
│   └── fr.json
└── src/
    ├── main.tsx
    ├── app/
    │   ├── App.tsx            router + providers
    │   ├── router.tsx         React Router v6 routes
    │   └── providers.tsx      QueryClient, Auth, Theme, i18n, Toaster
    │
    ├── core/                  ← NO product imports
    │   ├── api/
    │   │   ├── client.ts      axios instance, Bearer injection, error envelope
    │   │   └── types.ts       ApiError, ErrorEnvelope
    │   ├── auth/
    │   │   ├── AuthProvider.tsx
    │   │   ├── use-auth.ts
    │   │   ├── guards.tsx     ProtectedRoute, AdminRoute
    │   │   └── token-storage.ts
    │   └── query/
    │       └── client.ts      TanStack Query client
    │
    ├── design-system/         ← atoms
    │   ├── styles/
    │   │   └── globals.css    Tailwind v4 + Dark Precision tokens
    │   ├── components/ui/     shadcn primitives (button, card, input, …)
    │   └── lib/utils.ts       cn()
    │
    ├── shell/                 ← organisms: persistent chrome
    │   ├── AppShell.tsx       sidebar + header + outlet
    │   ├── AuthShell.tsx      centered card layout for auth pages
    │   ├── Sidebar.tsx        220px nav, brand, search, sections, user footer
    │   ├── Header.tsx         48px sticky bar, breadcrumb, page actions portal
    │   ├── UserMenu.tsx
    │   └── CommandPalette.tsx ⌘K
    │
    ├── shared/                ← molecules/organisms reused across modules
    │   ├── components/
    │   │   ├── PageHeader.tsx      title + description + actions
    │   │   ├── DataTable.tsx       list-view table
    │   │   ├── DataGrid.tsx        card-view grid
    │   │   ├── ViewToggle.tsx      card ↔ list toggle button
    │   │   ├── DetailDrawer.tsx    responsive sheet/split-pane wrapper
    │   │   ├── StatusBadge.tsx
    │   │   ├── ConfirmDialog.tsx
    │   │   ├── ImageUpload.tsx
    │   │   ├── EmptyState.tsx
    │   │   └── PageShell.tsx       content area wrapper with padding
    │   └── hooks/
    │       ├── use-view-mode.ts    card|list toggle + localStorage
    │       ├── use-mobile.ts
    │       └── use-debounce.ts
    │
    └── modules/
        ├── auth/
        │   ├── pages/
        │   │   ├── LoginPage.tsx
        │   │   ├── SignUpPage.tsx
        │   │   ├── ForgotPasswordPage.tsx
        │   │   └── AcceptInvitePage.tsx
        │   ├── api/auth-api.ts
        │   └── types.ts
        │
        ├── business/
        │   ├── api/
        │   │   ├── client.ts          tenant-scoped api helpers
        │   │   ├── query-keys.ts
        │   │   └── hooks/             one file per domain
        │   │       ├── use-dashboard.ts
        │   │       ├── use-products.ts
        │   │       ├── use-clients.ts
        │   │       ├── use-bookings.ts
        │   │       ├── use-costs.ts
        │   │       ├── use-locations.ts
        │   │       ├── use-testimonials.ts
        │   │       ├── use-content.ts
        │   │       ├── use-business.ts
        │   │       └── use-publish.ts
        │   ├── types/
        │   │   └── entities.ts
        │   ├── pages/
        │   │   ├── DashboardPage.tsx
        │   │   ├── ProductsPage.tsx
        │   │   ├── ClientsPage.tsx
        │   │   ├── BookingsPage.tsx
        │   │   ├── CostsPage.tsx
        │   │   ├── LocationsPage.tsx
        │   │   ├── TestimonialsPage.tsx
        │   │   ├── ContentPage.tsx
        │   │   ├── BusinessProfilePage.tsx
        │   │   ├── PublishPage.tsx
        │   │   └── OnboardingPage.tsx
        │   └── routes.tsx
        │
        ├── marketing/
        │   ├── api/
        │   │   ├── client.ts
        │   │   ├── query-keys.ts
        │   │   └── hooks/
        │   │       ├── use-companies.ts
        │   │       ├── use-projects.ts
        │   │       ├── use-threads.ts
        │   │       ├── use-messages.ts
        │   │       ├── use-brand-memory.ts
        │   │       └── use-social-posts.ts
        │   ├── types/
        │   │   └── entities.ts
        │   ├── pages/
        │   │   ├── AgencyOverviewPage.tsx
        │   │   ├── CompaniesPage.tsx
        │   │   ├── CompanyProjectsPage.tsx
        │   │   ├── ProjectDashboardPage.tsx
        │   │   ├── ThreadWorkspacePage.tsx
        │   │   ├── BrandMemoryPage.tsx
        │   │   └── SocialCalendarPage.tsx
        │   └── routes.tsx
        │
        └── admin/
            ├── api/
            │   └── use-tenants.ts
            ├── pages/
            │   ├── TenantListPage.tsx
            │   ├── TenantDetailPage.tsx
            │   └── TenantCreatePage.tsx
            └── routes.tsx
```

---

## 4. Shell design

### Sidebar (220px, always expanded)
- **Brand block** — 28px icon + "Aryansh Mesh" + zone label ("Business Manager" or "Marketing Hub")
- **Inline search** — `⌘K` shortcut label, opens CommandPalette
- **Nav sections** with labels:
  - *Workspace*: Dashboard, Products, Clients, Bookings, Costs
  - *Content*: Locations, Testimonials, Content, Publish
  - *Marketing*: Companies (collapses into project sub-nav when inside a project)
  - *Admin*: Tenants (platform operators only)
- **User footer** — avatar, name, role, settings icon
- Active item: `rgba(94,106,210,0.1)` bg + `rgba(94,106,210,0.2)` border, left accent bar
- No mobile collapse — Sheet overlay on < 768px

### Header (48px sticky)
- Left: breadcrumb + page title
- Center: hidden on mobile; search input (delegates to CommandPalette)
- Right: page-action portal slot (primary CTA injected by each page) + publish status widget + user menu
- `bg-[#010102]` with `border-b border-[#1a1b1e]`

---

## 5. Page pattern (every list page)

```
PageHeader          title + description + [ViewToggle] [+ Add button]
FilterBar           search input + filter chips + result count
ViewToggle output:
  List → DataTable  columns: icon | name+meta | col1 | col2 | status | actions
  Card → DataGrid   2–4 cols, card with image area + name + price + status badge
DetailDrawer        right Sheet on <1280px; inline split-pane on ≥1280px
  └── form fields, image upload, status toggle, Save / Discard footer
```

Every page must have:
- Skeleton loading state (matching layout of actual content)
- Empty state: `EmptyState` component with icon + copy + primary CTA
- Error state: `Alert` variant="destructive" + Retry button
- Sonner toast on every mutation success/failure
- EN + FR locale keys

---

## 6. Design tokens (Dark Precision)

```css
/* globals.css — override existing vars */
--rgb-canvas: 1 1 2;            /* #010102 */
--rgb-canvas-elevated: 13 13 17; /* #0d0d11 */
--rgb-surface-2: 15 16 17;
--rgb-hairline: 26 27 30;        /* #1a1b1e */
--rgb-hairline-strong: 35 37 42;
--rgb-ink: 247 248 248;
--rgb-body: 208 214 224;
--rgb-mute: 138 143 152;
--rgb-faint: 98 102 109;
--rgb-primary: 94 106 210;       /* #5e6ad2 */
--rgb-primary-hover: 130 143 255;
```

Custom utilities to add:
- `.shadow-whisper` — `0 1px 2px rgb(0 0 0 / 0.12)`
- `.shadow-card` — `0 2px 8px -2px rgb(0 0 0 / 0.3)`
- `.shadow-floating` — `0 8px 24px -4px rgb(0 0 0 / 0.4)`
- `.glass-surface` — semi-transparent elevated bg + backdrop-filter

---

## 7. Motion spec (Emil principles)

| Element | Timing | Easing |
|---|---|---|
| Route change | 160ms fade + 6px translateY | `cubic-bezier(0.23, 1, 0.32, 1)` |
| List row stagger | 30ms delay per item, max 8 | same |
| Sheet open | 220ms translateX | `cubic-bezier(0.32, 0.72, 0, 1)` (drawer) |
| Sheet close | 180ms | ease-in |
| Button :active | 100ms scale(0.97) | ease-out |
| Card hover | 150ms border-color | ease |
| Skeleton → content | 200ms opacity crossfade | ease |
| Popover scale | 125ms from trigger origin | ease-out |
| View toggle switch | 150ms opacity + blur(2px) | ease |

All gated: `@media (prefers-reduced-motion: reduce) { transition-duration: 0.01ms }` already in globals.css.

---

## 8. View toggle behaviour

- Toggle button in `PageHeader` right slot: `⊞ Cards | ☰ List`
- State stored in `localStorage` key `mesh_view_mode_{pageName}`
- Switching applies 150ms crossfade (blur trick, no layout jump)
- Card grid: `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`
- List table: icon 32px | name+meta 1fr | cols 80px each | actions 80px

---

## 9. DetailDrawer behaviour

```
width < 1280px → shadcn Sheet side="right", width=min(100vw,400px)
              → dark overlay behind it
width ≥ 1280px → inline flex split: list shrinks, drawer appears as right panel
              → no overlay, no animation (instant)
```

Close: `✕` button top-right. Keyboard: `Escape`.  
Unsaved changes: show `ConfirmDialog` before closing.  
Drawer footer: **Discard** (ghost) | **Save changes** (primary).

---

## 10. Auth pages

- `AuthShell`: full-screen `#010102` canvas + ambient radial gradient (lavender + violet stops)
- Centered card: `bg-[#0d0d11]` border `#1a1b1e` rounded-2xl shadow-floating width 360px
- Brand icon 40px above form
- Form: shadcn `Form` + `react-hook-form` + `zod`
- Submit: full-width primary button with `Spinner` on loading state
- Error: `Alert` variant subtle-destructive above form

---

## 11. Query key namespacing

```typescript
["auth", "me"]
["business", tenantId, "dashboard"]
["business", tenantId, "products", filters]
["business", tenantId, "products", productId]
["business", tenantId, "clients", filters]
["business", tenantId, "bookings"]
["business", tenantId, "costs"]
["business", tenantId, "publish", "status"]
["business", "admin", "tenants", filters]
["marketing", "companies", filters]
["marketing", "projects", projectId]
["marketing", "threads", threadId, "messages"]
["marketing", "brand-memory", projectId]
["marketing", "social-posts", projectId]
```

---

## 12. Environment

```env
VITE_API_BASE_URL=https://business-manager-api-446539388186.northamerica-northeast1.run.app
# local dev:
VITE_API_BASE_URL=http://localhost:8080
```

API client adds `/api/v1` prefix. No hardcoded host in any component.

---

## 13. What is NOT in scope

- Marketing SSE streaming chat UI (ThreadWorkspacePage scaffold only — full chat in next iteration)
- Competitor spy page (scaffold only)
- CRM pipeline (scaffold only)
- Public website embed script
- Mobile-native gestures / Vaul drawer (future)

---

## 14. Acceptance criteria

Before any page is considered complete:

- [ ] Uses `VITE_API_BASE_URL` through shared client
- [ ] Loading skeleton matches layout
- [ ] Empty state uses `EmptyState` component
- [ ] Error state uses `Alert` + retry
- [ ] Every mutation fires a Sonner toast
- [ ] Card ↔ List toggle works and persists
- [ ] DetailDrawer works as Sheet on narrow, split on wide
- [ ] All user-facing strings in `locales/en.json` and `locales/fr.json`
- [ ] `prefers-reduced-motion` respected
- [ ] No cross-module imports (business ↔ marketing)
