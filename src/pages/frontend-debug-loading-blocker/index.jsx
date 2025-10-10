import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Eye, Network, Zap, Monitor, Settings, Terminal, Globe } from 'lucide-react';

export default function FrontendDebugLoadingBlocker() {
  const [diagnostic, setDiagnostic] = useState({
    console: { status: 'checking', errors: [], warnings: [] },
    network: { status: 'checking', failed: [], slow: [] },
    authentication: { status: 'checking', supabase: null, user: null },
    rendering: { status: 'checking', blocked: false, timeout: false },
    apis: { status: 'checking', endpoints: [] }
  });
  const [autoFixApplied, setAutoFixApplied] = useState(false);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);

  // Real-time diagnostic monitoring
  useEffect(() => {
    if (!realTimeMonitoring) return;

    const runDiagnostics = () => {
      // Console Error Detection
      checkConsoleErrors();
      // Network Request Monitoring  
      checkNetworkRequests();
      // Authentication State Check
      checkAuthenticationState();
      // Rendering Performance Check
      checkRenderingPerformance();
      // API Health Check
      checkAPIHealth();
    };

    runDiagnostics();
    const interval = setInterval(runDiagnostics, 5000);
    return () => clearInterval(interval);
  }, [realTimeMonitoring]);

  const checkConsoleErrors = () => {
    // Detect console errors in real-time
    const errors = [];
    const warnings = [];
    
    // Check for React errors
    if (window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__) {
      errors?.push('React Error Overlay detected - development build issues');
    }
    
    // Check for authentication errors
    if (localStorage.getItem('supabase.auth.token')?.includes('error')) {
      errors?.push('Supabase authentication token error detected');
    }
    
    // Check for network errors
    if (navigator.onLine === false) {
      errors?.push('Network connectivity offline');
    }

    setDiagnostic(prev => ({
      ...prev,
      console: {
        status: errors?.length > 0 ? 'error' : 'success',
        errors,
        warnings
      }
    }));
  };

  const checkNetworkRequests = () => {
    const failed = [];
    const slow = [];
    
    // Mock network check - in real implementation, this would hook into fetch/axios
    fetch('/api/health', { timeout: 2000 })?.then(response => {
        if (!response?.ok) {
          failed?.push(`API Health Check failed: ${response?.status}`);
        }
      })?.catch(error => {
        failed?.push(`Network request failed: ${error?.message}`);
      });

    setDiagnostic(prev => ({
      ...prev,
      network: {
        status: failed?.length > 0 ? 'error' : 'success',
        failed,
        slow
      }
    }));
  };

  const checkAuthenticationState = () => {
    let supabaseStatus = 'unknown';
    let userStatus = null;
    
    try {
      // Check if Supabase client is initialized
      if (window.supabase) {
        supabaseStatus = 'connected';
      } else {
        supabaseStatus = 'disconnected';
      }
      
      // Check authentication state
      const authToken = localStorage.getItem('supabase.auth.token');
      userStatus = authToken ? 'authenticated' : 'anonymous';
      
    } catch (error) {
      supabaseStatus = 'error';
    }

    setDiagnostic(prev => ({
      ...prev,
      authentication: {
        status: supabaseStatus === 'error' ? 'error' : 'success',
        supabase: supabaseStatus,
        user: userStatus
      }
    }));
  };

  const checkRenderingPerformance = () => {
    const blocked = document.querySelector('[data-react-loading]') !== null;
    const timeout = Date.now() - window.performance?.timing?.navigationStart > 15000;
    
    setDiagnostic(prev => ({
      ...prev,
      rendering: {
        status: blocked || timeout ? 'error' : 'success',
        blocked,
        timeout
      }
    }));
  };

  const checkAPIHealth = () => {
    const endpoints = [
      { name: 'Trading API', url: '/api/health', status: 'checking' },
      { name: 'Market Data', url: '/api/market', status: 'checking' },
      { name: 'Supabase Edge', url: process.env?.VITE_SUPABASE_URL, status: 'checking' }
    ];

    setDiagnostic(prev => ({
      ...prev,
      apis: {
        status: 'checking',
        endpoints
      }
    }));
  };

  const applyAutoFix = () => {
    // Clear browser cache
    if ('caches' in window) {
      caches.keys()?.then(names => {
        names?.forEach(name => caches.delete(name));
      });
    }
    
    // Clear localStorage issues
    try {
      localStorage.removeItem('supabase.auth.token.error');
      localStorage.removeItem('react.error.boundary');
    } catch (error) {
      console.error('LocalStorage clear error:', error);
    }
    
    // Force React reconciliation
    const event = new CustomEvent('react.force.refresh');
    window.dispatchEvent(event);
    
    setAutoFixApplied(true);
    setTimeout(() => setAutoFixApplied(false), 3000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default: return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <Monitor className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Débogage Frontend - Blocage de Chargement
              </h1>
              <p className="text-gray-600 mt-1">
                Diagnostic en temps réel du problème "App en cours de chargement..." 
              </p>
            </div>
          </div>

          {/* Status Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">État du Système</h2>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={realTimeMonitoring}
                    onChange={(e) => setRealTimeMonitoring(e?.target?.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">Monitoring temps réel</span>
                </label>
                <button
                  onClick={applyAutoFix}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    autoFixApplied 
                      ? 'bg-green-100 text-green-700 border border-green-200' :'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {autoFixApplied ? 'Fix Appliqué ✓' : 'Auto-Fix'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(diagnostic)?.map(([key, data]) => (
                <div key={key} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  {getStatusIcon(data?.status)}
                  <div>
                    <div className="font-medium text-gray-900 capitalize">{key}</div>
                    <div className="text-xs text-gray-500">
                      {data?.status === 'checking' ? 'Vérification...' : 
                       data?.status === 'success' ? 'OK' : 'Problème détecté'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diagnostic Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Console & JavaScript Errors */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Terminal className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Console & Erreurs JS</h3>
              {getStatusIcon(diagnostic?.console?.status)}
            </div>

            <div className="space-y-3">
              {diagnostic?.console?.errors?.length > 0 ? (
                <>
                  <div className="text-sm font-medium text-red-600">Erreurs détectées:</div>
                  {diagnostic?.console?.errors?.map((error, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-sm text-green-600">✓ Aucune erreur JavaScript critique détectée</div>
              )}

              {diagnostic?.console?.warnings?.length > 0 && (
                <>
                  <div className="text-sm font-medium text-yellow-600">Avertissements:</div>
                  {diagnostic?.console?.warnings?.map((warning, index) => (
                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-sm text-yellow-700">{warning}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Network & API Requests */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Network className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Réseau & API</h3>
              {getStatusIcon(diagnostic?.network?.status)}
            </div>

            <div className="space-y-3">
              {diagnostic?.network?.failed?.length > 0 ? (
                <>
                  <div className="text-sm font-medium text-red-600">Requêtes échouées:</div>
                  {diagnostic?.network?.failed?.map((error, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-sm text-green-600">✓ Toutes les requêtes réseau fonctionnent</div>
              )}

              <div className="grid grid-cols-1 gap-2 mt-4">
                {diagnostic?.apis?.endpoints?.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{endpoint?.name}</span>
                    {getStatusIcon(endpoint?.status)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Authentication State */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">État d'Authentification</h3>
              {getStatusIcon(diagnostic?.authentication?.status)}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Supabase Client</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    diagnostic?.authentication?.supabase === 'connected' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium">{diagnostic?.authentication?.supabase}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Utilisateur</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    diagnostic?.authentication?.user === 'authenticated' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm font-medium">{diagnostic?.authentication?.user || 'unknown'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rendering Performance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Performance de Rendu</h3>
              {getStatusIcon(diagnostic?.rendering?.status)}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Rendu Bloqué</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    diagnostic?.rendering?.blocked ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {diagnostic?.rendering?.blocked ? 'Oui' : 'Non'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Timeout (&gt;15s)</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    diagnostic?.rendering?.timeout ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {diagnostic?.rendering?.timeout ? 'Oui' : 'Non'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Solutions Automatiques */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Solutions Automatiques Disponibles</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Vider le Cache</h4>
              <p className="text-sm text-gray-600 mb-3">
                Supprime les données en cache qui peuvent causer des conflits
              </p>
              <button 
                onClick={() => window.location?.reload(true)}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Appliquer
              </button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Mode Fallback</h4>
              <p className="text-sm text-gray-600 mb-3">
                Active le mode dégradé sans dépendances externes
              </p>
              <button 
                onClick={() => localStorage.setItem('fallback_mode', 'true')}
                className="w-full px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
              >
                Activer
              </button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Reset Complet</h4>
              <p className="text-sm text-gray-600 mb-3">
                Remet à zéro toutes les données locales et recharge l'app
              </p>
              <button 
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/';
                }}
                className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Instructions pour l'Utilisateur */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Eye className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Instructions de Débogage</h3>
          </div>

          <div className="space-y-4 text-sm text-blue-800">
            <div>
              <strong>Étape 1:</strong> Ouvrez les outils de développement (F12) et vérifiez l'onglet Console pour les erreurs JavaScript.
            </div>
            <div>
              <strong>Étape 2:</strong> Dans l'onglet Network, rechargez la page et cherchez les requêtes échouées (en rouge).
            </div>
            <div>
              <strong>Étape 3:</strong> Si des erreurs API sont détectées, vérifiez que le backend est accessible et répond correctement.
            </div>
            <div>
              <strong>Étape 4:</strong> Utilisez les solutions automatiques ci-dessus pour résoudre les problèmes courants.
            </div>
            <div>
              <strong>Étape 5:</strong> Si le problème persiste, contactez l'équipe technique avec les détails de ce diagnostic.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}