#!/usr/bin/env bash
# Fail if deprecated Geist or type-* Tailwind classes appear in src/.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PATTERN='text-ink|bg-canvas|border-hairline|text-mute[^d]|text-prose|bg-hairline|type-heading-|type-body-|type-button-|type-mono-|type-label-|type-display-|type-card-|type-caption|type-eyebrow|type-headline|type-code|gap-md|px-sm|py-xs|p-lg|mt-md'

if rg -n "$PATTERN" "$ROOT/src" --glob '!**/tokens/colors.ts' 2>/dev/null; then
  echo "error: deprecated design token classes found (see matches above)" >&2
  exit 1
fi

echo "ok: no deprecated Geist/type-* classes in src/"
