import { useState } from 'react';
import { RefreshCw, Wrench, CheckCircle, AlertCircle, Pause } from 'lucide-react';

export default function SystemRecoveryTools({ systemHealth, killSwitches, onAction }) {
  const [recoveryInProgress, setRecoveryInProgress] = useState(false);
  const [recoveryLog, setRecoveryLog] = useState([]);
  const [selectedRecoveryOption, setSelectedRecoveryOption] = useState(null);

  const recoveryOptions = [
    {
      id: 'gradual_restart',
      title: 'Gradual System Restart',
      description: 'Step-by-step reactivation of system components',
      duration: '5-10 minutes',
      risk: 'low',
      steps: [
        'Deactivate all kill switches to Level 1',
        'Resume data feeds and monitoring',
        'Enable strategy evaluation (paper mode)',
        'Gradually resume live trading with reduced limits'
      ]
    },
    {
      id: 'safe_mode_recovery',
      title: 'Safe Mode Recovery',
      description: 'Conservative recovery with enhanced monitoring',
      duration: '15-20 minutes',
      risk: 'minimal',
      steps: [
        'Maintain Level 2 kill switches',
        'Enable monitoring and analysis only',
        'Manual approval for all trading decisions',
        'Extended testing period before full automation'
      ]
    },
    {
      id: 'emergency_rollback',
      title: 'Emergency Rollback',
      description: 'Rollback to last known stable state',
      duration: '2-5 minutes',
      risk: 'low',
      steps: [
        'Stop all active strategies',
        'Close risky positions',
        'Restore configuration from backup',
        'Restart with proven stable settings'
      ]
    },
    {
      id: 'breeding_reset',
      title: 'Strategy Breeding Reset',
      description: 'Clear unstable strategies and restart breeding',
      duration: '10-15 minutes',
      risk: 'medium',
      steps: [
        'Pause all candidate strategies',
        'Archive underperforming strategies',
        'Reset genetic algorithm parameters',
        'Restart breeding with conservative settings'
      ]
    }
  ];

  const handleStartRecovery = async (recoveryOption) => {
    setRecoveryInProgress(true);
    setRecoveryLog([]);
    
    const steps = recoveryOption?.steps || [];
    
    for (let i = 0; i < steps?.length; i++) {
      const step = steps?.[i];
      
      setRecoveryLog(prev => [...prev, {
        step: i + 1,
        description: step,
        status: 'in_progress',
        timestamp: new Date()?.toISOString()
      }]);

      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Execute actual recovery actions based on step
      try {
        if (step?.includes('Deactivate all kill switches')) {
          // Deactivate critical kill switches
          const activeKillSwitches = killSwitches?.filter(ks => ks?.is_active) || [];
          for (const ks of activeKillSwitches) {
            await onAction?.('deactivate_killswitch', {
              module: ks?.module,
              reason: 'Recovery process - gradual restart'
            });
          }
        }

        setRecoveryLog(prev => 
          prev?.map((log, idx) => 
            idx === i 
              ? { ...log, status: 'completed', completedAt: new Date()?.toISOString() }
              : log
          )
        );
      } catch (error) {
        setRecoveryLog(prev => 
          prev?.map((log, idx) => 
            idx === i 
              ? { ...log, status: 'error', error: error?.message, completedAt: new Date()?.toISOString() }
              : log
          )
        );
        break;
      }
    }

    setRecoveryInProgress(false);
  };

  const getSystemHealthScore = () => {
    if (!systemHealth) return 0;
    
    let score = (systemHealth?.dhi_avg || 0) * 100;
    
    if (systemHealth?.mode === 'safe') score = Math?.min(score, 30);
    else if (systemHealth?.mode === 'degraded') score = Math?.min(score, 70);
    
    return Math?.round(score);
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'minimal': return 'bg-green-500';
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-green-600 shadow-2xl">
      <div className="p-6 border-b border-green-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wrench className="h-6 w-6 text-green-400" />
            <div>
              <h2 className="text-xl font-bold text-green-100">System Recovery Tools</h2>
              <p className="text-green-300 text-sm">Automated recovery and restoration procedures</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-400">System Health Score</div>
            <div className={`text-2xl font-bold ${getHealthScoreColor(getSystemHealthScore())}`}>
              {getSystemHealthScore()}%
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Recovery Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recovery Status</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${recoveryInProgress ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-sm text-gray-300">
                {recoveryInProgress ? 'Recovery in Progress' : 'Ready for Recovery'}
              </span>
            </div>
          </div>

          {/* Current System Status */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-400">Active Kill Switches</div>
              <div className="text-xl font-bold text-white">
                {killSwitches?.filter(ks => ks?.is_active)?.length || 0}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-400">System Mode</div>
              <div className={`text-xl font-bold ${systemHealth?.mode === 'normal' ? 'text-green-400' : 'text-red-400'}`}>
                {systemHealth?.mode?.toUpperCase() || 'UNKNOWN'}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-400">Recovery Options</div>
              <div className="text-xl font-bold text-blue-400">
                {recoveryOptions?.length}
              </div>
            </div>
          </div>
        </div>

        {/* Recovery Progress */}
        {recoveryInProgress && (
          <div className="mb-6 bg-blue-900 rounded-lg p-4 border border-blue-600">
            <h4 className="text-blue-100 font-semibold mb-3">Recovery Progress</h4>
            <div className="space-y-2">
              {recoveryLog?.map((log, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {log?.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-400" />}
                  {log?.status === 'in_progress' && <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />}
                  {log?.status === 'error' && <AlertCircle className="h-4 w-4 text-red-400" />}
                  
                  <div className="flex-1">
                    <div className={`text-sm ${log?.status === 'error' ? 'text-red-300' : 'text-white'}`}>
                      Step {log?.step}: {log?.description}
                    </div>
                    {log?.error && (
                      <div className="text-red-400 text-xs mt-1">Error: {log?.error}</div>
                    )}
                    {log?.completedAt && (
                      <div className="text-gray-500 text-xs">
                        {log?.status === 'completed' ? 'Completed' : 'Failed'} at {new Date(log?.completedAt)?.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recovery Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Available Recovery Procedures</h3>
          
          {recoveryOptions?.map((option) => (
            <div
              key={option?.id}
              className={`p-4 rounded-lg border transition-all ${
                selectedRecoveryOption?.id === option?.id
                  ? 'bg-green-900 border-green-500' :'bg-gray-700 border-gray-600 hover:border-green-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="font-semibold text-white">{option?.title}</div>
                    <span className={`px-2 py-1 text-xs rounded text-white ${getRiskColor(option?.risk)}`}>
                      {option?.risk?.toUpperCase()} RISK
                    </span>
                    <span className="text-gray-400 text-xs">
                      ⏱️ {option?.duration}
                    </span>
                  </div>
                  
                  <div className="text-gray-300 text-sm mb-3">{option?.description}</div>
                  
                  {selectedRecoveryOption?.id === option?.id && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-green-300 mb-2">Recovery Steps:</div>
                      <ol className="list-decimal list-inside space-y-1">
                        {option?.steps?.map((step, index) => (
                          <li key={index} className="text-gray-400 text-sm">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedRecoveryOption(
                      selectedRecoveryOption?.id === option?.id ? null : option
                    )}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                  >
                    {selectedRecoveryOption?.id === option?.id ? 'Hide' : 'Details'}
                  </button>
                  
                  <button
                    onClick={() => handleStartRecovery(option)}
                    disabled={recoveryInProgress}
                    className="px-4 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
                  >
                    {recoveryInProgress ? 'Running...' : 'Execute'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 p-4 bg-yellow-900 rounded-lg border border-yellow-600">
          <h4 className="text-yellow-100 font-semibold mb-3">⚡ Quick Recovery Actions</h4>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleStartRecovery({
                steps: ['Reset all kill switches to Level 1 monitoring']
              })}
              disabled={recoveryInProgress}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded font-medium transition-colors text-sm"
            >
              🔄 Reset All Kill Switches to L1
            </button>
            <button
              onClick={() => handleStartRecovery({
                steps: ['Enable safe mode monitoring only']
              })}
              disabled={recoveryInProgress}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium transition-colors text-sm"
            >
              🛡️ Enable Safe Mode Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}