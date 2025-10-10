import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Key, Settings, Shield, Users, Zap, Database } from 'lucide-react';

// Component imports for the three-column layout
import ProviderSetupPanel from './components/ProviderSetupPanel';
import ConfigurationWizardPanel from './components/ConfigurationWizardPanel';
import SecurityManagementPanel from './components/SecurityManagementPanel';
import QuickSetupPanel from './components/QuickSetupPanel';

const AiApiConfigurationCenter = () => {
  const [activeTab, setActiveTab] = useState('quick-setup');
  const [activeView, setActiveView] = useState('overview');
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    gemini: '',
    perplexity: ''
  });
  const [connectionStatus, setConnectionStatus] = useState({
    openai: 'untested',
    anthropic: 'untested', 
    gemini: 'untested',
    perplexity: 'untested'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load API keys from environment variables on mount
  useEffect(() => {
    const envKeys = {
      openai: import.meta.env?.VITE_OPENAI_API_KEY || '',
      anthropic: import.meta.env?.VITE_ANTHROPIC_API_KEY || '',
      gemini: import.meta.env?.VITE_GEMINI_API_KEY || '',
      perplexity: import.meta.env?.VITE_PERPLEXITY_API_KEY || ''
    };
    setApiKeys(envKeys);
  }, []);

  const handleApiKeyChange = (provider, value) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  const testConnection = async (provider) => {
    setLoading(true);
    setConnectionStatus(prev => ({
      ...prev,
      [provider]: 'testing'
    }));

    try {
      // Mock connection test - in real app, you'd make actual API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success/failure randomly for demo
      const isSuccess = Math.random() > 0.3;
      
      setConnectionStatus(prev => ({
        ...prev,
        [provider]: isSuccess ? 'connected' : 'failed'
      }));
      
      if (isSuccess) {
        setSuccess(`${provider?.charAt(0)?.toUpperCase() + provider?.slice(1)} connection successful`);
      } else {
        setError(`${provider?.charAt(0)?.toUpperCase() + provider?.slice(1)} connection failed`);
      }
    } catch (err) {
      setConnectionStatus(prev => ({
        ...prev,
        [provider]: 'failed'
      }));
      setError(`Failed to test ${provider} connection: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAllConnections = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    const providers = Object.keys(apiKeys)?.filter(key => apiKeys?.[key]?.trim());
    
    for (const provider of providers) {
      await testConnection(provider);
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay between tests
    }
    
    setLoading(false);
    setSuccess('Bulk testing completed');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Key className="w-8 h-8 text-blue-400" />
                  AI API Configuration Center
                </h1>
                <p className="text-gray-300 mt-2">
                  Comprehensive API key management and provider setup for Rocket Trading MVP's AI services
                </p>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={testAllConnections}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  {loading ? 'Testing...' : 'Test All'}
                </button>
                <button
                  onClick={() => window.location?.reload()}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Status Messages */}
        {error && (
          <div className="max-w-7xl mx-auto px-6 py-2">
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="flex-1">
                <p className="text-red-200">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          </div>
        )}
        {success && (
          <div className="max-w-7xl mx-auto px-6 py-2">
            <div className="bg-green-900/50 border border-green-700 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <p className="text-green-200">{success}</p>
              </div>
              <button
                onClick={() => setSuccess('')}
                className="text-green-400 hover:text-green-300"
              >
                ×
              </button>
            </div>
          </div>
        )}
        {/* Main Content - Three Column Layout */}
        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg border border-gray-200 p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab('quick-setup')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'quick-setup' ?'bg-blue-100 text-blue-700' :'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Quick Setup
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('setup')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'setup' ?'bg-blue-100 text-blue-700' :'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Provider Setup
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('configuration')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'configuration' ?'bg-blue-100 text-blue-700' :'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Configuration Wizard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'security' ?'bg-blue-100 text-blue-700' :'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Security Management
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex-1">
            {activeTab === 'quick-setup' && <QuickSetupPanel />}
            {activeTab === 'setup' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="w-6 h-6 text-orange-400" />
                  <h2 className="text-xl font-semibold">Provider Setup</h2>
                </div>
                <ProviderSetupPanel
                  apiKeys={apiKeys}
                  connectionStatus={connectionStatus}
                  onApiKeyChange={handleApiKeyChange}
                  onTestConnection={testConnection}
                  getStatusIcon={getStatusIcon}
                  loading={loading}
                />
              </div>
            )}
            {activeTab === 'configuration' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-6 h-6 text-teal-400" />
                  <h2 className="text-xl font-semibold">Configuration Wizard</h2>
                </div>
                <ConfigurationWizardPanel
                  connectionStatus={connectionStatus}
                  apiKeys={apiKeys}
                />
              </div>
            )}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-semibold">Security Management</h2>
                </div>
                <SecurityManagementPanel
                  apiKeys={apiKeys}
                  connectionStatus={connectionStatus}
                />
              </div>
            )}
          </div>
        </div>
        {/* Footer Status Bar */}
        <div className="bg-gray-800 border-t border-gray-700 py-4">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {Object.values(connectionStatus)?.filter(status => status === 'connected')?.length} of {Object.keys(apiKeys)?.length} providers connected
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Last updated: {new Date()?.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiApiConfigurationCenter;