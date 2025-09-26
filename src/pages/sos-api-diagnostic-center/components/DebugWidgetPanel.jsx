import React, { useState, useEffect } from 'react';
import { Bug, Play, Download, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function DebugWidgetPanel({ apiBase }) {
  const [debugResults, setDebugResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const expectedFormats = {
    '/status': {
      description: 'Status minimal du système',
      example: {
        "backend": {"status": "OK"},
        "quant_oracle": {"status": "OK"},
        "data_phoenix": {"status": "OK"}
      }
    },
    '/registry': {
      description: 'Liste des stratégies disponibles',
      example: [
        {"name": "Bollinger_RSI_Contrarian"},
        {"name": "Momentum_MA_Crossover"}
      ]
    },
    '/scores': {
      description: 'Scores de performance (window=252)',
      example: {
        "scores": [
          {"name": "Bollinger_RSI_Contrarian", "score": 0.62, "sharpe": 1.1, "mdd": 0.12},
          {"name": "Momentum_MA_Crossover", "score": 0.48, "sharpe": 0.9, "mdd": 0.15}
        ]
      }
    },
    '/select': {
      description: 'Sélection de stratégie optimale',
      example: {
        "selection": [{"name": "Bollinger_RSI_Contrarian", "confidence": 0.78}]
      }
    },
    '/allocate': {
      description: 'Allocation de poids par stratégie',
      example: {
        "weights": {
          "Bollinger_RSI_Contrarian": 0.6,
          "Momentum_MA_Crossover": 0.4
        }
      }
    }
  };

  const runDebugWidget = async () => {
    setIsRunning(true);
    const endpoints = ['/health', '/status', '/registry', '/scores?window=252', '/select', '/allocate'];
    const results = [];

    for (const endpoint of endpoints) {
      const url = apiBase + endpoint;
      const result = { url, endpoint };

      try {
        const response = await fetch(url, { mode: 'cors' });
        result.status = response?.status;
        result.ok = response?.ok;
        result.headers = {};
        
        // Collect headers
        response?.headers?.forEach((value, key) => {
          result.headers[key] = value;
        });

        // Try to parse response
        const contentType = response?.headers?.get('content-type');
        if (contentType && contentType?.includes('application/json')) {
          try {
            result.body = await response?.json();
          } catch (e) {
            result.body = await response?.text();
            result.parseError = 'Invalid JSON response';
          }
        } else {
          result.body = await response?.text();
        }

        // Validate against expected format
        const expectedFormat = expectedFormats?.[endpoint?.split('?')?.[0]];
        if (expectedFormat && result?.body) {
          result.validation = validateResponseFormat(result?.body, expectedFormat?.example);
        }
      } catch (error) {
        result.error = error?.message;
      }

      results?.push(result);
    }

    setDebugResults({
      timestamp: new Date()?.toISOString(),
      results
    });
    setIsRunning(false);
  };

  const validateResponseFormat = (actual, expected) => {
    try {
      if (Array.isArray(expected)) {
        if (!Array.isArray(actual)) return { valid: false, reason: 'Expected array' };
        if (actual?.length === 0) return { valid: true, reason: 'Empty array (acceptable)' };
        return { valid: true, reason: 'Array format correct' };
      }
      
      if (typeof expected === 'object') {
        if (typeof actual !== 'object') return { valid: false, reason: 'Expected object' };
        
        const expectedKeys = Object.keys(expected);
        const actualKeys = Object.keys(actual);
        const missingKeys = expectedKeys?.filter(key => !actualKeys?.includes(key));
        
        if (missingKeys?.length > 0) {
          return { valid: false, reason: `Missing keys: ${missingKeys?.join(', ')}` };
        }
        
        return { valid: true, reason: 'Object structure correct' };
      }
      
      return { valid: true, reason: 'Format acceptable' };
    } catch (error) {
      return { valid: false, reason: 'Validation error' };
    }
  };

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(runDebugWidget, 10000); // Every 10 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const downloadResults = () => {
    if (!debugResults) return;
    
    const dataStr = JSON.stringify(debugResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api-debug-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
    link?.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (result) => {
    if (result?.error) return <XCircle className="w-4 h-4 text-red-400" />;
    if (result?.ok) return <CheckCircle className="w-4 h-4 text-green-400" />;
    return <AlertCircle className="w-4 h-4 text-yellow-400" />;
  };

  return (
    <div className="bg-purple-800/30 backdrop-blur-sm border border-purple-600 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bug className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold">Widget de Debug Complet</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e?.target?.checked)}
              className="rounded border-purple-400"
            />
            <span className="text-sm">Auto-refresh</span>
          </label>
          
          {debugResults && (
            <button
              onClick={downloadResults}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger</span>
            </button>
          )}
          
          <button
            onClick={runDebugWidget}
            disabled={isRunning}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Test en cours...' : 'Lancer le debug'}</span>
          </button>
        </div>
      </div>
      {/* Expected Formats Documentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.entries(expectedFormats)?.map(([endpoint, format]) => (
          <div key={endpoint} className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
            <h3 className="font-semibold text-purple-300 mb-2">{endpoint}</h3>
            <p className="text-sm text-gray-300 mb-3">{format?.description}</p>
            <div className="bg-black/50 rounded p-3 overflow-x-auto">
              <pre className="text-xs text-green-300">
                {JSON.stringify(format?.example, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
      {/* Debug Results */}
      {debugResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Résultats du diagnostic</h3>
            <span className="text-sm text-gray-400">
              {new Date(debugResults.timestamp)?.toLocaleString('fr-FR')}
            </span>
          </div>

          <div className="bg-black/50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {debugResults?.results?.map((result, index) => (
              <div key={index} className="mb-4 p-3 bg-gray-900/50 rounded border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result)}
                    <span className="font-mono text-sm text-purple-300">{result?.endpoint}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm px-2 py-1 rounded ${
                      result?.ok ? 'bg-green-800 text-green-200' : result?.error ?'bg-red-800 text-red-200': 'bg-yellow-800 text-yellow-200'
                    }`}>
                      {result?.status || 'ERROR'}
                    </span>
                  </div>
                </div>

                {result?.validation && (
                  <div className={`text-xs mb-2 ${
                    result?.validation?.valid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    Validation: {result?.validation?.reason}
                  </div>
                )}

                <div className="bg-black/50 rounded p-2 overflow-x-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(result?.body || result?.error, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Help Text */}
      <div className="mt-6 bg-blue-900/30 border border-blue-600 rounded-lg p-4">
        <h4 className="font-semibold text-blue-300 mb-2">Instructions d'utilisation</h4>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>• Cliquez sur "Lancer le debug" pour tester tous les endpoints</li>
          <li>• Activez "Auto-refresh" pour des tests automatiques toutes les 10 secondes</li>
          <li>• Téléchargez les résultats pour analyse approfondie</li>
          <li>• Les erreurs de validation indiquent des problèmes de format JSON</li>
          <li>• Copiez les résultats dans la console pour partager avec l'équipe technique</li>
        </ul>
      </div>
    </div>
  );
}