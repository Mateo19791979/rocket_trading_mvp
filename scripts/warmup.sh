#!/usr/bin/env bash

set -euo pipefail

API_BASE="${API_BASE:-https://trading-mvp.com/api}"
WARM_ENDPOINTS="${WARM_ENDPOINTS:-/health,/status,/providers,/positions}"

echo "==[WARMUP]== $API_BASE"

IFS=',' read -ra EP <<< "$WARM_ENDPOINTS"

for p in "${EP[@]}"; do
  echo "→ $API_BASE$p"
  curl -sS "$API_BASE$p" >/dev/null || true
done

echo "✅ Warmup terminé"