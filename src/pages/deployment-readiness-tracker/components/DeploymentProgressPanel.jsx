import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Zap, 
  AlertCircle,
  CheckCircle,
  Activity,
  BarChart3,
  Timer,
  Rocket
} from 'lucide-react';

export default function DeploymentProgressPanel({ globalProgress, systemStatus, stageProgress }) {
  const [estimatedCompletion, setEstimatedCompletion] = useState(null);
  const [progressHistory, setProgressHistory] = useState([]);

  useEffect(() => {
    // Track progress over time
    setProgressHistory(prev => [
      ...prev?.slice(-19), // Keep last 20 entries
      { 
        timestamp: new Date()?.toLocaleTimeString(), 
        progress: globalProgress 
      }
    ]);

    // Calculate estimated completion time
    if (globalProgress < 100) {
      const remainingProgress = 100 - globalProgress;
      const averageStageTime = 45; // minutes per stage
      const estimatedMinutes = (remainingProgress / 22) * averageStageTime; // 22% remaining initially
      
      const now = new Date();
      const completion = new Date(now.getTime() + estimatedMinutes * 60000);
      setEstimatedCompletion(completion?.toLocaleTimeString());
    } else {
      setEstimatedCompletion('Completed!');
    }
  }, [globalProgress]);

  const getProgressColor = () => {
    if (globalProgress >= 100) return 'from-emerald-400 via-green-500 to-emerald-600';
    if (globalProgress >= 92) return 'from-blue-400 via-blue-500 to-emerald-400';
    if (globalProgress >= 85) return 'from-orange-400 via-blue-400 to-blue-500';
    return 'from-red-400 via-orange-400 to-blue-400';
  };

  const getStatusMessage = () => {
    if (globalProgress >= 100) return {
      text: '🎉 Production Ready! Deploy maintenant',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    };
    if (globalProgress >= 92) return {
      text: '⚡ Validation finale en cours...',
      color: 'text-blue-400', 
      bg: 'bg-blue-400/10'
    };
    if (globalProgress >= 85) return {
      text: '🔧 Configuration presque terminée',
      color: 'text-orange-400',
      bg: 'bg-orange-400/10'
    };
    return {
      text: '🚧 Configuration en cours',
      color: 'text-gray-300',
      bg: 'bg-gray-400/10'
    };
  };

  const statusMessage = getStatusMessage();

  const criticalMetrics = [
    {
      label: 'Providers Health',
      value: `${systemStatus?.providers?.healthy || 0}/3`,
      status: (systemStatus?.providers?.healthy || 0) >= 2 ? 'healthy' : 'critical',
      icon: <Activity className="w-4 h-4" />
    },
    {
      label: 'WebSocket Status', 
      value: systemStatus?.websocket?.status || 'disconnected',
      status: systemStatus?.websocket?.status === 'connected' ? 'healthy' : 'critical',
      icon: <Zap className="w-4 h-4" />
    },
    {
      label: 'Active AI Agents',
      value: `${systemStatus?.agents?.active || 0}/24`,
      status: (systemStatus?.agents?.active || 0) >= 3 ? 'healthy' : 'critical',
      icon: <Target className="w-4 h-4" />
    },
    {
      label: 'OHLC Latency',
      value: `${systemStatus?.ohlc?.delay || 0}s`,
      status: (systemStatus?.ohlc?.delay || 999) < 60 ? 'healthy' : 'critical',
      icon: <BarChart3 className="w-4 h-4" />
    }
  ];

  const getMetricColor = (status) => {
    return status === 'healthy' ?'text-green-400 bg-green-400/10 border-green-400/20' :'text-red-400 bg-red-400/10 border-red-400/20';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Rocket className="w-5 h-5 text-blue-400" />
        Deployment Readiness Panel
      </h2>
      {/* Main Progress Display */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-4xl font-bold text-white mb-1">
              {globalProgress?.toFixed(0)}%
            </div>
            <div className={`text-sm px-3 py-1 rounded-full border ${statusMessage?.bg} ${statusMessage?.color}`}>
              {statusMessage?.text}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">Estimated Completion</div>
            <div className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              {estimatedCompletion || 'Calculating...'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-6 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-1000 ease-out relative`}
            style={{ width: `${globalProgress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Progress Milestones */}
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span className={globalProgress >= 78 ? 'text-blue-400' : ''}>78% Base</span>
          <span className={globalProgress >= 85 ? 'text-orange-400' : ''}>85% Config</span>
          <span className={globalProgress >= 92 ? 'text-blue-400' : ''}>92% Integration</span>
          <span className={globalProgress >= 100 ? 'text-emerald-400' : ''}>100% Live</span>
        </div>
      </div>
      {/* Stage Progress Breakdown */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-4">Stage Progress</h3>
        <div className="space-y-3">
          {Object.entries(stageProgress)?.map(([stageKey, stage], index) => {
            const stageNumber = index + 1;
            const stageNames = ['API Keys', 'WebSocket', 'AI Agents', 'Validation'];
            
            return (
              <div key={stageKey} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    stage?.status === 'completed' ? 'bg-green-400/20 text-green-400' :
                    stage?.status === 'in-progress'? 'bg-blue-400/20 text-blue-400' : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {stage?.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : stageNumber}
                  </div>
                  <span className="text-sm text-gray-300">Stage {stageNumber}: {stageNames?.[index]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        stage?.status === 'completed' ? 'bg-green-400' :
                        stage?.status === 'in-progress'? 'bg-blue-400' : 'bg-gray-600'
                      }`}
                      style={{ width: `${stage?.progress || 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-white w-10 text-right">{stage?.progress || 0}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Critical System Metrics */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-4">Critical Metrics</h3>
        <div className="grid grid-cols-2 gap-3">
          {criticalMetrics?.map((metric, index) => (
            <div key={index} className={`p-3 rounded-lg border ${getMetricColor(metric?.status)}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {metric?.icon}
                  <span className="text-xs text-gray-300">{metric?.label}</span>
                </div>
                {metric?.status === 'healthy' ? 
                  <CheckCircle className="w-4 h-4 text-green-400" /> :
                  <AlertCircle className="w-4 h-4 text-red-400" />
                }
              </div>
              <div className="text-sm font-semibold">{metric?.value}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Progress Timeline */}
      {progressHistory?.length > 5 && (
        <div>
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Progress Timeline
          </h3>
          
          <div className="bg-gray-900/50 rounded-lg border border-gray-600 p-4">
            <div className="h-20 relative">
              {/* Simple progress line chart */}
              <div className="absolute inset-0 flex items-end justify-between">
                {progressHistory?.slice(-10)?.map((point, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-1 bg-blue-400 rounded-full"
                      style={{ height: `${(point?.progress - 70) * 2}px` }} // Scale for visibility
                    />
                    <span className="text-xs text-gray-500 mt-1 rotate-45 origin-left">
                      {point?.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Action Buttons */}
      <div className="mt-6 flex gap-2">
        {globalProgress >= 100 ? (
          <button className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-green-700 transition-all">
            <Rocket className="w-5 h-5" />
            Deploy to Production
          </button>
        ) : (
          <>
            <button className="flex-1 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-400/50 rounded-lg hover:bg-blue-600/30 flex items-center justify-center gap-2">
              <Timer className="w-4 h-4" />
              Continue Setup
            </button>
            <button className="px-4 py-2 bg-gray-600/20 text-gray-300 border border-gray-500/50 rounded-lg hover:bg-gray-600/30">
              Pause
            </button>
          </>
        )}
      </div>
      {/* Deployment Checklist Summary */}
      <div className="mt-4 text-xs text-gray-400 space-y-1">
        <div>🔑 Stage 1: Configure API provider keys (Finnhub, Alpha Vantage, TwelveData)</div>
        <div>⚡ Stage 2: Start WebSocket service with Redis pub/sub</div>
        <div>🤖 Stage 3: Activate AI agents (Data Phoenix, Quant Oracle, Strategy Weaver)</div>
        <div>✅ Stage 4: Run end-to-end validation and health checks</div>
      </div>
    </div>
  );
}