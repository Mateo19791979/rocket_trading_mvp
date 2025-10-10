import { useState } from "react";
import { AlertTriangle, CheckCircle, Play, Copy, Terminal, RefreshCw, ExternalLink, Code2, Server, Database } from "lucide-react";

export default function RlsDiagnosticExpress() {
  const [diagnosticState, setDiagnosticState] = useState({
    isRunning: false,
    currentTest: null,
    results: {},
    finalDiagnosis: null,
    logs: []
  });

  const [copySuccess, setCopySuccess] = useState(null);

  // Get API configuration
  const getApiConfig = () => {
    const apiBase = import.meta.env?.VITE_MVP_API_BASE || 
                   import.meta.env?.VITE_API_BASE_URL || 
                   "https://api.trading-mvp.com";
    
    const frontendBase = window.location?.origin || "https://trading-mvp.com";
    
    return { apiBase, frontendBase };
  };

  // Add log entry
  const addLog = (message, type = 'info') => {
    setDiagnosticState(prev => ({
      ...prev,
      logs: [...prev?.logs, {
        id: Date.now() + Math.random(),
        timestamp: new Date()?.toLocaleTimeString(),
        message,
        type
      }]
    }));
  };

  // Test Case 1: Direct endpoint test
  const runTest1DirectEndpoint = async () => {
    const { apiBase } = getApiConfig();
    const testUrl = `${apiBase}/security/rls/health`;
    
    addLog(`🧪 TEST 1: Endpoint Direct - ${testUrl}`, 'info');
    
    try {
      const response = await fetch(testUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        signal: AbortSignal.timeout(10000)
      });

      const contentType = response?.headers?.get("content-type");
      const responseText = await response?.text();
      
      addLog(`📊 Status: ${response?.status} ${response?.statusText}`, 'info');
      addLog(`📊 Content-Type: ${contentType}`, 'info');
      
      if (responseText?.startsWith("<!DOCTYPE") || responseText?.startsWith("<!doctype")) {
        addLog("❌ PROBLÈME: HTML reçu au lieu de JSON", 'error');
        addLog("🎯 CAUSE: Cas #1 ou #2 - Redirection ou endpoint manquant", 'error');
        
        return {
          success: false,
          type: "html_response",
          details: responseText?.substring(0, 500),
          httpStatus: response?.status
        };
      }

      try {
        const json = JSON.parse(responseText);
        addLog("✅ SUCCÈS: Réponse JSON valide reçue", 'success');
        
        return {
          success: true,
          type: "json_valid",
          data: json,
          httpStatus: response?.status
        };
      } catch (jsonError) {
        addLog("❌ PROBLÈME: Réponse non-JSON reçue", 'error');
        
        return {
          success: false,
          type: "invalid_json",
          details: responseText?.substring(0, 500),
          httpStatus: response?.status
        };
      }

    } catch (error) {
      addLog(`❌ ERREUR DE CONNEXION: ${error?.message}`, 'error');
      
      return {
        success: false,
        type: "network_error",
        error: error?.message
      };
    }
  };

  // Test Case 2: Backend connectivity
  const runTest2BackendConnectivity = async () => {
    const { apiBase } = getApiConfig();
    const endpoints = [
      `${apiBase}/status`,
      `${apiBase}/health`,
      `${apiBase}/`,
      `${apiBase}/api/health`
    ];

    addLog("🧪 TEST 2: Connectivité Backend", 'info');

    for (const endpoint of endpoints) {
      addLog(`🔍 Test: ${endpoint}`, 'info');
      
      try {
        const response = await fetch(endpoint, { 
          method: "GET",
          signal: AbortSignal.timeout(5000)
        });
        
        addLog(`  ✅ ${response?.status} ${response?.statusText}`, 'success');
        
        if (response?.ok) {
          try {
            const text = await response?.text();
            if (text?.startsWith("{")) {
              const json = JSON.parse(text);
              addLog(`  📊 Service: ${json?.service || "Unknown"}`, 'info');
            }
          } catch (e) {
            // Ignore parsing errors for connectivity test
          }
          
          return { success: true, workingEndpoint: endpoint };
        }
      } catch (error) {
        addLog(`  ❌ ${error?.message}`, 'error');
      }
    }

    addLog("❌ BACKEND INACCESSIBLE: Aucun endpoint ne répond", 'error');
    return { success: false, type: "backend_down" };
  };

  // Test Case 3: Frontend routing check
  const runTest3FrontendRouting = async () => {
    const { frontendBase } = getApiConfig();
    
    addLog("🧪 TEST 3: Frontend Routing", 'info');
    
    try {
      const response = await fetch(`${frontendBase}/security/rls/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000)
      });

      const responseText = await response?.text();
      
      if (responseText?.includes("<!DOCTYPE") || responseText?.includes("Rocketnew")) {
        addLog("❌ PROBLÈME: Frontend intercepte l'API call", 'error');
        return { success: false, type: "frontend_intercept" };
      } else {
        addLog("✅ Frontend routing OK", 'success');
        return { success: true };
      }
    } catch (error) {
      addLog(`ℹ️ Frontend routing test non concluant: ${error?.message}`, 'info');
      return { success: true };
    }
  };

  // Run complete analysis
  const runCompleteAnalysis = async () => {
    setDiagnosticState(prev => ({
      ...prev,
      isRunning: true,
      logs: [],
      results: {},
      finalDiagnosis: null
    }));

    addLog("🚀 DÉMARRAGE ANALYSE COMPLÈTE", 'info');
    addLog("============================", 'info');

    const results = {};

    // Test 1
    setDiagnosticState(prev => ({ ...prev, currentTest: "Test 1: Endpoint Direct" }));
    results.test1 = await runTest1DirectEndpoint();

    // Test 2
    setDiagnosticState(prev => ({ ...prev, currentTest: "Test 2: Backend Connectivity" }));
    results.test2 = await runTest2BackendConnectivity();

    // Test 3
    setDiagnosticState(prev => ({ ...prev, currentTest: "Test 3: Frontend Routing" }));
    results.test3 = await runTest3FrontendRouting();

    // Analyze results and determine diagnosis
    let diagnosis = "Problème non identifié";
    let solution = "Analyse manuelle requise";
    let priority = "MEDIUM";
    let solutionSteps = [];

    if (results?.test1?.type === "html_response") {
      if (results?.test2?.success) {
        diagnosis = "🎯 CAS #2: Route backend manquante";
        priority = "HIGH";
        solutionSteps = [
          "Ajouter les routes dans backend/server.js:",
          "app.get('/security/rls/health', rlsHealth);",
          "app.post('/security/rls/repair', rlsAutorepair);",
          "Redémarrer le backend"
        ];
      } else {
        diagnosis = "🎯 CAS #1: Backend down ou domaine incorrect";
        priority = "CRITICAL";
        solutionSteps = [
          "1. Démarrer backend: cd backend && npm start",
          `2. Corriger VITE_API_BASE_URL=${getApiConfig()?.apiBase}`,
          "3. Vérifier les variables d'environnement"
        ];
      }
    } else if (results?.test1?.type === "network_error") {
      diagnosis = "🎯 CAS #1: Connectivité backend impossible";
      priority = "CRITICAL";
      solutionSteps = [
        `Vérifier que le backend tourne sur ${getApiConfig()?.apiBase}`,
        "Vérifier les variables d'environnement",
        `Tester: curl ${getApiConfig()?.apiBase}/status`
      ];
    } else if (results?.test1?.success) {
      diagnosis = "✅ SYSTÈME FONCTIONNEL: Aucun problème détecté";
      priority = "LOW";
      solutionSteps = ["Le système fonctionne correctement"];
    } else {
      diagnosis = "🎯 CAS #3: Probablement fonctions Supabase manquantes";
      priority = "HIGH";
      solutionSteps = [
        "1. Aller dans Supabase SQL Editor",
        "2. Exécuter la migration RLS Health complète",
        "3. Créer appsec.rls_health() et appsec.rls_autorepair()",
        "4. Redémarrer le backend"
      ];
    }

    const finalDiagnosis = {
      diagnosis,
      priority,
      solutionSteps,
      results,
      timestamp: new Date()?.toISOString()
    };

    addLog("📊 RÉSULTATS FINAUX", 'info');
    addLog("==================", 'info');
    addLog(diagnosis, priority === "CRITICAL" ? 'error' : priority === "HIGH" ? 'warning' : 'success');

    setDiagnosticState(prev => ({
      ...prev,
      isRunning: false,
      currentTest: null,
      results,
      finalDiagnosis
    }));
  };

  // Copy diagnostic script
  const copyDiagnosticScript = async () => {
    const { apiBase } = getApiConfig();
    
    const script = `// Diagnostic script for RLS Health Check
const API_URL = "${apiBase}";

(async () => {
  try {
    const response = await fetch(\`\${API_URL}/security/rls/health\`);
    const text = await response.text();
    
    if (text.startsWith("<!DOCTYPE") || text.startsWith("<!doctype")) {
      console.error("❌ HTML reçu au lieu de JSON - Problème de routing ou backend");
      console.log("Response:", text.substring(0, 200));
    } else {
      const json = JSON.parse(text);
      console.log("✅ Réponse JSON OK:", json);
    }
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  }
})();`;

    try {
      await navigator.clipboard?.writeText(script);
      setCopySuccess('script');
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy script:', err);
    }
  };

  // Copy environment variables
  const copyEnvFix = async () => {
    const { apiBase } = getApiConfig();
    
    const envFix = `# Fix pour l'erreur "unexpected token doctype"
# Ajouter dans .env (frontend)
VITE_API_BASE_URL=${apiBase}
VITE_MVP_API_BASE=${apiBase}

# Ajouter dans backend/.env (si manquant)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
INTERNAL_ADMIN_KEY=your_admin_key_for_repairs
PORT=8082
NODE_ENV=production`;

    try {
      await navigator.clipboard?.writeText(envFix);
      setCopySuccess('env');
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy env fix:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Terminal className="w-10 h-10 text-red-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Diagnostic Express RLS
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">
            Solution &lt;10 minutes pour: <code className="bg-red-100 text-red-800 px-2 py-1 rounded">unexpected token '&lt;', &lt;!doctype...</code>
          </p>
          <p className="text-lg text-gray-500">
            Par Parfait Matthieu - 3 causes possibles, diagnostic automatique
          </p>
        </div>

        {/* Configuration Display */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5" />
            Configuration Détectée
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>API Backend:</strong> 
              <code className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded">{getApiConfig()?.apiBase}</code>
            </div>
            <div>
              <strong>Frontend:</strong> 
              <code className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded">{getApiConfig()?.frontendBase}</code>
            </div>
          </div>
        </div>

        {/* Possible Causes */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border-l-4 border-red-500 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-100 p-2 rounded-full">
                <ExternalLink className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-red-800">CAS #1</h3>
            </div>
            <h4 className="font-medium mb-2">Frontend appelle mauvais domaine</h4>
            <p className="text-sm text-gray-600 mb-3">
              Le front Rocketnew intercepte <code>/security/rls/health</code> et renvoie <code>index.html</code>
            </p>
            <div className="text-xs bg-red-50 p-3 rounded">
              <strong>Solution:</strong> Corriger l'URL fetch vers ton API
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-l-4 border-yellow-500 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <Server className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-yellow-800">CAS #2</h3>
            </div>
            <h4 className="font-medium mb-2">Route backend manquante</h4>
            <p className="text-sm text-gray-600 mb-3">
              L'API n'a pas la route <code>/security/rls/health</code> → 404 → page HTML Traefik/Nginx
            </p>
            <div className="text-xs bg-yellow-50 p-3 rounded">
              <strong>Solution:</strong> Ajouter la route backend
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-l-4 border-blue-500 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-800">CAS #3</h3>
            </div>
            <h4 className="font-medium mb-2">Fonctions Supabase manquantes</h4>
            <p className="text-sm text-gray-600 mb-3">
              Supabase RPC échoue (fonction <code>rls_health()</code> manquante ou clé invalide)
            </p>
            <div className="text-xs bg-blue-50 p-3 rounded">
              <strong>Solution:</strong> Corriger clé / fonction SQL
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={runCompleteAnalysis}
            disabled={diagnosticState?.isRunning}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {diagnosticState?.isRunning ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            {diagnosticState?.isRunning ? "Diagnostic en cours..." : "Lancer Diagnostic Express"}
          </button>

          <button
            onClick={copyDiagnosticScript}
            className="flex items-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Code2 className="w-5 h-5" />
            {copySuccess === 'script' ? 'Copié!' : 'Script Node.js'}
          </button>

          <button
            onClick={copyEnvFix}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Copy className="w-5 h-5" />
            {copySuccess === 'env' ? 'Copié!' : 'Fix .env'}
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Diagnostic Logs */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Terminal className="w-6 h-6" />
              Logs de Diagnostic
              {diagnosticState?.currentTest && (
                <span className="ml-auto text-sm text-blue-600 flex items-center gap-1">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {diagnosticState?.currentTest}
                </span>
              )}
            </h2>

            <div className="bg-black rounded-lg p-4 h-96 overflow-y-auto text-sm font-mono">
              {diagnosticState?.logs?.length === 0 ? (
                <div className="text-gray-500">Prêt à lancer le diagnostic...</div>
              ) : (
                diagnosticState?.logs?.map((log) => (
                  <div 
                    key={log?.id} 
                    className={`mb-1 ${
                      log?.type === 'error' ? 'text-red-400' : 
                      log?.type === 'success' ? 'text-green-400' :
                      log?.type === 'warning'? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    <span className="text-gray-500">[{log?.timestamp}]</span> {log?.message}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Résultats & Solutions
            </h2>

            {!diagnosticState?.finalDiagnosis ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Lancer le diagnostic pour voir les résultats...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Diagnosis */}
                <div className={`p-4 rounded-lg border-l-4 ${
                  diagnosticState?.finalDiagnosis?.priority === 'CRITICAL' ? 'bg-red-50 border-red-500' :
                  diagnosticState?.finalDiagnosis?.priority === 'HIGH'? 'bg-yellow-50 border-yellow-500' : 'bg-green-50 border-green-500'
                }`}>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    {diagnosticState?.finalDiagnosis?.priority === 'CRITICAL' ? '🔴 CRITIQUE' :
                     diagnosticState?.finalDiagnosis?.priority === 'HIGH' ? '🟡 PRIORITÉ' : '🟢 NORMAL'}
                    Diagnostic Final
                  </h3>
                  <p className="text-sm">{diagnosticState?.finalDiagnosis?.diagnosis}</p>
                </div>

                {/* Solution Steps */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">💡 Solution Recommandée:</h3>
                  <ul className="space-y-2">
                    {diagnosticState?.finalDiagnosis?.solutionSteps?.map((step, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-blue-600 font-mono">→</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Test Results Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">📊 Résumé des Tests:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {diagnosticState?.results?.test1?.success ? 
                        <CheckCircle className="w-4 h-4 text-green-500" /> : 
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      }
                      <span>Test 1 - Endpoint Direct: {diagnosticState?.results?.test1?.type || 'Non testé'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {diagnosticState?.results?.test2?.success ? 
                        <CheckCircle className="w-4 h-4 text-green-500" /> : 
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      }
                      <span>Test 2 - Backend: {diagnosticState?.results?.test2?.success ? 'Accessible' : 'Inaccessible'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {diagnosticState?.results?.test3?.success ? 
                        <CheckCircle className="w-4 h-4 text-green-500" /> : 
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      }
                      <span>Test 3 - Frontend: {diagnosticState?.results?.test3?.type === 'frontend_intercept' ? 'Intercepte les calls' : 'OK'}</span>
                    </div>
                  </div>
                </div>

                {/* Time Estimate */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">⏱️ Temps de Résolution Estimé:</h3>
                  <p className="text-sm">
                    {diagnosticState?.finalDiagnosis?.priority === 'CRITICAL' ? '< 5 minutes' :
                     diagnosticState?.finalDiagnosis?.priority === 'HIGH' ? '< 10 minutes' : '< 2 minutes'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">⚡ Actions Rapides</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <a
              href={`${getApiConfig()?.apiBase}/security/rls/health`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
            >
              <ExternalLink className="w-4 h-4" />
              Test API Direct
            </a>
            <a
              href={`${getApiConfig()?.apiBase}/status`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
            >
              <Server className="w-4 h-4" />
              Status Backend
            </a>
            <a
              href="https://app.supabase.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200"
            >
              <Database className="w-4 h-4" />
              Supabase Console
            </a>
            <button
              onClick={() => window.location?.reload()}
              className="flex items-center gap-2 p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}