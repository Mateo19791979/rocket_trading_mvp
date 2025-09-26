import React, { useState } from 'react';
import { Brain, Target, Shield, FileCode, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const StrategyExtractionPanel = ({ strategyExtractions, processingJobs, onRefresh }) => {
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [expandedYaml, setExpandedYaml] = useState({});

  const toggleYamlExpansion = (id) => {
    setExpandedYaml(prev => ({
      ...prev,
      [id]: !prev?.[id]
    }));
  };

  const getExtractionTypeColor = (type) => {
    switch (type) {
      case 'buy':
        return 'bg-green-500 text-white';
      case 'sell':
        return 'bg-red-500 text-white';
      case 'alloc':
        return 'bg-blue-500 text-white';
      case 'risk':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const agents = [
    {
      name: 'Knowledge Miner',
      type: 'knowledge_miner',
      description: 'BUY/SELL/ALLOC/RISK, paramètres',
      specialization: ['momentum', 'trend_following'],
      icon: Brain,
      color: 'text-green-400',
      status: 'active',
      performance: '87% accuracy'
    },
    {
      name: 'Normalizer',
      type: 'normalizer',
      description: 'fiches YAML (schema Registry)',
      specialization: ['yaml_generation', 'schema_validation'],
      icon: FileCode,
      color: 'text-blue-400',
      status: 'active',
      performance: '95% validation'
    },
    {
      name: 'Risk-Auditor',
      type: 'risk_auditor',
      description: 'contraintes (DD, vol, taille)',
      specialization: ['risk_analysis', 'constraint_validation'],
      icon: Shield,
      color: 'text-orange-400',
      status: 'active',
      performance: '92% detection'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Strategy Extraction Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - AI Agents */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-400" />
            🧩 Extraction de stratégies (agents)
          </h3>
          
          <div className="space-y-3">
            {agents?.map((agent) => {
              const Icon = agent?.icon;
              return (
                <div key={agent?.type} className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-700/50 rounded-lg">
                      <Icon className={`w-5 h-5 ${agent?.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-md font-medium text-white">{agent?.name}</h4>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${agent?.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                          <span className="text-xs text-gray-400 capitalize">{agent?.status}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{agent?.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {agent?.specialization?.map((spec) => (
                            <span 
                              key={spec} 
                              className="px-2 py-1 bg-gray-700/50 text-xs text-gray-300 rounded"
                            >
                              {spec?.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-green-400 font-medium">{agent?.performance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Recent Extractions */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Recent Strategy Extractions
          </h4>
          
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {strategyExtractions?.length > 0 ? strategyExtractions?.slice(0, 10)?.map((extraction) => (
                <div 
                  key={extraction?.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedStrategy?.id === extraction?.id
                      ? 'bg-blue-600/20 border-blue-500' :'bg-gray-700/30 border-gray-600 hover:bg-gray-600/30'
                  }`}
                  onClick={() => setSelectedStrategy(extraction)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getExtractionTypeColor(extraction?.extraction_type)}`}>
                        {extraction?.extraction_type?.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {extraction?.strategy_name}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${getConfidenceColor(extraction?.confidence_score)}`}>
                      {(extraction?.confidence_score * 100)?.toFixed(1)}%
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                    {extraction?.strategy_description}
                  </p>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>From: {extraction?.book_library?.title || 'Unknown Book'}</span>
                    <span>{extraction?.source_chapter}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No strategy extractions found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Selected Strategy Details */}
      {selectedStrategy && (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Strategy Details</h4>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-sm font-medium rounded ${getExtractionTypeColor(selectedStrategy?.extraction_type)}`}>
                {selectedStrategy?.extraction_type?.toUpperCase()}
              </span>
              <span className={`text-lg font-bold ${getConfidenceColor(selectedStrategy?.confidence_score)}`}>
                {(selectedStrategy?.confidence_score * 100)?.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-gray-400 mb-2">Strategy Information</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{selectedStrategy?.strategy_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize">{selectedStrategy?.extraction_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Source:</span>
                    <span className="text-white">{selectedStrategy?.source_chapter}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pages:</span>
                    <span className="text-white">{selectedStrategy?.source_page_range || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-400 mb-2">Description</h5>
                <p className="text-sm text-white bg-gray-700/30 p-3 rounded-lg">
                  {selectedStrategy?.strategy_description}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-gray-400 mb-2">Parameters</h5>
                <pre className="text-xs text-white bg-gray-900/50 p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(selectedStrategy?.parameters, null, 2)}
                </pre>
              </div>

              {selectedStrategy?.yaml_output && (
                <div>
                  <button 
                    onClick={() => toggleYamlExpansion(selectedStrategy?.id)}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2 hover:text-white transition-colors"
                  >
                    {expandedYaml?.[selectedStrategy?.id] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span>YAML Output</span>
                  </button>
                  
                  {expandedYaml?.[selectedStrategy?.id] && (
                    <pre className="text-xs text-green-400 bg-gray-900/50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                      {selectedStrategy?.yaml_output}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyExtractionPanel;