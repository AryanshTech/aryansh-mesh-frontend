# AryanshMesh

Unified frontend for the Aryansh platform — Business Manager and Marketing Hub in one React SPA.

## Stack

- React 19, Vite 6, TypeScript 5.8
- Tailwind CSS v4, shadcn/ui (new-york)
- TanStack Query, react-router-dom v7
- Firebase Auth + gateway session (`/api/v1`)
- i18next (EN / FR)

## Local development

```bash
cd aryansh-mesh
npm install
```

Create `.env` from your platform config (via `infra/platform.local.env`):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=http://localhost:8090
```

```bash
npm run dev
```

Dev server: **http://localhost:5175** — proxies `/api` → `http://localhost:8090`.

Start the API gateway and backends before signing in. See `../PLATFORM.md`.

## Structure

| Path | Purpose |
|------|---------|
| `src/app/` | Entry, providers, router |
| `src/core/` | Auth, API client, i18n, permissions |
| `src/design-system/` | Tokens, globals.css, shadcn UI |
| `src/shell/` | App layout, sidebar, product switcher |
| `src/modules/business/` | Business Manager features |
| `src/modules/marketing/` | Marketing Hub pages & components |
| `src/shared/` | Cross-module components |
| `locales/` | `en.json`, `fr.json` |

## Routes

- Business: `/business/*` (legacy `/dashboard`, `/products`, … redirect)
- Marketing: `/marketing/*` (legacy `/companies`, `/projects`, … redirect)
- Auth: `/login`, `/signup`, `/forgot-password`, `/accept-invite`

See `../docs/aryansh-mesh/ROUTES.md` for the full map.

## Docs

- `PRODUCT.md` — product definition
- `DESIGN.md` — design tokens and UI rules
- `../docs/aryansh-mesh/ARCHITECTURE.md` — module boundaries

## Deploy

Push to `main` runs `.github/workflows/deploy.yml` → Firebase Hosting. Configure GitHub vars per `../docs/aryansh-mesh/DEPLOYMENT.md`.

Proposed remote: `AryanshTech/aryansh-mesh-frontend`
