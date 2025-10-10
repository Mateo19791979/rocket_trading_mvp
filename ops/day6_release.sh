#!/usr/bin/env bash
set -euo pipefail
echo "== J6: Release & certification =="

# 1) Backup DB (si accès direct PG disponible)
if command -v pg_dump >/dev/null 2>&1; then
  TS=$(date +%Y%m%d_%H%M%S)
  pg_dump "${PG_URL:?PG_URL non défini}" -Fc -f "backup_${TS}.dump"
  echo "➡️ Backup: backup_${TS}.dump"
else
  echo "ℹ️ pg_dump non dispo, saute backup local (utilise backup Supabase natif)"
fi

# 2) Tag Git (si repo git)
if [ -d .git ]; then
  git tag -a "v1.0.0-PROD" -m "Rocket Trading MVP — 100% prod" || true
  git push --tags || true
fi

# 3) Sentry release (optionnel)
if command -v sentry-cli >/dev/null 2>&1; then
  sentry-cli releases new "rocket-mvp@1.0.0"
  sentry-cli releases finalize "rocket-mvp@1.0.0"
fi

echo "✅ Release marquée. Vérifie: SSL Labs (A+), ZAP (pas de High/Critical), Grafana vert, Sentry calme."