#!/usr/bin/env bash
set -euo pipefail
echo "== J5: QA finale =="

# 1) Pages vitales
for url in \
  "${APP_BASE_URL}/" \
  "${APP_BASE_URL}/dashboard" "${APP_BASE_URL}/agents" "${APP_BASE_URL}/kb" "${APP_BASE_URL}/readiness" \
; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" "$url")
  echo "$url -> $code"
  [ "$code" = "200" ] || { echo "❌ $url != 200"; exit 1; }
done

# 2) API routes clés
for url in \
  "${API_BASE_URL}/quotes?symbols=AAPL,MSFT&src=auto" \
  "${API_BASE_URL}/providers/health" "${API_BASE_URL}/sources/cmv/scan" "${API_BASE_URL}/security/rls/health" \
; do
  curl -sS "$url" | jq '.ok' | grep -q true || echo "⚠️ check: $url"
done

# 3) WebSocket handshake
node -e "const WebSocket=require('ws');const ws=new WebSocket(process.env.WS_URL);ws.on('open',()=>{console.log('WS OK');process.exit(0)});setTimeout(()=>process.exit(2),5000);" || { echo "❌ WS handshake"; exit 1; }

echo "✅ J5 OK"