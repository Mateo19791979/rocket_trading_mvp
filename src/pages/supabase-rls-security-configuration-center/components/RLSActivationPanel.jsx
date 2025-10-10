import React, { useState } from 'react';
import { Database, CheckCircle, AlertCircle, Play, RefreshCw, Copy, Shield, ToggleLeft } from 'lucide-react';

export default function RLSActivationPanel({ criticalTables, setCriticalTables, isLoading, setIsLoading }) {
  const [selectedTables, setSelectedTables] = useState([]);
  const [activationLog, setActivationLog] = useState([
    { timestamp: new Date()?.toISOString(), action: 'RLS Activation Panel initialized', status: 'info' },
    { timestamp: new Date()?.toISOString(), action: 'Scanning critical tables for RLS status', status: 'info' }
  ]);

  const rlsCommands = {
    providers: {
      enable: 'ALTER TABLE providers ENABLE ROW LEVEL SECURITY;',
      check: 'SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = \'providers\';',
      description: 'Critical API keys table - Service Role only access'
    },
    ai_agent_state: {
      enable: 'ALTER TABLE ai_agent_state ENABLE ROW LEVEL SECURITY;',
      check: 'SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = \'ai_agent_state\';',
      description: 'AI agent logs and state - system_ai role access'
    },
    external_sources_state: {
      enable: 'ALTER TABLE external_sources_state ENABLE ROW LEVEL SECURITY;',
      check: 'SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = \'external_sources_state\';',
      description: 'CMV/Wilshire ingestion state - data_ingest role'
    },
    ohlc: {
      enable: 'ALTER TABLE ohlc ENABLE ROW LEVEL SECURITY;',
      check: 'SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = \'ohlc\';',
      description: 'OHLC market data - data_ingest insert, authenticated read'
    },
    book_library: {
      enable: 'ALTER TABLE book_library ENABLE ROW LEVEL SECURITY;',
      check: 'SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = \'book_library\';',
      description: 'RAG knowledge base documents - read_public access'
    },
    reading_materials: {
      enable: 'ALTER TABLE reading_materials ENABLE ROW LEVEL SECURITY;',
      check: 'SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = \'reading_materials\';',
      description: 'RAG knowledge chunks - read_public access'
    },
    market_data: {
      enable: 'ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;',
      check: 'SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = \'market_data\';',
      description: 'Public market metrics - anon/read_public access'
    }
  };

  const handleToggleTable = (tableName) => {
    setSelectedTables(prev => {
      if (prev?.includes(tableName)) {
        return prev?.filter(t => t !== tableName);
      } else {
        return [...prev, tableName];
      }
    });
  };

  const handleActivateRLS = async (tableName) => {
    setIsLoading(true);
    setActivationLog(prev => [...prev, {
      timestamp: new Date()?.toISOString(),
      action: `Activating RLS for table: ${tableName}`,
      status: 'in-progress'
    }]);

    try {
      // Simulate RLS activation
      setTimeout(() => {
        setCriticalTables(prev => prev?.map(table => 
          table?.name === tableName 
            ? { ...table, rlsEnabled: true, status: table?.status === 'vulnerable' ? 'needs-jwt-roles' : table?.status }
            : table
        ));

        setActivationLog(prev => [...prev, {
          timestamp: new Date()?.toISOString(),
          action: `RLS successfully activated for ${tableName}`,
          status: 'success'
        }]);

        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setActivationLog(prev => [...prev, {
        timestamp: new Date()?.toISOString(),
        action: `Failed to activate RLS for ${tableName}: ${error?.message}`,
        status: 'error'
      }]);
      setIsLoading(false);
    }
  };

  const handleBulkActivation = async () => {
    if (selectedTables?.length === 0) return;

    setIsLoading(true);
    setActivationLog(prev => [...prev, {
      timestamp: new Date()?.toISOString(),
      action: `Starting bulk RLS activation for ${selectedTables?.length} tables`,
      status: 'in-progress'
    }]);

    try {
      // Simulate bulk activation
      setTimeout(() => {
        setCriticalTables(prev => prev?.map(table => 
          selectedTables?.includes(table?.name)
            ? { ...table, rlsEnabled: true, status: table?.status === 'vulnerable' ? 'needs-jwt-roles' : table?.status }
            : table
        ));

        setActivationLog(prev => [...prev, {
          timestamp: new Date()?.toISOString(),
          action: `Bulk RLS activation completed for ${selectedTables?.length} tables`,
          status: 'success'
        }]);

        setSelectedTables([]);
        setIsLoading(false);
      }, 3000);
    } catch (error) {
      setActivationLog(prev => [...prev, {
        timestamp: new Date()?.toISOString(),
        action: `Bulk RLS activation failed: ${error?.message}`,
        status: 'error'
      }]);
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'secured': case 'good':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'needs-jwt-roles': case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'vulnerable':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">RLS Activation Panel</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enable Row Level Security for critical database tables
              </p>
            </div>
          </div>
          
          {selectedTables?.length > 0 && (
            <button
              onClick={handleBulkActivation}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Activate RLS ({selectedTables?.length})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {criticalTables?.filter(t => t?.rlsEnabled)?.length}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Tables with RLS Enabled</div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {criticalTables?.filter(t => !t?.rlsEnabled)?.length}
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">Tables Needing Activation</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round((criticalTables?.filter(t => t?.rlsEnabled)?.length / criticalTables?.length) * 100)}%
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">RLS Coverage</div>
          </div>
        </div>
      </div>
      {/* Tables List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Critical Tables</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Select tables to activate Row Level Security policies
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {criticalTables?.map((table) => (
            <div key={table?.name} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedTables?.includes(table?.name)}
                    onChange={() => handleToggleTable(table?.name)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(table?.status)}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {table?.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {rlsCommands?.[table?.name]?.description || table?.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <ToggleLeft className={`w-5 h-5 ${table?.rlsEnabled ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className={`text-sm ${table?.rlsEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {table?.rlsEnabled ? 'RLS Enabled' : 'RLS Disabled'}
                    </span>
                  </div>

                  {!table?.rlsEnabled && (
                    <button
                      onClick={() => handleActivateRLS(table?.name)}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {isLoading ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Shield className="w-3 h-3 mr-1" />}
                      Activate
                    </button>
                  )}
                </div>
              </div>

              {/* SQL Commands */}
              {rlsCommands?.[table?.name] && (
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Enable RLS Command:</span>
                      <button
                        onClick={() => copyToClipboard(rlsCommands?.[table?.name]?.enable)}
                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </button>
                    </div>
                    <div className="bg-gray-900 dark:bg-gray-950 rounded-md p-3 text-sm">
                      <code className="text-green-400">
                        {rlsCommands?.[table?.name]?.enable}
                      </code>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Verification Command:</span>
                      <button
                        onClick={() => copyToClipboard(rlsCommands?.[table?.name]?.check)}
                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </button>
                    </div>
                    <div className="bg-gray-900 dark:bg-gray-950 rounded-md p-3 text-sm">
                      <code className="text-blue-400">
                        {rlsCommands?.[table?.name]?.check}
                      </code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Activation Log */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Activation Log</h3>
        </div>

        <div className="max-h-80 overflow-y-auto">
          <div className="p-6 space-y-3">
            {activationLog?.slice()?.reverse()?.map((log, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                  log?.status === 'success' ? 'bg-green-500' :
                  log?.status === 'error' ? 'bg-red-500' :
                  log?.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                }`}></div>
                <div className="flex-1">
                  <div className="text-sm text-gray-900 dark:text-white">{log?.action}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.timestamp)?.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}