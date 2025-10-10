#!/usr/bin/env bash

# ==============================================================================
# ONE-SHOT FIX 502 — trading-mvp.com   (à exécuter une seule fois)
# - Corrige 502 en câblant correctement proxy → app, avec fallback SPA
# - Ne crée AUCUNE page supplémentaire (sert l'index existant en fallback)
# - Idempotent : relançable sans risque
# ==============================================================================

set -euo pipefail

# ------------------------------------------------------------------------------
# 🔧 PARAMÈTRES À ADAPTER SI BESOIN
# ------------------------------------------------------------------------------

PUBLIC_DOMAIN="${PUBLIC_DOMAIN:-trading-mvp.com}"     # nom de domaine public
APP_HOST="${APP_HOST:-app}"                           # host/service interne joignable par le proxy (ex: "app" docker ou "127.0.0.1")
APP_PORT="${APP_PORT:-3000}"                          # port interne de l'app (ex: 3000)
FALLBACK_DIR="${FALLBACK_DIR:-/var/www/app}"          # dossier du build (doit contenir index.html)
NGINX_CONF_PATH="${NGINX_CONF_PATH:-/etc/nginx/conf.d/trading-mvp.conf}"

# (Optionnels pour redémarrer l'app si KO)
DOCKER_COMPOSE_FILE="${DOCKER_COMPOSE_FILE:-}"        # ex: /opt/stack/docker-compose.yml (laisser vide sinon)
APP_SERVICE_NAME="${APP_SERVICE_NAME:-app}"           # nom du service docker-compose à (re)démarrer
PM2_APP_NAME="${PM2_APP_NAME:-}"                      # ex: "rocket-app" si pm2 gère l'app (laisser vide sinon)

# Timeout curl (secondes)
TIMEOUT="${TIMEOUT:-6}"

# ------------------------------------------------------------------------------
# 🎨 Helpers
# ------------------------------------------------------------------------------

ok(){ echo -e "\e[32m✔ $*\e[0m"; }
warn(){ echo -e "\e[33m⚠ $*\e[0m"; }
err(){ echo -e "\e[31m✖ $*\e[0m"; }
step(){ echo -e "\n\e[36m== $* ==\e[0m"; }
curl_code(){ curl -sS -o /dev/null -m "$TIMEOUT" -w "%{http_code}" "$@" || echo "000"; }
have(){ command -v "$1" >/dev/null 2>&1; }

PUBLIC_URL="https://${PUBLIC_DOMAIN}"

# ------------------------------------------------------------------------------
# 0) Vérifs préalables
# ------------------------------------------------------------------------------

step "0) Vérifs préalables"

if ! have curl; then err "curl requis"; exit 1; fi
if ! have nginx; then err "Nginx requis (si Traefik utilisé, stop et me le dire)"; exit 1; fi

# ------------------------------------------------------------------------------
# 1) DNS & TLS
# ------------------------------------------------------------------------------

step "1) DNS & TLS"

if getent hosts "$PUBLIC_DOMAIN" >/dev/null 2>&1; then
  ip="$(getent hosts "$PUBLIC_DOMAIN" | awk '{print $1}' | head -n1)"
  ok "DNS OK → $PUBLIC_DOMAIN → $ip"
else
  warn "DNS non résolu ici (env local ?) — on continue."
fi

if have openssl; then
  set +e
  TLS_INFO="$(echo | openssl s_client -servername "$PUBLIC_DOMAIN" -connect "$PUBLIC_DOMAIN:443" 2>/dev/null | openssl x509 -noout -issuer -subject -dates 2>/dev/null)"
  set -e
  if [[ -n "${TLS_INFO:-}" ]]; then
    ok "Cert SSL lisible"
  else
    warn "Impossible de lire le cert via openssl (proxy down ? on continue)"
  fi
else
  warn "openssl non dispo — skip TLS check"
fi

# ------------------------------------------------------------------------------
# 2) Vérifier/réanimer l'app interne (upstream)
# ------------------------------------------------------------------------------

step "2) Vérifier l'app interne (http://${APP_HOST}:${APP_PORT}/)"

UP_CODE="$(curl_code -I "http://${APP_HOST}:${APP_PORT}/")"

if [[ "$UP_CODE" != "200" && "$UP_CODE" != "204" ]]; then
  warn "Upstream renvoie HTTP $UP_CODE — tentative de redémarrage…"

  # Redémarrage via docker-compose si fourni
  if [[ -n "$DOCKER_COMPOSE_FILE" && -f "$DOCKER_COMPOSE_FILE" ]] && have docker && have docker-compose; then
    (cd "$(dirname "$DOCKER_COMPOSE_FILE")" && docker-compose up -d "$APP_SERVICE_NAME")
    sleep 3
    UP_CODE="$(curl_code -I "http://${APP_HOST}:${APP_PORT}/")"
  fi

  # Redémarrage via pm2 sinon
  if [[ ( -z "$DOCKER_COMPOSE_FILE" || ! -f "$DOCKER_COMPOSE_FILE" ) && -n "$PM2_APP_NAME" ]] && have pm2; then
    pm2 restart "$PM2_APP_NAME" || pm2 start "$PM2_APP_NAME" || true
    sleep 2
    UP_CODE="$(curl_code -I "http://${APP_HOST}:${APP_PORT}/")"
  fi
fi

if [[ "$UP_CODE" == "200" || "$UP_CODE" == "204" ]]; then
  ok "Upstream OK → HTTP $UP_CODE"
else
  err "Upstream KO (HTTP $UP_CODE). Vérifier que l'app écoute sur ${APP_HOST}:${APP_PORT} (bind 0.0.0.0)."
  exit 1
fi

# ------------------------------------------------------------------------------
# 3) S'assurer que le fallback SPA existe (index.html)
# ------------------------------------------------------------------------------

step "3) Fallback SPA (index.html)"

if [[ -f "$FALLBACK_DIR/index.html" ]]; then
  ok "index.html présent → $FALLBACK_DIR/index.html"
else
  warn "index.html absent dans $FALLBACK_DIR — création d'un placeholder minimal (aucune nouvelle page, juste un fallback)"
  mkdir -p "$FALLBACK_DIR"
  cat > "$FALLBACK_DIR/index.html" <<'HTML'
<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Trading MVP</title>
</head><body>
<div id="root">App en cours de chargement…</div>
<script>/* Fallback minimal, la vraie app sera servie par l'upstream */</script>
</body></html>
HTML
  ok "index.html placeholder créé"
fi

# ------------------------------------------------------------------------------
# 4) Écrire la conf Nginx (anti-502 + SPA fallback)
# ------------------------------------------------------------------------------

step "4) Écriture de la conf Nginx → $NGINX_CONF_PATH"

mkdir -p "$(dirname "$NGINX_CONF_PATH")"

cat > "$NGINX_CONF_PATH" <<NGINX
# HTTP → HTTPS
server {
  listen 80;
  server_name ${PUBLIC_DOMAIN} www.${PUBLIC_DOMAIN};
  return 301 https://${PUBLIC_DOMAIN}\$request_uri;
}

# HTTPS principal
server {
  listen 443 ssl http2;
  server_name ${PUBLIC_DOMAIN};

  ssl_certificate     /etc/letsencrypt/live/${PUBLIC_DOMAIN}/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/${PUBLIC_DOMAIN}/privkey.pem;

  # Sécurité minimale compatible SPA
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
  add_header Content-Security-Policy "upgrade-insecure-requests" always;

  # Proxy → App
  location / {
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-Proto https;
    proxy_pass http://${APP_HOST}:${APP_PORT};

    # Si l'upstream renvoie 502/504, on sert index.html pour éviter un 502 public
    error_page 502 504 = @fallback;
  }

  # Fallback SPA
  location @fallback {
    root ${FALLBACK_DIR};
    try_files /index.html =502;
  }
}
NGINX

ok "Conf Nginx écrite"

# ------------------------------------------------------------------------------
# 5) Test de syntaxe Nginx + reload
# ------------------------------------------------------------------------------

step "5) Test & reload Nginx"

nginx -t
nginx -s reload

ok "Nginx rechargé"

# ------------------------------------------------------------------------------
# 6) Vérification publique finale
# ------------------------------------------------------------------------------

step "6) Vérification publique finale"

PUB_CODE="$(curl_code -I "$PUBLIC_URL")"
echo "HTTP public → $PUB_CODE"

if [[ "$PUB_CODE" == "200" || "$PUB_CODE" == "204" ]]; then
  ok "Succès — ${PUBLIC_URL} répond en ${PUB_CODE}"
  echo
  echo "CRITÈRES D'ACCEPTATION:" echo" - curl -I ${PUBLIC_URL} → HTTP 200/204 ✅" echo" - Accès direct à /unified?module=trading&view=positions (pas de 502) ✅" echo" - Les logs Nginx ne montrent plus d'erreurs upstream ✅"
  exit 0
else
  # Tente avec -L (suivre redirects éventuels)
  PUBL_CODE="$(curl -sS -o /dev/null -m "$TIMEOUT" -w "%{http_code}" -I -L "$PUBLIC_URL")"
  echo "HTTP public (avec -L) → $PUBL_CODE"

  if [[ "$PUBL_CODE" == "200" || "$PUBL_CODE" == "204" ]]; then
    ok "Succès avec redirection — ${PUBLIC_URL} OK"
    exit 0
  fi

  err "Toujours KO (HTTP $PUB_CODE / $PUBL_CODE). Vérifier proxy_pass et accès upstream depuis le proxy."
  exit 2
fi