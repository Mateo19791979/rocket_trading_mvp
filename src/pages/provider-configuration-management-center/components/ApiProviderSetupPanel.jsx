import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Key, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ExternalLink,
  Shield,
  DollarSign,
  Clock,
  Zap,
  Info,
  Activity
} from 'lucide-react';
import { providerConfigurationService } from '../../../services/providerConfigurationService';
import { supabase } from '../../../lib/supabase';

const ApiProviderSetupPanel = ({ providers = [], onProviderUpdate }) => {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rateLimit, setRateLimit] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState(null);
  const [bulkTesting, setBulkTesting] = useState(false);

  // NEW: Add state for simple providers table integration
  const [simpleProviders, setSimpleProviders] = useState({
    finnhub_api: '',
    alpha_api: '',
    twelve_api: ''
  });
  const [savingSimple, setSavingSimple] = useState(false);

  // Enhanced provider details with comprehensive setup information
  const providerDetails = {
    finhub: {
      name: 'Finnhub',
      description: 'Professional-grade real-time financial data and news API',
      website: 'https://finnhub.io/register',
      defaultRateLimit: 60,
      features: ['Real-time stock quotes', 'Company fundamentals', 'News sentiment', 'Economic indicators', 'Earnings data', 'Insider trading'],
      keyFormat: 'Free: "demo" | Premium: c1234567890abcdef...',
      instructions: 'Go to Finnhub.io → Create Account → Dashboard → API Keys → Copy your key',
      pricing: {
        free: { calls: '60/min', features: 'Basic quotes, limited news' },
        basic: { price: '$7.99/mo', calls: '300/min', features: 'Real-time data, full news' },
        premium: { price: '$24.99/mo', calls: '1000/min', features: 'All features, priority support' }
      },
      testEndpoint: '/quote?symbol=AAPL',
      validation: {
        pattern: /^(demo|[a-z0-9]{20,})$/i,
        minLength: 4,
        maxLength: 32
      },
      simpleKey: 'finnhub_api'
    },
    alpha_vantage: {
      name: 'Alpha Vantage', 
      description: 'Free and premium APIs for realtime and historical financial data',
      website: 'https://www.alphavantage.co/support/#api-key',
      defaultRateLimit: 5,
      features: ['Stock time series', 'Technical indicators', 'Forex data', 'Crypto prices', 'Sector performance', 'Economic indicators'],
      keyFormat: 'Format: ABCD1234EFGH5678 (16 alphanumeric characters)',
      instructions: 'Visit Alpha Vantage → Get Free API Key → Fill form → Check email → Copy 16-character key',
      pricing: {
        free: { calls: '5/min, 500/day', features: 'Basic data, 15min delay' },
        basic: { price: '$49.99/mo', calls: '75/min', features: 'Real-time data' },
        premium: { price: '$149.99/mo', calls: '600/min', features: 'All endpoints, priority' }
      },
      testEndpoint: '/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=1min',
      validation: {
        pattern: /^[A-Z0-9]{16}$/,
        minLength: 16,
        maxLength: 16
      },
      simpleKey: 'alpha_api'
    },
    twelve_data: {
      name: 'TwelveData',
      description: 'Global financial data API with generous free tier',
      website: 'https://twelvedata.com/pricing',
      defaultRateLimit: 8,
      features: ['Global stocks', 'Forex real-time', 'Cryptocurrencies', 'ETFs & Mutual funds', 'Options data', 'Fundamental data'],
      keyFormat: 'Format: abcd1234efgh5678ijkl9012mnop3456qrst7890 (40 chars)',
      instructions: 'TwelveData → Sign up → Account Settings → API → Generate new key → Copy 40-character key',
      pricing: {
        free: { calls: '8/min, 800/day', features: 'Basic data, some delays' },
        basic: { price: '$12/mo', calls: '100/min', features: 'Real-time, extended history' },
        pro: { price: '$49/mo', calls: '300/min', features: 'All features, WebSocket' }
      },
      testEndpoint: '/time_series?symbol=MSFT&interval=1min',
      validation: {
        pattern: /^[a-z0-9]{40}$/,
        minLength: 40,
        maxLength: 40
      },
      simpleKey: 'twelve_api'
    }
  };

  // NEW: Load simple providers data on mount
  useEffect(() => {
    loadSimpleProviders();
  }, []);

  const loadSimpleProviders = async () => {
    try {
      const { data, error } = await supabase?.from('providers')?.select('*')?.eq('id', 'default')?.single();
      
      if (error) {
        console.error('Error loading simple providers:', error);
        return;
      }

      if (data) {
        setSimpleProviders({
          finnhub_api: data?.finnhub_api || '',
          alpha_api: data?.alpha_api || '',
          twelve_api: data?.twelve_api || ''
        });
      }
    } catch (error) {
      console.error('Error loading simple providers:', error);
    }
  };

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setApiKey('');
    setRateLimit(provider?.rate_limit_per_minute?.toString() || '');
    setShowApiKey(false);
    setConnectionResult(null);
  };

  const getProviderStatus = (provider) => {
    if (!provider?.is_active) return { status: 'inactive', color: 'text-gray-400', icon: XCircle };
    if (provider?.api_key_encrypted) return { status: 'configured', color: 'text-green-400', icon: CheckCircle };
    return { status: 'needs_setup', color: 'text-orange-400', icon: AlertCircle };
  };

  const validateApiKey = (key, provider) => {
    if (!key?.trim()) return { valid: false, message: 'API key is required' };
    
    const details = providerDetails?.[provider?.api_name];
    if (!details?.validation) return { valid: true };

    const { pattern, minLength, maxLength } = details?.validation;
    
    if (key?.length < minLength || key?.length > maxLength) {
      return { 
        valid: false, 
        message: `Key must be ${minLength === maxLength ? minLength : `${minLength}-${maxLength}`} characters long` 
      };
    }
    
    if (pattern && !pattern?.test(key)) {
      return { 
        valid: false, 
        message: `Invalid format. Expected: ${details?.keyFormat}` 
      };
    }
    
    return { valid: true };
  };

  const handleSaveConfiguration = async () => {
    if (!selectedProvider) return;

    // Validate API key if provided
    if (apiKey?.trim()) {
      const validation = validateApiKey(apiKey, selectedProvider);
      if (!validation?.valid) {
        setConnectionResult({ success: false, message: validation?.message });
        return;
      }
    }

    try {
      setSaving(true);
      
      // Update rate limit if changed
      if (rateLimit && parseInt(rateLimit) !== selectedProvider?.rate_limit_per_minute) {
        await providerConfigurationService?.updateProviderConfig(selectedProvider?.id, {
          rate_limit_per_minute: parseInt(rateLimit)
        });
      }

      // Save API key if provided - now saves to both systems
      if (apiKey?.trim()) {
        // Save to external_api_configs (existing system)
        await providerConfigurationService?.saveApiKey(selectedProvider?.id, apiKey?.trim());
        
        // NEW: Also save to simple providers table
        const details = providerDetails?.[selectedProvider?.api_name];
        if (details?.simpleKey) {
          const updateData = {
            [details?.simpleKey]: apiKey?.trim(),
            updated_at: new Date()?.toISOString()
          };
          
          await supabase?.from('providers')?.upsert({ 
            id: 'default',
            ...updateData 
          });
          
          // Update local state
          setSimpleProviders(prev => ({
            ...prev,
            [details?.simpleKey]: apiKey?.trim()
          }));
        }
        
        setApiKey('');
        
        // Auto-test connection after saving key
        await testConnection();
      } else {
        setConnectionResult({ success: true, message: 'Rate limit configuration saved successfully!' });
      }

      onProviderUpdate?.();
      
    } catch (error) {
      setConnectionResult({ success: false, message: `Error: ${error?.message}` });
    } finally {
      setSaving(false);
    }
  };

  // NEW: Quick save function for simple providers table
  const handleQuickSave = async () => {
    try {
      setSavingSimple(true);
      
      const { error } = await supabase?.from('providers')?.upsert({
        id: 'default',
        finnhub_api: simpleProviders?.finnhub_api || null,
        alpha_api: simpleProviders?.alpha_api || null,
        twelve_api: simpleProviders?.twelve_api || null,
        updated_at: new Date()?.toISOString()
      });

      if (error) {
        setConnectionResult({ success: false, message: `Quick save failed: ${error?.message}` });
        return;
      }

      setConnectionResult({ 
        success: true, 
        message: '✅ All provider API keys saved successfully to central configuration!' 
      });

      // Also update the external_api_configs table for consistency
      const providers = await providerConfigurationService?.getAllProviders();
      
      for (const [key, value] of Object?.entries(simpleProviders)) {
        if (value?.trim()) {
          const providerName = key === 'finnhub_api' ? 'finhub' : 
                               key === 'alpha_api' ? 'alpha_vantage' : 'twelve_data';
          
          const provider = providers?.find(p => p?.api_name === providerName);
          if (provider) {
            await providerConfigurationService?.saveApiKey(provider?.id, value?.trim());
          }
        }
      }
      
      onProviderUpdate?.();
      
    } catch (error) {
      setConnectionResult({ success: false, message: `Quick save error: ${error?.message}` });
    } finally {
      setSavingSimple(false);
    }
  };

  const testConnection = async () => {
    if (!selectedProvider) return;

    try {
      setTestingConnection(true);
      const result = await providerConfigurationService?.testProviderConnectivity(selectedProvider?.api_name);
      
      setConnectionResult({
        success: result,
        message: result ? 
          `✅ Connection successful! ${selectedProvider?.api_name} is ready to use.` : 
          `❌ Connection failed. Please verify your API key and try again.`
      });
    } catch (error) {
      setConnectionResult({
        success: false,
        message: `Connection test failed: ${error?.message}. Check if your API key is valid and has sufficient permissions.`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleBulkTest = async () => {
    try {
      setBulkTesting(true);
      const results = await providerConfigurationService?.runBulkHealthCheck();
      
      const summary = results?.reduce((acc, result) => {
        acc[result?.provider] = result;
        return acc;
      }, {});
      
      const successCount = results?.filter(r => r?.success)?.length || 0;
      const totalCount = results?.length || 0;
      
      setConnectionResult({
        success: successCount > 0,
        message: `Bulk connectivity test completed. ${successCount}/${totalCount} providers are healthy and responding.`,
        details: summary
      });
      
      onProviderUpdate?.();
    } catch (error) {
      setConnectionResult({
        success: false,
        message: `Bulk test failed: ${error?.message}`
      });
    } finally {
      setBulkTesting(false);
    }
  };

  const apiKeyValidation = selectedProvider && apiKey ? validateApiKey(apiKey, selectedProvider) : null;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold">Financial Data Provider Setup</h2>
        </div>
        
        {/* Enhanced Bulk Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleBulkTest}
            disabled={bulkTesting || providers?.length === 0}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            {bulkTesting ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Test All Connections
              </>
            )}
          </button>
        </div>
      </div>

      {/* NEW: Quick Setup Panel */}
      <div className="mb-8 bg-gradient-to-r from-indigo-900/30 to-blue-900/30 border border-indigo-500/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-indigo-200">⚡ Quick Configuration Panel</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">Configure all three providers at once using the simplified interface</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Finnhub API Key
            </label>
            <input
              type="password"
              value={simpleProviders?.finnhub_api}
              onChange={(e) => setSimpleProviders(prev => ({ ...prev, finnhub_api: e?.target?.value }))}
              placeholder="Enter Finnhub API key"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Alpha Vantage API Key
            </label>
            <input
              type="password"
              value={simpleProviders?.alpha_api}
              onChange={(e) => setSimpleProviders(prev => ({ ...prev, alpha_api: e?.target?.value }))}
              placeholder="Enter Alpha Vantage key"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              TwelveData API Key
            </label>
            <input
              type="password"
              value={simpleProviders?.twelve_api}
              onChange={(e) => setSimpleProviders(prev => ({ ...prev, twelve_api: e?.target?.value }))}
              placeholder="Enter TwelveData key"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
          </div>
        </div>
        
        <button
          onClick={handleQuickSave}
          disabled={savingSimple}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all font-semibold"
        >
          {savingSimple ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              Saving All Keys...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              💾 Save All API Keys (Quick Setup)
            </>
          )}
        </button>
      </div>

      {/* Connection Result Alert */}
      {connectionResult && (
        <div className={`mb-6 p-4 rounded-lg border ${
          connectionResult?.success ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'
        }`}>
          <div className={`flex items-start gap-3 ${
            connectionResult?.success ? 'text-green-400' : 'text-red-400'
          }`}>
            {connectionResult?.success ? <CheckCircle className="w-5 h-5 mt-0.5" /> : <XCircle className="w-5 h-5 mt-0.5" />}
            <div className="flex-1">
              <p className="font-medium">{connectionResult?.message}</p>
              
              {connectionResult?.details && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object?.entries(connectionResult?.details)?.map(([provider, result]) => (
                    <div key={provider} className={`flex items-center justify-between p-2 rounded border ${
                      result?.success ? 'bg-green-900/10 border-green-500/20' : 'bg-red-900/10 border-red-500/20'
                    }`}>
                      <span className="text-sm font-medium capitalize">{provider?.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          result?.success ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className="text-xs">
                          {result?.success ? `${result?.responseTime || 'N/A'}ms` : 'Failed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Provider List with Enhanced Information */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          Available Financial Data Providers ({providers?.length})
        </h3>
        
        {providers?.map(provider => {
          const details = providerDetails?.[provider?.api_name] || {};
          const status = getProviderStatus(provider);
          const StatusIcon = status?.icon;
          
          return (
            <div
              key={provider?.id}
              onClick={() => handleProviderSelect(provider)}
              className={`p-5 rounded-lg border cursor-pointer transition-all hover:shadow-lg ${
                selectedProvider?.id === provider?.id
                  ? 'border-blue-500 bg-blue-900/20 shadow-lg ring-1 ring-blue-500/20' 
                  : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <StatusIcon className={`w-6 h-6 ${status?.color}`} />
                  <div>
                    <h4 className="font-semibold text-lg">{details?.name || provider?.api_name}</h4>
                    <p className="text-sm text-gray-400 max-w-lg">{details?.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                      status?.status === 'configured' ? 'bg-green-900/50 text-green-300 border border-green-500/30' 
                        : status?.status === 'inactive'? 'bg-gray-700 text-gray-400' :'bg-orange-900/50 text-orange-300 border border-orange-500/30'
                    }`}>
                      {status?.status === 'configured' ? '✓ READY' : 
                       status?.status === 'inactive' ? '○ INACTIVE' : '⚠ SETUP REQUIRED'}
                    </span>
                    {details?.website && (
                      <a
                        href={details?.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e?.stopPropagation()}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Get API Key"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{provider?.rate_limit_per_minute} calls/min</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Features Display */}
              {details?.features && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {details?.features?.slice(0, 4)?.map(feature => (
                      <span
                        key={feature}
                        className="px-2 py-1 bg-gray-600/60 text-xs rounded-md text-gray-300 border border-gray-600/50"
                      >
                        {feature}
                      </span>
                    ))}
                    {details?.features?.length > 4 && (
                      <span className="px-2 py-1 text-xs text-gray-400">
                        +{details?.features?.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing Information */}
              {details?.pricing && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {Object?.entries(details?.pricing)?.map(([tier, info]) => (
                    <div key={tier} className="bg-gray-700/30 rounded p-2">
                      <div className="font-medium text-gray-300 capitalize mb-1">{tier}</div>
                      <div className="text-gray-400">
                        {info?.price && <div className="text-blue-400 font-medium">{info?.price}</div>}
                        <div>{info?.calls}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Enhanced Configuration Form */}
      {selectedProvider && (
        <div className="border-t border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-500" />
              Configure {providerDetails?.[selectedProvider?.api_name]?.name || selectedProvider?.api_name}
            </h3>
            
            <button
              onClick={testConnection}
              disabled={testingConnection || !selectedProvider?.api_key_encrypted}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              {testingConnection ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Test Connection
                </>
              )}
            </button>
          </div>

          {/* Detailed Setup Instructions */}
          {providerDetails?.[selectedProvider?.api_name]?.instructions && (
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-300 mb-2">📋 Step-by-step setup guide:</h4>
                  <p className="text-sm text-gray-300 mb-3">{providerDetails?.[selectedProvider?.api_name]?.instructions}</p>
                  
                  <div className="bg-blue-900/30 rounded p-3">
                    <p className="text-xs text-blue-200 mb-1">Expected format:</p>
                    <code className="text-xs text-blue-100 font-mono">{providerDetails?.[selectedProvider?.api_name]?.keyFormat}</code>
                  </div>
                  
                  {providerDetails?.[selectedProvider?.api_name]?.testEndpoint && (
                    <div className="mt-3 text-xs text-gray-400">
                      Test endpoint: <code className="text-gray-300">{providerDetails?.[selectedProvider?.api_name]?.testEndpoint}</code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Enhanced API Key Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <span className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Key
                  <span className="text-red-400">*</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e?.target?.value)}
                  placeholder={selectedProvider?.api_key_encrypted ? 
                    'API key configured securely (enter new key to update)' : 
                    'Paste your API key here'}
                  className={`w-full bg-gray-700 border rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-colors ${
                    apiKeyValidation && !apiKeyValidation?.valid ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Enhanced Status Messages */}
              {selectedProvider?.api_key_encrypted ? (
                <div className="text-xs text-green-400 mt-2 flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  <span>API key is securely stored and encrypted</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              ) : (
                <div className="text-xs text-orange-400 mt-2 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" />
                  <span>No API key configured - provider will not work without a valid key</span>
                </div>
              )}
              
              {/* API Key Validation Feedback */}
              {apiKeyValidation && !apiKeyValidation?.valid && (
                <div className="text-xs text-red-400 mt-1 flex items-center gap-2">
                  <XCircle className="w-3 h-3" />
                  <span>{apiKeyValidation?.message}</span>
                </div>
              )}
            </div>

            {/* Enhanced Rate Limit Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Rate Limit (calls per minute)
                </span>
              </label>
              <input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(e?.target?.value)}
                min="1"
                max="1000"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="mt-2 text-xs space-y-1">
                <p className="text-gray-400">
                  <span className="font-medium">Recommended:</span> {providerDetails?.[selectedProvider?.api_name]?.defaultRateLimit} calls/min
                </p>
                <div className="flex items-center gap-2 text-yellow-400">
                  <DollarSign className="w-3 h-3" />
                  <span>Free tier limits are typically lower - check your provider's plan details</span>
                </div>
              </div>
            </div>

            {/* Enhanced Provider Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Status */}
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedProvider?.is_active ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  Provider Status
                </h4>
                <p className="text-sm text-gray-400 mb-2">
                  {selectedProvider?.is_active ? 'Active and available for use' : 'Inactive - not being used'}
                </p>
                <div className="text-xs text-gray-500">
                  Last updated: {selectedProvider?.updated_at ? 
                    new Date(selectedProvider?.updated_at)?.toLocaleString() : 'Never'}
                </div>
              </div>
              
              {/* Usage Statistics */}
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Usage Statistics
                </h4>
                <p className="text-sm text-gray-400 mb-1">
                  <span className="font-medium text-white">{selectedProvider?.total_calls_today || 0}</span> calls made today
                </p>
                <div className="text-xs text-gray-500">
                  Last successful call: {selectedProvider?.last_successful_call ? 
                    new Date(selectedProvider?.last_successful_call)?.toLocaleString() : 'Never'}
                </div>
              </div>
            </div>

            {/* API Base URL (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Base URL (Read-only)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedProvider?.base_url || ''}
                  readOnly
                  className="w-full bg-gray-600 border border-gray-600 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed text-sm font-mono"
                />
                <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>

            {/* Enhanced Save Button */}
            <button
              onClick={handleSaveConfiguration}
              disabled={saving || (!apiKey?.trim() && rateLimit === selectedProvider?.rate_limit_per_minute?.toString()) || (apiKeyValidation && !apiKeyValidation?.valid)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-6 py-4 rounded-lg flex items-center justify-center gap-3 transition-all font-semibold shadow-lg disabled:shadow-none"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Configuration & Test Connection</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiProviderSetupPanel;