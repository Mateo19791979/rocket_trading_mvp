import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Shield, Container, Activity, AlertTriangle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import DockerInfrastructurePanel from './components/DockerInfrastructurePanel';
import EnvironmentConfigPanel from './components/EnvironmentConfigPanel';
import DeploymentOrchestrationDashboard from './components/DeploymentOrchestrationDashboard';
import ProductionMonitoringSection from './components/ProductionMonitoringSection';
import AdvancedProductionControls from './components/AdvancedProductionControls';

export default function DockerProductionDeploymentCenter() {
  const [deploymentData, setDeploymentData] = useState({
    pipelines: [],
    metrics: [],
    certificates: [],
    killSwitches: [],
    auditLogs: [],
    emergencyControls: []
  });
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState({
    overall: 'healthy',
    docker: 'running',
    ssl: 'valid',
    deployment: 'ready'
  });

  useEffect(() => {
    loadDeploymentData();
    setupRealTimeUpdates();
  }, []);

  // Fix navigation error by adding error boundary and safer optional chaining
  const loadDeploymentData = async () => {
    if (!supabase) {
      console.warn('Supabase client not available');
      setDeploymentData({
        pipelines: [],
        metrics: [],
        certificates: [],
        killSwitches: [],
        auditLogs: [],
        emergencyControls: []
      });
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Load deployment pipelines with safer error handling
      const { data: pipelines, error: pipelineError } = (await supabase
        ?.from('deployment_pipelines')
        ?.select('*')
        ?.order('created_at', { ascending: false })
        ?.limit(10)) || {};

      if (pipelineError) {
        console.warn('Pipeline data unavailable:', pipelineError?.message);
      }

      // Load deployment metrics with error handling
      const { data: metrics, error: metricsError } = (await supabase
        ?.from('deployment_metrics')
        ?.select('*')
        ?.order('measured_at', { ascending: false })
        ?.limit(20)) || {};

      if (metricsError) {
        console.warn('Metrics data unavailable:', metricsError?.message);
      }

      // Load SSL certificates
      const { data: certificates } = await supabase
        ?.from('ssl_certificates')
        ?.select(`
          *,
          domain_configs (
            domain_name,
            status,
            dns_provider
          )
        `)
        ?.order('expires_at', { ascending: true });

      // Load kill switches
      const { data: killSwitches } = await supabase
        ?.from('kill_switches')
        ?.select('*')
        ?.order('updated_at', { ascending: false });

      // Load recent audit logs
      const { data: auditLogs } = await supabase
        ?.from('deployment_audit_logs')
        ?.select('*')
        ?.order('created_at', { ascending: false })
        ?.limit(15);

      // Load emergency controls
      const { data: emergencyControls } = await supabase
        ?.from('emergency_controls')
        ?.select('*')
        ?.order('triggered_at', { ascending: false })
        ?.limit(10);

      setDeploymentData({
        pipelines: pipelines || [],
        metrics: metrics || [],
        certificates: certificates || [],
        killSwitches: killSwitches || [],
        auditLogs: auditLogs || [],
        emergencyControls: emergencyControls || []
      });

      // Calculate system health with fallback data
      calculateSystemHealth(pipelines || [], certificates || [], killSwitches || []);
    } catch (error) {
      console.error('Error loading deployment data:', error);
      // Set fallback data to prevent UI crashes
      setDeploymentData({
        pipelines: [],
        metrics: [],
        certificates: [],
        killSwitches: [],
        auditLogs: [],
        emergencyControls: []
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSystemHealth = (pipelines, certificates, killSwitches) => {
    const health = {
      overall: 'healthy',
      docker: 'running',
      ssl: 'valid',
      deployment: 'ready'
    };

    // Check deployment health
    const runningPipelines = pipelines?.filter(p => p?.overall_status === 'running')?.length || 0;
    const failedPipelines = pipelines?.filter(p => p?.overall_status === 'failed')?.length || 0;
    
    if (failedPipelines > 0) {
      health.deployment = 'issues';
      health.overall = 'warning';
    } else if (runningPipelines > 0) {
      health.deployment = 'deploying';
    }

    // Check SSL health
    const expiringSoon = certificates?.filter(cert => {
      const daysUntilExpiry = cert?.expires_at ? 
        Math.ceil((new Date(cert.expires_at) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
      return daysUntilExpiry <= 30;
    })?.length || 0;

    if (expiringSoon > 0) {
      health.ssl = 'warning';
      if (health?.overall === 'healthy') health.overall = 'warning';
    }

    // Check kill switches
    const activeKillSwitches = killSwitches?.filter(ks => ks?.is_active)?.length || 0;
    if (activeKillSwitches > 0) {
      health.overall = 'critical';
      health.docker = 'restricted';
    }

    setSystemHealth(health);
  };

  const setupRealTimeUpdates = () => {
    if (!supabase) return;

    const channels = [
      supabase?.channel('deployment-updates')
        ?.on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'deployment_pipelines'
        }, () => loadDeploymentData())
        ?.subscribe(),

      supabase?.channel('ssl-updates')
        ?.on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'ssl_certificates'
        }, () => loadDeploymentData())
        ?.subscribe(),

      supabase?.channel('killswitch-updates')
        ?.on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'kill_switches'
        }, () => loadDeploymentData())
        ?.subscribe()
    ];

    return () => {
      channels?.forEach(channel => {
        if (channel) supabase?.removeChannel(channel);
      });
    };
  };

  const triggerEmergencyStop = async () => {
    if (!supabase || !confirm('Are you sure you want to trigger emergency stop? This will halt all production operations.')) {
      return;
    }

    try {
      // Activate critical kill switches
      const { error: killError } = await supabase
        ?.from('kill_switches')
        ?.update({ 
          is_active: true, 
          reason: 'Emergency stop triggered from deployment center',
          updated_at: new Date()?.toISOString()
        })
        ?.in('module', ['EXECUTION', 'STRATEGY_GENERATION', 'DEPLOYMENT']);

      if (killError) throw killError;

      // Log emergency control
      const { error: controlError } = await supabase
        ?.from('emergency_controls')
        ?.insert({
          control_type: 'emergency_stop',
          trigger_reason: 'Manual emergency stop from Docker Production Deployment Center',
          impact_assessment: {
            severity: 'critical',
            affected_systems: ['docker', 'deployment', 'trading'],
            estimated_downtime: '5-15 minutes'
          }
        });

      if (controlError) throw controlError;

      alert('Emergency stop activated successfully. All production operations have been halted.');
      loadDeploymentData();
    } catch (error) {
      console.error('Error triggering emergency stop:', error);
      alert('Failed to trigger emergency stop. Please check console for details.');
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': case'running': case'valid': case'ready':
        return 'text-green-400';
      case 'warning': case'deploying':
        return 'text-yellow-400';
      case 'critical': case'issues': case'restricted':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading Docker Production Infrastructure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Container className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Docker Production Deployment Center
                </h1>
                <p className="text-gray-400">
                  Complete orchestration with automated SSL and load balancing
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* System Health Indicators */}
            <div className="flex items-center space-x-3 bg-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Server className={`h-4 w-4 ${getHealthColor(systemHealth?.docker)}`} />
                <span className="text-sm">Docker</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className={`h-4 w-4 ${getHealthColor(systemHealth?.ssl)}`} />
                <span className="text-sm">SSL</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className={`h-4 w-4 ${getHealthColor(systemHealth?.deployment)}`} />
                <span className="text-sm">Deploy</span>
              </div>
            </div>
            <button
              onClick={triggerEmergencyStop}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Emergency Stop</span>
            </button>
          </div>
        </div>
      </motion.div>
      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Docker Infrastructure & Environment */}
        <div className="col-span-4 space-y-6">
          <DockerInfrastructurePanel 
            certificates={deploymentData?.certificates}
            systemHealth={systemHealth}
          />
          <EnvironmentConfigPanel 
            pipelines={deploymentData?.pipelines}
            loadDeploymentData={loadDeploymentData}
          />
        </div>

        {/* Center Column - Deployment Orchestration & Monitoring */}
        <div className="col-span-4 space-y-6">
          <DeploymentOrchestrationDashboard 
            pipelines={deploymentData?.pipelines}
            metrics={deploymentData?.metrics}
            loadDeploymentData={loadDeploymentData}
          />
          <ProductionMonitoringSection 
            metrics={deploymentData?.metrics}
            auditLogs={deploymentData?.auditLogs}
            killSwitches={deploymentData?.killSwitches}
          />
        </div>

        {/* Right Column - Advanced Production Controls */}
        <div className="col-span-4 space-y-6">
          <AdvancedProductionControls 
            emergencyControls={deploymentData?.emergencyControls}
            killSwitches={deploymentData?.killSwitches}
            certificates={deploymentData?.certificates}
            loadDeploymentData={loadDeploymentData}
          />
        </div>
      </div>
      {/* Status Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4"
      >
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                systemHealth?.overall === 'healthy' ? 'bg-green-400' :
                systemHealth?.overall === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span>System Status: {systemHealth?.overall?.toUpperCase()}</span>
            </div>
            <span>•</span>
            <span>Active Pipelines: {deploymentData?.pipelines?.filter(p => p?.overall_status === 'running')?.length || 0}</span>
            <span>•</span>
            <span>SSL Certificates: {deploymentData?.certificates?.length || 0} active</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Last Updated: {new Date()?.toLocaleTimeString()}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}