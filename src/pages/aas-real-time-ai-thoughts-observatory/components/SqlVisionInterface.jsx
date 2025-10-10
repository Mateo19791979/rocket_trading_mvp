import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Play, Copy, CheckCircle, AlertTriangle, Activity, Search, Download, RefreshCw, Terminal } from 'lucide-react';
import { aasObservatoryService } from '../../../services/aasObservatoryService';

export default function SqlVisionInterface({ isActive, cognitiveMetrics }) {
  const [activeQuery, setActiveQuery] = useState('decisions_recent');
  const [queryResults, setQueryResults] = useState({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedQuery, setCopiedQuery] = useState(null);
  const [customQuery, setCustomQuery] = useState('');
  const [showCustomQuery, setShowCustomQuery] = useState(false);
  const [validationChecklist, setValidationChecklist] = useState({});

  const predefinedQueries = {
    decisions_recent: {
      title: 'Recent AI Decisions',
      description: 'Last 50 decisions from decisions_log',
      sql: `SELECT 
        ts, 
        agent, 
        task,
        outcome, 
        CASE 
          WHEN input IS NOT NULL THEN jsonb_typeof(input)
          ELSE 'null'
        END as input_type,
        CASE 
          WHEN output IS NOT NULL THEN jsonb_typeof(output)
          ELSE 'null'
        END as output_type
      FROM decisions_log 
      ORDER BY ts DESC 
      LIMIT 50;`,
      category: 'decisions'
    },
    system_health_current: {
      title: 'Current System Health',
      description: 'Health status and mode from system_health',
      sql: `SELECT 
        sh.mode,
        ROUND(sh.dhi_avg::numeric, 3) as dhi,
        sh.errors_1h,
        sh.health_status,
        ai.name as agent_name,
        sh.last_heartbeat
      FROM system_health sh
      LEFT JOIN ai_agents ai ON sh.agent_id = ai.id
      ORDER BY sh.last_heartbeat DESC 
      LIMIT 20;`,
      category: 'health'
    },
    strategies_top: {
      title: 'Top Strategy Candidates',
      description: 'Best performing strategies by IQS',
      sql: `SELECT 
        id, 
        iqs, 
        status, 
        notes,
        updated_at,
        CASE 
          WHEN metrics IS NOT NULL THEN jsonb_typeof(metrics)
          ELSE 'null'
        END as metrics_type
      FROM strategy_candidates 
      ORDER BY iqs DESC NULLS LAST, updated_at DESC 
      LIMIT 10;`,
      category: 'strategies'
    },
    agents_performance: {
      title: 'AI Agents Performance',
      description: 'Active agents with performance metrics',
      sql: `SELECT 
        name,
        agent_status,
        agent_group,
        strategy,
        win_rate,
        total_pnl,
        total_trades,
        last_active_at
      FROM ai_agents 
      WHERE agent_status != 'inactive'
      ORDER BY total_pnl DESC, win_rate DESC;`,
      category: 'agents'
    },
    kill_switches_status: {
      title: 'Kill Switches Status',
      description: 'Current emergency controls status',
      sql: `SELECT 
        module,
        is_active,
        reason,
        updated_at,
        activated_by
      FROM kill_switches 
      ORDER BY updated_at DESC;`,
      category: 'control'
    },
    event_bus_activity: {
      title: 'Event Bus Activity',
      description: 'Recent inter-agent communications',
      sql: `SELECT 
        eb.event_type,
        eb.priority,
        eb.is_processed,
        eb.created_at,
        source_agent.name as source_agent,
        target_agent.name as target_agent
      FROM event_bus eb
      LEFT JOIN ai_agents source_agent ON eb.source_agent_id = source_agent.id
      LEFT JOIN ai_agents target_agent ON eb.target_agent_id = target_agent.id
      ORDER BY eb.created_at DESC 
      LIMIT 30;`,
      category: 'events'
    }
  };

  const checklistItems = [
    {
      id: 'ui_pointing',
      title: 'UI Configuration',
      description: 'ApexControl points to VITE_API_BASE_URL',
      status: 'unknown'
    },
    {
      id: 'auth_header',
      title: 'Authentication',
      description: 'x-internal-key matches INTERNAL_ADMIN_KEY',
      status: 'unknown'
    },
    {
      id: 'rls_permissions',
      title: 'RLS Policies',
      description: 'Tables allow read access or service connection',
      status: 'unknown'
    },
    {
      id: 'grafana_datasource',
      title: 'Grafana Connection',
      description: 'Postgres (RO) datasource configured',
      status: 'unknown'
    },
    {
      id: 'kill_switch_behavior',
      title: 'Kill Switch Logic',
      description: 'LIVE_TRADING active blocks orders but allows thoughts',
      status: 'unknown'
    }
  ];

  useEffect(() => {
    if (isActive) {
      executeQuery(activeQuery);
      runValidationChecklist();
    }
  }, [isActive, activeQuery]);

  const executeQuery = async (queryKey, customSql = null) => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    try {
      const query = customSql || predefinedQueries?.[queryKey]?.sql;
      if (!query) throw new Error('No query found');

      const results = await aasObservatoryService?.executeSqlQuery(query);
      setQueryResults(prev => ({
        ...prev,
        [queryKey]: {
          data: results,
          timestamp: new Date(),
          status: 'success'
        }
      }));
    } catch (error) {
      setQueryResults(prev => ({
        ...prev,
        [queryKey]: {
          error: error?.message || 'Query execution failed',
          timestamp: new Date(),
          status: 'error'
        }
      }));
    } finally {
      setIsExecuting(false);
    }
  };

  const runValidationChecklist = async () => {
    try {
      const validation = await aasObservatoryService?.runValidationChecklist();
      setValidationChecklist(validation);
    } catch (error) {
      console.error('Validation checklist error:', error);
    }
  };

  const copyToClipboard = (text, queryKey) => {
    navigator.clipboard?.writeText(text);
    setCopiedQuery(queryKey);
    setTimeout(() => setCopiedQuery(null), 2000);
  };

  const executeCustomQuery = () => {
    if (!customQuery?.trim()) return;
    executeQuery('custom', customQuery);
  };

  const exportResults = (queryKey) => {
    const result = queryResults?.[queryKey];
    if (!result?.data) return;

    const csvContent = [
      Object.keys(result?.data?.[0] || {})?.join(','),
      ...result?.data?.map(row => 
        Object.values(row)?.map(val => 
          typeof val === 'string' ? `"${val?.replace(/"/g, '""')}"` : val
        )?.join(',')
      )
    ]?.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${queryKey}_${new Date()?.toISOString()?.slice(0, 10)}.csv`;
    a?.click();
    URL.revokeObjectURL(url);
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'string' && value?.length > 50) return value?.substring(0, 50) + '...';
    return String(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 h-[800px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Database className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">SQL Vision Interface</h3>
            <p className="text-gray-400 text-sm">Direct database inspection</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCustomQuery(!showCustomQuery)}
            className={`p-2 rounded-lg transition-all ${
              showCustomQuery ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
            title="Custom Query"
          >
            <Terminal className="h-4 w-4" />
          </button>
          <button
            onClick={() => executeQuery(activeQuery)}
            disabled={isExecuting}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50"
            title="Refresh Query"
          >
            <RefreshCw className={`h-4 w-4 ${isExecuting ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      {/* Custom Query Panel */}
      <AnimatePresence>
        {showCustomQuery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 bg-gray-700/50 border border-gray-600/50 rounded-lg p-4"
          >
            <h4 className="text-white font-medium mb-3">Custom SQL Query</h4>
            <textarea
              value={customQuery}
              onChange={(e) => setCustomQuery(e?.target?.value)}
              placeholder="Enter your SQL query here..."
              className="w-full h-24 bg-gray-800 border border-gray-600 rounded-lg p-3 text-white font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={executeCustomQuery}
                disabled={!customQuery?.trim() || isExecuting}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 transition-all"
              >
                <Play className="h-4 w-4" />
                <span>Execute Custom Query</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Query Tabs */}
      <div className="flex-1 flex flex-col">
        <div className="flex overflow-x-auto space-x-2 mb-4 pb-2">
          {Object.entries(predefinedQueries)?.map(([key, query]) => (
            <button
              key={key}
              onClick={() => setActiveQuery(key)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeQuery === key 
                  ? 'bg-blue-600 text-white' :'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              {query?.title}
            </button>
          ))}
        </div>

        {/* Query Info & Controls */}
        <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-white font-medium">
                {predefinedQueries?.[activeQuery]?.title || 'Custom Query'}
              </h4>
              <p className="text-gray-400 text-sm">
                {predefinedQueries?.[activeQuery]?.description || 'User-defined query'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(predefinedQueries?.[activeQuery]?.sql || customQuery, activeQuery)}
                className="p-2 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg transition-all"
                title="Copy SQL"
              >
                {copiedQuery === activeQuery ? 
                  <CheckCircle className="h-4 w-4 text-green-400" /> : 
                  <Copy className="h-4 w-4" />
                }
              </button>
              {queryResults?.[activeQuery]?.data && (
                <button
                  onClick={() => exportResults(activeQuery)}
                  className="p-2 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg transition-all"
                  title="Export CSV"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* SQL Query Display */}
          <div className="bg-gray-800/50 rounded p-3">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
              {predefinedQueries?.[activeQuery]?.sql || customQuery}
            </pre>
          </div>
        </div>

        {/* Query Results */}
        <div className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg p-4 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">Query Results</h4>
            {queryResults?.[activeQuery] && (
              <div className={`text-xs ${getStatusColor(queryResults?.[activeQuery]?.status)}`}>
                {queryResults?.[activeQuery]?.status === 'success' 
                  ? `${queryResults?.[activeQuery]?.data?.length || 0} rows`
                  : 'Error'
                } • {queryResults?.[activeQuery]?.timestamp?.toLocaleTimeString('en-US', { hour12: false })}
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-auto">
            {isExecuting ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto text-blue-400 animate-spin mb-3" />
                  <p className="text-gray-400">Executing query...</p>
                </div>
              </div>
            ) : queryResults?.[activeQuery]?.error ? (
              <div className="bg-red-900/30 border border-red-500/30 rounded p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <span className="text-red-300 font-medium">Query Error</span>
                </div>
                <p className="text-red-200 text-sm">{queryResults?.[activeQuery]?.error}</p>
              </div>
            ) : queryResults?.[activeQuery]?.data ? (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      {Object.keys(queryResults?.[activeQuery]?.data?.[0] || {})?.map(key => (
                        <th key={key} className="text-left text-gray-300 font-medium py-2 px-3 bg-gray-800/50">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResults?.[activeQuery]?.data?.map((row, index) => (
                      <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-600/20">
                        {Object.values(row)?.map((value, cellIndex) => (
                          <td key={cellIndex} className="py-2 px-3 text-gray-300">
                            {formatValue(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Search className="h-8 w-8 mx-auto mb-3" />
                  <p>Execute a query to see results</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Validation Checklist */}
      <div className="mt-4 pt-4 border-t border-gray-600/50">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-white font-medium text-sm">System Validation</h5>
          <button
            onClick={runValidationChecklist}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <RefreshCw className="h-3 w-3 inline mr-1" />
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {checklistItems?.map(item => (
            <div key={item?.id} className="flex items-center space-x-2 text-xs">
              <div className={`h-2 w-2 rounded-full ${
                validationChecklist?.[item?.id] === 'success' ? 'bg-green-400' :
                validationChecklist?.[item?.id] === 'warning' ? 'bg-yellow-400' :
                validationChecklist?.[item?.id] === 'error' ? 'bg-red-400' : 'bg-gray-500'
              }`} />
              <span className="text-gray-400 truncate" title={item?.description}>
                {item?.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}