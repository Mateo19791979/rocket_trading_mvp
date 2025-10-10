import React, { useState, useEffect } from 'react';
import { Square, AlertTriangle, CheckCircle, Clock, Shield, BarChart3, TestTube, Rocket, Calendar, Target, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Header from '../../components/ui/Header';

import DailyExecutionPanel from './components/DailyExecutionPanel';
import ProgressDashboard from './components/ProgressDashboard';
import ScriptOrchestrationPanel from './components/ScriptOrchestrationPanel';
import StageProgressPanel from './components/StageProgressPanel';

export default function J1J6GoLiveAutomationCenter() {
  const [activeItem, setActiveItem] = useState('j1-j6-automation');
  const [deploymentPipelines, setDeploymentPipelines] = useState([]);
  const [currentPipeline, setCurrentPipeline] = useState(null);
  const [stageExecutions, setStageExecutions] = useState([]);
  const [deploymentMetrics, setDeploymentMetrics] = useState([]);
  const [automationScripts, setAutomationScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stage definitions for J1-J6 workflow
  const stageDefinitions = [
    {
      id: 'j1_boot_guard',
      name: 'J1 - Boot Guard & Environment',
      description: 'System health checks, dependency verification, and infrastructure readiness',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500',
      estimatedDuration: 15
    },
    {
      id: 'j2_performance_testing', 
      name: 'J2 - K6 Performance Testing',
      description: 'Load testing orchestration with API latency validation and throughput testing',
      icon: BarChart3,
      color: 'from-green-500 to-teal-500',
      estimatedDuration: 45
    },
    {
      id: 'j3_security_scanning',
      name: 'J3 - Security Scanning',
      description: 'Vulnerability assessment with OWASP ZAP and SSL certificate validation',
      icon: Shield,
      color: 'from-yellow-500 to-orange-500',
      estimatedDuration: 30
    },
    {
      id: 'j4_monitoring_setup',
      name: 'J4 - Monitoring & Alerts',
      description: 'Prometheus integration with alerting configuration and dashboard setup',
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
      estimatedDuration: 10
    },
    {
      id: 'j5_qa_validation',
      name: 'J5 - QA Final Validation',
      description: 'End-to-end test execution with comprehensive system validation',
      icon: TestTube,
      color: 'from-indigo-500 to-blue-500',
      estimatedDuration: 20
    },
    {
      id: 'j6_production_release',
      name: 'J6 - Production Release',
      description: 'Automated tagging, backup verification, and production deployment',
      icon: Rocket,
      color: 'from-red-500 to-pink-500',
      estimatedDuration: 25
    }
  ];

  const loadDeploymentData = async () => {
    try {
      setLoading(true);
      
      // Load deployment pipelines
      const { data: pipelines, error: pipelinesError } = await supabase?.from('deployment_pipelines')?.select('*')?.order('created_at', { ascending: false });

      if (pipelinesError) throw pipelinesError;

      setDeploymentPipelines(pipelines || []);
      
      // Set current pipeline (first active one or most recent)
      const activePipeline = pipelines?.find(p => p?.overall_status === 'running') || pipelines?.[0];
      setCurrentPipeline(activePipeline);

      if (activePipeline) {
        // Load stage executions for current pipeline
        const { data: stages, error: stagesError } = await supabase?.from('stage_executions')?.select('*')?.eq('pipeline_id', activePipeline?.id)?.order('execution_order', { ascending: true });

        if (stagesError) throw stagesError;
        setStageExecutions(stages || []);

        // Load deployment metrics
        const { data: metrics, error: metricsError } = await supabase?.from('deployment_metrics')?.select('*')?.eq('pipeline_id', activePipeline?.id)?.order('measured_at', { ascending: false });

        if (metricsError) throw metricsError;
        setDeploymentMetrics(metrics || []);
      }

      // Load automation scripts
      const { data: scripts, error: scriptsError } = await supabase?.from('automation_scripts')?.select('*')?.eq('is_active', true)?.order('stage', { ascending: true });

      if (scriptsError) throw scriptsError;
      setAutomationScripts(scripts || []);

    } catch (err) {
      console.log('Deployment data load error:', err?.message);
      setError(`Failed to load deployment data: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const executeStage = async (stageId) => {
    try {
      if (!currentPipeline) return;

      const { error } = await supabase?.from('stage_executions')?.update({
          status: 'running',
          started_at: new Date()?.toISOString()
        })?.eq('pipeline_id', currentPipeline?.id)?.eq('stage', stageId);

      if (error) throw error;

      // Refresh data
      loadDeploymentData();

    } catch (err) {
      console.log('Stage execution error:', err?.message);
      setError(`Failed to execute stage: ${err?.message}`);
    }
  };

  const triggerEmergencyKillswitch = async (reason) => {
    try {
      if (!currentPipeline) return;

      const { error } = await supabase?.from('emergency_controls')?.insert({
          pipeline_id: currentPipeline?.id,
          control_type: 'killswitch',
          trigger_reason: reason || 'Manual emergency stop'
        });

      if (error) throw error;

      // Update pipeline status
      const { error: updateError } = await supabase?.from('deployment_pipelines')?.update({
          overall_status: 'cancelled'
        })?.eq('id', currentPipeline?.id);

      if (updateError) throw updateError;

      loadDeploymentData();

    } catch (err) {
      console.log('Emergency killswitch error:', err?.message);
      setError(`Failed to trigger killswitch: ${err?.message}`);
    }
  };

  useEffect(() => {
    loadDeploymentData();
    
    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(loadDeploymentData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header activeItem={activeItem} setActiveItem={setActiveItem} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-lg font-semibold text-foreground mb-2 font-heading">
                Loading J1-J6 Automation Center...
              </h2>
              <p className="text-muted-foreground font-body">
                Initializing deployment orchestration system
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-heading">
                J1-J6 Go-Live Automation Center
              </h1>
              <p className="text-muted-foreground font-body mt-2">
                Comprehensive deployment orchestration for 6-day production launch sequence with automated script execution and monitoring
              </p>
            </div>
            
            {/* Target Date & Overall Status */}
            <div className="text-right">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground font-body mb-1">
                <Calendar size={16} />
                <span>Target Date: October 9, 2025</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target size={16} className="text-primary" />
                <span className="text-lg font-semibold text-primary font-heading">
                  {currentPipeline?.completion_percentage?.toFixed(1) || '0'}% Ready
                </span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={16} className="text-red-600" />
                <span className="text-red-700 font-body">{error}</span>
              </div>
            </div>
          )}

          {/* Pipeline Status Overview */}
          {currentPipeline && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-trading mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground font-heading">
                    {currentPipeline?.pipeline_name}
                  </h2>
                  <p className="text-muted-foreground font-body">
                    Current Stage: {stageDefinitions?.find(s => s?.id === currentPipeline?.current_stage)?.name || 'Unknown'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Pipeline Status Badge */}
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentPipeline?.overall_status === 'completed' ? 'bg-green-100 text-green-700' :
                    currentPipeline?.overall_status === 'running' ? 'bg-blue-100 text-blue-700' :
                    currentPipeline?.overall_status === 'failed'? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {currentPipeline?.overall_status === 'running' && <Activity size={14} className="inline mr-1" />}
                    {currentPipeline?.overall_status === 'completed' && <CheckCircle size={14} className="inline mr-1" />}
                    {currentPipeline?.overall_status === 'failed' && <AlertTriangle size={14} className="inline mr-1" />}
                    {currentPipeline?.overall_status === 'pending' && <Clock size={14} className="inline mr-1" />}
                    {currentPipeline?.overall_status?.charAt(0)?.toUpperCase() + currentPipeline?.overall_status?.slice(1)}
                  </div>

                  {/* Emergency Controls */}
                  {currentPipeline?.overall_status === 'running' && (
                    <button
                      onClick={() => triggerEmergencyKillswitch('Manual intervention required')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <Square size={16} />
                      <span>Emergency Stop</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Daily Execution Pipeline */}
          <div className="lg:col-span-4 space-y-6">
            <DailyExecutionPanel 
              stageDefinitions={stageDefinitions}
              stageExecutions={stageExecutions}
              onExecuteStage={executeStage}
              currentPipeline={currentPipeline}
            />
          </div>

          {/* Center Column - Progress Dashboard */}
          <div className="lg:col-span-4 space-y-6">
            <ProgressDashboard 
              currentPipeline={currentPipeline}
              stageExecutions={stageExecutions}
              deploymentMetrics={deploymentMetrics}
              stageDefinitions={stageDefinitions}
            />

            <ScriptOrchestrationPanel 
              automationScripts={automationScripts}
              currentPipeline={currentPipeline}
              stageExecutions={stageExecutions}
            />
          </div>

          {/* Right Column - J3-J6 Execution Stages */}
          <div className="lg:col-span-4 space-y-6">
            <StageProgressPanel 
              stageDefinitions={stageDefinitions?.slice(2)} // J3-J6
              stageExecutions={stageExecutions}
              deploymentMetrics={deploymentMetrics}
              onExecuteStage={executeStage}
              title="J3-J6 Execution Stages"
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground font-body">
            Deployment automation powered by comprehensive J1-J6 workflow orchestration
          </p>
        </div>
      </div>
    </div>
  );
}