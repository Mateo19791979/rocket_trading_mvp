/**
 * 🚀 Diagnostic Express RLS en <10 minutes
 * Script automatique pour identifier l'erreur "unexpected token '<', <!doctype..."
 * 
 * Usage: node testRlsHealth.js
 * Auteur: Parfait Matthieu - Solution directe pour Trading MVP
 */

import fetch from "node-fetch";

// Configuration automatique des URLs
const config = {
  // URL API backend - adapter selon votre configuration
  API_URL: process.env?.API_URL || process.env?.VITE_MVP_API_BASE || "https://api.trading-mvp.com",
  
  // URL frontend Rocketnew - adapter selon votre domaine
  FRONTEND_URL: process.env?.FRONTEND_URL || process.env?.VITE_FRONTEND_URL || "https://trading-mvp.com",
  
  // Timeout pour les tests de connectivité
  TIMEOUT_MS: 10000
};

console.log(`
🎯 DIAGNOSTIC EXPRESS RLS - Trading MVP
======================================
⏱️  Objectif: identifier en 3 minutes où ça casse
🔍 Recherche: "Échec de la vérification RLS — unexpected token '<', <!doctype..."

Configuration détectée:
✅ API Backend: ${config?.API_URL}
✅ Frontend: ${config?.FRONTEND_URL}
✅ Timeout: ${config?.TIMEOUT_MS}ms

Starting diagnostic in 3 seconds...
`);

// Pause de 3 secondes pour la lisibilité
await new Promise(resolve => setTimeout(resolve, 3000));

/**
 * Test #1: Vérifier l'endpoint RLS Health directement
 */
async function testCase1_EndpointDirect() {
  console.log(`
🧪 TEST 1: Endpoint Direct
========================
👉 Test: ${config?.API_URL}/security/rls/health
`);

  try {
    const response = await fetch(`${config?.API_URL}/security/rls/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      signal: AbortSignal.timeout(config?.TIMEOUT_MS)
    });

    const contentType = response?.headers?.get("content-type");
    const responseText = await response?.text();
    
    console.log(`📊 Résultats Test 1:
• Status: ${response?.status} ${response?.statusText}
• Content-Type: ${contentType}
• Response size: ${responseText?.length} caractères`);

    // Analyse du contenu de la réponse
    if (responseText?.startsWith("<!DOCTYPE") || responseText?.startsWith("<!doctype")) {
      console.log(`
❌ PROBLÈME IDENTIFIÉ: HTML reçu au lieu de JSON
🎯 CAUSE: Cas #1 ou #2 - Redirection ou endpoint manquant
📄 HTML reçu: ${responseText?.substring(0, 200)}...

💡 SOLUTION IMMÉDIATE:
1️⃣ Si c'est du Rocketnew HTML → Problème de domaine/routing frontend
2️⃣ Si c'est une page d'erreur serveur → Backend endpoint manquant`);
      
      return { success: false, type: "html_response", details: responseText?.substring(0, 500) };
    }

    // Tentative de parsing JSON
    try {
      const json = JSON.parse(responseText);
      console.log(`
✅ SUCCÈS: Réponse JSON valide reçue
📊 Contenu: ${JSON.stringify(json, null, 2)?.substring(0, 300)}...

🎯 DIAGNOSTIC: Le backend et l'API fonctionnent correctement ➡️ Le problème est probablement côté frontend ou dans l'appel`);
      
      return { success: true, type: "json_valid", data: json };
    } catch (jsonError) {
      console.log(`
❌ PROBLÈME: Réponse non-JSON reçue
📄 Contenu: ${responseText?.substring(0, 300)}...
🎯 CAUSE: Backend répond mais format incorrect

💡 SOLUTION: Vérifier l'implémentation du endpoint backend`);
      
      return { success: false, type: "invalid_json", details: responseText?.substring(0, 500) };
    }

  } catch (error) {
    console.log(`
❌ ERREUR DE CONNEXION: ${error?.message}

🎯 DIAGNOSTIC:
• Network Error / Failed to fetch → Backend non accessible
• Timeout → Backend trop lent ou down
• CORS → Configuration CORS incorrecte`);
    
    return { success: false, type: "network_error", error: error?.message };
  }
}

/**
 * Test #2: Vérifier la connectivité backend générale
 */
async function testCase2_BackendConnectivity() {
  console.log(`
🧪 TEST 2: Connectivité Backend
==============================`);

  const endpoints = [
    `${config?.API_URL}/status`,
    `${config?.API_URL}/health`, 
    `${config?.API_URL}/`,
    `${config?.API_URL}/api/health`
  ];

  let workingEndpoint = null;
  
  for (const endpoint of endpoints) {
    console.log(`🔍 Test: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, { 
        method: "GET",
        signal: AbortSignal.timeout(5000)
      });
      
      console.log(`  ✅ ${response?.status} ${response?.statusText}`);
      
      if (response?.ok) {
        workingEndpoint = endpoint;
        
        // Essayer de lire la réponse
        try {
          const text = await response?.text();
          if (text?.startsWith("{")) {
            const json = JSON.parse(text);
            console.log(`  📊 Service: ${json?.service || "Unknown"}`);
            console.log(`  📊 Version: ${json?.version || "Unknown"}`);
          }
        } catch (e) {
          // Ignore parsing errors for connectivity test
        }
        
        break;
      }
    } catch (error) {
      console.log(`  ❌ ${error?.message}`);
    }
  }

  if (workingEndpoint) {
    console.log(`
✅ BACKEND ACCESSIBLE: ${workingEndpoint}
🎯 DIAGNOSTIC: Le serveur backend répond correctement
➡️ Problème spécifique au endpoint /security/rls/health`);
    return { success: true, workingEndpoint };
  } else {
    console.log(`
❌ BACKEND INACCESSIBLE: Aucun endpoint ne répond
🎯 DIAGNOSTIC: Serveur backend down ou mal configuré

💡 SOLUTIONS URGENTES:
1️⃣ cd backend && npm start
2️⃣ Vérifier le port: ${config?.API_URL}
3️⃣ Vérifier les variables d'environnement backend`);
    return { success: false, type: "backend_down" };
  }
}

/**
 * Test #3: Vérifier si l'appel vient du frontend Rocketnew
 */
async function testCase3_FrontendRouting() {
  console.log(`
🧪 TEST 3: Frontend Routing
==========================
🔍 Test si le frontend intercepte les calls API
`);

  try {
    // Simuler un appel comme le ferait le frontend
    const frontendResponse = await fetch(`${config?.FRONTEND_URL}/security/rls/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000)
    });

    const responseText = await frontendResponse?.text();
    
    if (responseText?.includes("<!DOCTYPE") || responseText?.includes("Rocketnew") || responseText?.includes("trading-mvp")) {
      console.log(`
❌ PROBLÈME IDENTIFIÉ: Frontend intercepte l'API call
🎯 CAUSE: Cas #1 - Le front appelle le mauvais domaine

📄 Réponse frontend: ${responseText?.substring(0, 200)}...

💡 SOLUTION EXPRESS:
Modifier le code frontend de:
  fetch("/security/rls/health")
à:
  fetch("${config?.API_URL}/security/rls/health")

🔧 Fix immédiat dans .env frontend:
VITE_API_BASE_URL=${config?.API_URL}`);
      
      return { success: false, type: "frontend_intercept", solution: "update_api_base_url" };
    } else {
      console.log(`✅ Frontend routing OK - ne cause pas le problème`);
      return { success: true };
    }
  } catch (error) {
    console.log(`ℹ️  Frontend routing test non concluant: ${error?.message}`);
    return { success: true }; // Not necessarily a problem
  }
}

/**
 * Test #4: Vérifier les fonctions Supabase manquantes
 */
async function testCase4_SupabaseFunctions() {
  console.log(`
🧪 TEST 4: Fonctions Supabase
============================
🔍 Vérifier si les fonctions rls_health() existent
`);

  // Tester via l'endpoint backend qui devrait appeler rls_health()
  try {
    const response = await fetch(`${config?.API_URL}/security/rls/health`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(config?.TIMEOUT_MS)
    });

    const responseText = await response?.text();
    
    // Rechercher des signes d'erreur de fonction manquante
    if (responseText?.includes("function") && responseText?.includes("does not exist")) {
      console.log(`
❌ PROBLÈME IDENTIFIÉ: Fonction Supabase manquante
🎯 CAUSE: Cas #3 - Fonction rls_health() non créée dans Supabase

📄 Erreur: ${responseText}

💡 SOLUTION EXPRESS:
1️⃣ Aller dans Supabase SQL Editor
2️⃣ Exécuter les fonctions RLS Health complètes
3️⃣ Créer appsec.rls_health() et appsec.rls_autorepair()`);
      
      return { success: false, type: "missing_supabase_functions" };
    }
    
    return { success: true };
  } catch (error) {
    console.log(`ℹ️  Test fonctions Supabase non concluant: ${error?.message}`);
    return { success: true };
  }
}

/**
 * Analyse complète et recommandations
 */
async function runCompleteAnalysis() {
  console.log(`
🚀 DÉMARRAGE ANALYSE COMPLÈTE
============================
`);

  const results = {
    test1: await testCase1_EndpointDirect(),
    test2: await testCase2_BackendConnectivity(), 
    test3: await testCase3_FrontendRouting(),
    test4: await testCase4_SupabaseFunctions()
  };

  console.log(`
📊 RÉSULTATS FINAUX
==================`);

  // Déterminer la cause racine et la solution
  let diagnosis = "Problème non identifié";
  let solution = "Analyse manuelle requise";
  let priority = "MEDIUM";

  if (results?.test1?.type === "html_response") {
    if (results?.test2?.success) {
      diagnosis = "🎯 CAS #2: Route backend manquante";
      solution = `Ajouter les routes dans backend/server.js:
app.get("/security/rls/health", rlsHealth);
app.post("/security/rls/repair", rlsAutorepair);`;
      priority = "HIGH";
    } else {
      diagnosis = "🎯 CAS #1: Backend down ou domaine incorrect"; 
      solution = `1. Démarrer backend: cd backend && npm start
2. Corriger VITE_API_BASE_URL=${config?.API_URL}`;
      priority = "CRITICAL";
    }
  } else if (results?.test1?.type === "network_error") {
    diagnosis = "🎯 CAS #1: Connectivité backend impossible";
    solution = `1. Vérifier que le backend tourne sur ${config?.API_URL}
2. Vérifier les variables d'environnement
3. Tester: curl ${config?.API_URL}/status`;
    priority = "CRITICAL";
  } else if (results?.test4?.type === "missing_supabase_functions") {
    diagnosis = "🎯 CAS #3: Fonctions Supabase RLS manquantes";
    solution = `1. Aller dans Supabase SQL Editor
2. Exécuter les migrations RLS Health
3. Créer appsec.rls_health() et appsec.rls_autorepair()`;
    priority = "HIGH";
  } else if (results?.test1?.success) {
    diagnosis = "✅ SYSTÈME FONCTIONNEL: Aucun problème détecté";
    solution = "Le système fonctionne correctement. L'erreur peut être intermittente.";
    priority = "LOW";
  }

  console.log(`
🎯 DIAGNOSTIC FINAL
==================
Cause identifiée: ${diagnosis}
Priorité: ${priority}

💡 SOLUTION RECOMMANDÉE:
${solution}

⏱️  TEMPS TOTAL: ${priority === "CRITICAL" ? "< 5 minutes" : "< 10 minutes"}

📋 ACTIONS IMMÉDIATES:
1. ${priority === "CRITICAL" ? "🔴 URGENT" : priority === "HIGH" ? "🟡 PRIORITÉ" : "🟢 NORMAL"}
2. Appliquer la solution ci-dessus
3. Retester avec: node testRlsHealth.js
4. Si problème persiste, vérifier les logs backend

📧 RAPPORT DÉTAILLÉ:
${JSON.stringify(results, null, 2)}
`);

  return { diagnosis, solution, priority, results };
}

// Exécution du diagnostic
try {
  const analysis = await runCompleteAnalysis();
  
  console.log(`
✅ DIAGNOSTIC TERMINÉ
====================
Temps d'exécution: ${new Date()?.toLocaleString()}
Status: ${analysis?.priority}

👉 Prochaines étapes:
1. Appliquer la solution recommandée
2. Redémarrer les services si nécessaire  
3. Retester l'endpoint RLS Health
4. Contacter le support si problème persiste
`);

  process.exit(analysis?.priority === "CRITICAL" ? 1 : 0);
} catch (error) {
  console.error(`
❌ ERREUR DURANT LE DIAGNOSTIC
=============================
${error?.message}

🔧 Solutions de récupération:
1. Vérifier la connectivité réseau
2. Vérifier les variables d'environnement 
3. Relancer: node testRlsHealth.js
4. Vérifier manuellement: curl ${config?.API_URL}/status
`);
  process.exit(1);
}