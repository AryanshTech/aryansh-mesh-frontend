# LinkedIn Pipeline Parity — Design

**Date:** 2026-07-15  
**Status:** Implementing (full parity per user choice)  
**Repos:** Frontend `aryansh-mesh-frontend`, Backend `businessManagerBackend`

## Problem

LinkedIn Create today is one-shot caption generation + calendar queue. Competitors demonstrate a trainable Knowledge base, gated multi-agent pipeline, learn-from-edits, and direct publish. We need reel parity.

## Goals

1. **Train** — LinkedIn personas with voice, content rules, inspiration posts, core profile (multi-client / ghostwriting).
2. **Gated pipeline** — seed → research/rank → pick topics → hooks → write/style → approve; keep Quick generate.
3. **Learn-from-edits** — propose durable style rules after revise/edit.
4. **Ship** — native LinkedIn OAuth publish; Typefully fallback; local schedule if neither connected.

## Non-goals

- Instagram/X pipelines in this track  
- Carousel builder  
- Scraping live LinkedIn history  

## Data model

### `linkedinPersonas/{id}` under marketing project

```
name, isDefault, coreProfile, voiceTone, contentRules,
inspirationPosts: [{ text, likes?, whyItWorks?, createdAt }],
updatedAt, createdAt, createdBy
```

### Pipeline state

Stored on creative run notes JSON under key `linkedinPipeline` (and/or `linkedinPipelineRuns/{runId}`).

### Integrations

`IntegrationProvider.LINKEDIN` credentials: `accessToken`, `refreshToken`, `expiresAt`, `memberUrn`.

Env (optional until LinkedIn app is approved):

- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `LINKEDIN_REDIRECT_URI`
- `LINKEDIN_PUBLISH_ENABLED` (default false until credentials present)

### Social posts

Add `externalPostId`. Schedule/publish sets `PUBLISHED` or `SCHEDULED` + external / typefully id.

## API surface

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/projects/{id}/linkedin/personas` | List / create |
| GET/PATCH/DELETE | `.../personas/{personaId}` | CRUD + set default |
| POST | `.../linkedin/pipeline/discover` | Research + ranked topics |
| POST | `.../linkedin/pipeline/develop` | Deep research + hooks |
| POST | `.../linkedin/pipeline/write` | Drafts in voice + style polish |
| POST | `.../linkedin/pipeline/propose-rules` | Learn-from-edits |
| GET | `.../linkedin/oauth/status` | Connected? enabled? |
| GET | `.../linkedin/oauth/start` | Auth URL |
| GET | `/api/v1/public/linkedin/oauth/callback` | Code exchange |
| POST | `.../linkedin/oauth/disconnect` | Revoke stored tokens |
| POST | `.../social-posts/{id}/publish` | Publish now |
| POST | `.../social-posts/{id}/schedule` | LinkedIn → Typefully → local |

Tenant twins under `/tenants/{tenantId}/marketing/linkedin/...`.

## UI

- Social hub (LinkedIn): Profile | **Train** | Create | Recipes  
- Create: Pipeline wizard + collapsed Quick generate  
- Calendar/Profile: Connect LinkedIn  

## Prompt context

Active persona KB prepended to discover/develop/write prompts; brand memory still company-level.
