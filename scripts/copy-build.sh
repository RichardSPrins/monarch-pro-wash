#!/usr/bin/env bash
# Regenerate every copy draft from scratch, in the only order that is correct.
#
#   1. copy-rewrite.mjs   defects, trust bars, review disclaimer, paragraph splits
#   2. the 3 re-ingested post-construction pages, which copy-rewrite does not emit
#      because they need no further patching
#   3. copy-rewrite.mjs again so those 3 get the global passes too
#   4. copy-prose.mjs     hand-written prose, company-first flips, lead-ins
#
# Running copy-prose before copy-rewrite discards the prose. Always use this.
set -euo pipefail
cd "$(dirname "$0")/.."
PAGES="${1:-/tmp/claude-501/pages-corrected.json}"
FIXED="${2:-/tmp/claude-501/ingest-fixed}"

node scripts/copy-rewrite.mjs --pages "$PAGES" --write >/dev/null
for t in nampa eagle caldwell; do
  cp "$FIXED/sia-$t--post-construction-cleanup.json" .emdash/ingest/
done
node scripts/copy-rewrite.mjs --pages "$PAGES" --write >/dev/null
node scripts/copy-prose.mjs --write >/dev/null
node scripts/copy-review-report.mjs
