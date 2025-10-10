import { useState, useEffect } from 'react';
import { Activity, Settings, PlayCircle, StopCircle, RefreshCw, AlertTriangle, CheckCircle, Clock, Trash2 } from 'lucide-react';
import orchestraDiagnosticService from '../../../services/orchestraDiagnosticService';

export default function OrchestraDiagnosticPanel() {
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Écoute les événements de diagnostic
    const handleDiagnosticEvent = (event) => {
      setLogs(prev => [...prev?.slice(-49), event?.detail]); // Garde 50 logs max
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('orchestra:diagnostic', handleDiagnosticEvent);
    }

    // Charge les logs existants
    setLogs(orchestraDiagnosticService?.getDiagnosticLogs());

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('orchestra:diagnostic', handleDiagnosticEvent);
      }
    };
  }, []);

  const runManualDiagnostic = async () => {
    setLoading(true);
    setIsRunning(true);
    
    try {
      const results = await orchestraDiagnosticService?.runCompleteDiagnostic();
      setDiagnosticResults(results);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur diagnostic:', error);
    } finally {
      setLoading(false);
      setIsRunning(false);
    }
  };

  const toggleAutoCheck = () => {
    if (autoCheckEnabled) {
      orchestraDiagnosticService?.stopAutoCheck();
      setAutoCheckEnabled(false);
    } else {
      orchestraDiagnosticService?.startAutoCheck(15); // 15 minutes
      setAutoCheckEnabled(true);
    }
  };

  const clearDiagnosticLogs = () => {
    orchestraDiagnosticService?.clearLogs();
    setLogs([]);
  };

  const getStatusIcon = (status) => {
    if (status?.includes('🟢')) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status?.includes('🟡')) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (status?.includes('🔴')) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  const getSeverityColor = (category) => {
    if (category?.includes('Error')) return 'text-red-600 bg-red-50';
    if (category?.includes('Warning') || category?.includes('Action Required')) return 'text-yellow-600 bg-yellow-50';
    if (category?.includes('Complete') || category?.includes('Active')) return 'text-green-600 bg-green-50';
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Diagnostic & Relance Chef Orchestra
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Auto-vérification IA régionales et réactivation système
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lastUpdate?.toLocaleTimeString('fr-FR')}
            </div>
          )}
          
          <button
            onClick={toggleAutoCheck}
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
              autoCheckEnabled 
                ? 'bg-green-100 text-green-700' :'bg-gray-100 text-gray-600'
            }`}
          >
            {autoCheckEnabled ? <StopCircle className="h-3 w-3" /> : <PlayCircle className="h-3 w-3" />}
            Auto-check {autoCheckEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
      {/* Contrôles */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={runManualDiagnostic}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Diagnostic en cours...' : 'Lancer Diagnostic'}
        </button>
        
        <button
          onClick={clearDiagnosticLogs}
          className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Vider Logs
        </button>
      </div>
      {/* Résultats du diagnostic */}
      {diagnosticResults?.summary && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Résumé du Diagnostic
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Chef Orchestra:</span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(diagnosticResults?.summary?.chef_orchestra)}
                  <span className="text-sm font-medium">{diagnosticResults?.summary?.chef_orchestra}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Flux WebSocket:</span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(diagnosticResults?.summary?.flux_websocket)}
                  <span className="text-sm font-medium">{diagnosticResults?.summary?.flux_websocket}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">IA Régionales:</span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(diagnosticResults?.summary?.ia_regionales)}
                  <span className="text-sm font-medium">{diagnosticResults?.summary?.ia_regionales}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dernier Signal:</span>
                <span className="text-sm font-medium">{diagnosticResults?.summary?.dernier_signal}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Santé Globale:</span>
              <div className="flex items-center gap-1">
                {getStatusIcon(diagnosticResults?.summary?.global_health)}
                <span className="text-sm font-semibold">{diagnosticResults?.summary?.global_health}</span>
              </div>
            </div>
            
            {diagnosticResults?.summary?.actions_correctives?.length > 0 && 
             diagnosticResults?.summary?.actions_correctives?.[0] !== 'Aucune action requise' && (
              <div className="mt-2">
                <span className="text-sm text-gray-600">Actions correctives:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {diagnosticResults?.summary?.actions_correctives?.map((action, index) => (
                    <span 
                      key={index}
                      className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded"
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Panneau Diagnostic Live */}
      <div className="bg-white border rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200">
          <h4 className="font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            Diagnostic Live
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {logs?.length} événements
            </span>
          </h4>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {logs?.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Aucun événement de diagnostic</p>
              <p className="text-xs">Lancez un diagnostic pour voir les logs</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {logs?.slice()?.reverse()?.map((log, index) => (
                <div key={index} className="p-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(log?.category)}`}>
                          {log?.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp)?.toLocaleTimeString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-sm mt-1 text-gray-800">{log?.message}</p>
                      {log?.data && typeof log?.data === 'object' && (
                        <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log?.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-semibold text-blue-800 mb-2">Instructions d'utilisation:</h5>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• <strong>Diagnostic Manuel:</strong> Cliquez "Lancer Diagnostic" pour vérifier immédiatement</li>
          <li>• <strong>Auto-vérification:</strong> Active la routine toutes les 15 minutes</li>
          <li>• <strong>Actions Automatiques:</strong> Le système tente de corriger automatiquement les problèmes détectés</li>
          <li>• <strong>Logs Live:</strong> Tous les événements sont journalisés en temps réel</li>
        </ul>
      </div>
    </div>
  );
}