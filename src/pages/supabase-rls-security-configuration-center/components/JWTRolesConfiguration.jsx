import React, { useState } from 'react';
import { Users, Key, CheckCircle, Play, RefreshCw, Copy, Settings, UserCheck, Database, Code } from 'lucide-react';

export default function JWTRolesConfiguration({ securityMetrics, setSecurityMetrics, isLoading, setIsLoading }) {
  const [selectedRole, setSelectedRole] = useState('system_ai');
  const [testResults, setTestResults] = useState([]);

  const applicationRoles = {
    system_ai: {
      name: 'system_ai',
      description: 'Autonomous AI agents - write logs/states & signals',
      permissions: ['INSERT on ai_agent_state', 'SELECT on ai_agent_state', 'SELECT on external_sources_state'],
      color: 'purple',
      icon: '🤖',
      examples: ['InfoHunter AI', 'Risk Controller', 'Signal Generator'],
      claimSetup: `
// Backend (Node.js) with Service Key:
const { createClient } = require('@supabase/supabase-js');
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
await admin.auth.admin.updateUserById('<USER_ID_AGENT>', {
  app_metadata: { role: 'system_ai' }
});`
    },
    data_ingest: {
      name: 'data_ingest',
      description: 'Market data ingestion jobs - CMV/Wilshire, OHLC processing',
      permissions: ['INSERT on external_sources_state', 'UPDATE on external_sources_state', 'INSERT on ohlc', 'SELECT on market_data'],
      color: 'blue',
      icon: '📊',
      examples: ['CMV Data Pipeline', 'Wilshire Processor', 'OHLC Aggregator'],
      claimSetup: `
// Backend setup for ingestion job:
await admin.auth.admin.updateUserById('<USER_ID_INGEST>', {
  app_metadata: { role: 'data_ingest' }
});`
    },
    read_public: {
      name: 'read_public',
      description: 'Dashboard frontend - read public views, no write access',
      permissions: ['SELECT on book_library', 'SELECT on reading_materials', 'SELECT on market_data'],
      color: 'green',
      icon: '👀',
      examples: ['Dashboard UI', 'Public API', 'Knowledge Base Reader'],
      claimSetup: `
// For public/dashboard users:
await admin.auth.admin.updateUserById('<USER_ID_PUBLIC>', {
  app_metadata: { role: 'read_public' }
});`
    }
  };

  const jwtClaimTestQueries = [
    {
      name: 'Verify JWT Claim Visibility',
      query: 'SELECT auth.jwt() as jwt, auth.uid() as uid;',
      description: 'Check if role claim is visible in JWT token',
      expectedResult: '{ "role": "system_ai", "sub": "..." }'
    },
    {
      name: 'Test system_ai Insert Permission',
      query: `INSERT INTO ai_agent_state (agent_id, state_key, state_value) 
VALUES ('${crypto.randomUUID()}', 'test_key', '{"status": "testing"}');`,
      description: 'Verify system_ai can insert agent state',
      role: 'system_ai'
    },
    {
      name: 'Test data_ingest OHLC Insert',
      query: `INSERT INTO ohlc (symbol, tf, ts, o, h, l, c, v) 
VALUES ('TEST', '1m', NOW(), 100.0, 101.0, 99.0, 100.5, 1000);`,
      description: 'Verify data_ingest can insert OHLC data',
      role: 'data_ingest'
    },
    {
      name: 'Test read_public Access',
      query: 'SELECT * FROM reading_materials LIMIT 5;',
      description: 'Verify read_public can access knowledge base',
      role: 'read_public'
    }
  ];

  const handleRoleConfiguration = async (roleKey) => {
    setIsLoading(true);
    try {
      // Simulate role configuration
      setTimeout(() => {
        setSecurityMetrics(prev => ({
          ...prev,
          jwtRolesClaimed: Math.min(prev?.jwtRolesClaimed + 1, 3)
        }));
        
        setTestResults(prev => [...prev, {
          timestamp: new Date()?.toISOString(),
          action: `Configured JWT role: ${roleKey}`,
          status: 'success',
          role: roleKey
        }]);
        
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.log('Role configuration simulation completed');
      setIsLoading(false);
    }
  };

  const handleTestJWTClaim = async (query, role) => {
    setIsLoading(true);
    try {
      // Simulate JWT claim test
      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate
        
        setTestResults(prev => [...prev, {
          timestamp: new Date()?.toISOString(),
          action: `Tested JWT claim for ${role}`,
          status: success ? 'success' : 'error',
          role: role,
          query: query?.substring(0, 50) + '...',
          result: success ? 'Access granted' : 'RLS policy violation'
        }]);
        
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.log('JWT claim test simulation completed');
      setIsLoading(false);
    }
  };

  const handleBulkRoleSetup = async () => {
    setIsLoading(true);
    try {
      // Simulate bulk role setup
      setTimeout(() => {
        setSecurityMetrics(prev => ({
          ...prev,
          jwtRolesClaimed: 3
        }));
        
        setTestResults(prev => [...prev, {
          timestamp: new Date()?.toISOString(),
          action: 'Bulk JWT roles configuration completed',
          status: 'success',
          role: 'all'
        }]);
        
        setIsLoading(false);
      }, 3000);
    } catch (error) {
      console.log('Bulk role setup simulation completed');
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  const getRoleColor = (color) => {
    const colors = {
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors?.[color] || colors?.blue;
  };

  const currentRole = applicationRoles?.[selectedRole];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-purple-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">JWT Roles Configuration</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Three-tier application role system with JWT claims
              </p>
            </div>
          </div>
          
          <button
            onClick={handleBulkRoleSetup}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
            Setup All Roles
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {securityMetrics?.jwtRolesClaimed}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">JWT Roles Configured</div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              3
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Application Roles Total</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round((securityMetrics?.jwtRolesClaimed / 3) * 100)}%
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Role Coverage</div>
          </div>
        </div>
      </div>
      {/* Role Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Application Roles</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Select a role to configure JWT claims and permissions
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(applicationRoles)?.map(([key, role]) => (
              <button
                key={key}
                onClick={() => setSelectedRole(key)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedRole === key
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' :'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{role?.icon}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role?.color)}`}>
                      {role?.name}
                    </span>
                  </div>
                  {selectedRole === key && <CheckCircle className="w-5 h-5 text-purple-500" />}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{role?.description}</p>
              </button>
            ))}
          </div>

          {/* Selected Role Details */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{currentRole?.icon}</span>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {currentRole?.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentRole?.description}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => handleRoleConfiguration(selectedRole)}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <UserCheck className="w-4 h-4 mr-2" />}
                Configure Role
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Permissions */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Permissions</h5>
                <div className="space-y-2">
                  {currentRole?.permissions?.map((permission, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Examples */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Use Cases</h5>
                <div className="space-y-2">
                  {currentRole?.examples?.map((example, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{example}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Claim Setup Code */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">JWT Claim Setup Code</h5>
                <button
                  onClick={() => copyToClipboard(currentRole?.claimSetup)}
                  className="inline-flex items-center text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Code
                </button>
              </div>
              <div className="bg-gray-900 dark:bg-gray-950 rounded-md p-4">
                <pre className="text-sm text-green-400 whitespace-pre-wrap">
                  <code>{currentRole?.claimSetup}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* JWT Claim Testing */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">JWT Claim Validation</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Test JWT role claims with database queries
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {jwtClaimTestQueries?.map((test, index) => (
            <div key={index} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {test?.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {test?.description}
                  </p>
                  {test?.role && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getRoleColor(applicationRoles?.[test?.role]?.color || 'blue')}`}>
                      {test?.role}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => handleTestJWTClaim(test?.query, test?.role || 'general')}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  Test
                </button>
              </div>

              <div className="bg-gray-900 dark:bg-gray-950 rounded-md p-3">
                <code className="text-sm text-blue-400 whitespace-pre-wrap">
                  {test?.query}
                </code>
              </div>

              {test?.expectedResult && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Expected Result: </span>
                  <span className="text-xs text-green-600 dark:text-green-400">{test?.expectedResult}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Test Results */}
      {testResults?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Test Results</h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            <div className="p-6 space-y-3">
              {testResults?.slice()?.reverse()?.map((result, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    result?.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900 dark:text-white">{result?.action}</span>
                      {result?.role && result?.role !== 'general' && (
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getRoleColor(applicationRoles?.[result?.role]?.color || 'blue')}`}>
                          {result?.role}
                        </span>
                      )}
                    </div>
                    {result?.query && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Query: {result?.query}
                      </div>
                    )}
                    {result?.result && (
                      <div className={`text-xs mt-1 ${result?.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {result?.result}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(result.timestamp)?.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}