#!/usr/bin/env bash

set -euo pipefail

# ==============================
# 🔧 PARAMÈTRES À ADAPTER (ou via variables d'env)
# ==============================

PROXY_URL="${PROXY_URL:-https://trading-mvp.com}"   # URL publique
APP_HOST="${APP_HOST:-mvp-frontend}"                # Service/host joignable par le proxy
APP_PORT="${APP_PORT:-80}"                          # Port interne de l'app (React/Nginx)
FALLBACK_DIR="${FALLBACK_DIR:-/usr/share/nginx/html}" # Dossier du build (index.html)
TIMEOUT="${TIMEOUT:-5}"                             # Timeout curl (s)

# ==============================
# 🎨 Helpers
# ==============================

ok(){ echo -e "\e[32m✔ $*\e[0m"; }
warn(){ echo -e "\e[33m⚠ $*\e[0m"; }
err(){ echo -e "\e[31m✖ $*\e[0m"; }
sep(){ echo -e "\n\e[90m──────────────────────────────────────\e[0m\n"; }
title(){ echo -e "\n\e[36m== $* ==\e[0m"; }
curl_h() { curl -sS -o /dev/null -m "$TIMEOUT" -D - "$@" || return 1; }
curl_code() { curl -sS -o /dev/null -m "$TIMEOUT" -w "%{http_code}" "$@" || echo "000"; }
have(){ command -v "$1" >/dev/null 2>&1; }

PROXY_HOST="$(echo "$PROXY_URL" | sed -E 's#https?://([^/]+)/?.*#\1#')"

# ==============================
# 🧪 Tests
# ==============================

title "1) DNS & Résolution"
if getent hosts "$PROXY_HOST" >/dev/null 2>&1; then
  ip="$(getent hosts "$PROXY_HOST" | awk '{print $1}' | head -n1)"
  ok "Résolution DNS OK → $PROXY_HOST → $ip"
else
  err "Impossible de résoudre $PROXY_HOST (DNS)."
fi

title "2) TLS (chaîne & validité)"
if have openssl; then
  set +e
  TLS_INFO="$(echo | openssl s_client -servername "$PROXY_HOST" -connect "$PROXY_HOST:443" 2>/dev/null | openssl x509 -noout -issuer -subject -dates 2>/dev/null)"
  set -e
  if [[ -n "${TLS_INFO:-}" ]]; then
    ok "Cert récupéré :"; echo "$TLS_INFO"
  else
    warn "Impossible de lire le cert via openssl (port 443 fermé ou proxy HS)."
  fi
else
  warn "openssl non disponible → skip TLS chain."
fi

title "3) Proxy public (HEAD)"
CODE="$(curl_code -I "$PROXY_URL")"
if [[ "$CODE" == "200" || "$CODE" == "204" || "$CODE" == "301" || "$CODE" == "302" ]]; then
  ok "Le proxy répond : HTTP $CODE"
else
  [[ "$CODE" == "502" ]] && err "Le proxy renvoie 502 (cible upstream probablement KO)." || err "Le proxy renvoie HTTP $CODE."
fi

sep

title "4) Upstream (depuis le proxy/serveur) — test direct"
UP_CODE="$(curl_code -I "http://$APP_HOST:$APP_PORT/")"
if [[ "$UP_CODE" == "200" || "$UP_CODE" == "204" ]]; then
  ok "Upstream OK : http://$APP_HOST:$APP_PORT → HTTP $UP_CODE"
else
  err "Upstream KO : http://$APP_HOST:$APP_PORT → HTTP $UP_CODE (process down, mauvais port, firewall ?)"
fi

title "5) Upstream (contenu minimal)"
if curl -sS -m "$TIMEOUT" "http://$APP_HOST:$APP_PORT/" >/dev/null; then
  ok "L'app renvoie du contenu à la racine /"
else
  err "L'app ne renvoie pas de contenu (vérifier logs app, variable PORT, bind 0.0.0.0)."
fi

sep

title "6) Fallback SPA (index.html côté proxy)"
if docker exec mvp-frontend test -f "$FALLBACK_DIR/index.html"2>/dev/null; then ok"index.html présent : $FALLBACK_DIR/index.html"
else
  warn "index.html introuvable dans $FALLBACK_DIR (si fallback Nginx prévu, corriger le chemin)."
fi

title "7) Redirections publiques"
HDRS="$(curl_h -L "$PROXY_URL" 2>/dev/null || true)"
echo "$HDRS" | grep -i '^HTTP' || true
if echo "$HDRS"| grep -qi '^location: .*trading-mvp\.com'; then ok"Redirection vers domaine canonique OK."
fi
if echo "$HDRS" | grep -qi '^location: .*http://'; then
  warn "Redirection HTTP détectée (préférer HTTPS uniquement)."
fi

sep

title "8) Docker/Traefik sanity (si présent)"
if docker ps | grep -q mvp-traefik; then
  ok "Traefik container actif"
  if docker logs mvp-traefik 2>&1 | tail -10 | grep -qi error; then
    warn "Erreurs récentes dans les logs Traefik"
  else
    ok "Logs Traefik propres"
  fi
else
  warn "Container Traefik non détecté."
fi

sep

title "9) Résumé & Pistes de fix"
echo "- Proxy public → HTTP $CODE" echo"- Upstream      → HTTP $UP_CODE"

[[ "$CODE" == "502" && "$UP_CODE" != "200" && "$UP_CODE" != "204" ]] && \
  echo "👉 Cause probable : upstream non joignable (process down / mauvais host:port / firewall)."

[[ "$CODE" == "502" && ( "$UP_CODE" == "200" || "$UP_CODE" == "204" ) ]] && \
  echo "👉 Cause probable : proxy mal câblé (proxy_pass/route) ou pas de fallback SPA en cas de 502."

echo
echo "✅ Fix rapide (Traefik) attendu :"
cat <<'TRAEFIK'
# Dans traefik/dynamic.yml - middleware SPA fallback
spa-fallback:
  errors:
    status:
      - "404" -"502" -"503" -"504" service:"mvp-frontend" query:"/index.html"
TRAEFIK

echo
ok "Diagnostic terminé."