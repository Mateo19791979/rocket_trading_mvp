import React, { useState, useEffect } from 'react';
import { 
  Key, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Copy,
  ExternalLink,
  Server
} from 'lucide-react';

export default function ApiKeysConfigurationPanel({ onProgressUpdate, onSystemStatusUpdate }) {
  const [apiKeys, setApiKeys] = useState({
    finnhub_api: '',
    alpha_api: '',
    twelve_api: ''
  });
  
  const [keyVisibility, setKeyVisibility] = useState({
    finnhub_api: false,
    alpha_api: false,
    twelve_api: false
  });
  
  const [testResults, setTestResults] = useState({
    finnhub_api: null,
    alpha_api: null,
    twelve_api: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const providers = [
    {
      key: 'finnhub_api',
      name: 'Finnhub API',
      description: 'Real-time stock prices, company news, and market data',
      placeholder: 'Enter your Finnhub API key...',
      testEndpoint: 'https://finnhub.io/api/v1/quote?symbol=AAPL',
      rateLimit: '60 calls/minute',
      websiteUrl: 'https://finnhub.io/'
    },
    {
      key: 'alpha_api', 
      name: 'Alpha Vantage API',
      description: 'Historical data, technical indicators, and fundamental data',
      placeholder: 'Enter your Alpha Vantage API key...',
      testEndpoint: 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL',
      rateLimit: '5 calls/minute',
      websiteUrl: 'https://www.alphavantage.co/'
    },
    {
      key: 'twelve_api',
      name: 'TwelveData API', 
      description: 'Global market data for stocks, forex, and cryptocurrencies',
      placeholder: 'Enter your TwelveData API key...',
      testEndpoint: 'https://api.twelvedata.com/quote?symbol=AAPL',
      rateLimit: '8 calls/minute',
      websiteUrl: 'https://twelvedata.com/'
    }
  ];

  useEffect(() => {
    loadExistingKeys();
  }, []);

  const loadExistingKeys = async () => {
    try {
      setIsLoading(true);
      
      // Simulated API call to load existing keys from providers table
      const response = await fetch('/api/providers/default', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response?.ok) {
        const data = await response?.json();
        setApiKeys({
          finnhub_api: data?.finnhub_api || '',
          alpha_api: data?.alpha_api || '',
          twelve_api: data?.twelve_api || ''
        });
      }
      
      // Test existing keys if they exist
      await testAllProviders();
    } catch (error) {
      console.log('Loading keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyChange = (providerKey, value) => {
    setApiKeys(prev => ({
      ...prev,
      [providerKey]: value
    }));
    
    // Clear test result when key changes
    setTestResults(prev => ({
      ...prev,
      [providerKey]: null
    }));
  };

  const toggleKeyVisibility = (providerKey) => {
    setKeyVisibility(prev => ({
      ...prev,
      [providerKey]: !prev?.[providerKey]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  const testSingleProvider = async (providerKey) => {
    if (!apiKeys?.[providerKey]) return;
    
    try {
      setTestResults(prev => ({ ...prev, [providerKey]: 'testing' }));
      
      const provider = providers?.find(p => p?.key === providerKey);
      const testUrl = `${provider?.testEndpoint}&apikey=${apiKeys?.[providerKey]}`;
      
      // Simulated API test call
      const response = await fetch(`/api/providers/test/${providerKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          api_key: apiKeys?.[providerKey],
          test_endpoint: testUrl
        })
      });

      const result = await response?.json();
      
      setTestResults(prev => ({
        ...prev,
        [providerKey]: result?.success ? 'success' : 'error'
      }));
      
      return result?.success;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [providerKey]: 'error'
      }));
      return false;
    }
  };

  const testAllProviders = async () => {
    setIsTesting(true);
    const results = [];
    
    for (const provider of providers) {
      if (apiKeys?.[provider?.key]) {
        const success = await testSingleProvider(provider?.key);
        results?.push(success);
      }
    }
    
    const healthyCount = results?.filter(Boolean)?.length;
    const totalConfigured = results?.length;
    
    // Update parent component with status
    onSystemStatusUpdate(prev => ({
      ...prev,
      providers: { count: totalConfigured, healthy: healthyCount }
    }));
    
    // Calculate progress (need at least 2 healthy providers)
    const progress = healthyCount >= 2 ? 100 : (healthyCount / 2) * 100;
    const status = healthyCount >= 2 ? 'completed' : healthyCount > 0 ? 'in-progress' : 'pending';
    
    onProgressUpdate(progress, status);
    setIsTesting(false);
  };

  const saveConfiguration = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/providers/default', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(apiKeys)
      });

      if (response?.ok) {
        await testAllProviders();
      }
    } catch (error) {
      console.log('Saving configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTestStatusIcon = (status) => {
    switch (status) {
      case 'testing':
        return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Server className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTestStatusColor = (status) => {
    switch (status) {
      case 'testing':
        return 'border-blue-400/50 bg-blue-400/10';
      case 'success':
        return 'border-green-400/50 bg-green-400/10';
      case 'error':
        return 'border-red-400/50 bg-red-400/10';
      default:
        return 'border-gray-600 bg-gray-800/30';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-400" />
          Stage 1: Configuration des Clés API Providers
        </h2>
        <div className="flex gap-2">
          <button
            onClick={testAllProviders}
            disabled={isTesting}
            className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-400/50 rounded-lg hover:bg-blue-600/30 disabled:opacity-50 flex items-center gap-2"
          >
            {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Test All
          </button>
          <button
            onClick={saveConfiguration}
            disabled={isLoading}
            className="px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-400/50 rounded-lg hover:bg-emerald-600/30 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Config'}
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {providers?.map((provider) => (
          <div 
            key={provider?.key}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              getTestStatusColor(testResults?.[provider?.key])
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-medium text-white">{provider?.name}</h3>
                  <a 
                    href={provider?.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-sm text-gray-400">{provider?.description}</p>
                <p className="text-xs text-gray-500 mt-1">Rate limit: {provider?.rateLimit}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {getTestStatusIcon(testResults?.[provider?.key])}
                <span className="text-sm text-gray-400">
                  {testResults?.[provider?.key] === 'testing' && 'Testing...'}
                  {testResults?.[provider?.key] === 'success' && 'Healthy'}
                  {testResults?.[provider?.key] === 'error' && 'Failed'}
                  {!testResults?.[provider?.key] && 'Not tested'}
                </span>
              </div>
            </div>

            <div className="relative">
              <input
                type={keyVisibility?.[provider?.key] ? 'text' : 'password'}
                value={apiKeys?.[provider?.key]}
                onChange={(e) => handleKeyChange(provider?.key, e?.target?.value)}
                placeholder={provider?.placeholder}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none pr-20"
              />
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  onClick={() => toggleKeyVisibility(provider?.key)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  {keyVisibility?.[provider?.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                
                {apiKeys?.[provider?.key] && (
                  <button
                    onClick={() => copyToClipboard(apiKeys?.[provider?.key])}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={() => testSingleProvider(provider?.key)}
                  disabled={!apiKeys?.[provider?.key] || testResults?.[provider?.key] === 'testing'}
                  className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${testResults?.[provider?.key] === 'testing' ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Progress Summary */}
      <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Configuration Progress</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Clés configurées:</span>
            <span className="text-white">{Object.values(apiKeys)?.filter(key => key?.length > 0)?.length}/3</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Providers healthy:</span>
            <span className={`${
              Object.values(testResults)?.filter(status => status === 'success')?.length >= 2 
                ? 'text-green-400' : 'text-red-400'
            }`}>
              {Object.values(testResults)?.filter(status => status === 'success')?.length}/3
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Status requirement:</span>
            <span className={`${
              Object.values(testResults)?.filter(status => status === 'success')?.length >= 2 
                ? 'text-green-400' : 'text-orange-400'
            }`}>
              {Object.values(testResults)?.filter(status => status === 'success')?.length >= 2 ? '✅ Ready' : '⏳ Need ≥2 healthy'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}