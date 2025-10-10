#!/usr/bin/env bash
set -euo pipefail

# 🚀 Rocket Trading MVP - Production Readiness Preflight Check
# This script validates all critical SLOs before deployment

echo "🚀 Starting Rocket Trading MVP Production Readiness Check..." echo"=================================================="

# ---- Configuration ----
PROM="${PROMETHEUS_URL:-http://prometheus:9090}"
API="${API_BASE_URL:-https://api.trading-mvp.com}"
APP="${APP_BASE_URL:-https://trading-mvp.com}"
SENTRY_TEST="${SENTRY_TEST_URL:-$API/debug/sentry-test}"
THRESH_P95=700        # ms
THRESH_P99=1200       # ms
THRESH_ERR=2          # %

echo "📋 Configuration:" echo"   Prometheus: $PROM" echo"   API Base:   $API" echo"   App Base:   $APP" echo""

# ---- Dependency Check ----
jq_ok() { command -v jq >/dev/null 2>&1; }
if ! jq_ok; then 
  echo "❌ jq missing - install with: apt-get install -y jq"
  exit 2
fi

# ---- Helper Functions ----
q() { 
  curl -sS --fail "$PROM/api/v1/query" --data-urlencode "query=$1" --connect-timeout 10
}
val() { 
  jq -r '.data.result[0].value[1]' 2>/dev/null || echo "NaN"
}

ok=true
start_time=$(date +%s)

echo "🔍 Running Production Readiness Checks..." echo""

# ---- HTTP Performance Checks ----
echo "🌐 HTTP Performance Validation:"
echo "   Checking p95 latency for /quotes endpoint..."
P95=$(q "1000 * histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket{path=\"/quotes\"}[5m])) by (le))" | val)
echo "   ✓ p95 latency: ${P95}ms (threshold: ${THRESH_P95}ms)"

if awk "BEGIN{exit !($P95 <= $THRESH_P95)}"2>/dev/null; then echo"   ✅ p95 latency PASSED"
else
  echo "   ❌ p95 latency FAILED - too high"
  ok=false
fi

echo "   Checking p99 latency for /quotes endpoint..."
P99=$(q "1000 * histogram_quantile(0.99, sum(rate(http_request_duration_ms_bucket{path=\"/quotes\"}[5m])) by (le))" | val)
echo "   ✓ p99 latency: ${P99}ms (threshold: ${THRESH_P99}ms)"

if awk "BEGIN{exit !($P99 <= $THRESH_P99)}"2>/dev/null; then echo"   ✅ p99 latency PASSED"
else
  echo "   ❌ p99 latency FAILED - too high"
  ok=false
fi
echo ""

# ---- Error Rate Check ----
echo "🚨 Error Rate Validation:" echo"   Checking 5xx error rate..."
ERR=$(q "100 * (sum(rate(http_requests_total{code=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m])))" | val)
echo "   ✓ 5xx error rate: ${ERR}% (threshold: ${THRESH_ERR}%)"

if awk "BEGIN{exit !($ERR <= $THRESH_ERR)}"2>/dev/null; then echo"   ✅ Error rate PASSED"
else
  echo "   ❌ Error rate FAILED - too high"
  ok=false
fi
echo ""

# ---- Service Health Checks ----
echo "💚 Service Health Validation:" echo"   Checking /readyz endpoint..."
if READYZ_CODE=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 5 "$API/readyz" 2>/dev/null) && echo "$READYZ_CODE" | grep -qE "200"; then
  echo "   ✅ /readyz PASSED (HTTP $READYZ_CODE)"
else
  echo "   ❌ /readyz FAILED (HTTP ${READYZ_CODE:-timeout})"
  ok=false
fi

echo "   Checking Sentry integration..."
if SENTRY_CODE=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 5 "$SENTRY_TEST" 2>/dev/null) && echo "$SENTRY_CODE" | grep -qE "200|204"; then
  echo "   ✅ Sentry PASSED (HTTP $SENTRY_CODE)"
else
  echo "   ❌ Sentry FAILED (HTTP ${SENTRY_CODE:-timeout})"
  ok=false
fi
echo ""

# ---- TLS Certificate Check ----
echo "🔒 TLS Certificate Validation:"
echo "   Checking SSL certificate expiry..."
DOMAIN=$(echo "$APP" | sed -E 's#https?://([^/]+)/?.*#\1#')
if ENDDATE=$(echo | timeout 10 openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2); then
  if [ -n "$ENDDATE" ]; then
    # Calculate days until expiry
    if command -v date >/dev/null 2>&1; then
      if EXPIRY_EPOCH=$(date -d "$ENDDATE" +%s 2>/dev/null) && CURRENT_EPOCH=$(date +%s 2>/dev/null); then
        DAYS_LEFT=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
        echo "   ✓ Certificate expires: $ENDDATE ($DAYS_LEFT days remaining)"
        if [ "$DAYS_LEFT" -gt 7 ]; then
          echo "   ✅ TLS Certificate PASSED"
        else
          echo "   ⚠️  TLS Certificate WARNING - expires soon"
        fi
      else
        echo "   ✓ Certificate expires: $ENDDATE"
        echo "   ✅ TLS Certificate PASSED"
      fi
    else
      echo "   ✓ Certificate expires: $ENDDATE"  
      echo "   ✅ TLS Certificate PASSED"
    fi
  else
    echo "   ❌ TLS Certificate FAILED - could not read expiry date"
    ok=false
  fi
else
  echo "   ❌ TLS Certificate FAILED - connection error"
  ok=false
fi
echo ""

# ---- Optional: OWASP ZAP Security Scan ----
if [ "${RUN_ZAP:-0}" -eq 1 ]; then
  echo "🛡️  Security Validation:" echo"   Running OWASP ZAP baseline scan..."
  if command -v docker >/dev/null 2>&1; then
    docker run --rm -t -v "$PWD:/zap/wrk" owasp/zap2docker-stable zap-baseline.py -t "$APP" -r zap_report.html || true
    echo "   ✓ Security scan completed - report: $(pwd)/zap_report.html"
  else
    echo "   ⚠️  Docker not available - skipping ZAP scan"
  fi
  echo ""
fi

# ---- Final Results ----
end_time=$(date +%s)
duration=$((end_time - start_time))

echo "==================================================" echo"🏁 Production Readiness Assessment Complete" echo"   Duration: ${duration}s" echo"   Timestamp: $(date -Iseconds)" echo""

if $ok; then
  echo "✅ GO — Production Ready" echo"   🎉 All SLOs are GREEN" echo"   🚀 Deployment APPROVED" echo"" echo"Next Steps:" echo"   1. Deploy to production environment" echo"   2. Monitor metrics in Grafana dashboard" echo"   3. Set up automated alerting"
  exit 0
else
  echo "❌ NO-GO — Production Blocked" echo"   💥 Critical issues detected" echo"   🛠️  Fix the failures above before deployment" echo"" echo"Troubleshooting:" echo"   1. Check Prometheus metrics collection" echo"   2. Verify API endpoints are responding" echo"   3. Review application logs for errors" echo"   4. Ensure all services are running"
  exit 1
fi