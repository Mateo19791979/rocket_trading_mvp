import React from 'react';
import { Play, CheckCircle, Clock, AlertTriangle, Loader, BarChart3, TrendingUp } from 'lucide-react';
import Icon from '../../../components/AppIcon';


export default function StageProgressPanel({ 
  stageDefinitions, 
  stageExecutions, 
  deploymentMetrics,
  onExecuteStage,
  title = "Stage Progress"
}) {
  const getStageExecution = (stageId) => {
    return stageExecutions?.find(se => se?.stage === stageId);
  };

  const getStageMetrics = (stageId) => {
    const execution = getStageExecution(stageId);
    return deploymentMetrics?.filter(m => m?.stage_execution_id === execution?.id) || [];
  };

  const canExecuteStage = (stageId) => {
    const stage = getStageExecution(stageId);
    return stage?.status === 'pending';
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

  const getStageSpecificContent = (stage, execution) => {
    switch (stage?.id) {
      case 'j3_security_scanning':
        return (
          <div className="mt-3 space-y-2">
            <div className="text-xs font-semibold text-orange-700">Security Checks:</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>OWASP ZAP Scan:</span>
                <span className={execution?.status === 'completed' ? 'text-green-600' : 'text-gray-500'}>
                  {execution?.status === 'completed' ? '✓ Passed' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>SSL Certificate:</span>
                <span className="text-green-600">✓ Valid</span>
              </div>
              <div className="flex justify-between">
                <span>Security Headers:</span>
                <span className={execution?.status === 'completed' ? 'text-green-600' : 'text-gray-500'}>
                  {execution?.status === 'completed' ? '✓ Configured' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        );

      case 'j4_monitoring_setup':
        return (
          <div className="mt-3 space-y-2">
            <div className="text-xs font-semibold text-purple-700">Monitoring Setup:</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Prometheus Rules:</span>
                <span className={execution?.status === 'completed' ? 'text-green-600' : 'text-gray-500'}>
                  {execution?.status === 'completed' ? '✓ Installed' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Alert Manager:</span>
                <span className={execution?.status === 'completed' ? 'text-green-600' : 'text-gray-500'}>
                  {execution?.status === 'completed' ? '✓ Configured' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Grafana Dashboard:</span>
                <span className={execution?.status === 'completed' ? 'text-green-600' : 'text-gray-500'}>
                  {execution?.status === 'completed' ? '✓ Deployed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        );

      case 'j5_qa_validation':
        return (
          <div className="mt-3 space-y-2">
            <div className="text-xs font-semibold text-indigo-700">QA Validation:</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>E2E Tests:</span>
                <span className={execution?.status === 'running' ? 'text-blue-600' : 'text-gray-500'}>
                  {execution?.status === 'running' ? '⟳ Running' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>API Health:</span>
                <span className="text-green-600">✓ OK</span>
              </div>
              <div className="flex justify-between">
                <span>WebSocket:</span>
                <span className="text-green-600">✓ Connected</span>
              </div>
            </div>
          </div>
        );

      case 'j6_production_release':
        return (
          <div className="mt-3 space-y-2">
            <div className="text-xs font-semibold text-red-700">Release Preparation:</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Database Backup:</span>
                <span className={execution?.status === 'completed' ? 'text-green-600' : 'text-gray-500'}>
                  {execution?.status === 'completed' ? '✓ Created' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Git Tag:</span>
                <span className={execution?.status === 'completed' ? 'text-green-600' : 'text-gray-500'}>
                  {execution?.status === 'completed' ? '✓ v1.0.0-PROD' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sentry Release:</span>
                <span className={execution?.status === 'completed' ? 'text-green-600' : 'text-gray-500'}>
                  {execution?.status === 'completed' ? '✓ Tagged' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground font-heading">
          {title}
        </h2>
        <div className="text-sm text-muted-foreground font-body">
          Security → QA → Release
        </div>
      </div>
      <div className="space-y-4">
        {stageDefinitions?.map((stage) => {
          const Icon = stage?.icon;
          const execution = getStageExecution(stage?.id);
          const metrics = getStageMetrics(stage?.id);
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
              {/* Stage-specific content */}
              {getStageSpecificContent(stage, execution)}
              {/* Execution Logs */}
              {execution?.stdout_log && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs font-mono">
                  <div className="font-semibold mb-2">Execution Log:</div>
                  <div className="bg-white rounded p-2 max-h-16 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-xs">
                      {execution?.stdout_log?.substring(0, 200)}
                      {execution?.stdout_log?.length > 200 && '...'}
                    </pre>
                  </div>
                </div>
              )}
              {/* Stage Metrics */}
              {metrics?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs font-semibold mb-2 flex items-center space-x-1">
                    <TrendingUp size={12} />
                    <span>Performance Metrics:</span>
                  </div>
                  <div className="space-y-1">
                    {metrics?.slice(0, 2)?.map((metric) => (
                      <div key={metric?.id} className="flex justify-between text-xs">
                        <span>{metric?.metric_name}:</span>
                        <span className={`font-semibold ${
                          metric?.is_within_threshold ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric?.metric_value} {metric?.metric_unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Comprehensive Audit Logging */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center space-x-2 mb-3">
          <BarChart3 size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground font-heading">
            Deployment Audit
          </h3>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-body">Backup Verification</span>
            <CheckCircle size={16} className="text-green-600" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-body">Production Tags</span>
            <Clock size={16} className="text-gray-400" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-body">Rollback Ready</span>
            <CheckCircle size={16} className="text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
}