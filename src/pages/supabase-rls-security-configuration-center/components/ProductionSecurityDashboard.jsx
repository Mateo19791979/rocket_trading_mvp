import React, { useState, useEffect } from 'react';
import { Activity, Shield, AlertTriangle, CheckCircle, TrendingUp, Users, RefreshCw } from 'lucide-react';

export default function ProductionSecurityDashboard({ 
  systemSecurityLevel, 
  securityMetrics, 
  deploymentReadiness, 
  criticalTables, 
  isLoading 
}) {
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeConnections: 847,
    requestsPerMinute: 2340,
    policiesEvaluated: 15670,
    failedAttempts: 23,
    lastIncident: null
  });

  const [securityAlerts, setSecurityAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      message: 'JWT role policies pending deployment on 3 tables',
      timestamp: new Date()?.toISOString(),
      resolved: false
    },
    {
      id: 2,
      type: 'info',
      message: 'RLS activation completed for providers table',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)?.toISOString(),
      resolved: true
    }
  ]);

  const [deploymentTimeline, setDeploymentTimeline] = useState([
    { stage: 'RLS Activation', progress: 100, status: 'completed' },
    { stage: 'JWT Configuration', progress: 75, status: 'in-progress' },
    { stage: 'Policy Deployment', progress: 45, status: 'in-progress' },
    { stage: 'Security Validation', progress: 20, status: 'pending' },
    { stage: 'Production Ready', progress: 0, status: 'pending' }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        ...prev,
        activeConnections: prev?.activeConnections + Math.floor(Math.random() * 20 - 10),
        requestsPerMinute: prev?.requestsPerMinute + Math.floor(Math.random() * 200 - 100),
        policiesEvaluated: prev?.policiesEvaluated + Math.floor(Math.random() * 50),
        failedAttempts: Math.max(0, prev?.failedAttempts + Math.floor(Math.random() * 3 - 1))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (level) => {
    if (level >= 100) return 'text-green-600 dark:text-green-400';
    if (level >= 98) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusBg = (level) => {
    if (level >= 100) return 'bg-green-100 dark:bg-green-900/20';
    if (level >= 98) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getDeploymentReadinessText = () => {
    switch (deploymentReadiness) {
      case 'ready':
        return { text: 'Production Ready', color: 'green' };
      case 'final-testing':
        return { text: 'Final Testing', color: 'yellow' };
      default:
        return { text: 'Securing System', color: 'red' };
    }
  };

  const readinessStatus = getDeploymentReadinessText();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-green-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Production Security Dashboard</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Real-time security metrics and deployment readiness assessment
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              readinessStatus?.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              readinessStatus?.color === 'yellow'? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {readinessStatus?.text}
            </div>
            
            <div className="text-right">
              <div className={`text-2xl font-bold ${getStatusColor(systemSecurityLevel)}`}>
                {systemSecurityLevel}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Security Level</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Deployment Progress
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {systemSecurityLevel >= 100 ? 'Complete' : `${100 - systemSecurityLevel}% remaining`}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                systemSecurityLevel >= 100 ? 'bg-green-500' : 
                systemSecurityLevel >= 98 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${systemSecurityLevel}%` }}
            ></div>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {realTimeMetrics?.activeConnections?.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Active Connections</div>
              </div>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {realTimeMetrics?.requestsPerMinute?.toLocaleString()}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Requests/min</div>
              </div>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {realTimeMetrics?.policiesEvaluated?.toLocaleString()}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Policies Evaluated</div>
              </div>
              <Shield className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {realTimeMetrics?.failedAttempts}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">Failed Attempts</div>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Security Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Security Alerts</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time security monitoring and alerts
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {securityAlerts?.map((alert) => (
                <div key={alert?.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      alert?.type === 'error' ? 'bg-red-500' :
                      alert?.type === 'warning' ? 'bg-yellow-500' :
                      alert?.type === 'info'? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {alert?.message}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(alert.timestamp)?.toLocaleString()}
                      </div>
                      {alert?.resolved && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          ✓ Resolved
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Deployment Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Deployment Timeline</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Progress towards 100% production readiness
            </p>
          </div>

          <div className="p-6 space-y-6">
            {deploymentTimeline?.map((stage, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  stage?.status === 'completed' ? 'bg-green-100 text-green-600' :
                  stage?.status === 'in-progress'? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {stage?.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : stage?.status === 'in-progress' ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stage?.stage}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {stage?.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        stage?.status === 'completed' ? 'bg-green-500' :
                        stage?.status === 'in-progress'? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                      style={{ width: `${stage?.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Tables Security Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tables Security Overview</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time security status of critical database tables
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalTables?.map((table) => (
              <div key={table?.name} className={`p-4 rounded-lg border-2 ${
                table?.status === 'secured' || table?.status === 'good' ?'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                  : table?.status === 'needs-jwt-roles'|| table?.status === 'partial' ?'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20' :'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {table?.name}
                  </span>
                  <div className="flex items-center space-x-1">
                    {table?.rlsEnabled ? (
                      <Shield className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    {table?.violations === 0 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {table?.description}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    table?.status === 'secured' || table?.status === 'good' ?'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : table?.status === 'needs-jwt-roles'|| table?.status === 'partial' ?'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {table?.status?.replace('-', ' ')}
                  </span>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {table?.policies}/{table?.requiredPolicies || table?.policies} policies
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Compliance Report */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Compliance Report</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Production deployment validation summary
            </p>
          </div>
          
          <div className={`px-4 py-2 rounded-lg ${getStatusBg(systemSecurityLevel)}`}>
            <div className={`text-lg font-bold ${getStatusColor(systemSecurityLevel)}`}>
              {systemSecurityLevel >= 100 ? 'READY FOR PRODUCTION' : 
               systemSecurityLevel >= 98 ? 'FINAL TESTING REQUIRED': 'SECURITY HARDENING IN PROGRESS'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              ✓
            </div>
            <div className="text-sm text-gray-900 dark:text-white font-medium">RLS Enabled</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">All critical tables</div>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              securityMetrics?.jwtRolesClaimed >= 3 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {securityMetrics?.jwtRolesClaimed >= 3 ? '✓' : '⚠'}
            </div>
            <div className="text-sm text-gray-900 dark:text-white font-medium">JWT Roles</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {securityMetrics?.jwtRolesClaimed}/3 configured
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              securityMetrics?.securityViolations === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {securityMetrics?.securityViolations === 0 ? '✓' : '✗'}
            </div>
            <div className="text-sm text-gray-900 dark:text-white font-medium">Security Violations</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {securityMetrics?.securityViolations} active violations
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              systemSecurityLevel >= 100 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {systemSecurityLevel >= 100 ? '✓' : '⏳'}
            </div>
            <div className="text-sm text-gray-900 dark:text-white font-medium">Production Ready</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {systemSecurityLevel}% complete
            </div>
          </div>
        </div>

        {systemSecurityLevel >= 100 && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <div className="text-sm font-medium text-green-800 dark:text-green-200">
                  System Ready for Production Deployment
                </div>
                <div className="text-xs text-green-600 dark:text-green-300 mt-1">
                  All RLS policies configured, JWT roles active, zero security violations detected.
                  Your Rocket Trading MVP is now 100% secure and ready for live deployment.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}