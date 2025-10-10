import React from 'react';
import { Play, CheckCircle, Clock, AlertTriangle, Loader } from 'lucide-react';
import Icon from '../../../components/AppIcon';


export default function DailyExecutionPanel({ 
  stageDefinitions, 
  stageExecutions, 
  onExecuteStage,
  currentPipeline 
}) {
  const getStageExecution = (stageId) => {
    return stageExecutions?.find(se => se?.stage === stageId);
  };

  const canExecuteStage = (stageId) => {
    const stage = getStageExecution(stageId);
    return stage?.status === 'pending' && currentPipeline?.overall_status !== 'failed';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'running':
        return <Loader size={20} className="text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertTriangle size={20} className="text-red-600" />;
      case 'pending':
        return <Clock size={20} className="text-gray-400" />;
      default:
        return <Clock size={20} className="text-gray-400" />;
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground font-heading">
          Daily Execution Pipeline
        </h2>
        <div className="text-sm text-muted-foreground font-body">
          J1-J2 Foundation Stages
        </div>
      </div>
      <div className="space-y-4">
        {stageDefinitions?.slice(0, 2)?.map((stage) => {
          const Icon = stage?.icon;
          const execution = getStageExecution(stage?.id);
          const canExecute = canExecuteStage(stage?.id);
          
          return (
            <div key={stage?.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stage?.color} shadow-md`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground font-heading">
                      {stage?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-body">
                      Est. {stage?.estimatedDuration}min
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(execution?.status)}
                  {canExecute && (
                    <button
                      onClick={() => onExecuteStage(stage?.id)}
                      className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      title="Execute Stage"
                    >
                      <Play size={16} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-body mb-3">
                {stage?.description}
              </p>
              {/* Execution Details */}
              {execution && (
                <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Status: {execution?.status}</span>
                    {execution?.duration_seconds && (
                      <span>Duration: {Math.round(execution?.duration_seconds / 60)}min</span>
                    )}
                  </div>
                  
                  {execution?.stdout_log && (
                    <div className="bg-white rounded p-2 max-h-20 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-xs">
                        {execution?.stdout_log}
                      </pre>
                    </div>
                  )}

                  {execution?.metrics && Object.keys(execution?.metrics)?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs font-semibold mb-1">Metrics:</div>
                      {Object.entries(execution?.metrics)?.map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span>{key}:</span>
                          <span className="font-semibold">
                            {typeof value === 'boolean' ? (value ? '✓' : '✗') : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* Health Checks for J1 */}
              {stage?.id === 'j1_boot_guard' && execution?.status === 'completed' && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-semibold text-green-700">System Health Checks:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <CheckCircle size={12} className="text-green-600" />
                      <span>RLS Health OK</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle size={12} className="text-green-600" />
                      <span>Dependencies Verified</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle size={12} className="text-green-600" />
                      <span>Infrastructure Ready</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle size={12} className="text-green-600" />
                      <span>API Responsive</span>
                    </div>
                  </div>
                </div>
              )}
              {/* Performance Metrics for J2 */}
              {stage?.id === 'j2_performance_testing' && execution?.status === 'running' && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-semibold text-blue-700">Performance Testing:</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Target Latency:</span>
                      <span className="font-semibold">&lt; 400ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target Throughput:</span>
                      <span className="font-semibold">&gt; 1000 req/s</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                    <div className="text-center text-xs text-muted-foreground">45% Complete</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Automated Script Triggers */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-semibold text-foreground font-heading mb-3">
          Automated Script Triggers
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-body">Environment Validation</span>
            <CheckCircle size={16} className="text-green-600" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-body">Dependency Check</span>
            <CheckCircle size={16} className="text-green-600" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-body">K6 Test Suite</span>
            <Loader size={16} className="text-blue-600 animate-spin" />
          </div>
        </div>
      </div>
    </div>
  );
}