import React, { useState, useEffect } from 'react';
import { Shield, Database, Lock, CheckCircle, AlertCircle, AlertTriangle, Play, RefreshCw, Users, Activity, Terminal, FileCheck, ExternalLink } from 'lucide-react';


// Component imports
import RLSActivationPanel from './components/RLSActivationPanel';
import JWTRolesConfiguration from './components/JWTRolesConfiguration';
import SQLPolicyGenerator from './components/SQLPolicyGenerator';
import PolicyTestingInterface from './components/PolicyTestingInterface';
import ProductionSecurityDashboard from './components/ProductionSecurityDashboard';
import Icon from '../../components/AppIcon';


export default function SupabaseRLSSecurityConfigurationCenter() {
  const [systemSecurityLevel, setSystemSecurityLevel] = useState(94);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [deploymentReadiness, setDeploymentReadiness] = useState('securing');

  const [securityMetrics, setSecurityMetrics] = useState({
    rlsEnabled: 7,
    totalTables: 7,
    policiesDeployed: 12,
    totalPolicies: 21,
    jwtRolesClaimed: 2,
    totalRoles: 3,
    securityViolations: 3,
    lastSecurityScan: new Date()?.toISOString()
  });

  const [criticalTables, setCriticalTables] = useState([
    {
      name: 'providers',
      status: 'secured',
      rlsEnabled: true,
      securityLevel: 'high',
      description: 'API keys - Backend only access',
      policies: 2,
      requiredPolicies: 0,
      violations: 0
    },
    {
      name: 'ai_agent_state',
      status: 'needs-jwt-roles',
      rlsEnabled: true,
      securityLevel: 'medium',
      description: 'AI agent logs and state',
      policies: 1,
      requiredPolicies: 2,
      violations: 1
    },
    {
      name: 'external_sources_state',
      status: 'needs-jwt-roles',
      rlsEnabled: true,
      securityLevel: 'medium',
      description: 'CMV/Wilshire data ingestion state',
      policies: 2,
      requiredPolicies: 3,
      violations: 1
    },
    {
      name: 'ohlc',
      status: 'needs-jwt-roles',
      rlsEnabled: true,
      securityLevel: 'medium',
      description: 'OHLC market data bars',
      policies: 2,
      requiredPolicies: 2,
      violations: 1
    },
    {
      name: 'book_library',
      status: 'partial',
      rlsEnabled: true,
      securityLevel: 'low',
      description: 'RAG knowledge base documents',
      policies: 1,
      requiredPolicies: 4,
      violations: 0
    },
    {
      name: 'reading_materials',
      status: 'partial',
      rlsEnabled: true,
      securityLevel: 'low',
      description: 'RAG knowledge chunks',
      policies: 1,
      requiredPolicies: 4,
      violations: 0
    },
    {
      name: 'market_data',
      status: 'good',
      rlsEnabled: true,
      securityLevel: 'medium',
      description: 'Public market data metrics',
      policies: 3,
      requiredPolicies: 3,
      violations: 0
    }
  ]);

  const [deploymentProgress, setDeploymentProgress] = useState({
    stage: 'rls_configuration',
    progress: 65,
    stages: [
      { id: 'rls_activation', name: 'RLS Activation', status: 'completed' },
      { id: 'jwt_roles', name: 'JWT Roles Setup', status: 'in-progress' },
      { id: 'policy_deployment', name: 'Policy Deployment', status: 'pending' },
      { id: 'testing_validation', name: 'Testing & Validation', status: 'pending' },
      { id: 'production_ready', name: 'Production Ready', status: 'pending' }
    ]
  });

  const updateSecurityLevel = () => {
    const completedPolicies = criticalTables?.reduce((acc, table) => acc + table?.policies, 0);
    const totalRequiredPolicies = criticalTables?.reduce((acc, table) => acc + table?.requiredPolicies, 0);
    const newLevel = Math.min(94 + Math.floor((completedPolicies / totalRequiredPolicies) * 6), 100);
    setSystemSecurityLevel(newLevel);

    if (newLevel >= 100) {
      setDeploymentReadiness('ready');
    } else if (newLevel >= 98) {
      setDeploymentReadiness('final-testing');
    } else {
      setDeploymentReadiness('securing');
    }
  };

  useEffect(() => {
    updateSecurityLevel();
  }, [criticalTables]);

  const handleBulkPolicyDeployment = async () => {
    setIsLoading(true);
    try {
      // Simulate policy deployment
      setTimeout(() => {
        setCriticalTables(prev => prev?.map(table => ({
          ...table,
          status: table?.name === 'providers' ? 'secured' : 'good',
          policies: table?.requiredPolicies || table?.policies,
          violations: 0
        })));
        setSecurityMetrics(prev => ({
          ...prev,
          policiesDeployed: 21,
          securityViolations: 0,
          jwtRolesClaimed: 3
        }));
        setIsLoading(false);
      }, 3000);
    } catch (error) {
      console.log('Policy deployment simulation completed');
      setIsLoading(false);
    }
  };

  const handleEmergencyLockdown = async () => {
    setIsLoading(true);
    try {
      // Simulate emergency lockdown
      setTimeout(() => {
        setCriticalTables(prev => prev?.map(table => ({
          ...table,
          status: 'secured',
          securityLevel: 'high'
        })));
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.log('Emergency lockdown simulation completed');
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Security Overview', icon: Shield },
    { id: 'rls-activation', name: 'RLS Activation', icon: Database },
    { id: 'jwt-roles', name: 'JWT Roles', icon: Users },
    { id: 'sql-generator', name: 'SQL Generator', icon: Terminal },
    { id: 'policy-testing', name: 'Policy Testing', icon: FileCheck },
    { id: 'dashboard', name: 'Security Dashboard', icon: Activity }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'secured': return 'text-green-600 bg-green-100';
      case 'good': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'needs-jwt-roles': return 'text-orange-600 bg-orange-100';
      case 'vulnerable': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSecurityIcon = (level) => {
    switch (level) {
      case 'high': return <Shield className="w-4 h-4 text-green-600" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'low': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg">
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Supabase RLS Security Configuration Center
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Production deployment security hardening with JWT role-based access control
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${systemSecurityLevel >= 100 ? 'bg-green-500' : systemSecurityLevel >= 98 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {systemSecurityLevel}% Security Level
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkPolicyDeployment}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  Deploy All Policies
                </button>
                
                <button
                  onClick={handleEmergencyLockdown}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                  Emergency Lockdown
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs?.map((tab) => {
                const Icon = tab?.icon;
                return (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab?.id
                        ? 'border-red-500 text-red-600 dark:text-red-400' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab?.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Security Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* System Security Progress */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Security Progress</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      deploymentReadiness === 'ready' ? 'bg-green-100 text-green-800' :
                      deploymentReadiness === 'final-testing'? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {deploymentReadiness === 'ready' ? 'Production Ready' :
                       deploymentReadiness === 'final-testing' ? 'Final Testing' : 'Securing System'}
                    </span>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Security Level</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{systemSecurityLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          systemSecurityLevel >= 100 ? 'bg-green-500' : 
                          systemSecurityLevel >= 98 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${systemSecurityLevel}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{securityMetrics?.rlsEnabled}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Tables with RLS</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{securityMetrics?.policiesDeployed}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Policies Deployed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{securityMetrics?.jwtRolesClaimed}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">JWT Roles Active</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('rls-activation')}
                      className="w-full flex items-center justify-between p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center">
                        <Database className="w-5 h-5 text-blue-500 mr-3" />
                        <span className="text-sm font-medium">Activate RLS</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('jwt-roles')}
                      className="w-full flex items-center justify-between p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-purple-500 mr-3" />
                        <span className="text-sm font-medium">Configure JWT Roles</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('sql-generator')}
                      className="w-full flex items-center justify-between p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center">
                        <Terminal className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-sm font-medium">Generate SQL</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Alerts</h3>
                  
                  <div className="space-y-3">
                    {securityMetrics?.securityViolations > 0 && (
                      <div className="flex items-start p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-red-800 dark:text-red-200">
                            {securityMetrics?.securityViolations} RLS Violations
                          </div>
                          <div className="text-xs text-red-600 dark:text-red-300">
                            JWT role policies need deployment
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Production Deployment Pending
                        </div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-300">
                          6% remaining to reach 100% security
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Tables Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Critical Tables Security Status</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Row Level Security configuration for production-critical database tables
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Table
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Security Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Policies
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Violations
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {criticalTables?.map((table) => (
                      <tr key={table?.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {table?.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {table?.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(table?.status)}`}>
                            {table?.status?.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getSecurityIcon(table?.securityLevel)}
                            <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                              {table?.securityLevel}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {table?.policies}/{table?.requiredPolicies || table?.policies}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {table?.violations > 0 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              {table?.violations} violations
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Secure
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                            Configure
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                            View SQL
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deployment Stages */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Deployment Progress</h3>
              
              <div className="space-y-4">
                {deploymentProgress?.stages?.map((stage, index) => (
                  <div key={stage?.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      stage?.status === 'completed' ? 'bg-green-100 text-green-600' :
                      stage?.status === 'in-progress'? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {stage?.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : stage?.status === 'in-progress' ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {stage?.name}
                      </div>
                      <div className={`text-xs ${
                        stage?.status === 'completed' ? 'text-green-600' :
                        stage?.status === 'in-progress'? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {stage?.status === 'completed' ? 'Completed' :
                         stage?.status === 'in-progress' ? 'In Progress' : 'Pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rls-activation' && (
          <RLSActivationPanel 
            criticalTables={criticalTables} 
            setCriticalTables={setCriticalTables}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        {activeTab === 'jwt-roles' && (
          <JWTRolesConfiguration
            securityMetrics={securityMetrics}
            setSecurityMetrics={setSecurityMetrics}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        {activeTab === 'sql-generator' && (
          <SQLPolicyGenerator
            criticalTables={criticalTables}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        {activeTab === 'policy-testing' && (
          <PolicyTestingInterface
            securityMetrics={securityMetrics}
            setSecurityMetrics={setSecurityMetrics}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        {activeTab === 'dashboard' && (
          <ProductionSecurityDashboard
            systemSecurityLevel={systemSecurityLevel}
            securityMetrics={securityMetrics}
            deploymentReadiness={deploymentReadiness}
            criticalTables={criticalTables}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}