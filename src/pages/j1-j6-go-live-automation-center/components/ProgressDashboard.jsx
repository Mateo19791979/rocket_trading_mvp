import React from 'react';
import { Target, Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function ProgressDashboard({ 
  currentPipeline, 
  stageExecutions, 
  deploymentMetrics, 
  stageDefinitions 
}) {
  const calculateDaysRemaining = () => {
    const targetDate = new Date('2025-10-09');
    const today = new Date();
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStageCompletionStats = () => {
    const total = stageExecutions?.length || 0;
    const completed = stageExecutions?.filter(se => se?.status === 'completed')?.length || 0;
    const running = stageExecutions?.filter(se => se?.status === 'running')?.length || 0;
    const failed = stageExecutions?.filter(se => se?.status === 'failed')?.length || 0;
    
    return { total, completed, running, failed };
  };

  const getLatestMetrics = () => {
    const recentMetrics = deploymentMetrics?.slice(0, 4) || [];
    return recentMetrics;
  };

  const daysRemaining = calculateDaysRemaining();
  const completionPercentage = currentPipeline?.completion_percentage || 0;
  const stageStats = getStageCompletionStats();
  const recentMetrics = getLatestMetrics();

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground font-heading">
          Progress Dashboard
        </h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground font-body">
          <Calendar size={16} />
          <span>{daysRemaining} days remaining</span>
        </div>
      </div>
      {/* Deployment Readiness Percentage */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-semibold text-foreground font-heading">
            Deployment Readiness
          </span>
          <div className="flex items-center space-x-2">
            <Target size={20} className="text-primary" />
            <span className="text-2xl font-bold text-primary">
              {completionPercentage?.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className="bg-gradient-to-r from-primary to-primary/80 h-4 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
            style={{width: `${Math.max(completionPercentage, 8)}%`}}
          >
            {completionPercentage >= 15 && (
              <span className="text-xs font-semibold text-white">
                {completionPercentage?.toFixed(0)}%
              </span>
            )}
          </div>
        </div>

        <div className="text-sm text-muted-foreground font-body text-center">
          Production readiness status - Target: 100% by October 9, 2025
        </div>
      </div>
      {/* Stage Completion Indicators */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground font-heading mb-3">
          Stage Completion Status
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stageStats?.completed}
            </div>
            <div className="text-sm text-muted-foreground font-body">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stageStats?.running}
            </div>
            <div className="text-sm text-muted-foreground font-body">Running</div>
          </div>
        </div>

        {/* Visual Timeline */}
        <div className="space-y-2">
          {stageDefinitions?.map((stage, index) => {
            const execution = stageExecutions?.find(se => se?.stage === stage?.id);
            const isActive = execution?.status === 'running';
            const isCompleted = execution?.status === 'completed';
            const isFailed = execution?.status === 'failed';
            
            return (
              <div key={stage?.id} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-600' : isActive ?'bg-blue-600': isFailed ?'bg-red-600': 'bg-gray-300'
                }`}>
                  {isCompleted && <CheckCircle size={10} className="text-white" />}
                  {isActive && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                  {isFailed && <AlertTriangle size={10} className="text-white" />}
                  {!execution && <Clock size={10} className="text-gray-600" />}
                </div>
                <div className="flex-1 text-sm">
                  <span className={`font-medium ${
                    isCompleted ? 'text-green-700' : isActive ?'text-blue-700': isFailed ?'text-red-700': 'text-muted-foreground'
                  }`}>
                    {stage?.name}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-body">
                  {execution?.duration_seconds ? `${Math.round(execution?.duration_seconds / 60)}min` : `~${stage?.estimatedDuration}min`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* October 9, 2025 Countdown */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-primary">Target Go-Live Date</div>
            <div className="text-lg font-bold text-primary">October 9, 2025</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {daysRemaining > 0 ? daysRemaining : 'TODAY'}
            </div>
            <div className="text-sm text-primary font-body">
              {daysRemaining > 0 ? 'days remaining' : 'Launch Day!'}
            </div>
          </div>
        </div>
      </div>
      {/* Recent Metrics */}
      {recentMetrics?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground font-heading mb-3">
            Latest Metrics
          </h3>
          <div className="space-y-2">
            {recentMetrics?.map((metric, index) => (
              <div key={metric?.id || index} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-body">
                  {metric?.metric_name}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-foreground">
                    {metric?.metric_value} {metric?.metric_unit}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    metric?.is_within_threshold ? 'bg-green-600' : 'bg-red-600'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Milestone Tracking */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground font-heading">
            Milestone Progress
          </h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-body">Environment Readiness</span>
            <span className="font-semibold text-green-600">100%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-body">Performance Validation</span>
            <span className="font-semibold text-blue-600">
              {stageExecutions?.find(se => se?.stage === 'j2_performance_testing')?.status === 'completed' ? '100%' : '45%'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-body">Security Compliance</span>
            <span className="font-semibold text-gray-600">Pending</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-body">Production Readiness</span>
            <span className="font-semibold text-gray-600">Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}