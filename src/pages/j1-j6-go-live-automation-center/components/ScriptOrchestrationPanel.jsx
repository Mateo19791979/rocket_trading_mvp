import React, { useState } from 'react';
import { Code, Terminal, FileText, Settings, CheckCircle, AlertTriangle, Clock, Loader } from 'lucide-react';

export default function ScriptOrchestrationPanel({ 
  automationScripts, 
  currentPipeline,
  stageExecutions 
}) {
  const [selectedScript, setSelectedScript] = useState(null);
  const [showOutput, setShowOutput] = useState(true);

  const getScriptForStage = (stage) => {
    return automationScripts?.find(script => script?.stage === stage);
  };

  const getExecutionForStage = (stage) => {
    return stageExecutions?.find(se => se?.stage === stage);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'running': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'running':
        return <Loader size={16} className="text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertTriangle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  const currentlyRunningExecution = stageExecutions?.find(se => se?.status === 'running');

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground font-heading">
          Script Orchestration
        </h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground font-body">
          <Terminal size={16} />
          <span>Makefile Execution</span>
        </div>
      </div>
      {/* Real-time Output Streaming */}
      {currentlyRunningExecution && showOutput && (
        <div className="mb-6 bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Terminal size={16} />
              <span className="text-white">Live Output - {currentlyRunningExecution?.script_name}</span>
            </div>
            <button 
              onClick={() => setShowOutput(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="bg-black rounded p-2 max-h-32 overflow-y-auto">
            <pre className="whitespace-pre-wrap">
              {currentlyRunningExecution?.stdout_log || 'Initializing script execution...\n$ bash ./ops/' + currentlyRunningExecution?.script_name}
            </pre>
          </div>
        </div>
      )}
      {/* Makefile Commands */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground font-heading mb-3">
          Available Make Commands
        </h3>
        
        <div className="grid grid-cols-1 gap-2">
          {['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'all']?.map((command) => {
            const stage = command === 'all' ? null : `j${command?.slice(-1)}_${
              command === 'day1' ? 'boot_guard' :
              command === 'day2' ? 'performance_testing' :
              command === 'day3' ? 'security_scanning' :
              command === 'day4' ? 'monitoring_setup' :
              command === 'day5'? 'qa_validation' : 'production_release'
            }`;
            
            const execution = stage ? getExecutionForStage(stage) : null;
            const isRunning = execution?.status === 'running';
            const isCompleted = execution?.status === 'completed';
            
            return (
              <div key={command} className={`flex items-center justify-between p-3 rounded-lg border ${
                isRunning ? 'border-blue-200 bg-blue-50' :
                isCompleted ? 'border-green-200 bg-green-50': 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center space-x-3">
                  <Code size={16} className="text-muted-foreground" />
                  <span className="font-mono text-sm font-medium">
                    make -C ops {command}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {execution && getStatusIcon(execution?.status)}
                  {command !== 'all' && execution?.duration_seconds && (
                    <span className="text-xs text-muted-foreground font-body">
                      {Math.round(execution?.duration_seconds / 60)}min
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Script Configuration */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground font-heading mb-3">
          Environment Configuration
        </h3>
        
        {currentPipeline?.environment_variables && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 gap-2 text-sm font-mono">
              {Object.entries(currentPipeline?.environment_variables)?.slice(0, 3)?.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="text-foreground font-medium truncate max-w-32">
                    {typeof value === 'string' && value?.length > 20 ? value?.substring(0, 20) +'...' : 
                      value
                    }
                  </span>
                </div>
              ))}
              {Object.keys(currentPipeline?.environment_variables)?.length > 3 && (
                <div className="text-center text-muted-foreground text-xs">
                  +{Object.keys(currentPipeline?.environment_variables)?.length - 3} more variables
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Error Handling & Rollback */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground font-heading mb-3">
          Error Handling
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-body">Auto-retry enabled</span>
            <CheckCircle size={16} className="text-green-600" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-body">Rollback capability</span>
            <CheckCircle size={16} className="text-green-600" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-body">Circuit breaker</span>
            <CheckCircle size={16} className="text-green-600" />
          </div>
        </div>
      </div>
      {/* Script Details */}
      <div>
        <h3 className="text-lg font-semibold text-foreground font-heading mb-3">
          Script Repository
        </h3>
        
        <div className="space-y-2">
          {automationScripts?.slice(0, 3)?.map((script) => (
            <div 
              key={script?.id} 
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedScript(selectedScript?.id === script?.id ? null : script)}
            >
              <div className="flex items-center space-x-3">
                <FileText size={16} className="text-muted-foreground" />
                <div>
                  <span className="font-medium text-foreground font-heading">
                    {script?.script_name}
                  </span>
                  <div className="text-xs text-muted-foreground font-body">
                    {script?.description}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground font-body">
                  {script?.timeout_minutes}min timeout
                </span>
                <Settings size={14} className="text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>

        {/* Script Details Modal */}
        {selectedScript && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-foreground font-heading">
                {selectedScript?.script_name}
              </h4>
              <button 
                onClick={() => setSelectedScript(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Path:</span> {selectedScript?.script_path}
              </div>
              <div>
                <span className="font-medium">Stage:</span> {selectedScript?.stage}
              </div>
              <div>
                <span className="font-medium">Required Variables:</span>
                <div className="ml-2 mt-1">
                  {selectedScript?.required_env_vars?.map((envVar) => (
                    <div key={envVar} className="font-mono text-xs text-muted-foreground">
                      {envVar}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}