#!/usr/bin/env bash
# ==============================================================================
# DIAGNOSTIC COMPLET SITE INACCESSIBLE — trading-mvp.com
# Commande diagnostic complète pour site inaccessible
# Basé sur les paramètres: APP_HOST=app APP_PORT=3000 API_HOST=api API_PORT=4000 SPA_DIR=/var/www/app
# ==============================================================================

set -e

# Variables d'environnement par défaut
APP_HOST=${APP_HOST:-"app"}
APP_PORT=${APP_PORT:-"3000"}
API_HOST=${API_HOST:-"api"}
API_PORT=${API_PORT:-"4000"}
SPA_DIR=${SPA_DIR:-"/var/www/app"}

# Couleurs pour la lisibilité
ok() { echo -e "\e[32m✔ $*\e[0m"; }
err() { echo -e "\e[31m✖ $*\e[0m"; }
info() { echo -e "\e[36mℹ $*\e[0m"; }
step() { echo -e "\n\e[1;33m>> $*\e[0m"; }
warn() { echo -e "\e[33m⚠ $*\e[0m"; }

echo "==============================================================================" echo"🚨 DIAGNOSTIC COMPLET SITE INACCESSIBLE - trading-mvp.com" echo"==============================================================================" echo"APP_HOST=$APP_HOST APP_PORT=$APP_PORT API_HOST=$API_HOST API_PORT=$API_PORT SPA_DIR=$SPA_DIR" echo""

# Commande exacte de l'utilisateur adaptée en bash bash -lc'

echo "[1] Upstream APP  : " $(curl -sS -m 4 -o /dev/null -w "%{http_code}" -I "http://'$APP_HOST':'$APP_PORT'/" || echo 000)

echo "[2] Upstream API  : " $(curl -sS -m 4 -o /dev/null -w "%{http_code}"     "http://'$API_HOST':'$API_PORT'/health" || echo 000)

echo "[3] proxy_pass & root (Nginx) :" grep -Rin --color -E"server_name|location /api/|location / |proxy_pass|root "/etc/nginx/conf.d /etc/nginx/sites-enabled || true echo"[4] Logs Nginx (20 dernières lignes) :"; tail -n 20 /var/log/nginx/error.log || true

echo "[5] Fallback SPA :"; ls -l "'$SPA_DIR'/index.html" || echo "index.html ABSENT" echo"[6] Test public  : " $(curl -sS -m 6 -o /dev/null -w "%{http_code}" -I https://trading-mvp.com || echo 000)

'

echo "" echo"==============================================================================" echo"🔧 DIAGNOSTIC TECHNIQUE ÉTENDU" echo"=============================================================================="

# [ÉTAPE 1] Test des conteneurs Docker
step "[ÉTAPE 1] Vérification conteneurs Docker"
if command -v docker &> /dev/null; then
    info "Conteneurs actifs :"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"|| true echo"" info"Réseaux Docker :"
    docker network ls || true
    echo ""
    
    # Test spécifique conteneur app
    APP_CONTAINER=$(docker ps -qf "name=$APP_HOST" 2>/dev/null || true)
    if [ -n "$APP_CONTAINER" ]; then
        ok "Conteneur APP '$APP_HOST' trouvé: $APP_CONTAINER" info"Logs récents du conteneur APP:"
        docker logs --tail 10 "$APP_CONTAINER" 2>/dev/null || true
    else
        err "Conteneur APP '$APP_HOST' introuvable"
    fi
    
    # Test spécifique conteneur API
    API_CONTAINER=$(docker ps -qf "name=$API_HOST" 2>/dev/null || true)
    if [ -n "$API_CONTAINER" ]; then
        ok "Conteneur API '$API_HOST' trouvé: $API_CONTAINER" info"Logs récents du conteneur API:"
        docker logs --tail 10 "$API_CONTAINER" 2>/dev/null || true
    else
        err "Conteneur API '$API_HOST' introuvable"
    fi
else
    warn "Docker non disponible - environnement non conteneurisé"
fi

echo ""

# [ÉTAPE 2] Tests de connectivité interne
step "[ÉTAPE 2] Tests connectivité interne"

# Test APP
info "Test direct APP: http://$APP_HOST:$APP_PORT/"
APP_STATUS=$(curl -sS -m 4 -o /dev/null -w "%{http_code}" -I "http://$APP_HOST:$APP_PORT/" 2>/dev/null || echo "000")
if [ "$APP_STATUS" = "200" ] || [ "$APP_STATUS" = "204" ]; then
    ok "APP accessible - Status: $APP_STATUS"
else
    err "APP inaccessible - Status: $APP_STATUS"
fi

# Test API
info "Test direct API: http://$API_HOST:$API_PORT/health"
API_STATUS=$(curl -sS -m 4 -o /dev/null -w "%{http_code}" "http://$API_HOST:$API_PORT/health" 2>/dev/null || echo "000")
if [ "$API_STATUS" = "200" ] || [ "$API_STATUS" = "204" ]; then
    ok "API accessible - Status: $API_STATUS"
else
    err "API inaccessible - Status: $API_STATUS"
fi

echo ""

# [ÉTAPE 3] Configuration Nginx
step "[ÉTAPE 3] Analyse configuration Nginx"

info "Recherche configurations Nginx:"
if [ -d "/etc/nginx" ]; then
    find /etc/nginx -name "*.conf" -type f 2>/dev/null | head -10 | while read -r conf_file; do
        echo "  📄 $conf_file"
    done
    echo "" info"Configuration trading-mvp dans Nginx:" grep -r"trading-mvp"/etc/nginx/ 2>/dev/null | head -5 || echo "  Aucune configuration trading-mvp trouvée" info"Directives proxy_pass:" grep -r"proxy_pass"/etc/nginx/ 2>/dev/null | head -5 || echo "  Aucune directive proxy_pass trouvée" info"Test configuration Nginx:"
    nginx -t 2>&1 || echo "  Configuration Nginx invalide"
else
    warn "Répertoire /etc/nginx introuvable"
fi

echo ""

# [ÉTAPE 4] Vérification SPA
step "[ÉTAPE 4] Vérification SPA et fichiers statiques"

info "Vérification répertoire SPA: $SPA_DIR"
if [ -d "$SPA_DIR" ]; then
    ok "Répertoire SPA existe"
    if [ -f "$SPA_DIR/index.html" ]; then
        ok "index.html trouvé" ls -la"$SPA_DIR/index.html" 2>/dev/null || true
    else
        err "index.html ABSENT dans $SPA_DIR"
    fi
    
    info "Contenu répertoire SPA:" ls -la"$SPA_DIR" 2>/dev/null | head -10 || true
else
    err "Répertoire SPA '$SPA_DIR' introuvable"
fi

echo ""

# [ÉTAPE 5] Tests réseau avancés
step "[ÉTAPE 5] Tests réseau et DNS"

info "Résolution DNS trading-mvp.com:"
nslookup trading-mvp.com 2>/dev/null || dig trading-mvp.com 2>/dev/null || echo "  Outils DNS non disponibles" info"Test ping trading-mvp.com:"
ping -c 2 trading-mvp.com 2>/dev/null || echo "  Ping échoué" info"Ports en écoute:"
netstat -tuln 2>/dev/null | grep -E ":80|:443|:$APP_PORT|:$API_PORT"|| ss -tuln 2>/dev/null | grep -E ":80|:443|:$APP_PORT|:$API_PORT" || echo "  Impossible de lister les ports" echo""

# [ÉTAPE 6] Test site public final
step "[ÉTAPE 6] Test final site public"

PUBLIC_STATUS=$(curl -sS -m 6 -o /dev/null -w "%{http_code}" -I https://trading-mvp.com 2>/dev/null || echo "000")

info "Status site public: $PUBLIC_STATUS"
if [ "$PUBLIC_STATUS" = "200" ] || [ "$PUBLIC_STATUS" = "204" ]; then
    ok "🎉 SITE PUBLIC ACCESSIBLE ! Status: $PUBLIC_STATUS" ok"Le problème semble résolu ou temporaire"
else
    err "🚨 SITE PUBLIC INACCESSIBLE ! Status: $PUBLIC_STATUS"
fi

echo "" echo"==============================================================================" echo"📋 RÉSUMÉ DIAGNOSTIC" echo"=============================================================================="

# Résumé des statuts
echo "✅ STATUTS:" echo"   APP ($APP_HOST:$APP_PORT): $APP_STATUS" echo"   API ($API_HOST:$API_PORT): $API_STATUS" echo"   Site public (trading-mvp.com): $PUBLIC_STATUS"

# Recommandations
echo "" echo"🔧 RECOMMANDATIONS:"
if [ "$APP_STATUS" = "000" ]; then
    echo "   • Vérifier conteneur APP: docker logs <container_app>" echo"   • Vérifier binding: APP doit écouter sur 0.0.0.0:$APP_PORT"
fi

if [ "$API_STATUS" = "000" ]; then
    echo "   • Vérifier conteneur API: docker logs <container_api>" echo"   • Vérifier endpoint /health sur API"
fi

if [ "$PUBLIC_STATUS" = "000" ] || [ "$PUBLIC_STATUS" = "502" ] || [ "$PUBLIC_STATUS" = "504" ]; then
    echo "   • Vérifier configuration proxy_pass dans Nginx" echo"   • Vérifier certificats SSL/TLS" echo"   • Vérifier DNS et résolution trading-mvp.com" echo"   • Redémarrer services: nginx, docker containers"
fi

echo "" echo"==============================================================================" echo"Diagnostic terminé - $(date)" echo"=============================================================================="