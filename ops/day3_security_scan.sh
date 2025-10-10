#!/usr/bin/env bash
set -euo pipefail
echo "== J3: Security scans =="

# 1) OWASP ZAP baseline (rapport HTML)
if [ "${DOCKER:-0}" -eq 1 ]; then
  docker run --rm -t -v "$PWD:/zap/wrk" owasp/zap2docker-stable \
    zap-baseline.py -t "${APP_BASE_URL}" -r zap_report.html || true
  echo "➡️ Rapport: $(pwd)/zap_report.html"
else
  echo "ℹ️ Run ZAP manually with Docker for best portability."
fi

# 2) Test Sentry (événement de test)
curl -sS -o /dev/null -w "%{http_code}\n" "${SENTRY_TEST_URL}" | grep -qE "200|204" || echo "⚠️ Sentry test endpoint not reachable (optional)"

# 3) Check TLS expiry (openssl rapide)
HOST="$(echo "$APP_BASE_URL" | sed -E 's#https?://([^/]+)/?.*#\1#')"
ENDDATE=$(echo | openssl s_client -servername "$HOST" -connect "$HOST:443" 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2 || true)
echo "TLS expires: ${ENDDATE:-unknown}"

echo "✅ J3 done (corrige alertes ZAP si High/Critical)"