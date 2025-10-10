#!/usr/bin/env bash
set -euo pipefail
echo "== J2: k6 perf suite =="

run_k6 () {
  local file="$1"
  if [ "${DOCKER:-0}" -eq 1 ]; then
    docker run --rm -i \
      -e BASE_URL="${API_BASE_URL}" \
      -e WS_URL="${WS_URL}" \
      -e KB_RPC_URL="${API_BASE_URL}/rpc/kb_search" \
      -e EMB_URL="${API_BASE_URL}/embeddings" \
      grafana/k6 run - < "$file"
  else
    k6 run "$file"
  fi
}

run_k6 perf/k6.providers.js
run_k6 perf/k6.quotes-http.js
run_k6 perf/k6.quotes-ws.js
run_k6 perf/k6.kb-rag.js

echo "== Prometheus quick SLO check =="
q(){ curl -sS --fail "${PROMETHEUS_URL}/api/v1/query" --data-urlencode "query=$1"; }
val(){ jq -r '.data.result[0].value[1]' 2>/dev/null || echo "NaN"; }

P95=$(q "1000 * histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket{path=\"/quotes\"}[5m])) by (le))" | val)
ERR=$(q "100 * (sum(rate(http_requests_total{code=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m])))" | val)

echo "p95=${P95}ms  err=${ERR}%"
awk "BEGIN{exit !($P95<=700)}" || { echo "❌ p95>700"; exit 1; }
awk "BEGIN{exit !($ERR<=2)}"  || { echo "❌ err>2%"; exit 1; }
echo "✅ J2 OK"