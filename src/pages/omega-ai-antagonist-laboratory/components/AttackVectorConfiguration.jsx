import { useState } from 'react';
import { Target, Settings, Play, AlertTriangle, TrendingDown, Zap, BarChart3 } from 'lucide-react';
import Icon from '@/components/AppIcon';



export default function AttackVectorConfiguration({ onLogAdd }) {
  const [attackVectors, setAttackVectors] = useState({
    marketCrash: { enabled: true, severity: 75, frequency: 3 },
    liquidityCrisis: { enabled: true, severity: 60, frequency: 2 },
    regimeChange: { enabled: false, severity: 85, frequency: 1 },
    blackSwan: { enabled: false, severity: 95, frequency: 1 },
    volatilitySpike: { enabled: true, severity: 50, frequency: 4 },
    correlationBreakdown: { enabled: true, severity: 70, frequency: 2 }
  });
  
  const [testConfiguration, setTestConfiguration] = useState({
    attackDuration: 5,
    cooldownPeriod: 2,
    adaptiveIntensity: true,
    learningMode: true,
    targetSelection: 'weakest_first'
  });

  const [currentAttack, setCurrentAttack] = useState(null);
  const [loading, setLoading] = useState(false);

  const attackVectorDetails = {
    marketCrash: {
      name: 'Market Crash Simulation',
      description: 'Simulate sudden market drops of 10-40% to test strategy resilience',
      icon: TrendingDown,
      color: 'red',
      parameters: ['Drop magnitude', 'Recovery timeline', 'Sector correlation']
    },
    liquidityCrisis: {
      name: 'Liquidity Crisis Attack',
      description: 'Test strategies against extreme bid-ask spread expansion',
      icon: AlertTriangle,
      color: 'orange',
      parameters: ['Spread multiplier', 'Volume reduction', 'Duration']
    },
    regimeChange: {
      name: 'Regime Change Assault',
      description: 'Fundamental shift in market behavior patterns',
      icon: BarChart3,
      color: 'purple',
      parameters: ['Pattern disruption', 'Trend reversal', 'Momentum shift']
    },
    blackSwan: {
      name: 'Black Swan Event',
      description: 'Unpredictable extreme market events with massive impact',
      icon: Zap,
      color: 'yellow',
      parameters: ['Event magnitude', 'Cascade effects', 'Recovery probability']
    },
    volatilitySpike: {
      name: 'Volatility Spike',
      description: 'Sudden increase in market volatility to test risk management',
      icon: TrendingDown,
      color: 'blue',
      parameters: ['VIX multiplier', 'Duration', 'Asset correlation']
    },
    correlationBreakdown: {
      name: 'Correlation Breakdown',
      description: 'Historical correlations between assets suddenly change',
      icon: Target,
      color: 'green',
      parameters: ['Correlation coefficient', 'Breakdown speed', 'New relationships']
    }
  };

  const updateAttackVector = (vectorKey, field, value) => {
    setAttackVectors(prev => ({
      ...prev,
      [vectorKey]: {
        ...prev?.[vectorKey],
        [field]: value
      }
    }));
  };

  const updateTestConfig = (field, value) => {
    setTestConfiguration(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const launchAttackVector = async (vectorKey) => {
    if (loading) return;
    
    setLoading(true);
    setCurrentAttack(vectorKey);
    
    try {
      const vector = attackVectors?.[vectorKey];
      const vectorDetails = attackVectorDetails?.[vectorKey];
      
      onLogAdd(`Launching ${vectorDetails?.name} with severity ${vector?.severity}%...`, 'info');
      
      // Simulate the attack execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock attack result
      const attackSuccess = Math.random() < (vector?.severity / 100) * 0.7; // Higher severity = higher chance
      
      onLogAdd(
        `${vectorDetails?.name} ${attackSuccess ? 'SUCCESSFUL' : 'REPELLED'} - ${attackSuccess ? 'Vulnerability detected' : 'Strategy held firm'}`,
        attackSuccess ? 'error' : 'success'
      );
      
    } catch (error) {
      onLogAdd(`Attack vector execution failed: ${error?.message}`, 'error');
    } finally {
      setLoading(false);
      setCurrentAttack(null);
    }
  };

  const executeFullAttackSequence = async () => {
    if (loading) return;
    
    const enabledVectors = Object.entries(attackVectors)?.filter(([key, vector]) => vector?.enabled)?.sort((a, b) => b?.[1]?.severity - a?.[1]?.severity); // Highest severity first

    if (enabledVectors?.length === 0) {
      onLogAdd('No attack vectors enabled. Configure vectors before execution.', 'error');
      return;
    }

    onLogAdd(`Initiating full attack sequence with ${enabledVectors?.length} vectors...`, 'info');
    
    for (const [vectorKey] of enabledVectors) {
      await launchAttackVector(vectorKey);
      
      // Cooldown between attacks
      if (testConfiguration?.cooldownPeriod > 0) {
        await new Promise(resolve => 
          setTimeout(resolve, testConfiguration.cooldownPeriod * 1000)
        );
      }
    }
    
    onLogAdd('Full attack sequence completed', 'success');
  };

  const getSeverityColor = (severity) => {
    if (severity >= 80) return 'text-red-400';
    if (severity >= 60) return 'text-orange-400';
    if (severity >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getSeverityBg = (severity) => {
    if (severity >= 80) return 'bg-red-400';
    if (severity >= 60) return 'bg-orange-400';
    if (severity >= 40) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Target className="w-8 h-8 text-orange-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Attack Vector Configuration</h2>
            <p className="text-gray-400">Configure Adversarial Scenarios & Stress Testing Parameters</p>
          </div>
        </div>
        <button
          onClick={executeFullAttackSequence}
          disabled={loading}
          className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Executing...' : 'Execute Full Sequence'}
        </button>
      </div>
      {/* Test Configuration Panel */}
      <div className="bg-gray-700 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-orange-400" />
          <span>Global Attack Configuration</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Attack Duration (minutes)
            </label>
            <input
              type="range"
              min="1"
              max="15"
              value={testConfiguration?.attackDuration}
              onChange={(e) => updateTestConfig('attackDuration', parseInt(e?.target?.value))}
              className="w-full"
            />
            <div className="text-center text-white text-sm mt-1">
              {testConfiguration?.attackDuration} min
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cooldown Period (seconds)
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={testConfiguration?.cooldownPeriod}
              onChange={(e) => updateTestConfig('cooldownPeriod', parseInt(e?.target?.value))}
              className="w-full"
            />
            <div className="text-center text-white text-sm mt-1">
              {testConfiguration?.cooldownPeriod} sec
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Selection
            </label>
            <select
              value={testConfiguration?.targetSelection}
              onChange={(e) => updateTestConfig('targetSelection', e?.target?.value)}
              className="w-full bg-gray-600 border border-gray-500 text-white rounded px-3 py-2"
            >
              <option value="weakest_first">Weakest First</option>
              <option value="strongest_first">Strongest First</option>
              <option value="random">Random</option>
              <option value="newest">Newest Strategies</option>
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={testConfiguration?.adaptiveIntensity}
                onChange={(e) => updateTestConfig('adaptiveIntensity', e?.target?.checked)}
                className="rounded"
              />
              <span className="text-gray-300 text-sm">Adaptive Intensity</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={testConfiguration?.learningMode}
                onChange={(e) => updateTestConfig('learningMode', e?.target?.checked)}
                className="rounded"
              />
              <span className="text-gray-300 text-sm">Learning Mode</span>
            </label>
          </div>
        </div>
      </div>
      {/* Attack Vectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(attackVectorDetails)?.map(([vectorKey, details]) => {
          const vector = attackVectors?.[vectorKey];
          const Icon = details?.icon;
          const isCurrentlyAttacking = currentAttack === vectorKey;
          
          return (
            <div
              key={vectorKey}
              className={`bg-gray-700 rounded-lg p-6 border transition-all duration-200 ${
                vector?.enabled 
                  ? `border-${details?.color}-500/50 bg-${details?.color}-900/10` 
                  : 'border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Icon className={`w-6 h-6 ${vector?.enabled ? `text-${details?.color}-400` : 'text-gray-400'}`} />
                  <div>
                    <h4 className="text-white font-semibold">{details?.name}</h4>
                    <p className="text-gray-400 text-sm">{details?.description}</p>
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={vector?.enabled}
                    onChange={(e) => updateAttackVector(vectorKey, 'enabled', e?.target?.checked)}
                    className="rounded"
                  />
                </label>
              </div>
              {vector?.enabled && (
                <div className="space-y-4">
                  {/* Severity */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-300">Severity</label>
                      <span className={`text-sm font-bold ${getSeverityColor(vector?.severity)}`}>
                        {vector?.severity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={vector?.severity}
                      onChange={(e) => updateAttackVector(vectorKey, 'severity', parseInt(e?.target?.value))}
                      className="w-full"
                    />
                    <div className="w-full bg-gray-600 h-2 rounded mt-1">
                      <div 
                        className={`h-2 rounded transition-all duration-300 ${getSeverityBg(vector?.severity)}`}
                        style={{ width: `${vector?.severity}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Frequency */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-300">Frequency</label>
                      <span className="text-white text-sm font-bold">{vector?.frequency}x</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={vector?.frequency}
                      onChange={(e) => updateAttackVector(vectorKey, 'frequency', parseInt(e?.target?.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Attack Parameters */}
                  <div className="bg-gray-600 p-3 rounded">
                    <h5 className="text-xs font-semibold text-gray-300 mb-2">Attack Parameters:</h5>
                    <div className="flex flex-wrap gap-1">
                      {details?.parameters?.map((param, index) => (
                        <span 
                          key={index}
                          className={`px-2 py-1 rounded text-xs bg-${details?.color}-600/20 text-${details?.color}-400`}
                        >
                          {param}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Launch Button */}
                  <button
                    onClick={() => launchAttackVector(vectorKey)}
                    disabled={loading}
                    className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                      isCurrentlyAttacking
                        ? `bg-${details?.color}-600 animate-pulse`
                        : `bg-${details?.color}-600 hover:bg-${details?.color}-700`
                    } text-white disabled:opacity-50`}
                  >
                    {isCurrentlyAttacking ? (
                      <span className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Attacking...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <Play className="w-4 h-4" />
                        <span>Launch Attack</span>
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Attack Status Summary */}
      <div className="mt-6 bg-gray-700 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">Attack Vector Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">
              {Object.values(attackVectors)?.filter(v => v?.enabled)?.length}
            </div>
            <div className="text-sm text-gray-400">Enabled Vectors</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">
              {Math.round(
                Object.values(attackVectors)?.filter(v => v?.enabled)?.reduce((sum, v) => sum + v?.severity, 0) / 
                Object.values(attackVectors)?.filter(v => v?.enabled)?.length || 0
              )}%
            </div>
            <div className="text-sm text-gray-400">Avg Severity</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {Object.values(attackVectors)?.filter(v => v?.enabled)?.reduce((sum, v) => sum + v?.frequency, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Frequency</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${loading ? 'text-red-400' : 'text-green-400'}`}>
              {loading ? 'ACTIVE' : 'READY'}
            </div>
            <div className="text-sm text-gray-400">System Status</div>
          </div>
        </div>
      </div>
    </div>
  );
}