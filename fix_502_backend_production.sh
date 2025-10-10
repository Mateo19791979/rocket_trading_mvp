#!/usr/bin/env bash
# ==============================================================================
# FIX DÉFINITIF 502 BAD GATEWAY - TRADING-MVP.COM
# Résout les problèmes hybrides Traefik + Nginx + Services Docker
# ==============================================================================

set -euo pipefail

# Configuration automatique
PUBLIC_DOMAIN="${PUBLIC_DOMAIN:-trading-mvp.com}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"

# Couleurs pour logs
red() { echo -e "\e[31m$*\e[0m"; }
green() { echo -e "\e[32m$*\e[0m"; }
yellow() { echo -e "\e[33m$*\e[0m"; }
blue() { echo -e "\e[36m$*\e[0m"; }
bold() { echo -e "\e[1m$*\e[0m"; }

echo
bold "🚨 FIX PRODUCTION 502 BAD GATEWAY - TRADING-MVP.COM" echo"============================================================"

# 1. DIAGNOSTIC INITIAL
blue "\n[1] 🔍 DIAGNOSTIC ARCHITECTURE ACTUELLE"
echo "-----------------------------------------------"

# Vérification Docker Compose
if [[ -f "$COMPOSE_FILE" ]]; then
    green "✅ Docker Compose détecté: $COMPOSE_FILE"
    if docker-compose ps 2>/dev/null | grep -q "mvp-"; then echo"📦 Services Docker actifs:"
        docker-compose ps | grep "mvp-" | while read line; do
            green "   ├─ $line"
        done
        DOCKER_MODE=true
    else
        yellow "⚠️ Services Docker non démarrés"
        DOCKER_MODE=false
    fi
else
    yellow "⚠️ Pas de Docker Compose trouvé"
    DOCKER_MODE=false
fi

# Vérification Nginx
if command -v nginx >/dev/null 2>&1; then
    green "✅ Nginx installé localement"
    if pgrep nginx >/dev/null; then
        echo "🌐 Nginx actif sur le serveur"
        NGINX_MODE=true
    else
        yellow "⚠️ Nginx installé mais non actif"
        NGINX_MODE=false
    fi
else
    yellow "⚠️ Nginx non installé"
    NGINX_MODE=false
fi

# 2. DÉTECTION DE L'ARCHITECTURE RECOMMANDÉE
blue "\n[2] 🏗️ ARCHITECTURE RECOMMANDÉE"
echo "------------------------------------"

if [[ "$DOCKER_MODE" == "true" ]]; then
    bold "🎯 OPTION A: TRAEFIK SEUL (Recommandée pour production)" echo"├─ Traefik gère SSL + routing automatique" echo"├─ Services Docker avec labels Traefik" echo"└─ Pas de Nginx séparé (évite les conflits)"
    RECOMMENDED_MODE="traefik"
elif [[ "$NGINX_MODE" == "true" ]]; then
    bold "🎯 OPTION B: NGINX CLASSIQUE" echo"├─ Nginx gère SSL + proxy vers services" echo"├─ Services backend sur ports locaux" echo"└─ Pas de Traefik (évite les conflits)"
    RECOMMENDED_MODE="nginx"
else
    red "❌ Aucune architecture valide détectée" echo"Vous devez choisir: Docker+Traefik OU Nginx classique"
    exit 1
fi

# 3. APPLICATION DU FIX SELON L'ARCHITECTURE
blue "\n[3] 🔧 APPLICATION DU FIX"
echo "----------------------------"

if [[ "$RECOMMENDED_MODE" == "traefik" ]]; then
    echo "🚀 Mode Traefik: Correction Docker Compose + désactivation Nginx"
    
    # Arrêt Nginx s'il interfère
    if [[ "$NGINX_MODE" == "true" ]]; then
        yellow "⚠️ Arrêt de Nginx pour éviter les conflits..."
        sudo systemctl stop nginx 2>/dev/null || true
        sudo systemctl disable nginx 2>/dev/null || true
    fi
    
    # Vérification et fix Docker Compose
    echo "🔄 Redémarrage des services Docker..."
    docker-compose down 2>/dev/null || true
    docker-compose up -d
    
    # Attente que les services soient prêts
    echo "⏳ Attente des services (30s)..."
    sleep 30
    
    # Test des services internes
    echo "🧪 Test des services internes:"
    
    # Test frontend
    frontend_status=$(docker-compose exec -T frontend wget --spider -q http://localhost:80/healthz 2>&1 && echo "OK" || echo "KO")
    if [[ "$frontend_status" == "OK" ]]; then
        green "   ✅ Frontend (mvp-frontend:80) OK"
    else
        red "   ❌ Frontend inaccessible"
    fi
    
    # Test API
    api_status=$(docker-compose exec -T api wget --spider -q http://localhost:3000/api/health 2>&1 && echo "OK" || echo "KO")
    if [[ "$api_status" == "OK" ]]; then
        green "   ✅ API (mvp-api:3000) OK"
    else
        red "   ❌ API inaccessible"
    fi
    
elif [[ "$RECOMMENDED_MODE" == "nginx" ]]; then
    echo "🌐 Mode Nginx: Configuration proxy optimisée"
    
    # Arrêt Docker Compose s'il interfère
    if [[ "$DOCKER_MODE" == "true" ]]; then
        yellow "⚠️ Arrêt de Traefik pour éviter les conflits..."
        docker-compose down 2>/dev/null || true
    fi
    
    # Configuration Nginx optimisée
    cat > /tmp/nginx_fix_502.conf << 'NGINX_CONFIG'
# Fix 502 Trading MVP - Configuration Nginx Optimisée
server {
    listen 80;
    server_name trading-mvp.com www.trading-mvp.com;
    return 301 https://trading-mvp.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name trading-mvp.com;
    
    ssl_certificate /etc/letsencrypt/live/trading-mvp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/trading-mvp.com/privkey.pem;
    
    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    
    # API Backend (port 4000 local ou service Docker)
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        
        # Timeouts anti-502
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Pas de fallback HTML pour l'API
    }
    
    # Frontend SPA
    location / {
        try_files $uri $uri/ @fallback;
        root /var/www/app;
        index index.html;
        
        # Cache pour les assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Fallback SPA pour React Router
    location @fallback {
        root /var/www/app;
        try_files /index.html =404;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # Health check
    location /healthz {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
NGINX_CONFIG

    # Application de la config
    echo "📝 Application de la configuration Nginx..."
    sudo cp /tmp/nginx_fix_502.conf /etc/nginx/conf.d/trading-mvp.conf
    
    # Test et rechargement
    if sudo nginx -t; then
        green "✅ Configuration Nginx valide"
        sudo nginx -s reload
    else
        red "❌ Erreur de configuration Nginx"
        sudo nginx -t
        exit 1
    fi
fi

# 4. VÉRIFICATION ET TEST FINAL
blue "\n[4] 🧪 TESTS DE VALIDATION"
echo "-----------------------------"

# Test du site principal
echo "🌐 Test de https://$PUBLIC_DOMAIN..."
public_code=$(curl -sS -o /dev/null -w "%{http_code}" -m 10 -I "https://$PUBLIC_DOMAIN" 2>/dev/null || echo "000")

if [[ "$public_code" == "200" || "$public_code" == "204" ]]; then
    green "✅ Site principal: HTTP $public_code"
else
    red "❌ Site principal: HTTP $public_code"
fi

# Test de l'API echo "🔧 Test de l'API..."
api_code=$(curl -sS -o /dev/null -w "%{http_code}" -m 10 -I "https://$PUBLIC_DOMAIN/api/health" 2>/dev/null || echo "000")

if [[ "$api_code" == "200" || "$api_code" == "204" ]]; then
    green "✅ API: HTTP $api_code"
else
    red "❌ API: HTTP $api_code"
fi

# Test de l'endpoint problématique
echo "🛡️ Test RLS Health..."
rls_code=$(curl -sS -o /dev/null -w "%{http_code}" -m 10 -I "https://$PUBLIC_DOMAIN/api/security/rls/health" 2>/dev/null || echo "000")

if [[ "$rls_code" == "200" || "$rls_code" == "204" ]]; then
    green "✅ RLS Health: HTTP $rls_code"
else
    red "❌ RLS Health: HTTP $rls_code"
fi

# 5. RÉSUMÉ ET RECOMMANDATIONS
bold "\n🎯 RÉSUMÉ DU FIX" echo"=================="

if [[ "$public_code" == "200" && "$api_code" == "200" ]]; then
    green "🎉 SUCCÈS: Tous les services répondent correctement !" echo"✅ Site principal accessible" echo"✅ API backend fonctionnelle" echo"✅ Problème 502 résolu"
elif [[ "$public_code" == "200" ]]; then
    yellow "⚠️ PARTIEL: Site OK mais API encore en erreur" echo"🔧 Actions supplémentaires nécessaires:" echo"   • Vérifier que le service API écoute sur le bon port" echo"   • Contrôler les logs: docker logs mvp-api OU journalctl -u votre-api" echo"   • Tester manuellement: curl http://localhost:4000/health"
else
    red "🚨 ÉCHEC: Problème persistant" echo"🔧 Debug supplémentaire requis:" echo"   • Vérifier les certificats SSL" echo"   • Contrôler les DNS (trading-mvp.com pointe bien vers ce serveur)" echo"   • Analyser les logs Nginx/Traefik"
fi

echo
bold "📞 COMMANDES DE VÉRIFICATION CONTINUE:" echo"# Statut des services" echo"docker-compose ps" echo"sudo systemctl status nginx"
echo
echo "# Logs en temps réel" echo"docker-compose logs -f" echo"sudo tail -f /var/log/nginx/error.log"
echo
echo "# Tests manuels" echo"curl -I https://trading-mvp.com" echo"curl -I https://trading-mvp.com/api/health"
echo

bold "🏁 FIN DU FIX 502 BACKEND"