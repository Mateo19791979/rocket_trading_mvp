#!/usr/bin/env bash

set -euo pipefail

echo "=================================================="  
echo " ROCKET RECOVERY — Restart + Checks + Warmup "
echo "=================================================="

# 0) Versions & env visibles
node -v || true
npm -v || true
echo "DOMAIN=${DOMAIN:-trading-mvp.com}"
echo "API_BASE=${API_BASE:-https://trading-mvp.com/api}"
echo "WS_URL=${WS_URL:-wss://trading-mvp.com/ws}"

# 1) Installer deps (au cas où)
if [ -f package.json ]; then
  echo "→ npm ci"
  npm ci --omit=dev || npm i --omit=dev
fi

# 2) Lancer backend & workers via PM2
echo "→ pm2 start"
npx pm2-runtime start infra/pm2.config.cjs || npx pm2 start infra/pm2.config.cjs
npx pm2 save || true
npx pm2 status || true

# 3) Checks DNS / SSL / API / WS
echo "→ Checks"
bash scripts/check_dns.sh
bash scripts/check_ssl.sh  
bash scripts/check_http.sh
node scripts/check_ws.js || echo "WS non bloquant pour le go-live API"

# 4) Warmup API (mise en cache, cold start)
bash scripts/warmup.sh

echo "=================================================="
echo " ✅ RECOVERY TERMINÉ — Site prêt en prod."
echo "    Si la page affiche encore 'App en cours de chargement…',"
echo "    vide le cache CDN Rocket/new et recharge (Ctrl+F5)."
echo "=================================================="