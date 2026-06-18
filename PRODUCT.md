# AryanshMesh — Product Definition

> Canonical product context for the unified Aryansh platform frontend.
> Register: **product** (app UI serving two SaaS modules).

---

## Summary

**AryanshMesh** is a single React SPA that replaces the separate Business Manager and Marketing Hub frontends. Users sign in once, switch products from a shared shell, and work in either module without re-authenticating.

| Module | Audience | Core job |
|--------|----------|----------|
| **Business** | Tenant owners, admins, editors, viewers | Manage business profile, catalog, clients, locations, content, bookings, and publish to public APIs |
| **Marketing** | Platform team, platform admins | Run GTM workflows: companies, projects, studio, content, social, CRM, AI workspace |

Backends (`auth-api`, `business-manager-api`, `marketing-hub-api`) and `api-gateway` stay unchanged. Only the client consolidates.

---

## Users and roles

### Platform

| Role (session) | Business module | Marketing module | Default landing |
|----------------|-----------------|------------------|-----------------|
| `platform_super_admin` / `PLATFORM_ADMIN` | Full admin + tenant workspace | Full access | `/business/admin/tenants` |
| `platform_team` / `PLATFORM_TEAM` | View/edit per service claim | Full GTM access | `/marketing` |

### Business (tenant)

| Role | Capabilities |
|------|--------------|
| `tenant_owner` | Onboarding, publish, team admin, all editor actions |
| `tenant_admin` | Team admin, publish, editor actions |
| `tenant_editor` | CRUD on tenant resources |
| `tenant_viewer` | Read-only tenant resources |

Service entitlements come from Firebase custom claims (`services`: `business-manager`, `marketing-hub`). The product switcher hides modules the user cannot access.

---

## Success criteria

1. **Single sign-on** — one Firebase login, one session sync, one token refresh path.
2. **Full parity** — every route and API flow from `business-manager` and `marketing-hub` works in Mesh before legacy apps are retired.
3. **Unified design** — Stripe-inspired light product shell (see [DESIGN.md](./DESIGN.md)); Marketing Hub dark theme is retired.
4. **Single deploy** — one Firebase Hosting site; BM and MH hosting sites redirect after cutover.
5. **i18n** — English and French for all user-visible strings via namespaced locale files.
6. **Modular codebase** — Business and Marketing modules do not import each other; shared logic lives in `core/`, `shell/`, `design-system/`, `shared/`.

---

## Non-goals (Phase 1)

- New backend APIs or schema changes (except gateway route fixes documented in [API-INTEGRATION.md](./API-INTEGRATION.md)).
- Marketing Hub browser extension changes (`marketing-hub-extension/`).
- Landing page (`landing-page/`) — separate Firebase project and repo.

---

## Scene sentence (design intent)

A platform operator or tenant admin sits at a desk in normal office lighting, switching between CRM tasks and agency GTM work in one tab. The interface is calm, light, and dense enough for daily operations: navy sidebar chrome, white content canvas, indigo reserved for primary actions.

---

## Related documents

| Doc | Purpose |
|-----|---------|
| [DESIGN.md](./DESIGN.md) | Tokens, typography, motion, shadcn rules |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Folder layout and module boundaries |
| [ROUTES.md](./ROUTES.md) | URL map and legacy redirects |
| [FEATURE-INVENTORY.md](./FEATURE-INVENTORY.md) | Parity checklist by feature |
| [API-INTEGRATION.md](./API-INTEGRATION.md) | Auth and API client |
| [I18N.md](./I18N.md) | Locale merge strategy |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Firebase, CI, CORS |
| [MIGRATION-CHECKLIST.md](./MIGRATION-CHECKLIST.md) | Cutover gates |
