import React, { useState } from 'react';
import { TrendingUp, Target, CheckCircle, AlertTriangle, PlayCircle, XCircle, Calendar, BarChart3 } from 'lucide-react';

export default function RecoveryProgressDashboard({ deploymentProgress, onStageAction }) {
  const [selectedStage, setSelectedStage] = useState(null);

  // Calculate progress from current 57% to target 100%
  const currentProgress = deploymentProgress?.completionPercentage || 57;
  const targetProgress = 100;
  const remainingProgress = targetProgress - currentProgress;
  
  // Estimated time remaining (mock calculation)
  const estimatedHoursRemaining = Math.max(1, Math.round(remainingProgress / 8)); // ~8% per hour

  // Stage completion tracking
  const stages = deploymentProgress?.stages || [];
  const stageMap = {
    'j1_boot_guard': 'J1: Boot Guard',
    'j2_performance_testing': 'J2: Performance Testing',
    'j3_security_scanning': 'J3: Security Scanning',
    'j4_monitoring_setup': 'J4: Monitoring Setup',
    'j5_qa_validation': 'J5: QA Validation',
    'j6_production_release': 'J6: Production Release'
  };

  const getStageStatus = (stageName) => {
    const stage = stages?.find(s => s?.name === stageName);
    return stage?.status || 'pending';
  };

  const getStageIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'running':
        return <PlayCircle className="w-4 h-4 text-blue-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'text-green-400';
    if (progress >= 70) return 'text-blue-400';
    if (progress >= 50) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getProgressBarColor = (progress) => {
    if (progress >= 90) return 'bg-green-400';
    if (progress >= 70) return 'bg-blue-400';
    if (progress >= 50) return 'bg-yellow-400';
    return 'bg-orange-400';
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center space-x-3">
        <TrendingUp className="w-6 h-6 text-green-400" />
        <span>Recovery Progress Dashboard</span>
      </h2>
      <div className="space-y-6">
        {/* Progress Overview */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="text-center mb-4">
            <div className={`text-4xl font-bold mb-2 ${getProgressColor(currentProgress)}`}>
              {currentProgress}%
            </div>
            <div className="text-slate-400 text-sm">System Recovery Progress</div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Current Progress</span>
              <span>Target: 100%</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${getProgressBarColor(currentProgress)}`}
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-blue-400">{remainingProgress}%</div>
              <div className="text-xs text-slate-400">Remaining</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-400">{estimatedHoursRemaining}h</div>
              <div className="text-xs text-slate-400">ETA</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-400">
                {stages?.filter(s => s?.status === 'completed')?.length || 0}/6
              </div>
              <div className="text-xs text-slate-400">Stages</div>
            </div>
          </div>
        </div>

        {/* Stage-by-Stage Recovery Indicators */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>Recovery Stages</span>
          </h3>

          <div className="space-y-2">
            {Object.entries(stageMap)?.map(([stageKey, stageName]) => {
              const status = getStageStatus(stageName);
              const stage = stages?.find(s => s?.name === stageName);
              
              return (
                <div 
                  key={stageKey}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    selectedStage === stageKey ? 'bg-slate-600/50' : 'hover:bg-slate-600/30'
                  }`}
                  onClick={() => setSelectedStage(selectedStage === stageKey ? null : stageKey)}
                >
                  <div className="flex items-center space-x-3">
                    {getStageIcon(status)}
                    <span className="text-sm font-medium">{stageName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                      status === 'failed'? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {status?.replace('_', ' ')?.toUpperCase()}
                    </span>
                    {stage?.duration && (
                      <span className="text-xs text-slate-400">
                        {Math.round(stage?.duration / 60)}m
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stage Details */}
          {selectedStage && (
            <div className="mt-4 p-3 bg-slate-600/30 rounded">
              <h4 className="font-medium mb-2">{stageMap?.[selectedStage]} Details</h4>
              {(() => {
                const stage = stages?.find(s => s?.name === stageMap?.[selectedStage]);
                if (stage) {
                  return (
                    <div className="space-y-1 text-sm text-slate-300">
                      <div>Status: <span className="text-white">{stage?.status}</span></div>
                      {stage?.startedAt && (
                        <div>Started: <span className="text-white">
                          {new Date(stage?.startedAt)?.toLocaleString()}
                        </span></div>
                      )}
                      {stage?.completedAt && (
                        <div>Completed: <span className="text-white">
                          {new Date(stage?.completedAt)?.toLocaleString()}
                        </span></div>
                      )}
                      {stage?.duration && (
                        <div>Duration: <span className="text-white">{Math.round(stage?.duration / 60)} minutes</span></div>
                      )}
                      {stage?.hasErrors && (
                        <div className="text-red-400 font-medium">⚠ Errors detected in logs</div>
                      )}
                    </div>
                  );
                }
                return <div className="text-slate-400 text-sm">No detailed information available</div>;
              })()}
            </div>
          )}
        </div>

        {/* Milestone Tracking */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Target className="w-4 h-4 text-green-400" />
            <span>Recovery Milestones</span>
          </h3>

          <div className="space-y-3">
            <div className={`flex items-center justify-between p-2 rounded ${
              currentProgress >= 60 ? 'bg-green-500/20' : 'bg-slate-600/20'
            }`}>
              <span className="text-sm">Critical Systems Restored</span>
              <span className={`text-xs font-medium ${
                currentProgress >= 60 ? 'text-green-400' : 'text-slate-400'
              }`}>
                {currentProgress >= 60 ? 'Complete' : '60% Target'}
              </span>
            </div>

            <div className={`flex items-center justify-between p-2 rounded ${
              currentProgress >= 80 ? 'bg-green-500/20' : 'bg-slate-600/20'
            }`}>
              <span className="text-sm">Performance Optimized</span>
              <span className={`text-xs font-medium ${
                currentProgress >= 80 ? 'text-green-400' : 'text-slate-400'
              }`}>
                {currentProgress >= 80 ? 'Complete' : '80% Target'}
              </span>
            </div>

            <div className={`flex items-center justify-between p-2 rounded ${
              currentProgress >= 100 ? 'bg-green-500/20' : 'bg-slate-600/20'
            }`}>
              <span className="text-sm">Production Ready</span>
              <span className={`text-xs font-medium ${
                currentProgress >= 100 ? 'text-green-400' : 'text-slate-400'
              }`}>
                {currentProgress >= 100 ? 'Complete' : '100% Target'}
              </span>
            </div>
          </div>
        </div>

        {/* Deployment Information */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>Deployment Information</span>
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Pipeline Name:</span>
              <span className="text-white">{deploymentProgress?.name || 'Rocket Trading MVP Recovery'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Stage:</span>
              <span className="text-white">{deploymentProgress?.currentStage?.replace('_', ' ')?.toUpperCase() || 'In Progress'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Date:</span>
              <span className="text-white">
                {deploymentProgress?.targetDate 
                  ? new Date(deploymentProgress?.targetDate)?.toLocaleDateString()
                  : 'Not set'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Overall Status:</span>
              <span className={`font-medium ${
                deploymentProgress?.overallStatus === 'completed' ? 'text-green-400' :
                deploymentProgress?.overallStatus === 'running' ? 'text-blue-400' :
                deploymentProgress?.overallStatus === 'failed'? 'text-red-400' : 'text-yellow-400'
              }`}>
                {deploymentProgress?.overallStatus?.replace('_', ' ')?.toUpperCase() || 'PENDING'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}