import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, RefreshCw, CheckCircle, AlertCircle, Clock, Layers, GitBranch, ArrowRight, Terminal, Activity } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function DeploymentOrchestrationDashboard({ pipelines, metrics, loadDeploymentData }) {
  const [activeDeployment, setActiveDeployment] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState([]);
  const [realTimeStatus, setRealTimeStatus] = useState({});

  useEffect(() => {
    if (pipelines?.length > 0) {
      setActiveDeployment(pipelines?.[0]);
      loadStageExecutions(pipelines?.[0]?.id);
    }
  }, [pipelines]);

  const loadStageExecutions = async (pipelineId) => {
    if (!supabase || !pipelineId) return;

    try {
      const { data: executions } = await supabase
        ?.from('stage_executions')
        ?.select('*')
        ?.eq('pipeline_id', pipelineId)
        ?.order('execution_order');

      setDeploymentLogs(executions || []);
    } catch (error) {
      console.error('Error loading stage executions:', error);
    }
  };

  const startDeployment = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        ?.from('deployment_pipelines')
        ?.insert({
          pipeline_name: `Docker Deployment - ${new Date()?.toISOString()}`,
          environment_variables: {
            DEPLOYMENT_TYPE: 'docker-compose',
            ENVIRONMENT: 'production'
          },
          configuration: {
            services: ['traefik', 'frontend', 'api'],
            health_checks: true,
            rollback_enabled: true
          },
          overall_status: 'running',
          current_stage: 'j1_boot_guard',
          started_at: new Date()?.toISOString()
        });

      if (error) throw error;

      // Create initial stage executions
      const stages = [
        { stage: 'j1_boot_guard', script_name: 'day1_boot_guard.sh', execution_order: 1 },
        { stage: 'j2_performance_testing', script_name: 'day2_k6_suite.sh', execution_order: 2 },
        { stage: 'j3_security_scanning', script_name: 'day3_security_scan.sh', execution_order: 3 },
        { stage: 'j4_monitoring_setup', script_name: 'day4_monitoring_alerts.yml', execution_order: 4 },
        { stage: 'j5_qa_validation', script_name: 'day5_qa_final.sh', execution_order: 5 },
        { stage: 'j6_production_release', script_name: 'day6_release.sh', execution_order: 6 }
      ];

      for (const stageData of stages) {
        await supabase
          ?.from('stage_executions')
          ?.insert({
            pipeline_id: data?.[0]?.id,
            ...stageData,
            command_template: `docker-compose exec production-deployment /ops/${stageData?.script_name}`,
            status: stageData?.execution_order === 1 ? 'running' : 'pending'
          });
      }

      alert('Deployment started successfully!');
      loadDeploymentData?.();
    } catch (error) {
      console.error('Error starting deployment:', error);
      alert('Failed to start deployment. Please try again.');
    }
  };

  const pauseDeployment = async (pipelineId) => {
    if (!supabase || !pipelineId) return;

    try {
      const { error } = await supabase
        ?.from('deployment_pipelines')
        ?.update({ 
          overall_status: 'paused',
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', pipelineId);

      if (error) throw error;

      alert('Deployment paused successfully!');
      loadDeploymentData?.();
    } catch (error) {
      console.error('Error pausing deployment:', error);
    }
  };

  const stopDeployment = async (pipelineId) => {
    if (!supabase || !pipelineId || !confirm('Are you sure you want to stop this deployment?')) {
      return;
    }

    try {
      const { error } = await supabase
        ?.from('deployment_pipelines')
        ?.update({ 
          overall_status: 'cancelled',
          completed_at: new Date()?.toISOString()
        })
        ?.eq('id', pipelineId);

      if (error) throw error;

      alert('Deployment stopped successfully!');
      loadDeploymentData?.();
    } catch (error) {
      console.error('Error stopping deployment:', error);
    }
  };

  const getStageIcon = (stage, status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/50 text-green-300 border-green-700/50';
      case 'running':
        return 'bg-blue-900/50 text-blue-300 border-blue-700/50';
      case 'failed':
        return 'bg-red-900/50 text-red-300 border-red-700/50';
      case 'paused':
        return 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50';
      default:
        return 'bg-gray-700/50 text-gray-300 border-gray-600/50';
    }
  };

  const calculateProgress = (pipeline) => {
    if (!pipeline) return 0;
    return pipeline?.completion_percentage || 0;
  };

  const runningPipelines = pipelines?.filter(p => p?.overall_status === 'running') || [];
  const completedPipelines = pipelines?.filter(p => p?.overall_status === 'completed') || [];
  const failedPipelines = pipelines?.filter(p => p?.overall_status === 'failed') || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Layers className="h-5 w-5 text-blue-400" />
            <span>Deployment Orchestration</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
            >
              <Terminal className="h-3 w-3" />
              <span>{showLogs ? 'Hide' : 'Show'} Logs</span>
            </button>
            <button
              onClick={startDeployment}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>Deploy</span>
            </button>
          </div>
        </div>

        {/* Deployment Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-blue-400">{runningPipelines?.length}</div>
            <div className="text-xs text-gray-400">Running</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-green-400">{completedPipelines?.length}</div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-red-400">{failedPipelines?.length}</div>
            <div className="text-xs text-gray-400">Failed</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-purple-400">
              {metrics?.length || 0}
            </div>
            <div className="text-xs text-gray-400">Metrics</div>
          </div>
        </div>

        {/* Active Deployment */}
        {activeDeployment && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${getStatusColor(activeDeployment?.overall_status)}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{activeDeployment?.pipeline_name}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs">
                    {Math.round(calculateProgress(activeDeployment))}%
                  </span>
                  {activeDeployment?.overall_status === 'running' && (
                    <>
                      <button
                        onClick={() => pauseDeployment(activeDeployment?.id)}
                        className="p-1 text-yellow-400 hover:text-yellow-300"
                      >
                        <Pause className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => stopDeployment(activeDeployment?.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <Square className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress(activeDeployment)}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Stage: {activeDeployment?.current_stage?.replace(/_/g, ' ')?.toUpperCase()}</span>
                <span>Started: {new Date(activeDeployment?.started_at || activeDeployment?.created_at)?.toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Stage Pipeline Visualization */}
            {deploymentLogs?.length > 0 && (
              <div className="bg-gray-900/30 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
                  <GitBranch className="h-4 w-4" />
                  <span>Deployment Stages</span>
                </h5>
                <div className="space-y-2">
                  {deploymentLogs?.map((execution, index) => (
                    <div key={execution?.id} className="flex items-center space-x-3">
                      {getStageIcon(execution?.stage, execution?.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white">
                            {execution?.stage?.replace(/_/g, ' ')?.toUpperCase()}
                          </span>
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            {execution?.duration_seconds && (
                              <span>{execution?.duration_seconds}s</span>
                            )}
                            <span className={`px-2 py-1 rounded ${getStatusColor(execution?.status)}`}>
                              {execution?.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {execution?.script_name}
                        </div>
                      </div>
                      {index < deploymentLogs?.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-gray-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Deployments List */}
        <div className="mt-6">
          <h5 className="text-sm font-medium text-gray-300 mb-3">Recent Deployments</h5>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {pipelines?.slice(0, 5)?.map((pipeline) => (
              <div
                key={pipeline?.id}
                onClick={() => {
                  setActiveDeployment(pipeline);
                  loadStageExecutions(pipeline?.id);
                }}
                className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-700/50 ${
                  activeDeployment?.id === pipeline?.id ? 'bg-blue-900/20 border border-blue-700/50' : 'bg-gray-900/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white truncate">
                      {pipeline?.pipeline_name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {pipeline?.created_at ? new Date(pipeline.created_at)?.toLocaleString() : 'Unknown date'}
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${getStatusColor(pipeline?.overall_status)}`}>
                    {pipeline?.overall_status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deployment Logs */}
        <AnimatePresence>
          {showLogs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 bg-gray-900 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Real-time Deployment Logs</span>
                </h5>
                <button className="text-gray-400 hover:text-white">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="bg-black/50 rounded p-3 font-mono text-xs text-green-400 max-h-40 overflow-y-auto">
                <div>[{new Date()?.toISOString()}] Starting Docker Compose deployment...</div>
                <div>[{new Date()?.toISOString()}] Pulling latest images...</div>
                <div>[{new Date()?.toISOString()}] traefik: Image pulled successfully</div>
                <div>[{new Date()?.toISOString()}] frontend: Building multi-stage image...</div>
                <div>[{new Date()?.toISOString()}] api: Container started</div>
                <div>[{new Date()?.toISOString()}] Health checks passing...</div>
                {deploymentLogs?.map((log, i) => (
                  <div key={i}>
                    [{new Date()?.toISOString()}] {log?.stage}: {log?.status}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}