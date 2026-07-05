# Aryansh Mesh Frontend

Unified React SPA for the Aryansh platform: **Business Manager**, **Marketing Hub**, and **platform admin** in one shell.

## Stack

| Layer | Choice |
|-------|--------|
| Runtime | React 19, TypeScript 5.8, Vite 6 |
| Styling | Tailwind CSS v4, shadcn/ui (new-york) |
| Data | TanStack Query v5 |
| Routing | react-router-dom v7 |
| Forms | react-hook-form + zod |
| i18n | i18next (English / French) |
| Auth | Backend JWT session (`/api/v1/auth/*`) |
| Deploy | Firebase Hosting via GitHub Actions |

## Prerequisites

- Node.js 22+
- npm
- Backend API reachable at the URL in `VITE_API_BASE_URL` (local default: `http://localhost:8080`)

## Local development

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Gateway root URL (no /api/v1 suffix)
VITE_API_BASE_URL=http://localhost:8080
VITE_COMPANY_SITE_URL=https://aryansh.tech
```

```bash
npm run dev
```

Dev server: **http://localhost:5175**

Vite proxies `/api` → `http://localhost:8080`. Start the backend before signing in.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 5175 |
| `npm run build` | Typecheck (`tsc -b`) and production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

## Project structure

```
src/
├── app/                 # Entry, providers, router
├── core/                # Auth, API client, tenant, i18n, theme, query
├── design-system/       # Tokens, globals.css, shadcn UI primitives
├── shell/               # AppShell, sidebar, header, command palette
├── modules/
│   ├── auth/            # Login, signup, invite, password reset
│   ├── business/        # Business Manager (CRM / ops)
│   ├── marketing/       # Marketing Hub (projects, threads, creative)
│   └── admin/           # Platform tenant management
└── shared/              # Cross-module components and hooks

locales/                 # en.json, fr.json
docs/                    # Architecture and design notes
```

Path alias: `@/` → `src/`.

## Routes

| Area | Paths |
|------|--------|
| Auth | `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/accept-invite` |
| Business | `/dashboard`, `/products`, `/clients`, `/bookings`, `/costs`, `/locations`, `/testimonials`, `/content`, `/business`, `/publish`, `/connect`, `/onboarding`, `/settings/team` |
| Marketing | `/marketing`, `/marketing/projects/:projectId`, `.../threads/:threadId`, `.../brand-memory`, `.../social` |
| Admin | `/admin/tenants`, `/admin/tenants/new`, `/admin/tenants/:tenantId` |

Legacy invite URL `/accept-invite` redirects to `/auth/accept-invite`.

## Conventions

- **Colors and typography** live in `src/design-system/tokens/` and CSS variables in `globals.css`. Prefer tokens over hard-coded values.
- **User-facing copy** goes in `locales/en.json` and `locales/fr.json` (never hard-code UI strings in components).
- **API access** goes through `src/core/api/client.ts` (`api.get/post/put/patch/delete`). Module hooks wrap TanStack Query.
- **Tenant scope**: business and marketing data are tenant-scoped; active tenant is managed by `ActiveTenantContext`.
- **Detail UX**: list pages use `DetailDrawer` (Sheet on narrow viewports, split pane on wide). Prefer drawer forms over nested dialogs for create/edit flows.

### Overlays inside drawers and dialogs

Radix Select menus and similar popovers must stay inside the drawer/dialog DOM subtree. Otherwise parent Sheet/Dialog layers treat them as outside clicks and collapse immediately.

| Pattern | Location |
|---------|----------|
| `OverlayPortalTarget` | Wraps drawer/dialog content; provides a local portal container |
| `SelectContent` | Portals into that container when present (falls back to document body) |
| `DetailDrawer` | Uses `OverlayPortalTarget` for create/edit forms |
| `DialogContent` | Same for FormDialog flows |

For new create flows on list pages, use **`DetailDrawer`** (not a nested `FormDialog` on top of a drawer). See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#shared-ui-patterns).

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Layers, modules, auth, data flow, UI patterns |
| [PRODUCT.md](PRODUCT.md) | Product summary |
| [docs/superpowers/specs/2026-06-22-mesh-frontend-rework-design.md](docs/superpowers/specs/2026-06-22-mesh-frontend-rework-design.md) | Original rework design spec |

## Deploy

Push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. Authenticate to GCP (Workload Identity)
2. `npm ci` + `npm run build` with `VITE_API_BASE_URL`
3. Deploy `dist/` to Firebase Hosting (SPA rewrite to `index.html`)

Configure GitHub repository variables as needed (`VITE_API_BASE_URL`, `FIREBASE_HOSTING_PROJECT`). Deploy identity is loaded from `deploy/github.env`.

## Repository

https://github.com/AryanshTech/aryansh-mesh-frontend
