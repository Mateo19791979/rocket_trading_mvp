#!/bin/bash

# 🔍 DIAGNOSTIC TRADES MONITORING - SCRIPT MANUEL
# Objectif : Identifier pourquoi les trades n'apparaissent pas dans le monitoring
# Exécution : chmod +x diagnostic_trades_manual.sh && ./diagnostic_trades_manual.sh

set -e

echo "=== 🚀 DIAGNOSTIC TRADES MONITORING MANUEL ===" echo"Vérification chaîne IBKR → Backend → DB → Frontend" echo""

# Configuration
BASE_URL="https://trading-mvp.com"
RESULTS_FILE="diagnostic_results_$(date +%Y%m%d_%H%M%S).txt" echo"📋 Rapport sauvegardé dans : $RESULTS_FILE" echo"" | tee $RESULTS_FILE

# =============================================================================
# 🔧 ÉTAPE 1 : TEST IBKR (Connexion & Fills)
# =============================================================================
echo "🔧 ÉTAPE 1/4 : TEST IBKR" | tee -a $RESULTS_FILE echo"Vérification connexion IBKR et récupération des fills"| tee -a $RESULTS_FILE echo"" | tee -a $RESULTS_FILE

# Test handshake IBKR
echo "► Test 1.1 : Handshake IBKR" | tee -a $RESULTS_FILE
HANDSHAKE_RESULT=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/ibkr/handshake" 2>/dev/null || echo "ERREUR_CONNEXION")

if [[ "$HANDSHAKE_RESULT" == *"ERREUR_CONNEXION"* ]]; then
    echo "❌ KO - Impossible de contacter l'API IBKR"| tee -a $RESULTS_FILE echo"   → CAUSE : Serveur inaccessible ou DNS défaillant"| tee -a $RESULTS_FILE echo"   → CORRECTIF : Vérifier connectivité réseau, statut serveur" | tee -a $RESULTS_FILE
    IBKR_CONNECTION="KO"
    FILLS_DETECTED=0
else
    HTTP_CODE=$(echo "$HANDSHAKE_RESULT" | grep "HTTP_CODE:" | cut -d: -f2)
    HANDSHAKE_DATA=$(echo "$HANDSHAKE_RESULT" | grep -v "HTTP_CODE:")
    
    if [[ "$HTTP_CODE" == "200" ]] && [[ "$HANDSHAKE_DATA" == *'"status":"ok"'* ]]; then
        echo "✅ OK - Handshake réussi : $HANDSHAKE_DATA" | tee -a $RESULTS_FILE
        IBKR_CONNECTION="OK"
    else
        echo "❌ KO - Handshake échoué (HTTP $HTTP_CODE)" | tee -a $RESULTS_FILE
        echo "   → RÉPONSE : $HANDSHAKE_DATA"| tee -a $RESULTS_FILE echo"   → CAUSE : TWS/Gateway non connecté ou API désactivée"| tee -a $RESULTS_FILE echo"   → CORRECTIF : Ouvrir TWS, Enable Socket Clients, port 7497" | tee -a $RESULTS_FILE
        IBKR_CONNECTION="KO"
    fi
fi

echo "" | tee -a $RESULTS_FILE

# Test récupération fills
echo "► Test 1.2 : Récupération des fills" | tee -a $RESULTS_FILE
if [[ "$IBKR_CONNECTION" == "OK" ]]; then
    FILLS_RESULT=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/ibkr/fills?limit=5" 2>/dev/null || echo "ERREUR_FILLS")
    
    if [[ "$FILLS_RESULT" == *"ERREUR_FILLS"* ]]; then
        echo "❌ KO - Impossible de récupérer les fills" | tee -a $RESULTS_FILE
        FILLS_DETECTED=0
    else
        FILLS_HTTP_CODE=$(echo "$FILLS_RESULT" | grep "HTTP_CODE:" | cut -d: -f2)
        FILLS_DATA=$(echo "$FILLS_RESULT" | grep -v "HTTP_CODE:")
        
        if [[ "$FILLS_HTTP_CODE" == "200" ]]; then
            # Compter les fills dans la réponse JSON
            FILLS_COUNT=$(echo "$FILLS_DATA" | grep -o '"' | wc -l | awk '{print int($1/10)}' 2>/dev/null || echo "0")
            
            if [[ "$FILLS_COUNT" -gt 0 ]]; then
                echo "✅ OK - $FILLS_COUNT fills détectés" | tee -a $RESULTS_FILE
                FILLS_DETECTED=$FILLS_COUNT
            else
                echo "⚠️  ATTENTION - Aucun fill détecté" | tee -a $RESULTS_FILE echo"   → CAUSE PROBABLE : IBKR_READ_ONLY=true ou pas d'exécutions récentes"| tee -a $RESULTS_FILE echo"   → CORRECTIF : Vérifier configuration IBKR_READ_ONLY=false" | tee -a $RESULTS_FILE
                FILLS_DETECTED=0
            fi
        else
            echo "❌ KO - Erreur HTTP $FILLS_HTTP_CODE pour les fills" | tee -a $RESULTS_FILE
            FILLS_DETECTED=0
        fi
    fi
else
    echo "⏸️  SKIP - Test fills ignoré (handshake KO)" | tee -a $RESULTS_FILE
    FILLS_DETECTED=0
fi

echo "" | tee -a $RESULTS_FILE

# =============================================================================
# 🔧 ÉTAPE 2 : TEST BACKEND (Logs d'exécution)
# =============================================================================
echo "🔧 ÉTAPE 2/4 : TEST BACKEND" | tee -a $RESULTS_FILE echo"Vérification logs d'exécution backend"| tee -a $RESULTS_FILE echo"" | tee -a $RESULTS_FILE

BACKEND_LOGS_RESULT=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/ibkr/execute/logs?limit=10" 2>/dev/null || echo "ERREUR_BACKEND")

if [[ "$BACKEND_LOGS_RESULT" == *"ERREUR_BACKEND"* ]]; then
    echo "❌ KO - Impossible de récupérer les logs backend"| tee -a $RESULTS_FILE echo"   → CAUSE : Endpoint /execute/logs non disponible"| tee -a $RESULTS_FILE echo"   → CORRECTIF : Vérifier route backend et redémarrer service" | tee -a $RESULTS_FILE
    BACKEND_LOGS_FOUND=false
else
    BACKEND_HTTP_CODE=$(echo "$BACKEND_LOGS_RESULT" | grep "HTTP_CODE:" | cut -d: -f2)
    BACKEND_DATA=$(echo "$BACKEND_LOGS_RESULT" | grep -v "HTTP_CODE:")
    
    if [[ "$BACKEND_HTTP_CODE" == "200" ]]; then
        BACKEND_ENTRIES=$(echo "$BACKEND_DATA" | grep -o '"' | wc -l 2>/dev/null || echo "0")
        
        if [[ "$BACKEND_ENTRIES" -gt 10 ]]; then
            echo "✅ OK - Logs backend détectés" | tee -a $RESULTS_FILE
            BACKEND_LOGS_FOUND=true
        else
            echo "⚠️  ATTENTION - Logs backend vides ou insuffisants" | tee -a $RESULTS_FILE echo"   → CAUSE : Backend ne journalise pas les ordres"| tee -a $RESULTS_FILE echo"   → CORRECTIF : Vérifier IBKR_READ_ONLY=false et logs applicatifs" | tee -a $RESULTS_FILE
            BACKEND_LOGS_FOUND=false
        fi
    else
        echo "❌ KO - Erreur HTTP $BACKEND_HTTP_CODE pour les logs" | tee -a $RESULTS_FILE
        BACKEND_LOGS_FOUND=false
    fi
fi

echo "" | tee -a $RESULTS_FILE

# =============================================================================
# 🔧 ÉTAPE 3 : TEST SUPABASE (Comptage tables)
# =============================================================================
echo "🔧 ÉTAPE 3/4 : TEST SUPABASE" | tee -a $RESULTS_FILE echo"Vérification des données en base (tables orders/fills)"| tee -a $RESULTS_FILE echo""| tee -a $RESULTS_FILE echo"⚠️  MANUEL REQUIS - Exécutez ces requêtes dans Supabase SQL Editor :"| tee -a $RESULTS_FILE echo""| tee -a $RESULTS_FILE echo"-- Requête 1 : Compter les ordres"| tee -a $RESULTS_FILE echo"SELECT COUNT(*) as orders_count FROM trading.orders;"| tee -a $RESULTS_FILE echo""| tee -a $RESULTS_FILE echo"-- Requête 2 : Compter les fills"| tee -a $RESULTS_FILE echo"SELECT COUNT(*) as fills_count FROM trading.fills;"| tee -a $RESULTS_FILE echo""| tee -a $RESULTS_FILE echo"-- Requête 3 : Vérifier vue orders"| tee -a $RESULTS_FILE echo"SELECT to_regclass('trading.v_orders_current_status') as vue_exists;"| tee -a $RESULTS_FILE echo""| tee -a $RESULTS_FILE echo"📝 INTERPRÉTATION SUPABASE :"| tee -a $RESULTS_FILE echo"   ✅ orders_count > 0 ET fills_count > 0 → Base alimentée correctement"| tee -a $RESULTS_FILE echo"   ❌ orders_count = 0 → Backend n'écrit pas en DB (problème triggers)"| tee -a $RESULTS_FILE echo"   ⚠️  orders_count > 0 mais fills_count = 0 → Problème ingestion fills"| tee -a $RESULTS_FILE echo"   ❌ vue_exists = NULL → Vue manquante, à recréer"| tee -a $RESULTS_FILE echo"" | tee -a $RESULTS_FILE

# Valeurs par défaut pour la suite (à ajuster manuellement après vérification DB)
ORDERS_IN_DB=0
FILLS_IN_DB=0

# =============================================================================
# 🔧 ÉTAPE 4 : TEST FRONTEND (API Metrics)
# =============================================================================
echo "🔧 ÉTAPE 4/4 : TEST FRONTEND" | tee -a $RESULTS_FILE echo"Vérification API compteur trades frontend"| tee -a $RESULTS_FILE echo"" | tee -a $RESULTS_FILE

FRONTEND_RESULT=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/metrics/trades/count" 2>/dev/null || echo "ERREUR_FRONTEND")

if [[ "$FRONTEND_RESULT" == *"ERREUR_FRONTEND"* ]]; then
    echo "❌ KO - Impossible de contacter l'API metrics"| tee -a $RESULTS_FILE echo"   → CAUSE : Endpoint /metrics/trades/count non disponible"| tee -a $RESULTS_FILE echo"   → CORRECTIF : Vérifier route API et redémarrer service" | tee -a $RESULTS_FILE
    FRONTEND_TRADES_COUNT=0
else
    FRONTEND_HTTP_CODE=$(echo "$FRONTEND_RESULT" | grep "HTTP_CODE:" | cut -d: -f2)
    FRONTEND_DATA=$(echo "$FRONTEND_RESULT" | grep -v "HTTP_CODE:")
    
    if [[ "$FRONTEND_HTTP_CODE" == "200" ]]; then
        if [[ "$FRONTEND_DATA" == *"count_15m"* ]] || [[ "$FRONTEND_DATA" == *"count_today"* ]]; then
            echo "✅ OK - API metrics répond : $FRONTEND_DATA" | tee -a $RESULTS_FILE
            # Extraire count_15m si présent, sinon count_today
            COUNT_15M=$(echo "$FRONTEND_DATA" | grep -o '"count_15m":[0-9]*' | cut -d: -f2 2>/dev/null || echo "0")
            COUNT_TODAY=$(echo "$FRONTEND_DATA" | grep -o '"count_today":[0-9]*' | cut -d: -f2 2>/dev/null || echo "0")
            
            if [[ "$COUNT_15M" -gt 0 ]]; then
                FRONTEND_TRADES_COUNT=$COUNT_15M
            else
                FRONTEND_TRADES_COUNT=$COUNT_TODAY
            fi
            
            echo "   → Trades détectés : $FRONTEND_TRADES_COUNT" | tee -a $RESULTS_FILE
        else
            echo "⚠️  ATTENTION - Réponse API inattendue : $FRONTEND_DATA" | tee -a $RESULTS_FILE
            FRONTEND_TRADES_COUNT=0
        fi
    else
        echo "❌ KO - Erreur HTTP $FRONTEND_HTTP_CODE pour metrics" | tee -a $RESULTS_FILE
        FRONTEND_TRADES_COUNT=0
    fi
fi

echo "" | tee -a $RESULTS_FILE

# =============================================================================
# 📊 RAPPORT DE SYNTHÈSE
# =============================================================================
echo "📊 RAPPORT DE SYNTHÈSE" | tee -a $RESULTS_FILE echo"==============================================="| tee -a $RESULTS_FILE echo"" | tee -a $RESULTS_FILE

# Tableau de résultats
printf "%-15s %-20s %-15s %-30s\n" "COMPOSANT" "TEST" "RÉSULTAT" "INTERPRÉTATION" | tee -a $RESULTS_FILE printf"%-15s %-20s %-15s %-30s\n""=========" "====" "========" "=============" | tee -a $RESULTS_FILE printf"%-15s %-20s %-15s %-30s\n""IBKR" "handshake/fills" "$IBKR_CONNECTION" "Connexion TWS/Gateway" | tee -a $RESULTS_FILE printf"%-15s %-20s %-15s %-30s\n""Backend" "execute/logs" "$BACKEND_LOGS_FOUND" "Journalisation ordres" | tee -a $RESULTS_FILE printf"%-15s %-20s %-15s %-30s\n" "Supabase" "orders/fills" "MANUEL" "Vérification DB requise" | tee -a $RESULTS_FILE
printf "%-15s %-20s %-15s %-30s\n""Frontend" "metrics/count" "$FRONTEND_TRADES_COUNT" "API monitoring UI" | tee -a $RESULTS_FILE echo"" | tee -a $RESULTS_FILE

# Diagnostic automatique
echo "🔍 DIAGNOSTIC AUTOMATIQUE :" | tee -a $RESULTS_FILE echo"" | tee -a $RESULTS_FILE

if [[ "$IBKR_CONNECTION" == "KO" ]]; then
    echo "🚨 CAUSE PROBABLE : TWS/Gateway non connecté"| tee -a $RESULTS_FILE echo"🔧 CORRECTIF RECOMMANDÉ : Ouvrir TWS/Gateway, Enable Socket Clients, port 7497, relancer handshake" | tee -a $RESULTS_FILE
elif [[ "$BACKEND_LOGS_FOUND" == "false" ]] && [[ "$IBKR_CONNECTION" == "OK" ]]; then
    echo "🚨 CAUSE PROBABLE : Backend n'écrit pas en DB"| tee -a $RESULTS_FILE echo"🔧 CORRECTIF RECOMMANDÉ : Vérifier route /api/ibkr/execute → insert DB (orders), vérifier logs backend" | tee -a $RESULTS_FILE
elif [[ "$FRONTEND_TRADES_COUNT" -eq 0 ]] && [[ "$IBKR_CONNECTION" == "OK" ]]; then
    echo "🚨 CAUSE PROBABLE : API frontend incorrecte ou DB vide"| tee -a $RESULTS_FILE echo"🔧 CORRECTIF RECOMMANDÉ : Corriger /api/metrics/trades/count pour lire trading.fills ou v_orders_current_status" | tee -a $RESULTS_FILE
else
    echo "✅ Tests automatiques OK - Vérifiez manuellement les compteurs Supabase" | tee -a $RESULTS_FILE
fi

echo "" | tee -a $RESULTS_FILE

# JSON Final (format simplifié pour copie manuelle)
echo "📋 JSON RÉSUMÉ (à compléter avec données Supabase) :" | tee -a $RESULTS_FILE
echo "{"| tee -a $RESULTS_FILE echo"  \"ibkr_connection\": \"$IBKR_CONNECTION\"," | tee -a $RESULTS_FILE echo"  \"fills_detected\": $FILLS_DETECTED," | tee -a $RESULTS_FILE echo"  \"orders_in_db\": $ORDERS_IN_DB," | tee -a $RESULTS_FILE echo"  \"fills_in_db\": $FILLS_IN_DB," | tee -a $RESULTS_FILE echo"  \"frontend_trades_count\": $FRONTEND_TRADES_COUNT," | tee -a $RESULTS_FILE echo"  \"backend_logs_found\": $BACKEND_LOGS_FOUND" | tee -a $RESULTS_FILE echo"}"| tee -a $RESULTS_FILE echo""| tee -a $RESULTS_FILE echo"✅ Diagnostic terminé. Rapport complet dans : $RESULTS_FILE" echo"📌 ÉTAPE SUIVANTE : Exécuter les requêtes SQL manuellement et mettre à jour orders_in_db/fills_in_db"