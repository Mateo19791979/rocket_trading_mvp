import React, { useState, useEffect } from 'react';
import { Key, CheckCircle, XCircle, AlertTriangle, RefreshCw, Settings, Activity, Shield, Clock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Link } from 'react-router-dom';

const ApiKeysStatusPanel = () => {
  const [keyStatus, setKeyStatus] = useState({
    finnhub: { configured: false, tested: false, status: 'unknown', lastTest: null },
    alphaVantage: { configured: false, tested: false, status: 'unknown', lastTest: null },
    twelveData: { configured: false, tested: false, status: 'unknown', lastTest: null }
  });
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [securityStatus, setSecurityStatus] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const handleProviderChange = (payload) => {
    // Reload status when providers table changes
    loadKeyStatus();
  };

  useEffect(() => {
    loadKeyStatus();
    
    // Set up real-time subscription for provider changes
    const subscription = supabase
      ?.channel('providers_channel')
      ?.on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'providers' 
      }, handleProviderChange)
      ?.subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadKeyStatus = async () => {
    setLoading(true);
    try {
      // Get provider configuration status
      const { data: securityData, error: securityError } = await supabase
        ?.rpc('check_provider_key_status', { provider_name: 'default' });

      if (!securityError && securityData) {
        setSecurityStatus(securityData);
      }

      // Get actual keys to test their validity
      const { data: providersData, error: providersError } = await supabase
        ?.from('providers')
        ?.select('finnhub_api, alpha_api, twelve_api, updated_at')
        ?.eq('id', 'default')
        ?.single();

      if (!providersError && providersData) {
        setLastUpdated(providersData?.updated_at);
        
        // Check which keys are configured
        const newStatus = {
          finnhub: {
            configured: !!providersData?.finnhub_api,
            tested: false,
            status: providersData?.finnhub_api ? 'configured' : 'missing',
            lastTest: null,
            key: providersData?.finnhub_api
          },
          alphaVantage: {
            configured: !!providersData?.alpha_api,
            tested: false,
            status: providersData?.alpha_api ? 'configured' : 'missing',
            lastTest: null,
            key: providersData?.alpha_api
          },
          twelveData: {
            configured: !!providersData?.twelve_api,
            tested: false,
            status: providersData?.twelve_api ? 'configured' : 'missing',
            lastTest: null,
            key: providersData?.twelve_api
          }
        };

        setKeyStatus(newStatus);
      }
    } catch (error) {
      console.error('Error loading API key status:', error);
    } finally {
      setLoading(false);
    }
  };

  const testAllConnections = async () => {
    setTesting(true);
    const updatedStatus = { ...keyStatus };

    // Test Finnhub
    if (keyStatus?.finnhub?.key) {
      try {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${encodeURIComponent(keyStatus?.finnhub?.key)}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        const data = await response?.json();
        updatedStatus.finnhub = {
          ...updatedStatus?.finnhub,
          tested: true,
          status: response?.ok && !data?.error ? 'active' : 'error',
          lastTest: new Date()?.toISOString(),
          testResult: data
        };
      } catch (error) {
        updatedStatus.finnhub = {
          ...updatedStatus?.finnhub,
          tested: true,
          status: 'error',
          lastTest: new Date()?.toISOString(),
          testResult: { error: error?.message }
        };
      }
    }

    // Test Alpha Vantage
    if (keyStatus?.alphaVantage?.key) {
      try {
        const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=1min&apikey=${encodeURIComponent(keyStatus?.alphaVantage?.key)}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        const data = await response?.json();
        const hasError = data?.['Error Message'] || data?.['Note']?.includes('rate limit');
        updatedStatus.alphaVantage = {
          ...updatedStatus?.alphaVantage,
          tested: true,
          status: response?.ok && !hasError ? 'active' : 'error',
          lastTest: new Date()?.toISOString(),
          testResult: data
        };
      } catch (error) {
        updatedStatus.alphaVantage = {
          ...updatedStatus?.alphaVantage,
          tested: true,
          status: 'error',
          lastTest: new Date()?.toISOString(),
          testResult: { error: error?.message }
        };
      }
    }

    // Test TwelveData
    if (keyStatus?.twelveData?.key) {
      try {
        const response = await fetch(`https://api.twelvedata.com/time_series?symbol=MSFT&interval=1min&apikey=${encodeURIComponent(keyStatus?.twelveData?.key)}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        const data = await response?.json();
        const hasError = data?.message || data?.status === 'error';
        updatedStatus.twelveData = {
          ...updatedStatus?.twelveData,
          tested: true,
          status: response?.ok && !hasError ? 'active' : 'error',
          lastTest: new Date()?.toISOString(),
          testResult: data
        };
      } catch (error) {
        updatedStatus.twelveData = {
          ...updatedStatus?.twelveData,
          tested: true,
          status: 'error',
          lastTest: new Date()?.toISOString(),
          testResult: { error: error?.message }
        };
      }
    }

    setKeyStatus(updatedStatus);
    setTesting(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'configured': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'missing': return <XCircle className="w-5 h-5 text-gray-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-900/20 border-green-500/30 text-green-300';
      case 'error': return 'bg-red-900/20 border-red-500/30 text-red-300';
      case 'configured': return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300';
      case 'missing': return 'bg-gray-900/20 border-gray-500/30 text-gray-400';
      default: return 'bg-gray-900/20 border-gray-500/30 text-gray-400';
    }
  };

  const getStatusText = (status, tested) => {
    switch (status) {
      case 'active': return '🟢 Opérationnel';
      case 'error': return '🔴 Erreur de connexion';
      case 'configured': return tested ? '🟡 Configuré (non testé)' : '🟡 Configuré';
      case 'missing': return '⚪ Non configuré';
      default: return '❓ Statut inconnu';
    }
  };

  const getTotalReady = () => {
    const active = Object.values(keyStatus)?.filter(k => k?.status === 'active')?.length;
    const configured = Object.values(keyStatus)?.filter(k => k?.configured)?.length;
    return { active, configured, total: 3 };
  };

  const readyStats = getTotalReady();

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-600/50">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-400">Vérification des clés API...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-600/50">
      {/* Header avec résumé */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Key className="w-6 h-6 text-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-white">🔑 Status des Clés API</h2>
            <p className="text-sm text-gray-400">
              Providers financiers - {readyStats?.active}/{readyStats?.total} opérationnels
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Overall Status Badge */}
          <div className={`flex items-center px-3 py-2 rounded-full text-sm font-medium border ${
            readyStats?.active >= 2 
              ? 'bg-green-900/30 text-green-300 border-green-500/30'
              : readyStats?.active >= 1 
              ? 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30' :'bg-red-900/30 text-red-300 border-red-500/30'
          }`}>
            {readyStats?.active >= 2 ? '✅ Prêt' : readyStats?.active >= 1 ? '⚠️ Partiel' : '❌ Non prêt'}
          </div>

          <button
            onClick={testAllConnections}
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Activity className={`w-4 h-4 ${testing ? 'animate-pulse' : ''}`} />
            {testing ? 'Test en cours...' : 'Tester tout'}
          </button>
          
          <button
            onClick={loadKeyStatus}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Provider Status Grid */}
      <div className="space-y-4">
        {[
          { key: 'finnhub', name: 'Finnhub', data: keyStatus?.finnhub },
          { key: 'alphaVantage', name: 'Alpha Vantage', data: keyStatus?.alphaVantage },
          { key: 'twelveData', name: 'TwelveData', data: keyStatus?.twelveData }
        ]?.map(provider => (
          <div 
            key={provider?.key} 
            className={`p-4 rounded-lg border ${getStatusColor(provider?.data?.status)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(provider?.data?.status)}
                <div>
                  <h3 className="font-semibold text-gray-200">{provider?.name}</h3>
                  <p className="text-sm opacity-75">
                    {getStatusText(provider?.data?.status, provider?.data?.tested)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-gray-400 mb-1">
                  {provider?.data?.configured ? 'Configuré' : 'Non configuré'}
                </div>
                {provider?.data?.lastTest && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(provider?.data?.lastTest)?.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>

            {/* Test Result Details */}
            {provider?.data?.tested && provider?.data?.testResult && (
              <div className="mt-3 pt-3 border-t border-gray-600/50">
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-400 hover:text-gray-300 mb-2">
                    Détails du dernier test
                  </summary>
                  <div className="bg-gray-900/50 rounded p-2 font-mono text-gray-300 overflow-auto max-h-24">
                    {provider?.data?.status === 'active' ? (
                      <div className="text-green-400">✓ Connexion réussie - Données reçues</div>
                    ) : (
                      <div className="text-red-400">
                        ✗ {provider?.data?.testResult?.error || JSON.stringify(provider?.data?.testResult, null, 2)}
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Security Info */}
      {securityStatus && (
        <div className="mt-6 pt-6 border-t border-gray-600/50">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">Informations de sécurité</span>
          </div>
          <div className="bg-indigo-900/20 rounded-lg p-3 border border-indigo-500/30">
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-300">
              <div>
                <div className="text-indigo-400 mb-1">Clés stockées</div>
                <div>{securityStatus?.total_keys || 0}/3</div>
              </div>
              <div>
                <div className="text-indigo-400 mb-1">Dernière MAJ</div>
                <div>{lastUpdated ? new Date(lastUpdated)?.toLocaleDateString() : 'Jamais'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 pt-6 border-t border-gray-600/50">
        <div className="flex justify-center">
          <Link
            to="/provider-configuration-management-center"
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-2 transition-colors"
          >
            <Settings className="w-4 h-4" />
            💠 Configuration Center
          </Link>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          Gérer, configurer et tester vos clés API de providers financiers
        </p>
      </div>
    </div>
  );
};

export default ApiKeysStatusPanel;