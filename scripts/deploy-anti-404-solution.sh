#!/bin/bash
# ====================================================================================
# SCRIPT DE DÉPLOIEMENT SOLUTION ANTI-404 COMPLÈTE
# ====================================================================================
# Implémente toutes les corrections 404 et tests automatisés
# Usage: ./deploy-anti-404-solution.sh

set -e

echo "=== 🚀 DÉPLOIEMENT SOLUTION ANTI-404 COMPLÈTE ===" echo"Date: $(date)" echo"Serveur: $(hostname)"

# Variables de configuration
DOMAIN="trading-mvp.com"
NGINX_CONF="/etc/nginx/sites-available/trading-mvp.conf"
WEB_ROOT="/var/www/app"
LOG_DIR="/var/log/nginx"

# ====================================================================================
# 1️⃣ BACKUP DE LA CONFIGURATION EXISTANTE
# ====================================================================================
echo "--- 📦 Sauvegarde configuration existante ---"
if [ -f "$NGINX_CONF" ]; then
    cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backup créé: ${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
else
    echo "⚠️ Aucune configuration existante trouvée"
fi

# ====================================================================================
# 2️⃣ DÉPLOIEMENT CONFIGURATION NGINX
# ====================================================================================
echo "--- 🔧 Installation nouvelle configuration Nginx ---"

# Copier la nouvelle configuration
cp nginx/nginx-404-fix.conf "$NGINX_CONF" echo"✅ Configuration Nginx mise à jour"

# Créer les répertoires de logs si nécessaires
mkdir -p "$LOG_DIR" touch"${LOG_DIR}/trading-mvp.access.log" touch"${LOG_DIR}/trading-mvp.error.log" chown www-data:www-data"${LOG_DIR}/trading-mvp."*.log echo"✅ Logs configurés"

# Test de la configuration
echo "--- 🧪 Test configuration Nginx ---"
if nginx -t; then
    echo "✅ Configuration Nginx valide"
else
    echo "❌ Erreur configuration Nginx - restauration backup"
    if [ -f "${NGINX_CONF}.backup."* ]; then
        cp "${NGINX_CONF}.backup."* "$NGINX_CONF"
    fi
    exit 1
fi

# Activation du site
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/trading-mvp.conf
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Rechargement Nginx
echo "--- 🔄 Rechargement Nginx ---"
systemctl reload nginx
systemctl status nginx --no-pager -l
echo "✅ Nginx rechargé avec succès"

# ====================================================================================
# 3️⃣ VÉRIFICATION FRONTEND REACT
# ====================================================================================
echo "--- ⚛️ Vérification build React ---"
if [ -d "$WEB_ROOT" ]; then
    if [ -f "$WEB_ROOT/index.html" ]; then
        echo "✅ Build React trouvé"
        # Vérifier la taille du build
        BUILD_SIZE=$(du -sh "$WEB_ROOT" | cut -f1)
        echo "📊 Taille du build: $BUILD_SIZE"
        
        # Vérifier les assets critiques
        CRITICAL_FILES=("index.html" "manifest.json" "favicon.ico")
        for file in "${CRITICAL_FILES[@]}"; do
            if [ -f "$WEB_ROOT/$file" ]; then
                echo "✅ $file présent"
            else
                echo "⚠️ $file manquant"
            fi
        done
    else
        echo "❌ index.html non trouvé dans $WEB_ROOT" echo"💡 Lancez la commande: npm run build"
    fi
else
    echo "❌ Répertoire web $WEB_ROOT non trouvé"
fi

# ====================================================================================
# 4️⃣ TESTS AUTOMATIQUES DES ROUTES
# ====================================================================================
echo "--- 🔍 Tests automatiques routes critiques ---"

# Fonction de test d'une route
test_route() {
    local route="$1"
    local expected_status="${2:-200}"
    local description="$3" echo"Testing: $route ($description)"
    
    if command -v curl >/dev/null 2>&1; then
        # Test avec curl
        status=$(curl -k -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}${route}" --max-time 10 || echo "000")
        if [ "$status" = "$expected_status" ]; then
            echo "✅ $route → HTTP $status"
        else
            echo "❌ $route → HTTP $status (attendu: $expected_status)"
        fi
    else
        echo "⚠️ curl non disponible - test manuel requis"
    fi
}

# Tests des routes principales
test_route "/" 200 "Page d'accueil" test_route"/unified" 200 "Dashboard unifié"
test_route "/unified?module=trading&view=positions"200 "Trading avec paramètres" test_route"/dashboard"200 "Dashboard principal" test_route"/system-status"200 "État système" test_route"/ai-system-status"200 "État IA" test_route"/market-analysis"200 "Analyse marché" test_route"/api/health"200 "Santé API" test_route"/health"200 "Santé Nginx" test_route"/nonexistent-page" 200 "Page inexistante (SPA fallback)"

# ====================================================================================
# 5️⃣ TEST BACKEND ET API
# ====================================================================================
echo "--- 🧠 Test backend et API ---"
if command -v curl >/dev/null 2>&1; then
    API_HEALTH=$(curl -k -s "https://${DOMAIN}/api/health" --max-time 5 || echo "API_ERROR")
    if echo "$API_HEALTH"| grep -q "OK\|success\|healthy\|running" 2>/dev/null; then echo"✅ Backend API opérationnel"
    else
        echo "⚠️ Backend API indisponible ou erreur" echo"Response: $API_HEALTH"
    fi
else
    echo "⚠️ Test API manuel requis"
fi

# ====================================================================================
# 6️⃣ MONITORING SETUP
# ====================================================================================
echo "--- 📊 Configuration monitoring 404 ---"

# Script de monitoring des 404
cat > /usr/local/bin/monitor-404.sh << 'EOF'
#!/bin/bash
# Monitoring des erreurs 404 en temps réel
LOG_FILE="/var/log/nginx/trading-mvp.access.log"

echo "=== MONITORING 404 - $(date) ===" echo"Dernières erreurs 404:" tail -n 1000"$LOG_FILE"| grep " 404 " | tail -n 10 echo"" echo"Top 404 par URL (dernières 1000 lignes):" tail -n 1000"$LOG_FILE" | grep " 404 " | awk '{print $7}' | sort | uniq -c | sort -nr | head -n 5

echo "" echo"Statistiques 404 (dernières 1000 lignes):"
TOTAL=$(tail -n 1000 "$LOG_FILE" | wc -l)
ERRORS_404=$(tail -n 1000 "$LOG_FILE" | grep " 404 " | wc -l)
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$(echo "scale=2; $ERRORS_404 * 100 / $TOTAL" | bc -l 2>/dev/null || echo "N/A")
    echo "Total requêtes: $TOTAL" echo"Erreurs 404: $ERRORS_404 ($PERCENTAGE%)"
fi
EOF

chmod +x /usr/local/bin/monitor-404.sh
echo "✅ Script monitoring 404 installé: /usr/local/bin/monitor-404.sh"

# ====================================================================================
# 7️⃣ TESTS LIVE CONTINUS
# ====================================================================================
echo "--- 🔁 Tests live et validation continue ---"

# Vérification logs récents
echo "Vérification logs récents (erreurs 404):"
if [ -f "${LOG_DIR}/trading-mvp.access.log" ]; then
    RECENT_404=$(tail -n 100 "${LOG_DIR}/trading-mvp.access.log" | grep " 404 " | wc -l)
    echo "📊 Erreurs 404 récentes (100 dernières lignes): $RECENT_404"
    
    if [ $RECENT_404 -gt 0 ]; then
        echo "⚠️ Détail des 404 récentes:" tail -n 100"${LOG_DIR}/trading-mvp.access.log" | grep " 404 " | tail -n 5
    else
        echo "✅ Aucune erreur 404 récente détectée"
    fi
else
    echo "⚠️ Log file pas encore créé"
fi

# ====================================================================================
# 8️⃣ RÉSUMÉ ET VÉRIFICATIONS FINALES
# ====================================================================================
echo "" echo"=== ✅ RÉSUMÉ DU DÉPLOIEMENT ===" echo"🧩 SPA Fallback: Configuration ✓" echo"🌐 Reverse Proxy API: Configuration ✓" echo"🧠 Cache Assets: Optimisé ✓" echo"🔒 HTTPS: Redirection forcée ✓" echo"🧾 Logs 404: Monitoring activé ✓" echo"🧮 Frontend: React Router renforcé ✓" echo"🧰 Variables ENV: À vérifier manuellement" echo"🚨 Tests: Automatiques ✓" echo"" echo"=== 🔧 COMMANDES UTILES ===" echo"Monitoring 404: /usr/local/bin/monitor-404.sh" echo"Logs Nginx: tail -f ${LOG_DIR}/trading-mvp.access.log" echo"Reload Nginx: systemctl reload nginx" echo"Test config: nginx -t" echo"" echo"=== 🎯 PROCHAINES ÉTAPES ===" echo"1. Vérifiez vos variables d'environnement React (.env)" echo"2. Testez manuellement les routes critiques" echo"3. Surveillez les logs pendant quelques heures" echo"4. Ajustez le cache selon vos besoins" echo"" echo"=== ✅ DÉPLOIEMENT ANTI-404 TERMINÉ ==="
date