import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, AlertTriangle, Shield, RotateCcw, Clock, FileText, Zap, CheckCircle, XCircle, RefreshCw, Terminal, Wrench, Activity } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import Icon from '@/components/AppIcon';


export default function AdvancedProductionControls({ 
  emergencyControls, 
  killSwitches, 
  certificates, 
  loadDeploymentData 
}) {
  const [activeControl, setActiveControl] = useState('automation');
  const [automationScripts, setAutomationScripts] = useState([]);
  const [certificateRenewalStatus, setCertificateRenewalStatus] = useState({});
  const [operationalLogs, setOperationalLogs] = useState([]);
  const [systemReadiness, setSystemReadiness] = useState({
    docker: true,
    ssl: true,
    database: true,
    networking: true
  });

  useEffect(() => {
    loadAutomationScripts();
    checkCertificateStatus();
    loadOperationalLogs();
  }, [emergencyControls, certificates]);

  const loadAutomationScripts = () => {
    const scripts = [
      {
        id: 1,
        name: 'Automated SSL Renewal',
        status: 'active',
        lastRun: new Date(Date.now() - 86400000)?.toISOString(),
        nextRun: new Date(Date.now() + 86400000 * 7)?.toISOString(),
        success: true,
        description: 'Monitors certificate expiry and triggers renewal'
      },
      {
        id: 2,
        name: 'Container Health Check',
        status: 'active',
        lastRun: new Date(Date.now() - 300000)?.toISOString(),
        nextRun: new Date(Date.now() + 300000)?.toISOString(),
        success: true,
        description: 'Verifies all containers are healthy'
      },
      {
        id: 3,
        name: 'Log Rotation',
        status: 'active',
        lastRun: new Date(Date.now() - 3600000)?.toISOString(),
        nextRun: new Date(Date.now() + 3600000)?.toISOString(),
        success: true,
        description: 'Manages deployment and container logs'
      },
      {
        id: 4,
        name: 'Rollback Detection',
        status: 'monitoring',
        lastRun: new Date(Date.now() - 1800000)?.toISOString(),
        nextRun: new Date(Date.now() + 600000)?.toISOString(),
        success: true,
        description: 'Detects deployment issues and triggers rollback'
      }
    ];
    
    setAutomationScripts(scripts);
  };

  const checkCertificateStatus = () => {
    const status = {};
    certificates?.forEach(cert => {
      const daysUntilExpiry = cert?.expires_at ? 
        Math.ceil((new Date(cert.expires_at) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
      
      status[cert?.id] = {
        domain: cert?.domain_configs?.domain_name || 'Unknown domain',
        daysUntilExpiry,
        needsRenewal: daysUntilExpiry <= 30,
        critical: daysUntilExpiry <= 7
      };
    });
    
    setCertificateRenewalStatus(status);
  };

  const loadOperationalLogs = () => {
    const logs = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 300000)?.toISOString(),
        level: 'info',
        message: 'SSL certificate renewal check completed successfully',
        component: 'ssl-monitor'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 600000)?.toISOString(),
        level: 'info',
        message: 'Container health check passed for all services',
        component: 'health-monitor'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 900000)?.toISOString(),
        level: 'warning',
        message: 'High memory usage detected in mvp-api container',
        component: 'resource-monitor'
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 1200000)?.toISOString(),
        level: 'info',
        message: 'Deployment validation completed successfully',
        component: 'deployment-validator'
      }
    ];
    
    setOperationalLogs(logs);
  };

  const triggerCertificateRenewal = async (certificateId) => {
    if (!supabase || !certificateId) return;

    try {
      const { error } = await supabase
        ?.from('ssl_certificates')
        ?.update({
          last_renewal_attempt_at: new Date()?.toISOString(),
          renewal_error: null
        })
        ?.eq('id', certificateId);

      if (error) throw error;

      alert('Certificate renewal initiated. Check logs for progress.');
      loadDeploymentData?.();
    } catch (error) {
      console.error('Error triggering certificate renewal:', error);
      alert('Failed to initiate certificate renewal.');
    }
  };

  const restartContainer = async (containerName) => {
    if (!confirm(`Are you sure you want to restart the ${containerName} container?`)) {
      return;
    }

    try {
      // Log the restart action
      if (supabase) {
        await supabase
          ?.from('deployment_audit_logs')
          ?.insert({
            action: 'container_restart',
            resource_type: 'docker_container',
            resource_id: containerName,
            new_values: { restart_reason: 'Manual restart from production controls' }
          });
      }

      alert(`${containerName} container restart initiated successfully.`);
      loadDeploymentData?.();
    } catch (error) {
      console.error('Error restarting container:', error);
      alert('Failed to restart container. Please try again.');
    }
  };

  const runEmergencyValidation = async () => {
    if (!supabase) return;

    try {
      // Create emergency control entry
      const { error } = await supabase
        ?.from('emergency_controls')
        ?.insert({
          control_type: 'production_readiness_validation',
          trigger_reason: 'Manual validation triggered from production controls',
          impact_assessment: {
            severity: 'low',
            affected_systems: ['validation'],
            estimated_duration: '2-5 minutes'
          }
        });

      if (error) throw error;

      alert('Production readiness validation started. Check logs for progress.');
      loadDeploymentData?.();
    } catch (error) {
      console.error('Error running validation:', error);
      alert('Failed to start validation. Please try again.');
    }
  };

  const controlPanels = [
    { key: 'automation', label: 'Automation', icon: Zap },
    { key: 'certificates', label: 'Certificates', icon: Shield },
    { key: 'emergency', label: 'Emergency', icon: AlertTriangle },
    { key: 'logs', label: 'Logs', icon: FileText }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': case'success':
        return 'text-green-400';
      case 'warning': case'monitoring':
        return 'text-yellow-400';
      case 'error': case'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const renderControlPanel = () => {
    switch (activeControl) {
      case 'automation':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium text-gray-300">Automated Scripts</h5>
              <button 
                onClick={() => loadAutomationScripts()}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {automationScripts?.map((script) => (
                <div key={script?.id} className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        script?.status === 'active' ? 'bg-green-400' :
                        script?.status === 'monitoring' ? 'bg-yellow-400' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-sm font-medium text-white">{script?.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      script?.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                    }`}>
                      {script?.success ? 'OK' : 'FAILED'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{script?.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last: {new Date(script?.lastRun)?.toLocaleString()}</span>
                    <span>Next: {new Date(script?.nextRun)?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'certificates':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium text-gray-300">Certificate Management</h5>
              <button 
                onClick={() => checkCertificateStatus()}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(certificateRenewalStatus)?.map(([id, cert]) => (
                <div key={id} className={`p-3 rounded-lg border ${
                  cert?.critical ? 'bg-red-900/20 border-red-700/50' : cert?.needsRenewal ?'bg-yellow-900/20 border-yellow-700/50': 'bg-gray-900/50 border-gray-700/50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{cert?.domain}</span>
                    <button
                      onClick={() => triggerCertificateRenewal(id)}
                      className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                    >
                      Renew Now
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`${
                      cert?.critical ? 'text-red-400' : cert?.needsRenewal ?'text-yellow-400' : 'text-green-400'
                    }`}>
                      {cert?.daysUntilExpiry} days until expiry
                    </span>
                    <div className="flex items-center space-x-1">
                      {cert?.critical ? (
                        <XCircle className="h-3 w-3 text-red-400" />
                      ) : cert?.needsRenewal ? (
                        <Clock className="h-3 w-3 text-yellow-400" />
                      ) : (
                        <CheckCircle className="h-3 w-3 text-green-400" />
                      )}
                      <span className="text-gray-400">
                        {cert?.critical ? 'Critical' : cert?.needsRenewal ? 'Soon' : 'Valid'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Renew All</span>
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1">
                <Settings className="h-3 w-3" />
                <span>Configure</span>
              </button>
            </div>
          </div>
        );

      case 'emergency':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium text-gray-300">Emergency Interventions</h5>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  killSwitches?.some(ks => ks?.is_active) ? 'bg-red-400' : 'bg-green-400'
                }`}></div>
                <span className="text-xs text-gray-400">System Status</span>
              </div>
            </div>
            {/* Container Controls */}
            <div className="space-y-2">
              <h6 className="text-xs font-medium text-gray-400">Container Controls</h6>
              {['traefik', 'mvp-frontend', 'mvp-api']?.map((container) => (
                <div key={container} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                  <span className="text-sm text-gray-300">{container}</span>
                  <button
                    onClick={() => restartContainer(container)}
                    className="text-yellow-400 hover:text-yellow-300 text-xs transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            {/* System Readiness */}
            <div className="space-y-2">
              <h6 className="text-xs font-medium text-gray-400">System Readiness</h6>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(systemReadiness)?.map(([system, ready]) => (
                  <div key={system} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                    <span className="text-xs text-gray-300">{system}</span>
                    <div className={`w-2 h-2 rounded-full ${ready ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  </div>
                ))}
              </div>
            </div>
            {/* Emergency Actions */}
            <div className="space-y-2">
              <button
                onClick={runEmergencyValidation}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
              >
                <Wrench className="h-3 w-3" />
                <span>Production Validation</span>
              </button>
            </div>
          </div>
        );

      case 'logs':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium text-gray-300">Comprehensive Logging</h5>
              <button 
                onClick={() => loadOperationalLogs()}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto">
              <div className="space-y-1">
                {operationalLogs?.map((log) => (
                  <div key={log?.id} className="flex items-start space-x-2 text-xs">
                    <span className="text-gray-500 flex-shrink-0">
                      {new Date(log?.timestamp)?.toLocaleTimeString()}
                    </span>
                    <span className={`flex-shrink-0 ${
                      log?.level === 'error' ? 'text-red-400' :
                      log?.level === 'warning' ? 'text-yellow-400' :
                      log?.level === 'info' ? 'text-blue-400' : 'text-gray-400'
                    }`}>
                      [{log?.level?.toUpperCase()}]
                    </span>
                    <span className="text-gray-300 flex-1">{log?.message}</span>
                    <span className="text-gray-500 flex-shrink-0">{log?.component}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1">
                <Terminal className="h-3 w-3" />
                <span>Export Logs</span>
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1">
                <Activity className="h-3 w-3" />
                <span>Live View</span>
              </button>
            </div>
          </div>
        );

      default:
        return <div>Select a control panel</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-purple-400" />
            <span>Advanced Production Controls</span>
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              emergencyControls?.some(ec => !ec?.resolved_at) ? 'bg-red-400' : 'bg-green-400'
            }`}></div>
            <span className="text-xs text-gray-400">
              {emergencyControls?.some(ec => !ec?.resolved_at) ? 'Issues Active' : 'All Systems Normal'}
            </span>
          </div>
        </div>

        {/* Control Panel Tabs */}
        <div className="grid grid-cols-2 gap-1 mb-4 bg-gray-900/50 rounded-lg p-1">
          {controlPanels?.map((panel) => {
            const Icon = panel?.icon;
            return (
              <button
                key={panel?.key}
                onClick={() => setActiveControl(panel?.key)}
                className={`flex items-center justify-center space-x-1 py-2 px-2 rounded-md transition-all duration-200 text-xs ${
                  activeControl === panel?.key
                    ? 'bg-purple-600 text-white' :'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{panel?.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Control Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeControl}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderControlPanel()}
          </motion.div>
        </AnimatePresence>

        {/* Emergency Controls Summary */}
        {emergencyControls?.length > 0 && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-red-300">Recent Emergency Controls</span>
            </div>
            <div className="space-y-1">
              {emergencyControls?.slice(0, 3)?.map((control) => (
                <div key={control?.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{control?.control_type}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    control?.resolved_at ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                  }`}>
                    {control?.resolved_at ? 'Resolved' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}