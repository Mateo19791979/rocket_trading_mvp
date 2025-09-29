import React, { useState, useEffect } from 'react';
import { Settings, Cpu, Languages, Filter, Sliders, Save, RefreshCw, Eye } from 'lucide-react';

const ProcessingConfigurationPanel = ({ systemHealth }) => {
  const [config, setConfig] = useState({
    ocr: {
      quality: 'high',
      language: ['en', 'fr'],
      dpi: 300,
      preprocessing: true
    },
    textChunking: {
      algorithm: 'semantic',
      maxTokens: 512,
      overlapTokens: 50,
      preserveStructure: true
    },
    languageDetection: {
      enabled: true,
      confidence: 0.8,
      fallback: 'en',
      multiLingual: true
    },
    contentFiltering: {
      derivatives: true,
      options: true,
      forex: false,
      commodities: false,
      minimumRelevance: 0.7
    }
  });

  const [isDirty, setIsDirty] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    // Load configuration from service or localStorage
    const savedConfig = localStorage.getItem('processingConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to load saved configuration:', error);
      }
    }
  }, []);

  const updateConfig = (section, key, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev?.[section],
        [key]: value
      }
    }));
    setIsDirty(true);
  };

  const updateLanguage = (language, add) => {
    setConfig(prev => ({
      ...prev,
      ocr: {
        ...prev?.ocr,
        language: add 
          ? [...prev?.ocr?.language, language]
          : prev?.ocr?.language?.filter(lang => lang !== language)
      }
    }));
    setIsDirty(true);
  };

  const saveConfiguration = () => {
    try {
      localStorage.setItem('processingConfig', JSON.stringify(config));
      setIsDirty(false);
      
      // Here you would also send to the backend service
      // knowledgePipelineService.updateProcessingConfig(config);
      
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  };

  const resetToDefaults = () => {
    const defaultConfig = {
      ocr: {
        quality: 'high',
        language: ['en', 'fr'],
        dpi: 300,
        preprocessing: true
      },
      textChunking: {
        algorithm: 'semantic',
        maxTokens: 512,
        overlapTokens: 50,
        preserveStructure: true
      },
      languageDetection: {
        enabled: true,
        confidence: 0.8,
        fallback: 'en',
        multiLingual: true
      },
      contentFiltering: {
        derivatives: true,
        options: true,
        forex: false,
        commodities: false,
        minimumRelevance: 0.7
      }
    };
    
    setConfig(defaultConfig);
    setIsDirty(true);
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'low': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' }
  ];

  const algorithms = [
    { value: 'semantic', name: 'Semantic Chunking', description: 'AI-based semantic boundaries' },
    { value: 'fixed', name: 'Fixed Size', description: 'Fixed token size chunks' },
    { value: 'paragraph', name: 'Paragraph Based', description: 'Natural paragraph boundaries' },
    { value: 'sentence', name: 'Sentence Based', description: 'Sentence-level chunking' }
  ];

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Processing Configuration</h3>
              <p className="text-sm text-gray-400">Customizable extraction parameters and content filtering</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`p-2 rounded-md border transition-colors ${
                previewMode 
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10' :'border-gray-600 text-gray-400 hover:border-gray-500'
              }`}
            >
              <Eye className="h-4 w-4" />
            </button>
            
            {isDirty && (
              <button
                onClick={saveConfiguration}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* OCR Quality Settings */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Cpu className="h-4 w-4 text-blue-400" />
              <h4 className="text-sm font-medium text-white">OCR Quality Settings</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Quality Level</label>
                <select
                  value={config?.ocr?.quality}
                  onChange={(e) => updateConfig('ocr', 'quality', e?.target?.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low (Fast)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Accurate)</option>
                </select>
                <p className={`text-xs mt-1 ${getQualityColor(config?.ocr?.quality)}`}>
                  {config?.ocr?.quality === 'high' && 'Best accuracy, slower processing'}
                  {config?.ocr?.quality === 'medium' && 'Good balance of speed and accuracy'}
                  {config?.ocr?.quality === 'low' && 'Faster processing, lower accuracy'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">DPI Resolution</label>
                <select
                  value={config?.ocr?.dpi}
                  onChange={(e) => updateConfig('ocr', 'dpi', parseInt(e?.target?.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={150}>150 DPI (Low)</option>
                  <option value={300}>300 DPI (Standard)</option>
                  <option value={600}>600 DPI (High)</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config?.ocr?.preprocessing}
                  onChange={(e) => updateConfig('ocr', 'preprocessing', e?.target?.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-300">Enable image preprocessing</span>
              </label>
              <p className="text-xs text-gray-400 mt-1">Improves OCR accuracy on low-quality scans</p>
            </div>

            {/* Language Selection */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-400 mb-2">OCR Languages</label>
              <div className="grid grid-cols-3 gap-2">
                {languages?.map((lang) => (
                  <label key={lang?.code} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config?.ocr?.language?.includes(lang?.code)}
                      onChange={(e) => updateLanguage(lang?.code, e?.target?.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-300">
                      {lang?.flag} {lang?.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Text Chunking Algorithm */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Sliders className="h-4 w-4 text-green-400" />
              <h4 className="text-sm font-medium text-white">Text Chunking Algorithm</h4>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">Algorithm</label>
                <select
                  value={config?.textChunking?.algorithm}
                  onChange={(e) => updateConfig('textChunking', 'algorithm', e?.target?.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {algorithms?.map(algo => (
                    <option key={algo?.value} value={algo?.value}>
                      {algo?.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {algorithms?.find(a => a?.value === config?.textChunking?.algorithm)?.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Max Tokens: {config?.textChunking?.maxTokens}
                  </label>
                  <input
                    type="range"
                    min="128"
                    max="2048"
                    step="128"
                    value={config?.textChunking?.maxTokens}
                    onChange={(e) => updateConfig('textChunking', 'maxTokens', parseInt(e?.target?.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">
                    Overlap: {config?.textChunking?.overlapTokens}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="10"
                    value={config?.textChunking?.overlapTokens}
                    onChange={(e) => updateConfig('textChunking', 'overlapTokens', parseInt(e?.target?.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config?.textChunking?.preserveStructure}
                  onChange={(e) => updateConfig('textChunking', 'preserveStructure', e?.target?.checked)}
                  className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-300">Preserve document structure</span>
              </label>
            </div>
          </div>

          {/* Language Detection */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Languages className="h-4 w-4 text-purple-400" />
              <h4 className="text-sm font-medium text-white">Language Detection</h4>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config?.languageDetection?.enabled}
                  onChange={(e) => updateConfig('languageDetection', 'enabled', e?.target?.checked)}
                  className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-300">Enable automatic language detection</span>
              </label>

              {config?.languageDetection?.enabled && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      Confidence Threshold: {config?.languageDetection?.confidence}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="1.0"
                      step="0.1"
                      value={config?.languageDetection?.confidence}
                      onChange={(e) => updateConfig('languageDetection', 'confidence', parseFloat(e?.target?.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Fallback Language</label>
                    <select
                      value={config?.languageDetection?.fallback}
                      onChange={(e) => updateConfig('languageDetection', 'fallback', e?.target?.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {languages?.slice(0, 4)?.map(lang => (
                        <option key={lang?.code} value={lang?.code}>
                          {lang?.flag} {lang?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Filtering */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Filter className="h-4 w-4 text-orange-400" />
              <h4 className="text-sm font-medium text-white">Content Filtering</h4>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-400">Focus on specific financial instruments:</p>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(config?.contentFiltering)?.filter(([key]) => key !== 'minimumRelevance')?.map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => updateConfig('contentFiltering', key, e?.target?.checked)}
                      className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-300 capitalize">
                      {key === 'forex' ? 'Forex' : key}
                    </span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  Minimum Relevance: {config?.contentFiltering?.minimumRelevance}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={config?.contentFiltering?.minimumRelevance}
                  onChange={(e) => updateConfig('contentFiltering', 'minimumRelevance', parseFloat(e?.target?.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={resetToDefaults}
              className="inline-flex items-center px-4 py-2 border border-gray-600 text-gray-400 text-sm font-medium rounded-md hover:border-gray-500 hover:text-gray-300 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </button>

            {isDirty && (
              <button
                onClick={saveConfiguration}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingConfigurationPanel;