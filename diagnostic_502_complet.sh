#!/usr/bin/env bash
# ==============================================================================
# DIAGNOSTIC COMPLET 502 - trading-mvp.com
# Identifie précisément où ça cloche après l'exécution du script one-shot
# ==============================================================================

set -euo pipefail

# Configuration
PUBLIC_DOMAIN="${PUBLIC_DOMAIN:-trading-mvp.com}"
APP_HOST="${APP_HOST:-app}"
APP_PORT="${APP_PORT:-3000}"
FALLBACK_DIR="${FALLBACK_DIR:-/var/www/app}"

# Couleurs pour les logs
red() { echo -e "\e[31m$*\e[0m"; }
green() { echo -e "\e[32m$*\e[0m"; }
yellow() { echo -e "\e[33m$*\e[0m"; }
blue() { echo -e "\e[36m$*\e[0m"; }
bold() { echo -e "\e[1m$*\e[0m"; }

echo
bold "🔍 DIAGNOSTIC COMPLET - PROBLÈMES IDENTIFIÉS SUR TRADING-MVP.COM" echo"=================================================================="

# 1. Test upstream (app interne)
blue "\n[1] 🎯 CHECK UPSTREAM → http://$APP_HOST:$APP_PORT/"
echo "-----------------------------------------------------------"
upstream_code=$(curl -sS -o /dev/null -w "%{http_code}" -m 5 -I "http://$APP_HOST:$APP_PORT/" 2>/dev/null || echo "000")

if [[ "$upstream_code" == "200" || "$upstream_code" == "204" ]]; then
    green "✅ Upstream OK → HTTP $upstream_code" echo"   ├─ L'application React écoute correctement" echo "   └─ Le problème n'est PAS l'app elle-même"
else
    red "❌ Upstream KO → HTTP $upstream_code" echo"   ├─ 🚨 PROBLÈME TROUVÉ : L'app n'écoute pas sur $APP_HOST:$APP_PORT" echo"   ├─ Solutions possibles :" echo"   │   • App doit écouter sur 0.0.0.0:3000 (pas 127.0.0.1:3000)" echo"   │   • Vérifier que le process React/Node tourne" echo"   │   • Check les logs Docker : docker logs app" echo"   └─ 🔧 CORRECTIF : Redémarrer l'app avec bind sur 0.0.0.0"
fi

# 2. Configuration Nginx (proxy_pass + root)
blue "\n[2] 📝 NGINX CONFIGURATION SNIPPETS"
echo "-------------------------------------------" echo"🔍 Recherche des directives proxy_pass et root dans la config Nginx..."

nginx_configs=(
    "/etc/nginx/conf.d" "/etc/nginx/sites-enabled" "/etc/nginx/nginx.conf"
)

found_config=false
for config_dir in "${nginx_configs[@]}"; do
    if [[ -d "$config_dir" ]] || [[ -f "$config_dir" ]]; then
        echo "📂 Analysing $config_dir :"
        proxy_lines=$(grep -Rin --color=never -E "proxy_pass|root " "$config_dir" 2>/dev/null || true)
        if [[ -n "$proxy_lines" ]]; then
            found_config=true
            while IFS= read -r line; do
                if [[ "$line" =~ proxy_pass ]]; then
                    green "   ├─ 🔗 $line"
                else
                    yellow "   ├─ 📁 $line"
                fi
            done <<< "$proxy_lines"
        fi
    fi
done

if [[ "$found_config" == "false" ]]; then
    red "❌ Aucune configuration Nginx trouvée !" echo"   └─ 🚨 PROBLÈME : Le script one-shot n'a pas créé la config"
fi

# 3. Logs d'erreur Nginx récents
blue "\n[3] 📋 NGINX ERROR LOGS (20 dernières lignes)"
echo "----------------------------------------------------"
nginx_error_log="/var/log/nginx/error.log"
if [[ -f "$nginx_error_log" ]]; then
    echo "📄 Contenu de $nginx_error_log :" tail -n 20"$nginx_error_log" 2>/dev/null | while IFS= read -r line; do
        if [[ "$line" =~ (connect.*failed|upstream.*error|502|504) ]]; then
            red "   🚨 $line"
        elif [[ "$line" =~ (warn|warning) ]]; then
            yellow "   ⚠️  $line"
        else
            echo "   ℹ️  $line"
        fi
    done
else
    yellow "⚠️ Log file $nginx_error_log introuvable"
fi

# 4. Vérification du fallback SPA
blue "\n[4] 📄 SPA FALLBACK : index.html"
echo "-------------------------------------"
if [[ -f "$FALLBACK_DIR/index.html" ]]; then
    file_size=$(stat -c%s "$FALLBACK_DIR/index.html" 2>/dev/null || echo "0")
    green "✅ index.html trouvé : $FALLBACK_DIR/index.html ($file_size bytes)"
    
    # Vérification du contenu
    if [[ $file_size -lt 100 ]]; then
        yellow "   ⚠️ Fichier très petit - possiblement un placeholder"
    else
        echo "   ├─ Taille normale pour un fichier React build"
    fi
    
    # Check des permissions
    permissions=$(ls -l "$FALLBACK_DIR/index.html" 2>/dev/null || echo "unknown")
    echo "   └─ Permissions : $permissions"
else
    red "❌ index.html NOT FOUND in $FALLBACK_DIR" echo"   ├─ 🚨 PROBLÈME : Fallback SPA manquant" echo"   └─ 🔧 CORRECTIF : Créer ou copier le build React vers $FALLBACK_DIR"
fi

# 5. Test et reload Nginx
blue "\n[5] 🔄 NGINX TEST & RELOAD"
echo "------------------------------" echo"🧪 Test de la syntaxe Nginx..."
if nginx -t 2>&1 | grep -q "successful"; then green"✅ Syntaxe Nginx OK" echo"🔄 Rechargement Nginx..."
    if nginx -s reload 2>/dev/null; then
        green "✅ Nginx rechargé avec succès"
    else
        red "❌ Échec du rechargement Nginx"
    fi
else
    red "❌ Erreur de syntaxe Nginx !" echo"📋 Détails de l'erreur :"
    nginx -t 2>&1 | while IFS= read -r line; do
        red "   🚨 $line"
    done
fi

# 6. Test public final
blue "\n[6] 🌐 TEST PUBLIC FINAL"
echo "----------------------------"
public_url="https://$PUBLIC_DOMAIN" echo"🚀 Test de $public_url..."

# Test sans suivre les redirections
public_code=$(curl -sS -o /dev/null -w "%{http_code}" -m 6 -I "$public_url" 2>/dev/null || echo "000")
echo "📊 Réponse HTTP : $public_code"

if [[ "$public_code" == "200" || "$public_code" == "204" ]]; then
    green "🎉 SUCCESS ! $public_url répond correctement"
else
    # Test avec redirections
    public_code_redirect=$(curl -sS -o /dev/null -w "%{http_code}" -m 6 -I -L "$public_url" 2>/dev/null || echo "000")
    echo "📊 Réponse HTTP (avec redirections) : $public_code_redirect"
    
    if [[ "$public_code_redirect" == "200" || "$public_code_redirect" == "204" ]]; then
        yellow "⚠️ Fonctionne avec redirections mais pas en direct"
    else
        red "❌ ÉCHEC : $public_url inaccessible (HTTP $public_code)"
    fi
fi

# 7. Test de l'API spécifique qui pose problème
blue "\n[7] 🔧 TEST API RLS HEALTH (problème identifié)"
echo "-------------------------------------------------------"
api_url="https://$PUBLIC_DOMAIN/api/security/rls/health" echo"🎯 Test de l'endpoint API : $api_url"

api_code=$(curl -sS -o /dev/null -w "%{http_code}" -m 6 -I "$api_url" 2>/dev/null || echo "000")
echo "📊 Réponse API : $api_code"

if [[ "$api_code" == "200" || "$api_code" == "204" ]]; then
    green "✅ API RLS health accessible"
else
    red "❌ API RLS health INACCESSIBLE (HTTP $api_code)"
    echo "   ├─ 🚨 C'est exactement le problème vu dans les logs navigateur" echo "   ├─ L'app utilise le fallback Supabase qui fonctionne" echo"   └─ 🔧 CORRECTIF : Fixer le reverse proxy vers l'API backend"
fi

# 8. Test de l'API backend direct
blue "\n[8] 🎯 TEST API BACKEND DIRECT"
echo "-----------------------------------"
backend_url="http://$APP_HOST:4000/health" echo"🔍 Test direct de l'API backend : $backend_url"

backend_code=$(curl -sS -o /dev/null -w "%{http_code}" -m 5 -I "$backend_url" 2>/dev/null || echo "000")
echo "📊 Réponse Backend : $backend_code"

if [[ "$backend_code" == "200" || "$backend_code" == "204" ]]; then
    green "✅ Backend API répond directement" echo"   └─ Le problème est dans le reverse proxy Nginx"
else
    red "❌ Backend API ne répond pas (HTTP $backend_code)"
    echo "   ├─ 🚨 PROBLÈME : Le service API backend est down" echo"   └─ 🔧 CORRECTIF : Vérifier/redémarrer le service API"
fi

# 9. Résumé et recommandations
bold "\n🎯 RÉSUMÉ DIAGNOSTIC & PLAN D'ACTION" echo"=======================================" echo"📍 PROBLÈMES IDENTIFIÉS :" echo""

if [[ "$upstream_code" != "200" && "$upstream_code" != "204" ]]; then
    red "❌ 1. UPSTREAM DOWN : L'app n'écoute pas sur $APP_HOST:$APP_PORT" echo "   🔧 Solution : Redémarrer l'app avec bind 0.0.0.0:3000" echo""
fi

if [[ "$backend_code" != "200" && "$backend_code" != "204" ]]; then
    red "❌ 2. BACKEND API DOWN : API backend ne répond pas sur port 4000" echo"   🔧 Solution : Vérifier/redémarrer le service API backend" echo""
fi

if [[ "$api_code" != "200" && "$api_code" != "204" ]]; then
    red "❌ 3. REVERSE PROXY BROKEN : API backend inaccessible via Nginx" echo"   🔧 Solution : Vérifier proxy_pass dans Nginx config" echo""
fi

if [[ "$public_code" != "200" && "$public_code" != "204" ]]; then
    red "❌ 4. 502 BAD GATEWAY : Site principal inaccessible" echo"   🔧 Solution : Corriger la chaîne proxy → app" echo""
fi

echo "🔧 COMMANDES DE CORRECTION SUGGÉRÉES :" echo"" echo"# 1. Vérifier l'app Docker" echo"docker ps | grep app" echo"docker logs app --tail 20" echo"" echo"# 2. Vérifier l'API backend" echo"docker ps | grep api" echo"docker logs api --tail 20" echo"" echo"# 3. Redémarrer les services si nécessaire" echo"docker-compose restart app api" echo"" echo"# 4. Vérifier la config Nginx générée" echo"cat /etc/nginx/conf.d/trading-mvp.conf" echo"" echo"# 5. Tests manuels du proxy" echo"curl -I http://$APP_HOST:$APP_PORT/" echo"curl -I http://$APP_HOST:4000/health" echo"curl -I https://$PUBLIC_DOMAIN/" echo"" bold"📞 STATUT FINAL :"
if [[ "$public_code" == "200" || "$public_code" == "204" ]] && [[ "$api_code" == "200" || "$api_code" == "204" ]]; then
    green "🎉 RÉSOLU : Le site et l'API sont maintenant accessibles !"
elif [[ "$public_code" == "200" || "$public_code" == "204" ]]; then
    yellow "⚠️ PARTIELLEMENT RÉSOLU : Site accessible mais API encore en erreur"
else
    red "🚨 NON RÉSOLU : Actions correctives nécessaires" echo"   └─ Suivre le plan d'action ci-dessus"
fi

echo "" echo"================== FIN DIAGNOSTIC =================="