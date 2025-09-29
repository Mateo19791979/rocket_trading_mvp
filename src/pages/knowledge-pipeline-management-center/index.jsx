import React, { useState, useEffect } from 'react';
import { Server, Play, Pause, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import PipelineArchitecturePanel from './components/PipelineArchitecturePanel';
import ProcessingModulesPanel from './components/ProcessingModulesPanel';
import LiveMonitoringPanel from './components/LiveMonitoringPanel';
import SystemIntegrationPanel from './components/SystemIntegrationPanel';
import InteractivePipelineControls from './components/InteractivePipelineControls';

const KnowledgePipelineManagementCenter = () => {
  const [systemStatus, setSystemStatus] = useState('healthy');
  const [pipelineRunning, setPipelineRunning] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Update timestamp every minute
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleStartPipeline = () => {
    setPipelineRunning(true);
    setSystemStatus('healthy');
  };

  const handleStopPipeline = () => {
    setPipelineRunning(false);
    setSystemStatus('stopped');
  };

  const handleRefreshStatus = () => {
    setLastUpdate(new Date());
    // Trigger refresh in child components
    window.dispatchEvent(new CustomEvent('refresh-pipeline-status'));
  };

  const statusColor = {
    healthy: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    stopped: 'text-gray-400'
  };

  const statusIcon = {
    healthy: CheckCircle,
    warning: AlertCircle,
    error: AlertCircle,
    stopped: Clock
  };

  const StatusIcon = statusIcon?.[systemStatus];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-800/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-gradient-to-br from-blue-500 to-teal-600 p-2">
                  <Server className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Knowledge Pipeline Management Center
                  </h1>
                  <p className="text-sm text-gray-400">
                    Trading MVP Knowledge Pipeline System v1.0.0
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* System Status */}
              <div className="flex items-center space-x-2">
                <StatusIcon className={`h-5 w-5 ${statusColor?.[systemStatus]}`} />
                <span className={`text-sm font-medium ${statusColor?.[systemStatus]}`}>
                  {systemStatus?.charAt(0)?.toUpperCase() + systemStatus?.slice(1)}
                </span>
              </div>

              {/* Pipeline Controls */}
              <div className="flex items-center space-x-2">
                {pipelineRunning ? (
                  <button
                    onClick={handleStopPipeline}
                    className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-colors"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={handleStartPipeline}
                    className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-colors"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </button>
                )}
                
                <button
                  onClick={handleRefreshStatus}
                  className="inline-flex items-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>

              {/* Last Update */}
              <div className="text-sm text-gray-400">
                Last update: {lastUpdate?.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Pipeline Architecture */}
            <PipelineArchitecturePanel pipelineRunning={pipelineRunning} />
            
            {/* Processing Modules */}
            <ProcessingModulesPanel systemStatus={systemStatus} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Live Monitoring */}
            <LiveMonitoringPanel pipelineRunning={pipelineRunning} />
            
            {/* System Integration */}
            <SystemIntegrationPanel />
          </div>
        </div>

        {/* Bottom Full Width */}
        <div className="mt-8">
          <InteractivePipelineControls 
            pipelineRunning={pipelineRunning}
            onStatusChange={setSystemStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default KnowledgePipelineManagementCenter;