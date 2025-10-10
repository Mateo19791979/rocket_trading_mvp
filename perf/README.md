# Perf Kit — Rocket Trading MVP

## Lancer avec k6 (Docker)
docker run --rm -i \
  -e BASE_URL=$BASE_URL \
  grafana/k6 run - < perf/k6.providers.js

docker run --rm -i -e BASE_URL=$BASE_URL grafana/k6 run - < perf/k6.quotes-http.js
docker run --rm -i -e WS_URL=$WS_URL grafana/k6 run - < perf/k6.quotes-ws.js
docker run --rm -i -e KB_RPC_URL=$KB_RPC_URL -e EMB_URL=$EMB_URL grafana/k6 run - < perf/k6.kb-rag.js

## Générer du flux WS côté serveur
node perf/node.ws-publisher.js
SYMS=AAPL,MSFT,TSLA RATE=1000 node perf/node.ws-publisher.js

## SLO / SLI cibles
- Providers /health p95 < 800 ms ; erreurs < 1%
- /quotes HTTP p95 < 700 ms (p99 < 1.2s), erreurs < 2%
- WS bridge : >= 1 000 clients, >= 5 000 msg/s stable, pertes < 0.1%
- RAG kb_search p95 < 900 ms (embedding + ANN), erreurs < 2%

## Tips
- Monte le `RATE` du publisher jusqu'au point de rupture → note le débit max.
- Coupe un provider (Chaos Panel) → /providers/health doit rester ok & /quotes continue (fallback).
- Surveille Grafana: latency_p95, error_rate, ws_clients, ws_msg_rate, bar_close_delay.

## Variables d'environnement

export BASE_URL="https://api.trading-mvp.com"
export WS_URL="wss://api.trading-mvp.com/ws/quotes"
export REDIS_URL="redis://localhost:6379"          # ou "redis://redis:6379"
export KB_RPC_URL="$BASE_URL/rpc/kb_search"        # si exposé en REST/RPC
export EMB_URL="https://your-embeddings-endpoint/embeddings"

## Comment exploiter les résultats

Si un threshold k6 est rouge → identifie le goulot (provider lent, DB, CPU, GC).

**/quotes p95 > 1s ?**
Active plus d'instances Router, ajoute cache 1–2s, ou passe provider primaire à celui avec la plus faible latence.

**WS pertes de messages ?**
Vérifie proxy_set_header Upgrade/Connection, taille buffers, et Redis (latence/pipeline).

**RAG lent ?**
Augmente ivfflat lists, index VACUUM/ANALYZE, batch embeddings 16–32.