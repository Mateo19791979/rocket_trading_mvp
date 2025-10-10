#!/usr/bin/env bash
set -euo pipefail
echo "== J1: Boot guard & redeploy =="

# 1) Vérif RLS Health + Auto-Repair (via ton endpoint backend)
curl -sS "${API_BASE_URL}/security/rls/health" | jq . || { echo "❌ RLS health unreachable"; exit 1; }

# Auto-repair si besoin
curl -sS -X POST -H "x-internal-key: ${INTERNAL_ADMIN_KEY}" \
  "${API_BASE_URL}/security/rls/repair" | jq .

# 2) Redéploiement API/WS/Traefik (adapté à ton orchestrateur)
# Exemple: docker compose
if [ "${DOCKER:-0}" -eq 1 ]; then
  docker compose pull && docker compose up -d
fi

# 3) Sanity checks
curl -sS -o /dev/null -w "%{http_code}\n" "${API_BASE_URL}/readyz" | grep -q 200 || { echo "❌ /readyz"; exit 1; }
echo "✅ J1 OK"