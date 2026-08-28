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
    # Normalize content-hashed asset filenames (e.g. /_astro/about.B9zzyCDW.css) before
    # comparing, in temp copies only — never edits BASE/CUR on disk. The hash rotates
    # whenever a build's CSS/JS bytes change (e.g. Tailwind's purge set shrinking after a
    # dead component is deleted) even though every page's rendered output is identical;
    # that's a build artifact, not "rendered HTML".
    NORM_BASE=$(mktemp -d); NORM_CUR=$(mktemp -d)
    trap 'rm -rf "$NORM_BASE" "$NORM_CUR"' EXIT
    cp -R "$BASE"/. "$NORM_BASE"/
    cp -R "$CUR"/. "$NORM_CUR"/
    for d in "$NORM_BASE" "$NORM_CUR"; do
      find "$d" -name '*.html' -print0 | xargs -0 sed -i '' -E 's#(/_astro/[A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+\.(css|js)#\1.HASH.\2#g'
    done
    # Ignore pages that are intentionally added/removed (see plan Global Constraints).
    if diff -r -x 'alt' -x 'admin' "$NORM_BASE" "$NORM_CUR"; then echo "HTML parity: OK"; else echo "HTML parity: DIFF (see above)"; exit 1; fi ;;
  *) echo "usage: $0 snapshot|check"; exit 2 ;;
esac
