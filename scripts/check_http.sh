#!/usr/bin/env bash

set -euo pipefail

API_BASE="${API_BASE:-https://trading-mvp.com/api}"
HEALTH_PATH="${HEALTH_PATH:-/health}"

echo "==[HTTP CHECK]== $API_BASE$HEALTH_PATH"

code=$(curl -sS -o /tmp/h.out -w "%{http_code}" "$API_BASE$HEALTH_PATH" || true)

echo "HTTP $code"
cat /tmp/h.out || true

if [ "$code" -ge 200 ] && [ "$code" -lt 300 ]; then
  echo "✅ API HEALTH OK"
else
  echo "❌ API health KO"
  exit 3
fi