import React, { useState, useEffect } from 'react';
import { Shield, Home, Settings, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export default function SafeLanding() {
  const [systemInfo, setSystemInfo] = useState({
    timestamp: new Date()?.toISOString(),
    safeMode: true,
    buildVersion: 'fusion-stable-22h00',
    url: typeof window !== 'undefined' ? window.location?.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
  });

  const [diagnostics, setDiagnostics] = useState({
    localStorage: 'checking',
    sessionStorage: 'checking',
    indexedDB: 'checking',
    serviceWorker: 'checking'
  });

  useEffect(() => {
    // Run basic diagnostics
    const runDiagnostics = () => {
      // localStorage test
      try {
        const testKey = '__safe_mode_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        setDiagnostics(prev => ({ ...prev, localStorage: 'ok' }));
      } catch (e) {
        setDiagnostics(prev => ({ ...prev, localStorage: 'error' }));
      }

      // sessionStorage test
      try {
        const testKey = '__safe_mode_session_test__';
        sessionStorage.setItem(testKey, 'test');
        sessionStorage.removeItem(testKey);
        setDiagnostics(prev => ({ ...prev, sessionStorage: 'ok' }));
      } catch (e) {
        setDiagnostics(prev => ({ ...prev, sessionStorage: 'error' }));
      }

      // IndexedDB test
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        setDiagnostics(prev => ({ ...prev, indexedDB: 'ok' }));
      } else {
        setDiagnostics(prev => ({ ...prev, indexedDB: 'not_available' }));
      }

      // Service Worker test
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        setDiagnostics(prev => ({ ...prev, serviceWorker: 'ok' }));
      } else {
        setDiagnostics(prev => ({ ...prev, serviceWorker: 'not_available' }));
      }
    };

    runDiagnostics();
  }, []);

  const exitSafeMode = () => {
    localStorage.removeItem('SAFE_MODE');
    window.location.href = '/';
  };

  const reloadApplication = () => {
    window.location?.reload();
  };

  const clearApplicationData = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les données de l\'application ?')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  const getDiagnosticIcon = (status) => {
    switch (status) {
      case 'ok': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'not_available': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
    }
  };

  const getDiagnosticText = (status) => {
    switch (status) {
      case 'ok': return 'Fonctionnel';
      case 'error': return 'Erreur détectée';
      case 'not_available': return 'Non disponible';
      default: return 'Vérification...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Header */}
      <div className="border-b border-blue-500/30 bg-black/60 backdrop-blur-md">
        <div className="px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="w-10 h-10 text-yellow-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-300 bg-clip-text text-transparent">
                SAFE MODE - Mode Sécurité
              </h1>
              <div className="text-xs text-yellow-300/70 font-mono">
                Build: {systemInfo?.buildVersion} | Runtime: Mode dégradé actif
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="max-width-4xl mx-auto space-y-8">
          {/* Main Message */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Application en Mode Sécurisé
            </h2>
            <p className="text-yellow-100 mb-4">
              L'application fonctionne actuellement en mode sécurisé pour éviter les erreurs système. 
              Les composants lourds et les fonctionnalités avancées sont temporairement désactivés.
            </p>
            <p className="text-yellow-200 text-sm">
              Ce mode a été activé automatiquement suite à une erreur détectée ou manuellement pour des raisons de stabilité.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* System Diagnostics */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Diagnostics Système
              </h3>
              
              <div className="space-y-4">
                {Object.entries(diagnostics)?.map(([key, status]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getDiagnosticIcon(status)}
                      <span className="font-medium capitalize">{key?.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                    <span className={`text-sm ${
                      status === 'ok' ? 'text-green-300' :
                      status === 'error' ? 'text-red-300' :
                      status === 'not_available' ? 'text-yellow-300' : 'text-blue-300'
                    }`}>
                      {getDiagnosticText(status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Information */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Informations Système</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Build Version:</span>
                  <span className="text-white font-mono">{systemInfo?.buildVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Timestamp:</span>
                  <span className="text-white font-mono">{systemInfo?.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mode:</span>
                  <span className="text-yellow-300 font-medium">SAFE_MODE</span>
                </div>
                <div className="break-all">
                  <div className="text-gray-400 mb-1">URL:</div>
                  <div className="text-white font-mono text-xs bg-black/30 p-2 rounded">
                    {systemInfo?.url}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Actions Disponibles</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={exitSafeMode}
                className="flex items-center justify-center gap-2 py-4 px-6 bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 rounded-lg text-green-300 font-medium transition-all duration-200 hover:scale-105"
              >
                <Home className="w-5 h-5" />
                Quitter SAFE MODE
              </button>
              
              <button
                onClick={reloadApplication}
                className="flex items-center justify-center gap-2 py-4 px-6 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded-lg text-blue-300 font-medium transition-all duration-200 hover:scale-105"
              >
                <RefreshCw className="w-5 h-5" />
                Recharger
              </button>
              
              <button
                onClick={clearApplicationData}
                className="flex items-center justify-center gap-2 py-4 px-6 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 rounded-lg text-red-300 font-medium transition-all duration-200 hover:scale-105"
              >
                <AlertTriangle className="w-5 h-5" />
                Reset Complet
              </button>
            </div>
          </div>

          {/* Help Information */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-300 mb-4">Informations d'Aide</h3>
            <div className="space-y-2 text-sm text-blue-100">
              <p>• <strong>Quitter SAFE MODE :</strong> Retourne à l'application normale si le problème est résolu</p>
              <p>• <strong>Recharger :</strong> Recharge la page en conservant le mode sécurisé</p>
              <p>• <strong>Reset Complet :</strong> Efface toutes les données stockées et redémarre l'application</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}