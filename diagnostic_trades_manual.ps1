# 🔍 DIAGNOSTIC TRADES MONITORING - SCRIPT POWERSHELL
# Objectif : Identifier pourquoi les trades n'apparaissent pas dans le monitoring  
# Exécution : .\diagnostic_trades_manual.ps1

Write-Host "=== 🚀 DIAGNOSTIC TRADES MONITORING MANUEL ===" -ForegroundColor Cyan Write-Host"Vérification chaîne IBKR → Backend → DB → Frontend"-ForegroundColor White Write-Host""

# Configuration
$BaseUrl = "https://trading-mvp.com"
$ResultsFile = "diagnostic_results_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt" Write-Host"📋 Rapport sauvegardé dans : $ResultsFile"-ForegroundColor Yellow "" | Out-File -FilePath $ResultsFile

# =============================================================================
# 🔧 ÉTAPE 1 : TEST IBKR (Connexion & Fills)
# =============================================================================
Write-Host "🔧 ÉTAPE 1/4 : TEST IBKR" -ForegroundColor Green "🔧 ÉTAPE 1/4 : TEST IBKR"| Out-File -FilePath $ResultsFile -Append Write-Host"Vérification connexion IBKR et récupération des fills" "Vérification connexion IBKR et récupération des fills"| Out-File -FilePath $ResultsFile -Append "" | Out-File -FilePath $ResultsFile -Append

# Test handshake IBKR
Write-Host "► Test 1.1 : Handshake IBKR" -ForegroundColor Yellow "► Test 1.1 : Handshake IBKR" | Out-File -FilePath $ResultsFile -Append

try {
    $HandshakeResponse = Invoke-RestMethod -Uri "$BaseUrl/api/ibkr/handshake" -Method GET -TimeoutSec 10
    $HandshakeStatus = $HandshakeResponse.status
    $HandshakeConnection = $HandshakeResponse.connection
    
    if ($HandshakeStatus -eq "ok") {
        Write-Host "✅ OK - Handshake réussi : status=$HandshakeStatus, connection=$HandshakeConnection"-ForegroundColor Green "✅ OK - Handshake réussi : status=$HandshakeStatus, connection=$HandshakeConnection" | Out-File -FilePath $ResultsFile -Append
        $IbkrConnection = "OK"
    } else {
        Write-Host "❌ KO - Handshake échoué : $HandshakeResponse" -ForegroundColor Red "❌ KO - Handshake échoué : $HandshakeResponse"| Out-File -FilePath $ResultsFile -Append "   → CAUSE : TWS/Gateway non connecté ou API désactivée"| Out-File -FilePath $ResultsFile -Append "   → CORRECTIF : Ouvrir TWS, Enable Socket Clients, port 7497" | Out-File -FilePath $ResultsFile -Append
        $IbkrConnection = "KO"
    }
}
catch {
    Write-Host "❌ KO - Impossible de contacter l'API IBKR : $($_.Exception.Message)" -ForegroundColor Red
    "❌ KO - Impossible de contacter l'API IBKR : $($_.Exception.Message)"| Out-File -FilePath $ResultsFile -Append "   → CAUSE : Serveur inaccessible ou DNS défaillant"| Out-File -FilePath $ResultsFile -Append "   → CORRECTIF : Vérifier connectivité réseau, statut serveur" | Out-File -FilePath $ResultsFile -Append
    $IbkrConnection = "KO"
}

"" | Out-File -FilePath $ResultsFile -Append

# Test récupération fills
Write-Host "► Test 1.2 : Récupération des fills" -ForegroundColor Yellow "► Test 1.2 : Récupération des fills" | Out-File -FilePath $ResultsFile -Append

if ($IbkrConnection -eq "OK") {
    try {
        $FillsResponse = Invoke-RestMethod -Uri "$BaseUrl/api/ibkr/fills?limit=5" -Method GET -TimeoutSec 10
        
        if ($FillsResponse -and $FillsResponse.Count -gt 0) {
            $FillsCount = $FillsResponse.Count
            Write-Host "✅ OK - $FillsCount fills détectés" -ForegroundColor Green "✅ OK - $FillsCount fills détectés" | Out-File -FilePath $ResultsFile -Append
            $FillsDetected = $FillsCount
        } else {
            Write-Host "⚠️  ATTENTION - Aucun fill détecté" -ForegroundColor Yellow "⚠️  ATTENTION - Aucun fill détecté"| Out-File -FilePath $ResultsFile -Append "   → CAUSE PROBABLE : IBKR_READ_ONLY=true ou pas d'exécutions récentes"| Out-File -FilePath $ResultsFile -Append "   → CORRECTIF : Vérifier configuration IBKR_READ_ONLY=false" | Out-File -FilePath $ResultsFile -Append
            $FillsDetected = 0
        }
    }
    catch {
        Write-Host "❌ KO - Erreur récupération fills : $($_.Exception.Message)" -ForegroundColor Red
        "❌ KO - Erreur récupération fills : $($_.Exception.Message)" | Out-File -FilePath $ResultsFile -Append
        $FillsDetected = 0
    }
} else {
    Write-Host "⏸️  SKIP - Test fills ignoré (handshake KO)" -ForegroundColor Gray
    "⏸️  SKIP - Test fills ignoré (handshake KO)" | Out-File -FilePath $ResultsFile -Append
    $FillsDetected = 0
}

"" | Out-File -FilePath $ResultsFile -Append

# =============================================================================
# 🔧 ÉTAPE 2 : TEST BACKEND (Logs d'exécution)
# =============================================================================
Write-Host "🔧 ÉTAPE 2/4 : TEST BACKEND" -ForegroundColor Green "🔧 ÉTAPE 2/4 : TEST BACKEND"| Out-File -FilePath $ResultsFile -Append Write-Host"Vérification logs d'exécution backend"
"Vérification logs d'exécution backend"| Out-File -FilePath $ResultsFile -Append "" | Out-File -FilePath $ResultsFile -Append

try {
    $BackendResponse = Invoke-RestMethod -Uri "$BaseUrl/api/ibkr/execute/logs?limit=10" -Method GET -TimeoutSec 10
    
    if ($BackendResponse -and $BackendResponse.Count -gt 0) {
        Write-Host "✅ OK - Logs backend détectés ($($BackendResponse.Count) entrées)" -ForegroundColor Green
        "✅ OK - Logs backend détectés ($($BackendResponse.Count) entrées)" | Out-File -FilePath $ResultsFile -Append
        $BackendLogsFound = $true
    } else {
        Write-Host "⚠️  ATTENTION - Logs backend vides ou insuffisants" -ForegroundColor Yellow "⚠️  ATTENTION - Logs backend vides ou insuffisants"| Out-File -FilePath $ResultsFile -Append "   → CAUSE : Backend ne journalise pas les ordres"| Out-File -FilePath $ResultsFile -Append "   → CORRECTIF : Vérifier IBKR_READ_ONLY=false et logs applicatifs" | Out-File -FilePath $ResultsFile -Append
        $BackendLogsFound = $false
    }
}
catch {
    Write-Host "❌ KO - Impossible de récupérer les logs backend : $($_.Exception.Message)" -ForegroundColor Red
    "❌ KO - Impossible de récupérer les logs backend : $($_.Exception.Message)"| Out-File -FilePath $ResultsFile -Append "   → CAUSE : Endpoint /execute/logs non disponible"| Out-File -FilePath $ResultsFile -Append "   → CORRECTIF : Vérifier route backend et redémarrer service" | Out-File -FilePath $ResultsFile -Append
    $BackendLogsFound = $false
}

"" | Out-File -FilePath $ResultsFile -Append

# =============================================================================
# 🔧 ÉTAPE 3 : TEST SUPABASE (Comptage tables)
# =============================================================================
Write-Host "🔧 ÉTAPE 3/4 : TEST SUPABASE" -ForegroundColor Green "🔧 ÉTAPE 3/4 : TEST SUPABASE"| Out-File -FilePath $ResultsFile -Append Write-Host"Vérification des données en base (tables orders/fills)" "Vérification des données en base (tables orders/fills)"| Out-File -FilePath $ResultsFile -Append ""| Out-File -FilePath $ResultsFile -Append Write-Host"⚠️  MANUEL REQUIS - Exécutez ces requêtes dans Supabase SQL Editor :"-ForegroundColor Yellow "⚠️  MANUEL REQUIS - Exécutez ces requêtes dans Supabase SQL Editor :"| Out-File -FilePath $ResultsFile -Append ""| Out-File -FilePath $ResultsFile -Append "-- Requête 1 : Compter les ordres"| Out-File -FilePath $ResultsFile -Append "SELECT COUNT(*) as orders_count FROM trading.orders;"| Out-File -FilePath $ResultsFile -Append ""| Out-File -FilePath $ResultsFile -Append "-- Requête 2 : Compter les fills"| Out-File -FilePath $ResultsFile -Append "SELECT COUNT(*) as fills_count FROM trading.fills;"| Out-File -FilePath $ResultsFile -Append ""| Out-File -FilePath $ResultsFile -Append "-- Requête 3 : Vérifier vue orders"| Out-File -FilePath $ResultsFile -Append "SELECT to_regclass('trading.v_orders_current_status') as vue_exists;"| Out-File -FilePath $ResultsFile -Append ""| Out-File -FilePath $ResultsFile -Append Write-Host"📝 INTERPRÉTATION SUPABASE :"-ForegroundColor Cyan "📝 INTERPRÉTATION SUPABASE :"| Out-File -FilePath $ResultsFile -Append "   ✅ orders_count > 0 ET fills_count > 0 → Base alimentée correctement"| Out-File -FilePath $ResultsFile -Append "   ❌ orders_count = 0 → Backend n'écrit pas en DB (problème triggers)"| Out-File -FilePath $ResultsFile -Append "   ⚠️  orders_count > 0 mais fills_count = 0 → Problème ingestion fills"| Out-File -FilePath $ResultsFile -Append "   ❌ vue_exists = NULL → Vue manquante, à recréer"| Out-File -FilePath $ResultsFile -Append "" | Out-File -FilePath $ResultsFile -Append

# Valeurs par défaut pour la suite (à ajuster manuellement après vérification DB)
$OrdersInDb = 0
$FillsInDb = 0

# =============================================================================
# 🔧 ÉTAPE 4 : TEST FRONTEND (API Metrics)
# =============================================================================
Write-Host "🔧 ÉTAPE 4/4 : TEST FRONTEND" -ForegroundColor Green "🔧 ÉTAPE 4/4 : TEST FRONTEND"| Out-File -FilePath $ResultsFile -Append Write-Host"Vérification API compteur trades frontend" "Vérification API compteur trades frontend"| Out-File -FilePath $ResultsFile -Append "" | Out-File -FilePath $ResultsFile -Append

try {
    $FrontendResponse = Invoke-RestMethod -Uri "$BaseUrl/api/metrics/trades/count" -Method GET -TimeoutSec 10
    
    if ($FrontendResponse.count_15m -or $FrontendResponse.count_today) {
        $Count15m = $FrontendResponse.count_15m
        $CountToday = $FrontendResponse.count_today
        
        if ($Count15m -gt 0) {
            $FrontendTradesCount = $Count15m
        } else {
            $FrontendTradesCount = $CountToday
        }
        
        Write-Host "✅ OK - API metrics répond : count_15m=$Count15m, count_today=$CountToday" -ForegroundColor Green "✅ OK - API metrics répond : count_15m=$Count15m, count_today=$CountToday"| Out-File -FilePath $ResultsFile -Append "   → Trades détectés : $FrontendTradesCount" | Out-File -FilePath $ResultsFile -Append
    } else {
        Write-Host "⚠️  ATTENTION - Réponse API inattendue : $FrontendResponse" -ForegroundColor Yellow "⚠️  ATTENTION - Réponse API inattendue : $FrontendResponse" | Out-File -FilePath $ResultsFile -Append
        $FrontendTradesCount = 0
    }
}
catch {
    Write-Host "❌ KO - Impossible de contacter l'API metrics : $($_.Exception.Message)" -ForegroundColor Red
    "❌ KO - Impossible de contacter l'API metrics : $($_.Exception.Message)"| Out-File -FilePath $ResultsFile -Append "   → CAUSE : Endpoint /metrics/trades/count non disponible"| Out-File -FilePath $ResultsFile -Append "   → CORRECTIF : Vérifier route API et redémarrer service" | Out-File -FilePath $ResultsFile -Append
    $FrontendTradesCount = 0
}

"" | Out-File -FilePath $ResultsFile -Append

# =============================================================================
# 📊 RAPPORT DE SYNTHÈSE
# =============================================================================
Write-Host "📊 RAPPORT DE SYNTHÈSE" -ForegroundColor Cyan "📊 RAPPORT DE SYNTHÈSE"| Out-File -FilePath $ResultsFile -Append "==============================================="| Out-File -FilePath $ResultsFile -Append "" | Out-File -FilePath $ResultsFile -Append

# Tableau de résultats
$ResultsTable = @"
COMPOSANT       TEST                 RÉSULTAT         INTERPRÉTATION
=========       ====                 ========         ==============
IBKR            handshake/fills      $IbkrConnection             Connexion TWS/Gateway
Backend         execute/logs         $BackendLogsFound           Journalisation ordres
Supabase        orders/fills         MANUEL           Vérification DB requise
Frontend        metrics/count        $FrontendTradesCount             API monitoring UI
"@

Write-Host $ResultsTable
$ResultsTable | Out-File -FilePath $ResultsFile -Append
"" | Out-File -FilePath $ResultsFile -Append

# Diagnostic automatique
Write-Host "🔍 DIAGNOSTIC AUTOMATIQUE :" -ForegroundColor Magenta "🔍 DIAGNOSTIC AUTOMATIQUE :"| Out-File -FilePath $ResultsFile -Append "" | Out-File -FilePath $ResultsFile -Append

if ($IbkrConnection -eq "KO") {
    Write-Host "🚨 CAUSE PROBABLE : TWS/Gateway non connecté"-ForegroundColor Red "🚨 CAUSE PROBABLE : TWS/Gateway non connecté"| Out-File -FilePath $ResultsFile -Append Write-Host"🔧 CORRECTIF RECOMMANDÉ : Ouvrir TWS/Gateway, Enable Socket Clients, port 7497, relancer handshake"-ForegroundColor Yellow "🔧 CORRECTIF RECOMMANDÉ : Ouvrir TWS/Gateway, Enable Socket Clients, port 7497, relancer handshake" | Out-File -FilePath $ResultsFile -Append
} elseif ($BackendLogsFound -eq $false -and $IbkrConnection -eq "OK") {
    Write-Host "🚨 CAUSE PROBABLE : Backend n'écrit pas en DB" -ForegroundColor Red "🚨 CAUSE PROBABLE : Backend n'écrit pas en DB"| Out-File -FilePath $ResultsFile -Append Write-Host"🔧 CORRECTIF RECOMMANDÉ : Vérifier route /api/ibkr/execute → insert DB (orders), vérifier logs backend"-ForegroundColor Yellow "🔧 CORRECTIF RECOMMANDÉ : Vérifier route /api/ibkr/execute → insert DB (orders), vérifier logs backend" | Out-File -FilePath $ResultsFile -Append
} elseif ($FrontendTradesCount -eq 0 -and $IbkrConnection -eq "OK") {
    Write-Host "🚨 CAUSE PROBABLE : API frontend incorrecte ou DB vide"-ForegroundColor Red "🚨 CAUSE PROBABLE : API frontend incorrecte ou DB vide"| Out-File -FilePath $ResultsFile -Append Write-Host"🔧 CORRECTIF RECOMMANDÉ : Corriger /api/metrics/trades/count pour lire trading.fills ou v_orders_current_status"-ForegroundColor Yellow "🔧 CORRECTIF RECOMMANDÉ : Corriger /api/metrics/trades/count pour lire trading.fills ou v_orders_current_status" | Out-File -FilePath $ResultsFile -Append
} else {
    Write-Host "✅ Tests automatiques OK - Vérifiez manuellement les compteurs Supabase" -ForegroundColor Green
    "✅ Tests automatiques OK - Vérifiez manuellement les compteurs Supabase" | Out-File -FilePath $ResultsFile -Append
}

"" | Out-File -FilePath $ResultsFile -Append

# JSON Final (format simplifié pour copie manuelle)
$JsonResult = @"
📋 JSON RÉSUMÉ (à compléter avec données Supabase) :
{
  "ibkr_connection": "$IbkrConnection",
  "fills_detected": $FillsDetected,
  "orders_in_db": $OrdersInDb,
  "fills_in_db": $FillsInDb,
  "frontend_trades_count": $FrontendTradesCount,
  "backend_logs_found": $BackendLogsFound
}
"@

Write-Host $JsonResult -ForegroundColor Cyan
$JsonResult | Out-File -FilePath $ResultsFile -Append

"" | Out-File -FilePath $ResultsFile -Append Write-Host"✅ Diagnostic terminé. Rapport complet dans : $ResultsFile"-ForegroundColor Green Write-Host"📌 ÉTAPE SUIVANTE : Exécuter les requêtes SQL manuellement et mettre à jour orders_in_db/fills_in_db" -ForegroundColor Yellow