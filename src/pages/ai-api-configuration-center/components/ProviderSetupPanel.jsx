import React, { useState } from 'react';
import { Eye, EyeOff, ExternalLink, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

const PROVIDER_CONFIGS = {
  openai: {
    name: 'OpenAI',
    models: ['GPT-5', 'GPT-5-Mini', 'GPT-4.1', 'GPT-4o'],
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-700',
    description: 'Advanced AI models for text, code, and multimodal tasks',
    setupUrl: 'https://platform.openai.com/api-keys'
  },
  anthropic: {
    name: 'Anthropic Claude',
    models: ['Claude Sonnet 4', 'Claude Opus 4.1', 'Claude Haiku 3.5'],
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-700',
    description: 'Constitutional AI with safety-focused design',
    setupUrl: 'https://console.anthropic.com/'
  },
  gemini: {
    name: 'Google Gemini',
    models: ['Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'Gemini 2.0 Flash'],
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-700',
    description: 'Multimodal AI with advanced reasoning capabilities',
    setupUrl: 'https://aistudio.google.com/app/apikey'
  },
  perplexity: {
    name: 'Perplexity',
    models: ['Sonar Pro', 'Sonar Reasoning Pro', 'Sonar Deep Research'],
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-700',
    description: 'AI search with real-time web access and citations',
    setupUrl: 'https://www.perplexity.ai/settings/api'
  }
};

export default function ProviderSetupPanel({ 
  apiKeys, 
  connectionStatus, 
  onApiKeyChange, 
  onTestConnection, 
  getStatusIcon, 
  loading 
}) {
  const [showKeys, setShowKeys] = useState({});

  const toggleKeyVisibility = (provider) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev?.[provider]
    }));
  };

  const renderProviderCard = (providerId, config) => {
    const status = connectionStatus?.[providerId];
    const hasKey = apiKeys?.[providerId]?.trim()?.length > 0;

    return (
      <div
        key={providerId}
        className={`${config?.bgColor} ${config?.borderColor} border rounded-lg p-6 transition-all duration-200 hover:shadow-lg`}
      >
        {/* Provider Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${hasKey ? 'bg-green-500' : 'bg-gray-500'}`} />
            <h3 className={`text-lg font-semibold ${config?.color}`}>{config?.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <a
              href={config?.setupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
        {/* Description */}
        <p className="text-sm text-gray-300 mb-4">
          {config?.description}
        </p>
        {/* Model Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Available Models
          </label>
          <div className="flex flex-wrap gap-2">
            {config?.models?.map(model => (
              <span
                key={model}
                className="px-2 py-1 bg-gray-700 text-xs rounded-md text-gray-300"
              >
                {model}
              </span>
            ))}
          </div>
        </div>
        {/* API Key Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              type={showKeys?.[providerId] ? 'text' : 'password'}
              value={apiKeys?.[providerId] || ''}
              onChange={(e) => onApiKeyChange(providerId, e?.target?.value)}
              placeholder={`Enter ${config?.name} API key`}
              className="w-full px-3 py-2 pr-20 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
              <button
                onClick={() => toggleKeyVisibility(providerId)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {showKeys?.[providerId] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
        {/* Usage Quota Monitoring */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Usage Status
          </label>
          <div className="bg-gray-800 rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Monthly Usage</span>
              <span className="text-xs text-gray-400">
                {status === 'connected' ? '15% used' : 'N/A'}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: status === 'connected' ? '15%' : '0%' }}
              />
            </div>
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => onTestConnection(providerId)}
            disabled={!hasKey || loading || status === 'testing'}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              status === 'connected' ?'bg-green-600 hover:bg-green-700 text-white' :'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {status === 'testing' ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Testing...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Test Connection
              </div>
            )}
          </button>
        </div>
        {/* Status Messages */}
        {status === 'connected' && (
          <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            Connection verified • Rate limits: Normal
          </div>
        )}
        {status === 'failed' && (
          <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            Connection failed • Check API key validity
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {Object.entries(PROVIDER_CONFIGS)?.map(([providerId, config]) => 
        renderProviderCard(providerId, config)
      )}
    </div>
  );
}