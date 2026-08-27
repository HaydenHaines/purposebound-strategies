#!/usr/bin/env bash
# Guards the CMS refactor: rendered HTML must not change.
# usage: scripts/html-parity.sh snapshot   # build + save baseline
#        scripts/html-parity.sh check      # build + diff against baseline
set -euo pipefail
cd "$(dirname "$0")/.."
BASE=.parity/baseline
CUR=.parity/current
npm run build --silent >/dev/null
case "${1:-}" in
  snapshot)
    rm -rf "$BASE"; mkdir -p "$BASE"
    (cd dist && find . -name '*.html' | cpio -pdm "../$BASE" 2>/dev/null)
    echo "baseline: $(find "$BASE" -name '*.html' | wc -l | tr -d ' ') pages" ;;
  check)
    rm -rf "$CUR"; mkdir -p "$CUR"
    (cd dist && find . -name '*.html' | cpio -pdm "../$CUR" 2>/dev/null)
    # Ignore pages that are intentionally added/removed (see plan Global Constraints).
    if diff -r -x 'alt' -x 'admin' "$BASE" "$CUR"; then echo "HTML parity: OK"; else echo "HTML parity: DIFF (see above)"; exit 1; fi ;;
  *) echo "usage: $0 snapshot|check"; exit 2 ;;
esac
