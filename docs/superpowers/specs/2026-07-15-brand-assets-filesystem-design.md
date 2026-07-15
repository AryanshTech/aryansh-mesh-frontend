# Brand Assets Filesystem — Design

**Date:** 2026-07-15  
**Status:** Approved direction (user confirmed overview; full ops + agent/Nano Banana access)  
**Repos:** Frontend `aryansh-mesh-frontend`, Backend `businessManagerBackend`

## Problem

Assets today is a flat approval grid. Marketers need a persistent brand media library (images + videos) with a filesystem feel, plus Generated outputs from Create / Nano Banana. Agents (AAMs) and Nano Banana must read that library when generating.

## Goals

1. One **Assets** tab with **Brand** and **Generated** areas.
2. Brand starter folders: Logos, Product, People, Video.
3. Full library ops: upload, preview, rename, move, delete; approve/reject on Generated.
4. Generation access: auto-attach a default brand set + optional picker (desk, agents, Nano Banana).

## Non-goals (v1)

- Nested folders beyond starter set / one level under Brand.
- Sharing, permissions per file, versioning, CDN transforms.
- Separate storage system or Brand Identity binary fields.
- Real-time collaborative drive UX.

## Architecture

Reuse **CreativeAsset** + GCS attachments. Virtual folders via metadata — no Folder collection.

```
CreativeAsset
  runId?: string | null
  assetType: IMAGE | VIDEO | …
  label, url, attachmentId, approvalStatus
  metadata:
    scope: "brand" | "generated"
    folderPath: "/Brand/Logos" | "/Brand/Product" | "/Brand/People" | "/Brand/Video" | "/Generated" | "/Generated/{runId}"
    (existing) generator, model, prompt for Nano Banana
```

**Invariants**

- Brand: `scope=brand`, `runId=null`, `folderPath` under `/Brand/…`, default `approvalStatus=approved`.
- Generated: `scope=generated`, optional `runId`, `folderPath` `/Generated` or `/Generated/{runId}`; Nano Banana uploads set this automatically.
- Legacy assets (no scope): treat as **Generated** (`/Generated` or `/Generated/{runId}` if `runId` present).

## UI

### Layout

- Segment control: **Brand | Generated**.
- Brand: left folder rail (Logos, Product, People, Video) + breadcrumb + file grid.
- Generated: flat/grid by recency; optional group by run; approve/reject in detail panel.
- File cards: thumbnail (image/video poster), label, type badge; click → detail (preview, rename, move, delete).
- Toolbar: Upload (into current Brand folder), type filter (image/video), search by label.

### Ops

| Action | Brand | Generated |
|--------|-------|-----------|
| Upload | Current folder | Optional; usually from Create |
| Rename | Yes | Yes |
| Move | Between Brand starter folders | Between Generated / run paths (light) |
| Delete | Yes (GCS + Firestore) | Yes |
| Approve/Reject | Hidden | Yes |

Starter folders are always listed (even empty). No “create folder” in v1.

## Backend API

Existing: list, create-from-URL, upload, generate-image, patch status.

**Add / extend**

1. **Upload** — accept `folderPath`, `scope` (multipart fields or JSON sidecar). Controllers today pass `Map.of()`; pass through metadata.
2. **PATCH `/assets/{id}`** — `label`, `metadata` (merge), optional clear `runId` when moving to Brand.
3. **DELETE `/assets/{id}`** — delete Firestore asset + GCS object via attachment id.
4. **List brand refs** (optional helper): `GET …/assets?scope=brand` or client-filter list; if volume grows later, server filter.

**Nano Banana `generateImageFromPrompt`**

- Set `scope=generated`, `folderPath=/Generated` or `/Generated/{runId}`.
- Accept optional `referenceAssetIds[]`; load brand images and pass as multimodal reference parts to Vertex when present.
- Always merge **default brand set** unless `skipBrandDefaults=true`: prefer 1 from `/Brand/Logos` + up to 2 from `/Brand/Product` (newest approved/brand images).

**Agents / AAM / desk prompts**

- `BrandContextService` (or sibling) exposes `formatBrandAssetLibraryForPrompt(projectId)` listing labels + folder + public media URLs for default set.
- Thread/agent context and image-brief / pixel flows include that block + any user-picked asset ids from the Create picker.

## Frontend API hooks

Extend `use-creative.ts`:

- `useUploadCreativeAsset` — pass `scope`, `folderPath`.
- `useUpdateCreativeAsset` — rename/move.
- `useDeleteCreativeAsset`.
- Helpers: `brandFolderPaths`, `resolveAssetScope`, `defaultBrandReferenceAssets(assets)`.

New UI pieces (can live under `CreativeAssetsTab` or split):

- `AssetLibraryTab` (or rewrite `CreativeAssetsTab`) — filesystem shell.
- `BrandAssetPicker` — multi-select used on Marketing Desk before Nano Banana / image brief.

## Data flow — generation

```
Brand library (GCS)
        │
        ├─ Auto default set (logo + ≤2 product)
        └─ Optional picker selection
                │
                ▼
   Desk / Agent / Nano Banana request
                │
                ▼
   Prompt text + reference image bytes/URLs
                │
                ▼
   Output asset → scope=generated → Assets / Generated
```

## Error handling

- Upload MIME still: jpeg/png/webp/mp4 (+ zip for remotion packs).
- Delete: if GCS delete fails, still remove Firestore doc or return 502 and keep doc — prefer **best-effort GCS then Firestore**; surface toast on partial failure.
- Move to invalid folderPath → 400.
- Missing reference asset id → skip that id, do not fail whole generation.

## Testing

- Unit: scope/folder resolution for legacy assets; default brand set selection.
- API: upload with metadata; patch rename/move; delete; generate-image with references.
- UI smoke: Brand folder nav, upload into Logos, move to Product, delete; Generated approve; desk picker + generate.

## Implementation order

1. Backend metadata on upload + patch + delete.
2. Nano Banana / BrandContext brand-ref wiring (defaults + optional ids).
3. Frontend filesystem Assets UI.
4. Desk `BrandAssetPicker` wired to generate-image + agent prompts.
5. i18n + migrate UX for legacy assets as Generated.

## Success criteria

- Marketer can store brand images/videos under starter folders and manage them (rename/move/delete).
- Generated outputs appear under Generated with approve/reject.
- Nano Banana and agent/desk generation receive auto brand refs and optional picks without leaving Create.
