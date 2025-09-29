import React, { useState, useEffect } from 'react';
import { Terminal, FileText, Search, AlertCircle, CheckCircle, RefreshCw, Database } from 'lucide-react';
import knowledgePipelineService from '../../../services/knowledgePipelineService';

const InteractivePipelineControls = ({ pipelineRunning, onStatusChange }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [queryInput, setQueryInput] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [logs, setLogs] = useState([
    { time: new Date()?.toLocaleTimeString(), level: 'info', message: 'Pipeline system initialized' },
    { time: new Date()?.toLocaleTimeString(), level: 'info', message: 'All modules ready' }
  ]);

  const [operationStatus, setOperationStatus] = useState({});

  const addLog = (level, message) => {
    setLogs(prev => [...prev?.slice(-9), {
      time: new Date()?.toLocaleTimeString(),
      level,
      message
    }]);
  };

  const handleManualTrigger = async (action) => {
    setIsProcessing(true);
    setSelectedAction(action);
    addLog('info', `Starting ${action}...`);

    try {
      let result;
      
      switch (action) {
        case 'ingest':
          result = await knowledgePipelineService?.triggerPdfIngestion('sample_document.pdf');
          break;
        case 'extract':
          result = await knowledgePipelineService?.triggerRuleExtraction('sample_doc_id');
          break;
        case 'build_registry':
          result = await knowledgePipelineService?.buildRegistry();
          break;
        case 'query_orchestrator':
          if (queryInput?.trim()) {
            result = await knowledgePipelineService?.queryOrchestrator(queryInput?.trim());
            if (result?.success) {
              setQueryResults(result?.data);
            }
          } else {
            result = { success: false, error: 'Query input is required' };
          }
          break;
        default:
          result = { success: false, error: 'Unknown action' };
      }

      if (result?.success) {
        addLog('success', `${action} completed successfully`);
        setOperationStatus(prev => ({ ...prev, [action]: 'success' }));
        if (result?.data?.message) {
          addLog('info', result?.data?.message);
        }
      } else {
        addLog('error', `${action} failed: ${result?.error || 'Unknown error'}`);
        setOperationStatus(prev => ({ ...prev, [action]: 'error' }));
        onStatusChange('warning');
      }
    } catch (error) {
      addLog('error', `${action} failed: ${error?.message}`);
      setOperationStatus(prev => ({ ...prev, [action]: 'error' }));
      onStatusChange('error');
    } finally {
      setIsProcessing(false);
      setSelectedAction(null);
      
      // Reset operation status after 5 seconds
      setTimeout(() => {
        setOperationStatus(prev => ({ ...prev, [action]: null }));
      }, 5000);
    }
  };

  const handleQuerySubmit = (e) => {
    e?.preventDefault();
    if (queryInput?.trim()) {
      handleManualTrigger('query_orchestrator');
    }
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getOperationStatusIcon = (action) => {
    const status = operationStatus?.[action];
    if (selectedAction === action && isProcessing) {
      return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />;
    }
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-400" />;
      default: return null;
    }
  };

  const pipelineActions = [
    {
      id: 'ingest',
      name: 'Trigger PDF Ingestion',
      description: 'Manually process PDF documents from inbox',
      icon: FileText,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'extract',
      name: 'Run Rule Extraction',
      description: 'Extract trading strategies from processed documents',
      icon: Search,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'build_registry',
      name: 'Build Registry',
      description: 'Compile and update strategy registry',
      icon: Database,
      color: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-2">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Interactive Pipeline Controls</h3>
            <p className="text-sm text-gray-400">Manual triggers, configuration, and real-time monitoring</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Manual Controls */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-medium text-white mb-4">Manual Pipeline Triggers</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {pipelineActions?.map((action) => {
                const ActionIcon = action?.icon;
                const statusIcon = getOperationStatusIcon(action?.id);

                return (
                  <button
                    key={action?.id}
                    onClick={() => handleManualTrigger(action?.id)}
                    disabled={isProcessing}
                    className="relative p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${action?.color} opacity-0 group-hover:opacity-10 rounded-lg transition-opacity`}></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`rounded-lg bg-gradient-to-br ${action?.color} p-2`}>
                          <ActionIcon className="h-4 w-4 text-white" />
                        </div>
                        {statusIcon}
                      </div>
                      <h5 className="text-sm font-semibold text-white mb-1">{action?.name}</h5>
                      <p className="text-xs text-gray-400">{action?.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Query Interface */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-3">Orchestrator Query Interface</h4>
              <form onSubmit={handleQuerySubmit} className="flex space-x-3 mb-4">
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e?.target?.value)}
                  placeholder="Query strategies (e.g., 'volatility correlation', 'options hedging')"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  disabled={isProcessing || !queryInput?.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {selectedAction === 'query_orchestrator' && isProcessing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </button>
              </form>

              {/* Query Results */}
              {queryResults && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-white mb-2">
                    Query Results ({queryResults?.count || 0} found)
                  </h5>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {queryResults?.results?.slice(0, 5)?.map((result, index) => (
                      <div key={index} className="p-2 bg-gray-800 rounded border border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{result?.strategy_name}</span>
                          <span className="text-xs text-blue-400">{(result?.confidence_score * 100)?.toFixed(1)}%</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{result?.strategy_description}</p>
                      </div>
                    )) || <p className="text-sm text-gray-400">No results found</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Logs */}
          <div>
            <h4 className="text-sm font-medium text-white mb-4">System Logs</h4>
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs">
              <div className="max-h-64 overflow-y-auto space-y-1">
                {logs?.map((log, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-gray-500 shrink-0">{log?.time}</span>
                    <span className={`uppercase font-semibold shrink-0 ${getLogColor(log?.level)}`}>
                      {log?.level}
                    </span>
                    <span className="text-gray-300">{log?.message}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Analytics */}
            <div className="mt-4 bg-gray-900/50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-white mb-3">Performance Analytics</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Avg Response Time</span>
                  <span className="text-xs text-green-400">847ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Success Rate</span>
                  <span className="text-xs text-green-400">96.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Active Connections</span>
                  <span className="text-xs text-blue-400">4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Queue Depth</span>
                  <span className="text-xs text-orange-400">2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractivePipelineControls;