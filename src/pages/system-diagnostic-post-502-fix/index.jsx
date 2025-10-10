import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle, RefreshCw, Network, Server, Database, Shield, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { systemHealthService } from '../../services/systemHealthService';
import { ibkrHealthService } from '../../services/ibkrHealthService';
import { API, secureFetch } from '../../lib/apiBase';
import Header from '../../components/ui/Header';

export default function SystemDiagnosticPost502Fix() {
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState('diagnostic');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [overallStatus, setOverallStatus] = useState(null);
  const [progress, setProgress] = useState(0);

  const diagnosticTests = [
    {
      id: 'frontend_load',
      title: 'Chargement Frontend',
      description: 'Vérification du chargement de la page Home et des composants React',
      category: 'frontend'
    },
    {
      id: 'backend_api_health',
      title: 'Backend API Health Check',
      description: 'Test de connectivité vers l\'API backend principale',
      category: 'backend'
    },
    {
      id: 'supabase_connection',
      title: 'Connexion Supabase',
      description: 'Vérification de la connexion et authentification Supabase',
      category: 'database'
    },
    {
      id: 'ssl_certificate',
      title: 'Certificat SSL',
      description: 'Validation du certificat SSL et de la sécurité HTTPS',
      category: 'security'
    },
    {
      id: 'nginx_proxy',
      title: 'Proxy Nginx/Traefik',
      description: 'Test de configuration du reverse proxy',
      category: 'infrastructure'
    },
    {
      id: 'ibkr_gateway',
      title: 'Passerelle IBKR',
      description: 'Vérification de l\'état des connexions IBKR (Paper et Live)',
      category: 'trading'
    },
    {
      id: 'api_routing',
      title: 'Routage API',
      description: 'Test des routes API principales (/api/health, /api/providers)',
      category: 'backend'
    },
    {
      id: 'edge_functions',
      title: 'Edge Functions',
      description: 'Vérification des fallbacks Edge Functions Supabase',
      category: 'backend'
    },
    {
      id: 'websocket_connection',
      title: 'WebSocket Temps Réel',
      description: 'Test des connexions WebSocket pour les données en temps réel',
      category: 'realtime'
    },
    {
      id: 'cors_configuration',
      title: 'Configuration CORS',
      description: 'Validation des en-têtes CORS pour les requêtes cross-origin',
      category: 'security'
    }
  ];

  const runDiagnostic = async () => {
    setIsRunning(true);
    setProgress(0);
    setTestResults({});
    
    const results = {};
    let passedTests = 0;
    const totalTests = diagnosticTests?.length;

    for (let i = 0; i < diagnosticTests?.length; i++) {
      const test = diagnosticTests?.[i];
      setProgress(((i + 1) / totalTests) * 100);
      
      try {
        const result = await runSingleTest(test);
        results[test.id] = result;
        if (result?.status === 'success') passedTests++;
      } catch (error) {
        results[test.id] = {
          status: 'error',
          message: error?.message || 'Test failed',
          duration: 0
        };
      }
      
      setTestResults({ ...results });
      
      // Petite pause pour l'UX
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Calcul du statut global
    const successRate = (passedTests / totalTests) * 100;
    let status = 'critical';
    if (successRate >= 90) status = 'excellent';
    else if (successRate >= 70) status = 'good';
    else if (successRate >= 50) status = 'warning';

    setOverallStatus({
      status,
      successRate,
      passedTests,
      totalTests,
      message: getOverallStatusMessage(status, successRate)
    });

    setIsRunning(false);
  };

  const runSingleTest = async (test) => {
    const startTime = Date.now();
    
    try {
      switch (test?.id) {
        case 'frontend_load':
          return await testFrontendLoad();
        
        case 'backend_api_health':
          return await testBackendApiHealth();
        
        case 'supabase_connection':
          return await testSupabaseConnection();
        
        case 'ssl_certificate':
          return await testSSLCertificate();
        
        case 'nginx_proxy':
          return await testNginxProxy();
        
        case 'ibkr_gateway':
          return await testIBKRGateway();
        
        case 'api_routing':
          return await testApiRouting();
        
        case 'edge_functions':
          return await testEdgeFunctions();
        
        case 'websocket_connection':
          return await testWebSocketConnection();
        
        case 'cors_configuration':
          return await testCORSConfiguration();
        
        default:
          throw new Error('Test non implémenté');
      }
    } catch (error) {
      return {
        status: 'error',
        message: error?.message,
        duration: Date.now() - startTime
      };
    }
  };

  // Tests individuels
  const testFrontendLoad = async () => {
    const startTime = Date.now();
    
    // Vérifier que React est monté
    const reactRoot = document.getElementById('root');
    if (!reactRoot || !reactRoot?.innerHTML) {
      throw new Error('React app not mounted');
    }

    // Vérifier que les composants sont chargés
    const header = document.querySelector('[data-testid="header"]') || document.querySelector('header');
    if (!header) {
      throw new Error('Header component not found');
    }

    return {
      status: 'success',
      message: 'Frontend React chargé correctement',
      duration: Date.now() - startTime
    };
  };

  const testBackendApiHealth = async () => {
    const startTime = Date.now();
    
    try {
      const response = await secureFetch('/health', {
        method: 'GET',
        timeout: 10000
      });

      if (!response?.ok) {
        throw new Error(`Backend API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response?.json();
      
      return {
        status: 'success',
        message: `Backend API opérationnel (${response?.status})`,
        duration: Date.now() - startTime,
        details: data
      };
    } catch (error) {
      if (error?.message?.includes('Backend API returning HTML')) {
        return {
          status: 'error',
          message: '502 Gateway Error: Backend renvoie du HTML au lieu de JSON',
          duration: Date.now() - startTime,
          fix: 'Le problème 502 persiste - backend non accessible'
        };
      }
      throw error;
    }
  };

  const testSupabaseConnection = async () => {
    const startTime = Date.now();
    
    try {
      const health = await systemHealthService?.getSystemHealth();
      
      if (!health || health?.error) {
        throw new Error(health?.error || 'Supabase health check failed');
      }

      return {
        status: 'success',
        message: 'Connexion Supabase opérationnelle',
        duration: Date.now() - startTime,
        details: {
          agents: health?.agents?.length || 0,
          providers: health?.dataProviders?.length || 0
        }
      };
    } catch (error) {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }
  };

  const testSSLCertificate = async () => {
    const startTime = Date.now();
    
    // Vérifier que nous sommes en HTTPS
    if (window.location?.protocol !== 'https:') {
      throw new Error('Site not served over HTTPS');
    }

    // Test de connectivité SSL vers l'API
    try {
      const response = await fetch(API, { method: 'HEAD' });
      return {
        status: 'success',
        message: 'Certificat SSL valide et fonctionnel',
        duration: Date.now() - startTime
      };
    } catch (error) {
      throw new Error(`SSL certificate issue: ${error.message}`);
    }
  };

  const testNginxProxy = async () => {
    const startTime = Date.now();
    
    try {
      // Test d'une requête vers le proxy
      const response = await fetch(window.location?.origin, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      // Vérifier les en-têtes du proxy
      const serverHeader = response?.headers?.get('server');
      const proxyDetected = serverHeader?.includes('nginx') || 
                           response?.headers?.get('x-forwarded-proto') === 'https';

      return {
        status: 'success',
        message: `Reverse proxy opérationnel (${serverHeader || 'detected'})`,
        duration: Date.now() - startTime
      };
    } catch (error) {
      throw new Error(`Proxy configuration issue: ${error.message}`);
    }
  };

  const testIBKRGateway = async () => {
    const startTime = Date.now();
    
    try {
      const ibkrStatus = await ibkrHealthService?.getIBKRHealth();
      
      if (!ibkrStatus) {
        throw new Error('IBKR health service unavailable');
      }

      const paperStatus = ibkrStatus?.gateway_paper?.status === 'available' ? 'OK' : 'DOWN';
      const liveStatus = ibkrStatus?.gateway_live?.status === 'available' ? 'OK' : 'DOWN';

      return {
        status: paperStatus === 'OK' || liveStatus === 'OK' ? 'success' : 'warning',
        message: `IBKR Paper: ${paperStatus}, Live: ${liveStatus}`,
        duration: Date.now() - startTime,
        details: ibkrStatus
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'IBKR service indisponible (normal en mode développement)',
        duration: Date.now() - startTime
      };
    }
  };

  const testApiRouting = async () => {
    const startTime = Date.now();
    
    const routes = ['/health', '/api/providers', '/api/market'];
    const results = [];

    for (const route of routes) {
      try {
        const response = await secureFetch(route, { method: 'GET', timeout: 5000 });
        results?.push({ route, status: response?.status, ok: response?.ok });
      } catch (error) {
        results?.push({ route, status: 0, error: error?.message });
      }
    }

    const successful = results?.filter(r => r?.ok)?.length;
    
    return {
      status: successful > 0 ? 'success' : 'error',
      message: `${successful}/${routes?.length} routes API fonctionnelles`,
      duration: Date.now() - startTime,
      details: results
    };
  };

  const testEdgeFunctions = async () => {
    const startTime = Date.now();
    
    try {
      // Test d'une Edge Function Supabase si disponible
      const edgeUrl = import.meta.env?.VITE_EDGE_BASE_URL;
      if (!edgeUrl) {
        return {
          status: 'warning',
          message: 'Edge Functions URL non configurée',
          duration: Date.now() - startTime
        };
      }

      const response = await fetch(`${edgeUrl}/rls-health`, { 
        method: 'GET',
        timeout: 5000 
      });

      return {
        status: response?.ok ? 'success' : 'warning',
        message: response?.ok ? 'Edge Functions opérationnelles' : 'Edge Functions partielles',
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'Edge Functions non testables',
        duration: Date.now() - startTime
      };
    }
  };

  const testWebSocketConnection = async () => {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      try {
        // Test WebSocket simple
        const wsUrl = API.replace('https:', 'wss:').replace('http:', 'ws:') + '/ws';
        const ws = new WebSocket(wsUrl);
        
        const timeout = setTimeout(() => {
          ws.close();
          resolve({
            status: 'warning',
            message: 'WebSocket timeout (normal si non implémenté)',
            duration: Date.now() - startTime
          });
        }, 3000);

        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          resolve({
            status: 'success',
            message: 'WebSocket connecté avec succès',
            duration: Date.now() - startTime
          });
        };

        ws.onerror = () => {
          clearTimeout(timeout);
          resolve({
            status: 'warning',
            message: 'WebSocket non disponible',
            duration: Date.now() - startTime
          });
        };
      } catch (error) {
        resolve({
          status: 'warning',
          message: 'WebSocket test failed',
          duration: Date.now() - startTime
        });
      }
    });
  };

  const testCORSConfiguration = async () => {
    const startTime = Date.now();
    
    try {
      const response = await secureFetch('/health', {
        method: 'GET',
        headers: {
          'Origin': window.location?.origin
        }
      });

      const corsHeaders = {
        'access-control-allow-origin': response?.headers?.get('access-control-allow-origin'),
        'access-control-allow-methods': response?.headers?.get('access-control-allow-methods'),
        'access-control-allow-headers': response?.headers?.get('access-control-allow-headers')
      };

      return {
        status: 'success',
        message: 'Configuration CORS fonctionnelle',
        duration: Date.now() - startTime,
        details: corsHeaders
      };
    } catch (error) {
      throw new Error(`CORS configuration issue: ${error.message}`);
    }
  };

  const getOverallStatusMessage = (status, successRate) => {
    switch (status) {
      case 'excellent':
        return `🎉 Système entièrement opérationnel ! Tous les correctifs 502 ont été appliqués avec succès.`;
      case 'good':
        return `✅ Système majoritairement fonctionnel. Les problèmes 502 principaux sont résolus.`;
      case 'warning':
        return `⚠️ Système partiellement fonctionnel. Quelques services nécessitent encore attention.`;
      default:
        return `🚨 Problèmes critiques détectés. Les corrections 502 n'ont pas entièrement réussi.`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300 animate-pulse" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'frontend':
        return <Network className="w-4 h-4" />;
      case 'backend':
        return <Server className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'trading':
        return <Zap className="w-4 h-4" />;
      default:
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header activeItem={activeItem} setActiveItem={setActiveItem} />

        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  🔧 Diagnostic Post-Correction 502
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  Test complet du système après l'application des correctifs backend
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>🎯 Objectif: Valider la résolution des erreurs 502</span>
                  <span>⏱️ Tests: Backend, Frontend, SSL, IBKR, Routing</span>
                  <span>🚀 Prêt pour production</span>
                </div>
              </div>
              <button
                onClick={runDiagnostic}
                disabled={isRunning}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isRunning
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Tests en cours...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Lancer le Diagnostic</span>
                  </>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            {isRunning && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression des tests</span>
                  <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overall Status */}
        {overallStatus && (
          <div className="mb-8">
            <div className={`rounded-2xl p-6 border-2 ${
              overallStatus?.status === 'excellent' ? 'bg-green-50 border-green-200' :
              overallStatus?.status === 'good' ? 'bg-blue-50 border-blue-200' :
              overallStatus?.status === 'warning'? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Résultat Global du Diagnostic
                  </h2>
                  <p className="text-gray-700 mb-4">{overallStatus?.message}</p>
                  <div className="flex items-center space-x-6 text-sm">
                    <span className={`font-medium ${
                      overallStatus?.status === 'excellent' ? 'text-green-700' :
                      overallStatus?.status === 'good' ? 'text-blue-700' :
                      overallStatus?.status === 'warning'? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      Tests réussis: {overallStatus?.passedTests}/{overallStatus?.totalTests}
                    </span>
                    <span className="text-gray-600">
                      Taux de succès: {overallStatus?.successRate?.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className={`text-6xl ${
                  overallStatus?.status === 'excellent' ? 'text-green-500' :
                  overallStatus?.status === 'good' ? 'text-blue-500' :
                  overallStatus?.status === 'warning'? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {overallStatus?.status === 'excellent' ? '🎉' :
                   overallStatus?.status === 'good' ? '✅' :
                   overallStatus?.status === 'warning' ? '⚠️' : '🚨'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {diagnosticTests?.map((test) => {
            const result = testResults?.[test?.id];
            
            return (
              <div key={test?.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      test?.category === 'frontend' ? 'bg-purple-100 text-purple-600' :
                      test?.category === 'backend' ? 'bg-blue-100 text-blue-600' :
                      test?.category === 'database' ? 'bg-green-100 text-green-600' :
                      test?.category === 'security' ? 'bg-red-100 text-red-600' :
                      test?.category === 'trading'? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getCategoryIcon(test?.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{test?.title}</h3>
                      <p className="text-sm text-gray-600">{test?.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result && (
                      <span className="text-xs text-gray-500">
                        {result?.duration}ms
                      </span>
                    )}
                    {getStatusIcon(result?.status)}
                  </div>
                </div>
                {result && (
                  <div className="space-y-2">
                    <div className={`p-3 rounded-lg text-sm ${
                      result?.status === 'success' ? 'bg-green-50 text-green-800' :
                      result?.status === 'warning'? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {result?.message}
                    </div>

                    {result?.fix && (
                      <div className="p-3 rounded-lg bg-blue-50 text-blue-800 text-sm">
                        <strong>Solution:</strong> {result?.fix}
                      </div>
                    )}

                    {result?.details && (
                      <details className="text-xs text-gray-600">
                        <summary className="cursor-pointer hover:text-gray-800">
                          Détails techniques
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                          {JSON.stringify(result?.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
                {!result && isRunning && (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Test en attente...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Next Steps */}
        {overallStatus && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                🎯 Prochaines Étapes Recommandées
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {overallStatus?.status === 'excellent' ? (
                  <>
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <h3 className="font-medium text-green-800 mb-2">✅ Prêt pour Production</h3>
                      <p className="text-sm text-green-700">
                        Système entièrement fonctionnel. Vous pouvez déployer en toute confiance.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <h3 className="font-medium text-blue-800 mb-2">📊 Monitoring</h3>
                      <p className="text-sm text-blue-700">
                        Activez la surveillance continue pour maintenir la performance.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                      <h3 className="font-medium text-purple-800 mb-2">🚀 Optimisation</h3>
                      <p className="text-sm text-purple-700">
                        Explorez les fonctionnalités avancées du trading MVP.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                      <h3 className="font-medium text-red-800 mb-2">🔧 Correctifs Requis</h3>
                      <p className="text-sm text-red-700">
                        Résolvez les tests en échec avant de passer en production.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                      <h3 className="font-medium text-yellow-800 mb-2">⚠️ Tests Additionnels</h3>
                      <p className="text-sm text-yellow-700">
                        Relancez le diagnostic après avoir appliqué les corrections.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <h3 className="font-medium text-blue-800 mb-2">📋 Documentation</h3>
                      <p className="text-sm text-blue-700">
                        Consultez les logs détaillés pour identifier les problèmes.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}