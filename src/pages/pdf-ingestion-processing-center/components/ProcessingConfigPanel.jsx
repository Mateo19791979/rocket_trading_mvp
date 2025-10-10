import React, { useState } from 'react';
import { 
  Settings, 
  Sliders, 
  Brain, 
  Filter,
  Save,
  RotateCcw
} from 'lucide-react';

export default function ProcessingConfigPanel() {
  const [config, setConfig] = useState({
    chunkSize: 1000,
    chunkOverlap: 200,
    embeddingModel: 'text-embedding-3-small',
    contentFiltering: true,
    technicalRelevance: 85,
    language: 'auto',
    domains: ['QuantOracle', 'StrategyWeaver', 'DataPhoenix', 'Deployer'],
    batchSize: 32,
    rateLimitDelay: 100
  });

  const [presets, setPresets] = useState([
    {
      name: 'High Precision',
      description: 'Smaller chunks, high overlap for detailed analysis',
      config: {
        chunkSize: 800,
        chunkOverlap: 300,
        technicalRelevance: 95,
        batchSize: 16
      }
    },
    {
      name: 'Balanced',
      description: 'Default settings for most technical documents',
      config: {
        chunkSize: 1000,
        chunkOverlap: 200,
        technicalRelevance: 85,
        batchSize: 32
      }
    },
    {
      name: 'Fast Processing',
      description: 'Larger chunks, minimal overlap for speed',
      config: {
        chunkSize: 1500,
        chunkOverlap: 100,
        technicalRelevance: 75,
        batchSize: 64
      }
    }
  ]);

  const embeddingModels = [
    { value: 'text-embedding-3-small', label: 'OpenAI text-embedding-3-small (1536D)', cost: 'Low' },
    { value: 'text-embedding-3-large', label: 'OpenAI text-embedding-3-large (3072D)', cost: 'High' },
    { value: 'text-embedding-ada-002', label: 'OpenAI text-embedding-ada-002 (Legacy)', cost: 'Medium' }
  ];

  const availableDomains = [
    'QuantOracle',
    'StrategyWeaver', 
    'DataPhoenix',
    'Deployer',
    'Telemetry',
    'ImmuneSentinel',
    'ComplianceGuard',
    'KillSwitch'
  ];

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleDomainToggle = (domain) => {
    setConfig(prev => ({
      ...prev,
      domains: prev?.domains?.includes(domain)
        ? prev?.domains?.filter(d => d !== domain)
        : [...prev?.domains, domain]
    }));
  };

  const applyPreset = (preset) => {
    setConfig(prev => ({ ...prev, ...preset?.config }));
  };

  const resetToDefaults = () => {
    const defaultConfig = presets?.find(p => p?.name === 'Balanced');
    if (defaultConfig) {
      applyPreset(defaultConfig);
    }
  };

  const saveConfig = () => {
    // In a real implementation, this would save to localStorage or backend
    localStorage.setItem('ragProcessingConfig', JSON.stringify(config));
    // Show success message
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Settings className="h-5 w-5 text-teal-400" />
          <h3 className="text-lg font-semibold">Processing Configuration</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={resetToDefaults}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Reset to defaults"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={saveConfig}
            className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors"
            title="Save configuration"
          >
            <Save className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* Configuration Presets */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Presets:</h4>
        <div className="grid grid-cols-1 gap-2">
          {presets?.map((preset, index) => (
            <button
              key={index}
              onClick={() => applyPreset(preset)}
              className="text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="font-medium text-white">{preset?.name}</div>
              <div className="text-sm text-gray-400">{preset?.description}</div>
            </button>
          ))}
        </div>
      </div>
      {/* Chunking Parameters */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Sliders className="h-4 w-4 text-gray-400" />
          <h4 className="text-sm font-medium text-gray-300">Chunking Parameters</h4>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Chunk Size: {config?.chunkSize} tokens
            </label>
            <input
              type="range"
              min="500"
              max="2000"
              step="100"
              value={config?.chunkSize}
              onChange={(e) => handleConfigChange('chunkSize', parseInt(e?.target?.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>500</span>
              <span>1250</span>
              <span>2000</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Chunk Overlap: {config?.chunkOverlap} tokens
            </label>
            <input
              type="range"
              min="50"
              max="500"
              step="25"
              value={config?.chunkOverlap}
              onChange={(e) => handleConfigChange('chunkOverlap', parseInt(e?.target?.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50</span>
              <span>275</span>
              <span>500</span>
            </div>
          </div>
        </div>
      </div>
      {/* Embedding Model Selection */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Brain className="h-4 w-4 text-gray-400" />
          <h4 className="text-sm font-medium text-gray-300">Embedding Model</h4>
        </div>
        
        <div className="space-y-2">
          {embeddingModels?.map((model) => (
            <label key={model?.value} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600">
              <input
                type="radio"
                name="embeddingModel"
                value={model?.value}
                checked={config?.embeddingModel === model?.value}
                onChange={(e) => handleConfigChange('embeddingModel', e?.target?.value)}
                className="text-teal-500"
              />
              <div className="flex-1">
                <div className="text-sm text-white">{model?.label}</div>
                <div className="text-xs text-gray-400">Cost: {model?.cost}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      {/* Content Filtering */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <h4 className="text-sm font-medium text-gray-300">Content Filtering</h4>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={config?.contentFiltering}
              onChange={(e) => handleConfigChange('contentFiltering', e?.target?.checked)}
              className="rounded border-gray-600 text-teal-500 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-300">Enable technical relevance filtering</span>
          </label>
          
          {config?.contentFiltering && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Technical Relevance Threshold: {config?.technicalRelevance}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={config?.technicalRelevance}
                onChange={(e) => handleConfigChange('technicalRelevance', parseInt(e?.target?.value))}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
      {/* Agent Domain Assignment */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Default Agent Domains</h4>
        <div className="grid grid-cols-2 gap-2">
          {availableDomains?.map((domain) => (
            <label key={domain} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config?.domains?.includes(domain)}
                onChange={() => handleDomainToggle(domain)}
                className="rounded border-gray-600 text-teal-500 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-300">{domain}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Processing Parameters */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Processing Parameters</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Batch Size</label>
            <select
              value={config?.batchSize}
              onChange={(e) => handleConfigChange('batchSize', parseInt(e?.target?.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value={16}>16 (Conservative)</option>
              <option value={32}>32 (Balanced)</option>
              <option value={64}>64 (Fast)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Rate Limit (ms)</label>
            <input
              type="number"
              min="0"
              max="1000"
              step="50"
              value={config?.rateLimitDelay}
              onChange={(e) => handleConfigChange('rateLimitDelay', parseInt(e?.target?.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>
      {/* Configuration Summary */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Current Configuration:</h4>
        <div className="text-xs text-gray-400 space-y-1">
          <p>Chunks: {config?.chunkSize} tokens with {config?.chunkOverlap} overlap</p>
          <p>Model: {config?.embeddingModel}</p>
          <p>Domains: {config?.domains?.length} selected</p>
          <p>Batch processing: {config?.batchSize} chunks per batch</p>
        </div>
      </div>
    </div>
  );
}