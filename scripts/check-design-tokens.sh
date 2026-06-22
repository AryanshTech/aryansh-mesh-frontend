#!/usr/bin/env bash
# Fail if deprecated token paths, legacy classes, or token bypasses appear.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LEGACY_PATTERN='text-ink|bg-canvas|border-hairline|text-mute[^d]|text-prose|bg-hairline|type-heading-|type-body-|type-button-|type-mono-|type-label-|type-display-|type-card-|type-caption|type-eyebrow|type-headline|type-code|gap-md|px-sm|py-xs|p-lg|mt-md|tracking-display|tracking-headline'
INLINE_SIZE_PATTERN='text-\[[0-9]+px\]'
DEFAULT_SHADOW_PATTERN='shadow-(sm|md|lg|xl|2xl)\b'
RAW_HEX_PATTERN='#[0-9a-fA-F]{3,8}\b'
STALE_TOKEN_PATH_PATTERN='src/design-system/styles/tokens\.css|src/design-system/tokens/colors\.ts|tokens\.css|colors\.ts'
OBSOLETE_IMPORT_PATTERN="modules/marketing/components/dashboard/(stat-card|data-table-card)"

if rg -n "$LEGACY_PATTERN" "$ROOT/src" --glob '!**/tokens/colors.ts' 2>/dev/null; then
  echo "error: deprecated design token classes found (see matches above)" >&2
  exit 1
fi

if rg -n "$INLINE_SIZE_PATTERN" "$ROOT/src" 2>/dev/null; then
  echo "error: inline text-[Npx] font sizes found; use .typo-* utilities from globals.css (see typography.ts)" >&2
  exit 1
fi

if rg -n "$DEFAULT_SHADOW_PATTERN" "$ROOT/src" 2>/dev/null; then
  echo "error: default Tailwind shadows found; use shadow-whisper, shadow-card, or shadow-floating" >&2
  exit 1
fi

if rg -n "$RAW_HEX_PATTERN" "$ROOT/src" \
  --glob '!src/design-system/styles/globals.css' \
  --glob '!src/design-system/tokens/platformColors.ts' \
  --glob '!src/**/*.svg' 2>/dev/null; then
  echo "error: raw hex colors found in runtime source; move values to globals.css or token files" >&2
  exit 1
fi

if rg -n "$OBSOLETE_IMPORT_PATTERN" "$ROOT/src" 2>/dev/null; then
  echo "error: obsolete marketing dashboard component imports found; use shared Linear components" >&2
  exit 1
fi

if rg -n "$STALE_TOKEN_PATH_PATTERN" "$ROOT/DESIGN.md" "$ROOT/IMMERSIVE-UX-PLAN.md" "$ROOT/docs" 2>/dev/null; then
  echo "error: stale token file references found; canonical runtime tokens live in globals.css" >&2
  exit 1
fi

echo "ok: design token guard passed"
