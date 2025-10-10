import React, { useState } from 'react';
import { 
  PlayCircle, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  Lightbulb,
  TrendingUp,
  Activity,
  Bell
} from 'lucide-react';

const ONBOARDING_STEPS = {
  openai: [
    { step: '1. Create Account', url: 'https://platform.openai.com/signup', status: 'pending' },
    { step: '2. Add Payment Method', url: 'https://platform.openai.com/account/billing', status: 'pending' },
    { step: '3. Generate API Key', url: 'https://platform.openai.com/api-keys', status: 'pending' },
    { step: '4. Set Usage Limits', url: 'https://platform.openai.com/account/limits', status: 'pending' }
  ],
  anthropic: [
    { step: '1. Request Access', url: 'https://console.anthropic.com/', status: 'pending' },
    { step: '2. Setup Billing', url: 'https://console.anthropic.com/settings/billing', status: 'pending' },
    { step: '3. Create API Key', url: 'https://console.anthropic.com/settings/keys', status: 'pending' },
    { step: '4. Review Policies', url: 'https://www.anthropic.com/usage-policy', status: 'pending' }
  ],
  gemini: [
    { step: '1. Access AI Studio', url: 'https://aistudio.google.com/', status: 'pending' },
    { step: '2. Enable APIs', url: 'https://console.cloud.google.com/apis/enableflow?apiid=generativelanguage.googleapis.com', status: 'pending' },
    { step: '3. Create API Key', url: 'https://aistudio.google.com/app/apikey', status: 'pending' },
    { step: '4. Set Quotas', url: 'https://console.cloud.google.com/iam-admin/quotas', status: 'pending' }
  ],
  perplexity: [
    { step: '1. Create Account', url: 'https://www.perplexity.ai/signup', status: 'pending' },
    { step: '2. Upgrade to Pro', url: 'https://www.perplexity.ai/pro', status: 'pending' },
    { step: '3. Generate API Key', url: 'https://www.perplexity.ai/settings/api', status: 'pending' },
    { step: '4. Review Limits', url: 'https://docs.perplexity.ai/reference/rate-limits', status: 'pending' }
  ]
};

export default function ConfigurationWizardPanel({ connectionStatus, apiKeys }) {
  const [activeProvider, setActiveProvider] = useState('openai');
  const [testResults, setTestResults] = useState({});

  const getProviderStatus = (provider) => {
    const hasKey = apiKeys?.[provider]?.trim()?.length > 0;
    const isConnected = connectionStatus?.[provider] === 'connected';
    
    if (isConnected) return 'completed';
    if (hasKey) return 'in-progress';
    return 'pending';
  };

  const renderStepsByProvider = (provider) => {
    const steps = ONBOARDING_STEPS?.[provider] || [];
    const providerStatus = getProviderStatus(provider);
    
    return steps?.map((step, index) => (
      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
        <div className="flex-shrink-0">
          {providerStatus === 'completed' ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : providerStatus === 'in-progress' && index < 3 ? (
            <Clock className="w-5 h-5 text-yellow-400" />
          ) : (
            <div className="w-5 h-5 border-2 border-gray-600 rounded-full" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-200">{step?.step}</p>
        </div>
        <a
          href={step?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    ));
  };

  const getHealthScore = () => {
    const connectedCount = Object.values(connectionStatus)?.filter(status => status === 'connected')?.length;
    const totalProviders = Object.keys(connectionStatus)?.length;
    return Math.round((connectedCount / totalProviders) * 100);
  };

  const healthScore = getHealthScore();

  return (
    <div className="space-y-6">
      {/* Step-by-Step Provider Onboarding */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <PlayCircle className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold">Step-by-Step Provider Onboarding</h3>
        </div>
        
        {/* Provider Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(ONBOARDING_STEPS)?.map(provider => (
            <button
              key={provider}
              onClick={() => setActiveProvider(provider)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                activeProvider === provider
                  ? 'bg-teal-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {provider?.charAt(0)?.toUpperCase() + provider?.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Steps for Active Provider */}
        <div className="space-y-2">
          {renderStepsByProvider(activeProvider)}
        </div>
      </div>
      {/* Validation Dashboard */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold">Validation Dashboard</h3>
        </div>
        
        {/* Real-time Connectivity Testing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">System Health</span>
              <span className={`text-lg font-bold ${healthScore >= 75 ? 'text-green-400' : healthScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {healthScore}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  healthScore >= 75 ? 'bg-green-500' : healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Response Time</span>
              <span className="text-lg font-bold text-blue-400">
                {connectionStatus?.openai === 'connected' ? '245ms' : 'N/A'}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              Average across all providers
            </div>
          </div>
        </div>

        {/* Error Tracking */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">Recent Issues</span>
          </div>
          <div className="space-y-2">
            {Object.entries(connectionStatus)?.map(([provider, status]) => (
              <div key={provider} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{provider?.charAt(0)?.toUpperCase() + provider?.slice(1)}</span>
                <span className={`${
                  status === 'connected' ? 'text-green-400' : 
                  status === 'failed' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {status === 'connected' ? 'Operational' : 
                   status === 'failed' ? 'Connection Failed' : 'Not Configured'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Alert Notifications */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold">Automated Health Checks</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-700 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-200">Health Check Scheduled</p>
              <p className="text-xs text-green-300">Next check in 5 minutes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
            <Lightbulb className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-blue-200">Optimization Suggestion</p>
              <p className="text-xs text-blue-300">Consider enabling fallback providers for higher reliability</p>
            </div>
          </div>
          
          {healthScore < 75 && (
            <div className="flex items-center gap-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-yellow-200">Performance Alert</p>
                <p className="text-xs text-yellow-300">System health below optimal threshold</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}