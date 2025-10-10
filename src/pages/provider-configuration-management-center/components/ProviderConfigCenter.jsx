import React, { useState, useEffect } from 'react';
import { Key, Save, TestTube, CheckCircle, XCircle, Eye, EyeOff, Shield, Activity, Clock, Database, Zap, FileText, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const ProviderConfigCenter = () => {
  const [state, setState] = useState({
    finnhubKey: '',
    alphaKey: '',
    twelveKey: '',
    test: { finnhub: null, alpha: null, twelve: null },
    busy: false,
    notice: '',
    showKeys: { finnhub: false, alpha: false, twelve: false }
  });

  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [securityStatus, setSecurityStatus] = useState(null);

  // Load existing configuration
  useEffect(() => {
    loadCurrentConfig();
    loadSecurityStatus();
    loadRecentAuditLogs();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      const { data, error } = await supabase?.from("providers")?.select("finnhub_api, alpha_api, twelve_api")?.eq("id", "default")?.single();

      if (!error && data) {
        setState(prev => ({
          ...prev,
          finnhubKey: data?.finnhub_api || "",
          alphaKey: data?.alpha_api || "",
          twelveKey: data?.twelve_api || ""
        }));
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const loadSecurityStatus = async () => {
    try {
      const { data, error } = await supabase?.rpc('check_provider_key_status', { provider_name: 'default' });
      
      if (!error && data) {
        setSecurityStatus(data);
      }
    } catch (error) {
      console.error('Error loading security status:', error);
    }
  };

  const loadRecentAuditLogs = async () => {
    try {
      setLoadingAudit(true);
      const { data, error } = await supabase?.rpc('get_provider_audit_logs', { 
        limit_count: 20, 
        offset_count: 0 
      });
      
      if (!error && data) {
        setAuditLogs(data);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleSave = async () => {
    setState(prev => ({ ...prev, busy: true, notice: '' }));

    try {
      const { error } = await supabase?.from("providers")?.upsert({
        id: "default",
        finnhub_api: state?.finnhubKey?.trim() || null,
        alpha_api: state?.alphaKey?.trim() || null,
        twelve_api: state?.twelveKey?.trim() || null,
        updated_at: new Date()?.toISOString()
      });

      if (error) {
        setState(prev => ({ 
          ...prev, 
          busy: false,
          notice: `❌ Erreur: ${error?.message}` 
        }));
        return;
      }

      setState(prev => ({ 
        ...prev, 
        busy: false,
        notice: "✅ Clés enregistrées avec sécurité RLS + audit activé!" 
      }));

      // Reload security status and audit logs
      await loadSecurityStatus();
      await loadRecentAuditLogs();

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        busy: false,
        notice: `❌ Erreur: ${error?.message}` 
      }));
    }
  };

  const handleTestAll = async () => {
    setState(prev => ({ ...prev, busy: true, notice: '', test: {} }));
    
    const testResults = {};

    // Test Finnhub
    if (state?.finnhubKey?.trim()) {
      try {
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${encodeURIComponent(state?.finnhubKey?.trim())}`, { method: "GET" });
        const data = await res?.json();
        testResults.finnhub = { 
          ok: res?.ok && !data?.error, 
          status: res?.status, 
          body: data,
          message: data?.error || (res?.ok ? 'Connection successful' : 'Connection failed')
        };
      } catch (e) { 
        testResults.finnhub = { ok: false, error: String(e), message: 'Network error' }; 
      }
    } else {
      testResults.finnhub = { ok: false, message: 'No API key provided' };
    }

    // Test Alpha Vantage
    if (state?.alphaKey?.trim()) {
      try {
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=1min&apikey=${encodeURIComponent(state?.alphaKey?.trim())}`;
        const res = await fetch(url, { method: "GET" });
        const data = await res?.json();
        const hasError = data?.['Error Message'] || data?.['Note']?.includes('rate limit');
        testResults.alpha = { 
          ok: res?.ok && !hasError, 
          status: res?.status, 
          body: data,
          message: hasError ? (data?.['Error Message'] || 'Rate limit reached') : (res?.ok ? 'Connection successful' : 'Connection failed')
        };
      } catch (e) { 
        testResults.alpha = { ok: false, error: String(e), message: 'Network error' }; 
      }
    } else {
      testResults.alpha = { ok: false, message: 'No API key provided' };
    }

    // Test TwelveData
    if (state?.twelveKey?.trim()) {
      try {
        const url = `https://api.twelvedata.com/time_series?symbol=MSFT&interval=1min&apikey=${encodeURIComponent(state?.twelveKey?.trim())}`;
        const res = await fetch(url, { method: "GET" });
        const data = await res?.json();
        const hasError = data?.message || data?.status === 'error';
        testResults.twelve = { 
          ok: res?.ok && !hasError, 
          status: res?.status, 
          body: data,
          message: hasError ? data?.message : (res?.ok ? 'Connection successful' : 'Connection failed')
        };
      } catch (e) { 
        testResults.twelve = { ok: false, error: String(e), message: 'Network error' }; 
      }
    } else {
      testResults.twelve = { ok: false, message: 'No API key provided' };
    }

    setState(prev => ({ 
      ...prev, 
      test: testResults, 
      busy: false,
      notice: `🔍 Tests terminés - ${Object?.values(testResults)?.filter(r => r?.ok)?.length}/3 providers connectés`
    }));
  };

  const toggleKeyVisibility = (provider) => {
    setState(prev => ({
      ...prev,
      showKeys: {
        ...prev?.showKeys,
        [provider]: !prev?.showKeys?.[provider]
      }
    }));
  };

  const clearAuditLogs = async () => {
    if (!window?.confirm('Êtes-vous sûr de vouloir nettoyer les anciens logs d\'audit ? Cette action est irréversible.')) return;
    
    try {
      await supabase?.rpc('cleanup_old_audit_logs', { days_to_keep: 30 });
      setState(prev => ({ 
        ...prev, 
        notice: '🧹 Nettoyage des logs d\'audit effectué (gardé: 30 derniers jours)' 
      }));
      await loadRecentAuditLogs();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        notice: `❌ Erreur nettoyage: ${error?.message}` 
      }));
    }
  };

  const getStatusColor = (hasKey) => hasKey ? 'text-green-400' : 'text-red-400';
  const getStatusIcon = (hasKey) => hasKey ? CheckCircle : XCircle;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header avec status sécurisé */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-400" />
            <div>
              <h1 className="text-2xl font-bold text-indigo-200">⚙️ Configuration Sécurisée des Providers</h1>
              <p className="text-gray-400">Système RLS + Audit activé - Stockage côté serveur sécurisé</p>
            </div>
          </div>
          
          {securityStatus && (
            <div className="bg-indigo-900/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-200">Status Sécurité</span>
              </div>
              <div className="text-xs text-gray-300 space-y-1">
                <div>Clés configurées: {securityStatus?.total_keys || 0}/3</div>
                <div>Dernière MAJ: {securityStatus?.last_updated ? new Date(securityStatus?.last_updated)?.toLocaleString() : 'Jamais'}</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'finnhub', name: 'Finnhub', configured: securityStatus?.keys_configured?.finnhub },
            { key: 'alpha_vantage', name: 'Alpha Vantage', configured: securityStatus?.keys_configured?.alpha_vantage },
            { key: 'twelve_data', name: 'TwelveData', configured: securityStatus?.keys_configured?.twelve_data }
          ]?.map(provider => {
            const StatusIcon = getStatusIcon(provider?.configured);
            return (
              <div key={provider?.key} className="bg-gray-800/50 rounded-lg p-3 border border-gray-600/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">{provider?.name}</span>
                  <StatusIcon className={`w-4 h-4 ${getStatusColor(provider?.configured)}`} />
                </div>
                <div className={`text-xs mt-1 ${getStatusColor(provider?.configured)}`}>
                  {provider?.configured ? '✓ Configuré' : '○ Non configuré'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuration principale */}
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-500" />
          Configuration des Clés API
        </h2>
        <p className="text-gray-400 mb-6">
          Les clés sont stockées de manière sécurisée côté serveur. Les tests interrogent directement les endpoints officiels.
        </p>

        <div className="grid grid-cols-1 gap-6">
          {/* Finnhub */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Finnhub API Key
            </label>
            <div className="relative">
              <input
                type={state?.showKeys?.finnhub ? 'text' : 'password'}
                value={state?.finnhubKey}
                onChange={(e) => setState(prev => ({ ...prev, finnhubKey: e?.target?.value }))}
                placeholder="Colle ta clé Finnhub ici"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => toggleKeyVisibility('finnhub')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {state?.showKeys?.finnhub ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Alpha Vantage */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Alpha Vantage API Key
            </label>
            <div className="relative">
              <input
                type={state?.showKeys?.alpha ? 'text' : 'password'}
                value={state?.alphaKey}
                onChange={(e) => setState(prev => ({ ...prev, alphaKey: e?.target?.value }))}
                placeholder="Colle ta clé Alpha Vantage ici"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => toggleKeyVisibility('alpha')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {state?.showKeys?.alpha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* TwelveData */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              TwelveData API Key
            </label>
            <div className="relative">
              <input
                type={state?.showKeys?.twelve ? 'text' : 'password'}
                value={state?.twelveKey}
                onChange={(e) => setState(prev => ({ ...prev, twelveKey: e?.target?.value }))}
                placeholder="Colle ta clé TwelveData ici"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => toggleKeyVisibility('twelve')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {state?.showKeys?.twelve ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={state?.busy}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-2 transition-colors"
            >
              {state?.busy ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  💾 Sauvegarder
                </>
              )}
            </button>
            
            <button
              onClick={handleTestAll}
              disabled={state?.busy}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-2 transition-colors"
            >
              {state?.busy ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                  Test en cours...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4" />
                  🔍 Tester les connexions
                </>
              )}
            </button>
          </div>

          {/* Notice */}
          {state?.notice && (
            <div className={`p-4 rounded-lg border ${
              state?.notice?.includes('✅') || state?.notice?.includes('🔍') 
                ? 'bg-green-900/20 border-green-500/30 text-green-400' :'bg-red-900/20 border-red-500/30 text-red-400'
            }`}>
              <div className="flex items-center gap-2">
                {state?.notice?.includes('✅') || state?.notice?.includes('🔍') ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span className="font-medium">{state?.notice}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Résultats des tests */}
      {Object?.keys(state?.test)?.length > 0 && (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            Résultats de test
          </h2>
          
          <div className="space-y-4">
            {Object?.entries(state?.test)?.map(([provider, result]) => {
              const isSuccess = result?.ok;
              const StatusIcon = isSuccess ? CheckCircle : XCircle;
              
              return (
                <div key={provider} className={`p-4 rounded-lg border ${
                  isSuccess 
                    ? 'bg-green-900/20 border-green-500/30' :'bg-red-900/20 border-red-500/30'
                }`}>
                  <div className="flex items-start gap-3">
                    <StatusIcon className={`w-5 h-5 mt-0.5 ${isSuccess ? 'text-green-400' : 'text-red-400'}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-200 capitalize">
                          {provider === 'finnhub' ? 'Finnhub' : 
                           provider === 'alpha' ? 'Alpha Vantage' : 'TwelveData'}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isSuccess ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                        }`}>
                          {isSuccess ? 'CONNECTÉ' : 'ÉCHEC'}
                        </span>
                      </div>
                      
                      <p className={`text-sm mb-3 ${isSuccess ? 'text-green-300' : 'text-red-300'}`}>
                        {result?.message || (isSuccess ? 'Connexion réussie' : 'Connexion échouée')}
                      </p>
                      
                      {result?.status && (
                        <div className="text-xs text-gray-400 mb-2">
                          Status HTTP: {result?.status}
                        </div>
                      )}
                      
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                          Voir les détails de la réponse
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-900/50 rounded text-gray-300 overflow-auto max-h-32">
                          {JSON.stringify(result?.body || result, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Logs d'audit sécurisés */}
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Journal d'Audit Sécurisé
          </h2>
          
          <div className="flex gap-2">
            <button
              onClick={loadRecentAuditLogs}
              disabled={loadingAudit}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loadingAudit ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            
            <button
              onClick={clearAuditLogs}
              className="bg-orange-600 hover:bg-orange-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Nettoyer
            </button>
          </div>
        </div>

        {loadingAudit ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-400">Chargement des logs d'audit...</span>
          </div>
        ) : auditLogs?.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {auditLogs?.map((log, index) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      log?.action?.includes('INSERT') ? 'bg-green-500' :
                      log?.action?.includes('UPDATE') ? 'bg-blue-500' :
                      log?.action?.includes('DELETE') ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-200">{log?.action}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log?.audit_timestamp)?.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 mb-2">
                  Acteur: <span className="text-gray-300">{log?.actor}</span>
                  {log?.record_id && (
                    <> | ID: <span className="text-gray-300">{log?.record_id}</span></>
                  )}
                </div>
                
                {log?.details && Object?.keys(log?.details)?.length > 0 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                      Détails de l'opération
                    </summary>
                    <pre className="mt-1 p-2 bg-gray-900/50 rounded text-gray-300 overflow-auto max-h-24">
                      {JSON.stringify(log?.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun log d'audit disponible</p>
          </div>
        )}
      </div>

      {/* Fallback Google Sheets */}
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="font-semibold text-lg text-indigo-600 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          📊 Fallback Google Sheets
        </h3>
        <p className="text-gray-400 mb-3">Si tous les providers tombent, stocke une feuille avec :</p>
        <div className="bg-gray-700/50 rounded-lg p-3 font-mono text-sm text-green-400 border border-gray-600/50">
          =GOOGLEFINANCE("AAPL","price")
        </div>
        <p className="text-gray-400 text-sm mt-3">
          Brancher la feuille (lecture seule) comme provider de secours dans ton Router.
        </p>
      </div>
    </div>
  );
};

export default ProviderConfigCenter;