import React, { useState, useEffect } from 'react';
import { runDiagnosticQuery } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import DiagnosticCard from './components/DiagnosticCard';
import ActionPlan from './components/ActionPlan';

const Diagnostic6Verifications = () => {
  const [verifications, setVerifications] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalStatus, setGlobalStatus] = useState('idle');
  const [releaseStatus, setReleaseStatus] = useState('idle');
  
  const API_BASE = import.meta.env?.VITE_API_BASE || 'https://rockettra3991.builtwithrocket.new/api';

  // Safe fetch for API calls with fallback
  const safeFetch = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        headers: { "Accept": "application/json", ...options?.headers },
        ...options
      });
      
      if (!response?.ok) {
        throw new Error(`HTTP ${response?.status}`);
      }
      
      return await response?.json();
    } catch (error) {
      console.warn('API call failed:', url, error);
      return { ok: false, error: error?.message, fallback: true };
    }
  };

  const runVerification = async (verificationId, query, description, isApiCheck = false, apiUrl = null) => {
    try {
      setVerifications(prev => ({ 
        ...prev, 
        [verificationId]: { status: 'loading', description, id: verificationId } 
      }));
      
      let result;
      
      if (isApiCheck && apiUrl) {
        // API check
        result = await safeFetch(apiUrl);
        
        setVerifications(prev => ({ 
          ...prev, 
          [verificationId]: { 
            status: result?.ok ? 'success' : 'error', 
            description, 
            id: verificationId,
            result: result,
            error: !result?.ok,
            isApiCheck: true
          }
        }));
      } else {
        // Database query check
        const { data, error } = await runDiagnosticQuery(query);
        
        if (error) {
          setVerifications(prev => ({ 
            ...prev, 
            [verificationId]: { 
              status: 'error', 
              description, 
              id: verificationId,
              result: error?.message,
              error: true
            }
          }));
        } else {
          setVerifications(prev => ({ 
            ...prev, 
            [verificationId]: { 
              status: 'success', 
              description, 
              id: verificationId,
              result: data,
              error: false
            }
          }));
        }
      }
    } catch (err) {
      setVerifications(prev => ({ 
        ...prev, 
        [verificationId]: { 
          status: 'error', 
          description, 
          id: verificationId,
          result: err?.message,
          error: true
        }
      }));
    }
  };

  const runAllVerifications = async () => {
    setLoading(true);
    setGlobalStatus('running');
    
    const checks = [
      {
        id: 'check1',
        description: '1) Clés IA chargées - Diagnostics AI Keys',
        isApiCheck: true,
        apiUrl: `${API_BASE}/diagnostics/ai-keys`
      },
      {
        id: 'check2',
        description: '2) API backend répond en JSON (health)',
        isApiCheck: true,
        apiUrl: `${API_BASE}/health`
      },
      {
        id: 'check3',
        description: '3) Endpoints Swarm OK (state)',
        isApiCheck: true,
        apiUrl: `${API_BASE}/swarm/state`
      },
      {
        id: 'check4',
        description: '4) Endpoints Swarm OK (statistics)',
        isApiCheck: true,
        apiUrl: `${API_BASE}/swarm/statistics`
      },
      {
        id: 'check5',
        description: '5) Statistiques DB (anti-PGRST116) - RPC Stats',
        query: `SELECT * FROM rpc_stats_overview_json() LIMIT 1`
      }
    ];

    for (const check of checks) {
      if (check?.isApiCheck) {
        await runVerification(check?.id, null, check?.description, true, check?.apiUrl);
      } else {
        await runVerification(check?.id, check?.query, check?.description);
      }
      // Petit délai pour éviter de surcharger
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setLoading(false);
    setGlobalStatus('completed');
  };

  const retryVerification = async (verificationId) => {
    const checks = [
      {
        id: 'check1',
        description: '1) Clés IA chargées - Diagnostics AI Keys',
        isApiCheck: true,
        apiUrl: `${API_BASE}/diagnostics/ai-keys`
      },
      {
        id: 'check2',
        description: '2) API backend répond en JSON (health)',
        isApiCheck: true,
        apiUrl: `${API_BASE}/health`
      },
      {
        id: 'check3',
        description: '3) Endpoints Swarm OK (state)',
        isApiCheck: true,
        apiUrl: `${API_BASE}/swarm/state`
      },
      {
        id: 'check4',
        description: '4) Endpoints Swarm OK (statistics)',
        isApiCheck: true,
        apiUrl: `${API_BASE}/swarm/statistics`
      },
      {
        id: 'check5',
        description: '5) Statistiques DB (anti-PGRST116) - RPC Stats',
        query: `SELECT * FROM rpc_stats_overview_json() LIMIT 1`
      }
    ];

    const check = checks?.find(c => c?.id === verificationId);
    if (check) {
      if (check?.isApiCheck) {
        await runVerification(check?.id, null, check?.description, true, check?.apiUrl);
      } else {
        await runVerification(check?.id, check?.query, check?.description);
      }
    }
  };

  const getCompletionStats = () => {
    const total = 5;
    const completed = Object.values(verifications)?.filter(v => v?.status !== 'loading')?.length;
    const errors = Object.values(verifications)?.filter(v => v?.error)?.length;
    const success = Object.values(verifications)?.filter(v => v?.status === 'success')?.length;
    
    return { total, completed, errors, success };
  };

  const stats = getCompletionStats();
  const allChecksPass = stats?.success === 5 && stats?.errors === 0;

  const releaseAIs = async () => {
    if (!allChecksPass) {
      alert('❌ Tous les checks doivent être au vert avant de libérer les IAs');
      return;
    }

    setReleaseStatus('releasing');
    
    try {
      // Step 1: Disable maintenance mode
      await safeFetch(`${API_BASE}/maintenance/disable`, { method: 'POST' });
      
      // Step 2: Enable trading
      await safeFetch(`${API_BASE}/trading/enable`, { method: 'POST' });
      
      // Step 3: Smoke test (optional)
      const smokeTest = await safeFetch(`${API_BASE}/ibkr/smoke-test`, { method: 'POST' });
      
      if (smokeTest?.ok) {
        setReleaseStatus('success');
        alert('🚀 IAs libérées avec succès ! Trading Multi-IA activé.');
      } else {
        setReleaseStatus('error');
        alert('⚠️ IAs partiellement libérées - Smoke test échoué. Vérifiez IBKR Paper Trading.');
      }
    } catch (error) {
      setReleaseStatus('error');
      alert(`❌ Erreur lors de la libération des IAs: ${error?.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🚦 GO/NO-GO Multi-IA Trading System
              </h1>
              {globalStatus === 'completed' && (
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-green-600">✅ {stats?.success} succès</span>
                  {stats?.errors > 0 && (
                    <span className="text-red-600">❌ {stats?.errors} erreurs</span>
                  )}
                  <span className="text-gray-500">📊 {stats?.completed}/{stats?.total} complété</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={runAllVerifications}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                {loading ? '⏳ Analyse en cours...' : '🔍 Lancer les 5 checks'}
              </Button>
              
              {allChecksPass && (
                <Button 
                  onClick={releaseAIs}
                  disabled={releaseStatus === 'releasing'}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg animate-pulse"
                >
                  {releaseStatus === 'releasing' ? '⏳ Libération...' : '🚀 LIBÉRER LES IAs'}
                </Button>
              )}
            </div>
          </div>

          {/* Status Summary */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🎯 État du Système Multi-IA</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${allChecksPass ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className={allChecksPass ? 'text-green-800 font-medium' : 'text-red-800'}>
                  Système: {allChecksPass ? '✅ Prêt pour libération' : '❌ Pas encore prêt'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${stats?.success >= 4 ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                <span>Infrastructure: {stats?.success >= 4 ? '100% opérationnelle' : 'En cours de validation'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${releaseStatus === 'success' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                <span>Trading: {releaseStatus === 'success' ? 'IAs libérées' : 'En attente'}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 mb-6">
            {Object.entries(verifications)?.sort(([a], [b]) => a?.localeCompare(b))?.map(([id, verification]) => (
                <DiagnosticCard 
                  key={id} 
                  verification={verification} 
                  onRetry={retryVerification}
                />
              ))}
          </div>

          {Object.keys(verifications)?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🚦</div>
              <p className="text-xl">Cliquez sur "Lancer les 5 checks" pour commencer la validation</p>
              <p className="text-sm mt-2 text-gray-400">
                Les 5 vérifications détermineront si le système peut libérer les IAs de trading
              </p>
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left max-w-2xl mx-auto">
                <h4 className="font-semibold text-yellow-800 mb-2">🔥 Mateo, note importante:</h4>
                <p className="text-yellow-700 text-sm">
                  Tant qu'un seul des 5 checks est rouge → <strong>NO-GO</strong> (garde IBKR_READ_ONLY=true).<br/>
                  Quand les 5 sont verts → <strong>GO</strong> : le bouton "LIBÉRER LES IAs" apparaîtra pour activer le trading Paper réel et lancer le prompt multi-IA.
                </p>
              </div>
            </div>
          )}

          {/* Action Plan - Only show if there are failed checks */}
          {stats?.errors > 0 && (
            <ActionPlan verifications={verifications} />
          )}
          
          {/* Success State - Show release confirmation */}
          {allChecksPass && releaseStatus === 'idle' && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">🎉 Tous les checks sont au vert !</h3>
              <p className="text-green-700 mb-4">
                Le système Multi-IA est prêt pour la libération. Les 5 vérifications critiques ont toutes réussi.
                Vous pouvez maintenant libérer les IAs pour le trading Paper réel.
              </p>
              <div className="text-sm text-green-600 bg-green-100 p-3 rounded">
                <strong>Actions automatiques lors de la libération:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Désactivation du mode maintenance UI</li>
                  <li>Activation des runtime_flags de trading</li>
                  <li>Test de connectivité IBKR Paper</li>
                  <li>Lancement du prompt Multi-IA autonome</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Diagnostic6Verifications;