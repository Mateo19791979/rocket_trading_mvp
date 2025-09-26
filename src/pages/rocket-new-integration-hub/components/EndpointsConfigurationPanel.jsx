import React, { useState } from 'react';
import { Plug, Copy, CheckCircle, AlertCircle, Globe, Clock } from 'lucide-react';

const EndpointsConfigurationPanel = () => {
  const [testStatus, setTestStatus] = useState({});
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);

  const endpoints = [
    {
      url: 'https://api.trading-mvp.com/registry',
      description: 'Catalogue des stratégies disponibles',
      method: 'GET',
      cors: true
    },
    {
      url: 'https://api.trading-mvp.com/scores?window=252',
      description: 'Scores de performance (252 jours)',
      method: 'GET',
      cors: true
    },
    {
      url: 'https://api.trading-mvp.com/select',
      description: 'Sélection de stratégies optimales',
      method: 'POST',
      cors: true
    },
    {
      url: 'https://api.trading-mvp.com/allocate',
      description: 'Allocation de capital par stratégie',
      method: 'POST',
      cors: true
    },
    {
      url: 'https://api.trading-mvp.com/status',
      description: 'Statut en temps réel des services',
      method: 'GET',
      cors: true
    }
  ];

  const copyEndpoint = async (url) => {
    try {
      await navigator.clipboard?.writeText(url);
      setCopiedEndpoint(url);
      setTimeout(() => setCopiedEndpoint(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const testEndpoint = async (endpoint) => {
    setTestStatus(prev => ({ ...prev, [endpoint?.url]: 'testing' }));
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTestStatus(prev => ({ ...prev, [endpoint?.url]: 'success' }));
      setTimeout(() => {
        setTestStatus(prev => ({ ...prev, [endpoint?.url]: null }));
      }, 3000);
    } catch (error) {
      setTestStatus(prev => ({ ...prev, [endpoint?.url]: 'error' }));
    }
  };

  const getStatusIcon = (url) => {
    const status = testStatus?.[url];
    switch (status) {
      case 'testing': return <Clock className="w-4 h-4 text-orange-400 animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-teal-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Globe className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-lg mr-4">
          <Plug className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">🔌 Endpoints à pointer</h3>
      </div>
      <div className="space-y-4">
        {endpoints?.map((endpoint, index) => (
          <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 bg-teal-400 rounded-full mr-3"></span>
                <div>
                  <p className="text-white font-medium">• {endpoint?.url}</p>
                  <p className="text-sm text-gray-300">{endpoint?.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  endpoint?.method === 'GET' ?'bg-teal-500/20 text-teal-300 border border-teal-400/30' :'bg-orange-500/20 text-orange-300 border border-orange-400/30'
                }`}>
                  {endpoint?.method}
                </span>
                
                {endpoint?.cors && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 border border-green-400/30 rounded-full text-xs font-medium">
                    CORS OK
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="font-mono text-sm text-gray-300 bg-black/20 px-3 py-1 rounded flex-1 mr-3">
                {endpoint?.url}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => testEndpoint(endpoint)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  title="Tester l'endpoint"
                >
                  {getStatusIcon(endpoint?.url)}
                </button>
                
                <button
                  onClick={() => copyEndpoint(endpoint?.url)}
                  className={`p-2 rounded-lg transition-colors ${
                    copiedEndpoint === endpoint?.url 
                      ? 'text-teal-300 bg-teal-500/20' :'text-white hover:bg-white/20'
                  }`}
                  title="Copier l'URL"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-white mb-2">🔒 Sécurité</h4>
            <p className="text-sm text-gray-300">HTTPS uniquement • CORS configuré</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">⚡ Performance</h4>
            <p className="text-sm text-gray-300">Latence &lt; 300ms • Rate limit appliqué</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndpointsConfigurationPanel;