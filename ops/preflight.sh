#!/usr/bin/env bash
set -euo pipefail

# Configuration
PROM="${PROMETHEUS_URL:-http://prometheus:9090}"
API="${API_BASE_URL:-https://api.trading-mvp.com}"
APP="${APP_BASE_URL:-https://trading-mvp.com}"

echo "🔍 Trading MVP Preflight GO/NO-GO Check"
echo "========================================"

# Check dependencies
command -v jq >/dev/null 2>&1 || { echo "❌ jq is required but not installed"; exit 2; }
command -v curl >/dev/null 2>&1 || { echo "❌ curl is required but not installed"; exit 2; }

# Prometheus query helper
query_prom() {
    curl -sS --fail --max-time 10 "$PROM/api/v1/query" --data-urlencode "query=$1" 2>/dev/null || echo '{"data":{"result":[]}}'
}

# Extract single value from Prometheus response
extract_value() {
    jq -r '.data.result[0].value[1] // "NaN"' 2>/dev/null || echo "NaN"
}

# Check API health
echo "📊 Checking API Health..."
API_HEALTH=$(curl -sS --fail --max-time 5 "$API/status" 2>/dev/null | jq -r '.health_score // 0' || echo "0")
echo "   API Health Score: $API_HEALTH%"

# Check RLS Health if available
echo "🛡️  Checking RLS Security..."
RLS_HEALTH=$(curl -sS --fail --max-time 5 "$API/security/rls/health" 2>/dev/null | jq -r '.data.summary.overall_health_score // 0' || echo "0")
echo "   RLS Health Score: $RLS_HEALTH%"

# Performance Metrics
echo "⚡ Checking Performance Metrics..."

# P95 Response Time (convert to milliseconds)
P95=$(query_prom "1000 * histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket{path=\"/quotes\"}[5m])) by (le))" | extract_value)
P95_NUM=$(echo "$P95" | awk '{print ($1 == "NaN") ? 999 : $1}')
echo "   P95 Response Time: ${P95}ms"

# P99 Response Time  
P99=$(query_prom "1000 * histogram_quantile(0.99, sum(rate(http_request_duration_ms_bucket{path=\"/quotes\"}[5m])) by (le))" | extract_value)
P99_NUM=$(echo "$P99" | awk '{print ($1 == "NaN") ? 999 : $1}')
echo "   P99 Response Time: ${P99}ms"

# Error Rate (percentage)
ERR=$(query_prom "100 * (sum(rate(http_requests_total{code=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m])))" | extract_value)
ERR_NUM=$(echo "$ERR" | awk '{print ($1 == "NaN") ? 0 : $1}')
echo "   Error Rate: ${ERR}%"

echo ""
echo "🎯 GO/NO-GO Decision"
echo "===================="

# Decision logic
DECISION="GO"

# Check P95 threshold (700ms)
if awk "BEGIN{exit !($P95_NUM <= 700)}"; then
    echo "✅ P95 Response Time: PASS ($P95_NUM <= 700ms)"
else
    echo "❌ P95 Response Time: FAIL ($P95_NUM > 700ms)"
    DECISION="NO-GO"
fi

# Check P99 threshold (1200ms)  
if awk "BEGIN{exit !($P99_NUM <= 1200)}"; then
    echo "✅ P99 Response Time: PASS ($P99_NUM <= 1200ms)"
else
    echo "❌ P99 Response Time: FAIL ($P99_NUM > 1200ms)"
    DECISION="NO-GO"
fi

# Check error rate threshold (2%)
if awk "BEGIN{exit !($ERR_NUM <= 2)}"; then
    echo "✅ Error Rate: PASS ($ERR_NUM <= 2%)"
else
    echo "❌ Error Rate: FAIL ($ERR_NUM > 2%)"
    DECISION="NO-GO"
fi

# Check API health threshold (80%)
if awk "BEGIN{exit !($API_HEALTH >= 80)}"; then
    echo "✅ API Health: PASS ($API_HEALTH >= 80%)"
else
    echo "❌ API Health: FAIL ($API_HEALTH < 80%)"
    DECISION="NO-GO"
fi

# Check RLS health threshold (90%)
if awk "BEGIN{exit !($RLS_HEALTH >= 90)}"; then
    echo "✅ RLS Security: PASS ($RLS_HEALTH >= 90%)"
else
    echo "❌ RLS Security: FAIL ($RLS_HEALTH < 90%)"
    DECISION="NO-GO"
fi

echo ""
echo "🚀 Final Decision: $DECISION"
echo "=================="

if [ "$DECISION" = "GO" ]; then
    echo "✅ All systems green - deployment approved"
    exit 0
else
    echo "❌ Quality gates failed - deployment blocked"
    echo ""
    echo "📋 Recommended Actions:"
    echo "   1. Check API performance and error rates"
    echo "   2. Verify RLS policy health and repair if needed"
    echo "   3. Review system resources and scaling"
    echo "   4. Run diagnostics on failing components"
    exit 1
fi