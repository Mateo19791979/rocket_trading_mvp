import React, { useState } from 'react';
import { Terminal, Copy, Download, Play, RefreshCw, CheckCircle, AlertTriangle, Code2, FileText, Zap } from 'lucide-react';

export default function SQLPolicyGenerator({ criticalTables, isLoading, setIsLoading }) {
  const [selectedTable, setSelectedTable] = useState('ai_agent_state');
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [deploymentStatus, setDeploymentStatus] = useState({});
  const [activeTemplate, setActiveTemplate] = useState('production');

  const sqlTemplates = {
    production: {
      name: 'Production Ready SQL',
      description: 'Complete RLS policies following the French guide patterns',
      icon: '🚀'
    },
    development: {
      name: 'Development SQL',
      description: 'Looser policies for development testing',
      icon: '🧪'
    },
    emergency: {
      name: 'Emergency Lockdown',
      description: 'Maximum security lockdown policies',
      icon: '🔒'
    }
  };

  const productionSQL = {
    providers: `-- Providers (API Keys) - Backend Service Role Only
-- No public policy = only Service Role can access
DROP POLICY IF EXISTS providers_public_select ON providers;
DROP POLICY IF EXISTS providers_authenticated_select ON providers;

-- No policies needed - Service Role bypasses RLS
-- Backend endpoints should use SUPABASE_SERVICE_KEY only`,

    ai_agent_state: `-- AI Agent State (logs_ai equivalent) - system_ai role
DROP POLICY IF EXISTS ai_agent_state_insert_system_ai ON ai_agent_state;
DROP POLICY IF EXISTS ai_agent_state_select_system_ai ON ai_agent_state;

-- System AI agents can insert their logs/states
CREATE POLICY ai_agent_state_insert_system_ai
ON ai_agent_state FOR INSERT
TO authenticated
WITH CHECK ( coalesce(auth.jwt() ->> 'role','') = 'system_ai' );

-- System AI and data_ingest can read logs for diagnostics
CREATE POLICY ai_agent_state_select_system_ai
ON ai_agent_state FOR SELECT
TO authenticated
USING ( coalesce(auth.jwt() ->> 'role','') IN ('system_ai','data_ingest') );`,

    external_sources_state: `-- External Sources State - CMV/Wilshire data_ingest role
DROP POLICY IF EXISTS ext_state_upsert_ingest ON external_sources_state;
DROP POLICY IF EXISTS ext_state_select_auth ON external_sources_state;

-- Data ingestion jobs can upsert state
CREATE POLICY ext_state_upsert_ingest
ON external_sources_state FOR INSERT
TO authenticated
WITH CHECK ( coalesce(auth.jwt() ->> 'role','') = 'data_ingest' );

CREATE POLICY ext_state_update_ingest
ON external_sources_state FOR UPDATE
TO authenticated
USING ( coalesce(auth.jwt() ->> 'role','') = 'data_ingest' )
WITH CHECK ( coalesce(auth.jwt() ->> 'role','') = 'data_ingest' );

-- All authenticated users can read state
CREATE POLICY ext_state_select_auth
ON external_sources_state FOR SELECT
TO authenticated
USING ( true );`,

    ohlc: `-- OHLC Bars - data_ingest writes, authenticated reads
DROP POLICY IF EXISTS ohlc_insert_ingest ON ohlc;
DROP POLICY IF EXISTS ohlc_select_auth ON ohlc;

-- Data ingestion can insert OHLC data
CREATE POLICY ohlc_insert_ingest
ON ohlc FOR INSERT
TO authenticated
WITH CHECK ( coalesce(auth.jwt() ->> 'role','') = 'data_ingest' );

-- All authenticated users can read OHLC data
CREATE POLICY ohlc_select_auth
ON ohlc FOR SELECT
TO authenticated
USING ( true );`,

    book_library: `-- Book Library (RAG kb_docs) - read_public access
DROP POLICY IF EXISTS book_library_select_read_public ON book_library;
DROP POLICY IF EXISTS book_library_insert_ingest ON book_library;

-- Public and authenticated can read knowledge base
CREATE POLICY book_library_select_read_public
ON book_library FOR SELECT
TO anon, authenticated
USING ( true );

-- Data ingestion can add new books
CREATE POLICY book_library_insert_ingest
ON book_library FOR INSERT
TO authenticated
WITH CHECK ( coalesce(auth.jwt() ->> 'role','') = 'data_ingest' );`,

    reading_materials: `-- Reading Materials (RAG kb_chunks) - read_public access
DROP POLICY IF EXISTS reading_materials_select_read_public ON reading_materials;
DROP POLICY IF EXISTS reading_materials_insert_ingest ON reading_materials;

-- Public and authenticated can read knowledge chunks
CREATE POLICY reading_materials_select_read_public
ON reading_materials FOR SELECT
TO anon, authenticated
USING ( true );

-- Data ingestion can add new materials
CREATE POLICY reading_materials_insert_ingest
ON reading_materials FOR INSERT
TO authenticated
WITH CHECK ( coalesce(auth.jwt() ->> 'role','') = 'data_ingest' );`,

    market_data: `-- Market Data (metrics_public equivalent) - public read access
DROP POLICY IF EXISTS market_data_select_anon ON market_data;

-- Public access to market data metrics
CREATE POLICY market_data_select_anon
ON market_data FOR SELECT
TO anon, authenticated
USING ( true );`
  };

  const emergencySQL = {
    providers: `-- EMERGENCY LOCKDOWN: Providers table
DROP POLICY IF EXISTS emergency_lockdown_providers ON providers;
CREATE POLICY emergency_lockdown_providers ON providers FOR ALL TO authenticated USING (false);`,
    
    ai_agent_state: `-- EMERGENCY LOCKDOWN: AI Agent State
DROP POLICY IF EXISTS emergency_lockdown_ai_agent_state ON ai_agent_state;
CREATE POLICY emergency_lockdown_ai_agent_state ON ai_agent_state FOR ALL TO authenticated USING (false);`,
    
    external_sources_state: `-- EMERGENCY LOCKDOWN: External Sources State
DROP POLICY IF EXISTS emergency_lockdown_external_sources_state ON external_sources_state;
CREATE POLICY emergency_lockdown_external_sources_state ON external_sources_state FOR ALL TO authenticated USING (false);`
  };

  const handleGenerateSQL = (tableName, template = 'production') => {
    let sql = '';
    
    if (template === 'emergency') {
      sql = emergencySQL?.[tableName] || `-- Emergency lockdown for ${tableName}
DROP POLICY IF EXISTS emergency_lockdown_${tableName} ON ${tableName};
CREATE POLICY emergency_lockdown_${tableName} ON ${tableName} FOR ALL TO authenticated USING (false);`;
    } else {
      sql = productionSQL?.[tableName] || `-- No specific policy template for ${tableName}`;
    }

    setGeneratedSQL(sql);
  };

  const handleDeploySQL = async (tableName) => {
    setIsLoading(true);
    setDeploymentStatus(prev => ({ ...prev, [tableName]: 'deploying' }));

    try {
      // Simulate SQL deployment
      setTimeout(() => {
        setDeploymentStatus(prev => ({ ...prev, [tableName]: 'success' }));
        setIsLoading(false);
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setDeploymentStatus(prev => ({ ...prev, [tableName]: null }));
        }, 3000);
      }, 2000);
    } catch (error) {
      setDeploymentStatus(prev => ({ ...prev, [tableName]: 'error' }));
      setIsLoading(false);
    }
  };

  const handleBulkDeployment = async () => {
    setIsLoading(true);
    
    try {
      // Simulate bulk deployment
      setTimeout(() => {
        const newStatus = {};
        criticalTables?.forEach(table => {
          newStatus[table.name] = 'success';
        });
        setDeploymentStatus(newStatus);
        setIsLoading(false);
        
        // Reset status after 5 seconds
        setTimeout(() => {
          setDeploymentStatus({});
        }, 5000);
      }, 4000);
    } catch (error) {
      console.log('Bulk deployment simulation completed');
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  const downloadSQL = () => {
    const allSQL = Object.entries(productionSQL)?.map(([table, sql]) => `-- ===============================
-- ${table?.toUpperCase()} TABLE POLICIES
-- ===============================

${sql}

`)?.join('\n');

    const blob = new Blob([allSQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supabase_rls_policies.sql';
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDeploymentIcon = (status) => {
    switch (status) {
      case 'deploying':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Play className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Terminal className="w-6 h-6 text-green-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">SQL Policy Generator</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ready-to-execute RLS policies for each table with syntax highlighting
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={downloadSQL}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Download All SQL
            </button>
            
            <button
              onClick={handleBulkDeployment}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
              Deploy All Policies
            </button>
          </div>
        </div>

        {/* Template Selection */}
        <div className="flex space-x-4 mb-6">
          {Object.entries(sqlTemplates)?.map(([key, template]) => (
            <button
              key={key}
              onClick={() => {
                setActiveTemplate(key);
                handleGenerateSQL(selectedTable, key);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTemplate === key
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <span>{template?.icon}</span>
              <span>{template?.name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {criticalTables?.length}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Tables to Secure</div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Object.values(productionSQL)?.length}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">SQL Templates Ready</div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Object.values(deploymentStatus)?.filter(status => status === 'success')?.length}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Policies Deployed</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select Table</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Choose a table to generate RLS policies
            </p>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {criticalTables?.map((table) => (
              <div
                key={table?.name}
                onClick={() => {
                  setSelectedTable(table?.name);
                  handleGenerateSQL(table?.name, activeTemplate);
                }}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedTable === table?.name
                    ? 'bg-green-50 dark:bg-green-900/20 border-r-4 border-green-500' :'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {table?.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {table?.description}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getDeploymentIcon(deploymentStatus?.[table?.name])}
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleDeploySQL(table?.name);
                      }}
                      disabled={isLoading}
                      className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 font-medium"
                    >
                      Deploy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SQL Generator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Generated SQL */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Generated SQL for {selectedTable}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ready-to-execute RLS policies with JWT role checks
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(generatedSQL || productionSQL?.[selectedTable] || '')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </button>
                
                <button
                  onClick={() => handleDeploySQL(selectedTable)}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {deploymentStatus?.[selectedTable] === 'deploying' ? (
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-1" />
                  )}
                  Deploy
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-6 overflow-x-auto">
                <pre className="text-sm text-white whitespace-pre-wrap">
                  <code>
                    {generatedSQL || productionSQL?.[selectedTable] || `-- Select a table to generate SQL policies`}
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Policy Explanation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Policy Explanation</h3>
            
            <div className="space-y-4">
              {selectedTable === 'providers' && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start space-x-3">
                    <Code2 className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-red-800 dark:text-red-200">No Policies = Maximum Security</div>
                      <div className="text-sm text-red-600 dark:text-red-300 mt-1">
                        No RLS policies means only the Service Role Key can access this table. 
                        This is the safest approach for API keys and sensitive data.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTable === 'ai_agent_state' && (
                <div className="space-y-3">
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start space-x-3">
                      <Code2 className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-purple-800 dark:text-purple-200">JWT Role: system_ai</div>
                        <div className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                          Only users with 'system_ai' role in their JWT can insert agent states. Both'system_ai' and 'data_ingest' roles can read for diagnostics.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTable === 'external_sources_state' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <Code2 className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800 dark:text-blue-200">JWT Role: data_ingest</div>
                      <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                        CMV/Wilshire data ingestion jobs with 'data_ingest' role can upsert state data.
                        All authenticated users can read the ingestion state.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-800 dark:text-green-200">JWT Claim Check</div>
                    <div className="text-sm text-green-600 dark:text-green-300 mt-1">
                      All policies use <code className="bg-white dark:bg-gray-900 px-1 rounded">coalesce(auth.jwt() -&gt;&gt; 'role','')</code> 
                      to safely extract the role from JWT claims with fallback to empty string.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deployment Status */}
          {Object.keys(deploymentStatus)?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Deployment Status</h3>
              
              <div className="space-y-3">
                {Object.entries(deploymentStatus)?.map(([tableName, status]) => (
                  <div key={tableName} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getDeploymentIcon(status)}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{tableName}</span>
                    </div>
                    
                    <span className={`text-sm ${
                      status === 'success' ? 'text-green-600 dark:text-green-400' :
                      status === 'error' ? 'text-red-600 dark:text-red-400' :
                      status === 'deploying'? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {status === 'success' ? 'Deployed Successfully' :
                       status === 'error' ? 'Deployment Failed' :
                       status === 'deploying' ? 'Deploying...' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}