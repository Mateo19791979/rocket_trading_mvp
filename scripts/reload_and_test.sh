#!/usr/bin/env bash

set -euo pipefail

SITE="${SITE:-https://trading-mvp.com}"

echo "[*] Vérification de l'infrastructure Docker..."

# Vérifier que les containers sont up
if ! docker ps | grep -q mvp-traefik; then
  echo "[!] Container Traefik non actif - tentative de redémarrage..."
  docker-compose up -d traefik
  sleep 5
fi

if ! docker ps | grep -q mvp-frontend; then
  echo "[!] Container Frontend non actif - tentative de redémarrage..."
  docker-compose up -d frontend
  sleep 5
fi

# Recharger la configuration Traefik (via file provider)
echo "[*] Rechargement de la configuration Traefik..."
if docker exec mvp-traefik traefik version >/dev/null 2>&1; then
  # Traefik recharge automatiquement avec file.watch=true
  echo "[*] Configuration Traefik rechargée automatiquement"
else
  echo "[!] Impossible de communiquer avec Traefik"
  exit 1
fi

# Si Nginx est utilisé directement (pas dans notre cas Traefik)
if command -v nginx >/dev/null 2>&1; then
  echo "[*] Test syntaxe Nginx..."
  nginx -t
  echo "[*] Reload Nginx..."
  nginx -s reload
else
  echo "[*] Nginx non présent (normal avec Traefik)."
fi

# Attendre que les services soient prêts
echo "[*] Attente stabilisation des services..."
sleep 3

echo "[*] Test HTTP public..."
code="$(curl -sS -o /dev/null -w "%{http_code}" -I "$SITE")"

if [[ "$code" == "200" || "$code" == "204" ]]; then
  echo "✔ OK — $SITE → HTTP $code"
else
  echo "✖ KO — $SITE → HTTP $code"
  
  # Diagnostic rapide en cas d'échec
  echo "[*] Diagnostic rapide..."
  echo "- Status containers:"
  docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" echo"- Logs Traefik récents:"
  docker logs mvp-traefik --tail 10
  
  echo "- Logs Frontend récents:"
  docker logs mvp-frontend --tail 10
  
  exit 1
fi

# Test des routes importantes
echo "[*] Test des routes critiques..."

# Test route SPA (doit retourner du HTML même sur une route inexistante)
spa_code="$(curl -sS -o /dev/null -w "%{http_code}" "$SITE/unified?module=trading&view=positions")"
if [[ "$spa_code" == "200" ]]; then
  echo "✔ SPA routing OK → HTTP $spa_code"
else
  echo "✖ SPA routing KO → HTTP $spa_code (vérifier fallback)"
fi

# Test API si présente
api_code="$(curl -sS -o /dev/null -w "%{http_code}" "$SITE/api/health" 2>/dev/null || echo "000")"
if [[ "$api_code" == "200" || "$api_code" == "000" ]]; then
  [[ "$api_code" == "200" ]] && echo "✔ API health OK → HTTP $api_code" || echo "⚠ API non testée (endpoint inexistant)"
else
  echo "⚠ API health → HTTP $api_code"
fi

# Test redirection HTTP → HTTPS
http_redirect="$(curl -sS -o /dev/null -w "%{http_code}" -I "http://trading-mvp.com" 2>/dev/null || echo "000")"
if [[ "$http_redirect" == "301" || "$http_redirect" == "302" ]]; then
  echo "✔ Redirection HTTP→HTTPS OK → HTTP $http_redirect"
else
  echo "⚠ Redirection HTTP→HTTPS → HTTP $http_redirect"
fi

echo
echo "🎯 Résumé final:" echo"- Site principal: HTTP $code" echo"- SPA routing: HTTP $spa_code" echo"- API health: HTTP $api_code" echo"- HTTP redirect: HTTP $http_redirect"

if [[ "$code" == "200" && "$spa_code" == "200" ]]; then
  echo
  echo "✅ SUCCÈS - Le site est opérationnel !" echo"👉 Tester manuellement: $SITE/unified?module=trading&view=positions"
else
  echo
  echo "❌ ÉCHEC - Corriger les problèmes détectés" echo"👉 Relancer: ./scripts/diagnose_502.sh"
fi