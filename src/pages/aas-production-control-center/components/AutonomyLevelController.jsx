import React, { useState } from 'react';
import { 
  Brain, 
  Shield, 
  Zap, 
  Target, 
  Crown,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Settings,
  Activity,
  Gauge
} from 'lucide-react';

const AutonomyLevelController = ({ autonomyLevel, setAutonomyLevel, systemHealth }) => {
  const [transitionInProgress, setTransitionInProgress] = useState(false);

  const autonomyLevels = [
    {
      level: 1,
      name: "Copilote",
      description: "AI assists with analysis, human makes all decisions",
      icon: Shield,
      color: "blue",
      capabilities: [
        "Data analysis and filtering",
        "Pattern recognition assistance", 
        "Risk assessment reports",
        "Manual trade execution only"
      ],
      requirements: {
        dhi: 0.6,
        uptime: 0.95,
        confidence: 0.7
      }
    },
    {
      level: 2,
      name: "Apprentie",
      description: "AI makes micro-decisions in controlled environments",
      icon: Activity,
      color: "green",
      capabilities: [
        "Autonomous source selection",
        "Budget allocation decisions",
        "Auto-correction of prompts",
        "Risk parameter adjustments"
      ],
      requirements: {
        dhi: 0.7,
        uptime: 0.97,
        confidence: 0.75
      }
    },
    {
      level: 3,
      name: "Adaptative",
      description: "AI adapts behavior based on market regime",
      icon: Target,
      color: "purple",
      capabilities: [
        "Market regime detection",
        "Dynamic strategy allocation",
        "Parametric risk management",
        "Real-time adaptation"
      ],
      requirements: {
        dhi: 0.8,
        uptime: 0.98,
        confidence: 0.8
      }
    },
    {
      level: 4,
      name: "Générative",
      description: "AI creates and evolves new strategies",
      icon: Zap,
      color: "yellow",
      capabilities: [
        "Genetic algorithm breeding",
        "Virtual natural selection",
        "Alpha factor discovery",
        "Strategy innovation"
      ],
      requirements: {
        dhi: 0.85,
        uptime: 0.99,
        confidence: 0.85
      }
    },
    {
      level: 5,
      name: "Autonome Spéculative",
      description: "Fully autonomous hedge fund operations",
      icon: Crown,
      color: "red",
      capabilities: [
        "Meta-learning optimization",
        "Portfolio strategy management",
        "Self-governance & audit",
        "Autonomous decision making"
      ],
      requirements: {
        dhi: 0.9,
        uptime: 0.995,
        confidence: 0.9
      }
    }
  ];

  const currentLevel = autonomyLevels?.find(l => l?.level === autonomyLevel);
  const nextLevel = autonomyLevels?.find(l => l?.level === autonomyLevel + 1);
  const prevLevel = autonomyLevels?.find(l => l?.level === autonomyLevel - 1);

  const canUpgrade = () => {
    if (!nextLevel || !systemHealth) return false;
    
    const requirements = nextLevel?.requirements;
    return (systemHealth?.dhi_avg >= requirements?.dhi && systemHealth?.mode === 'normal');
  };

  const canDowngrade = () => {
    return autonomyLevel > 1;
  };

  const handleLevelChange = async (newLevel) => {
    if (newLevel === autonomyLevel) return;
    
    setTransitionInProgress(true);
    
    // Simulate level transition delay
    setTimeout(() => {
      setAutonomyLevel(newLevel);
      setTransitionInProgress(false);
    }, 2000);
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: "text-blue-400 bg-blue-900/20 border-blue-500",
      green: "text-green-400 bg-green-900/20 border-green-500",
      purple: "text-purple-400 bg-purple-900/20 border-purple-500",
      yellow: "text-yellow-400 bg-yellow-900/20 border-yellow-500",
      red: "text-red-400 bg-red-900/20 border-red-500"
    };
    return colorMap?.[color] || colorMap?.blue;
  };

  const getProgressPercentage = () => {
    if (!systemHealth || !currentLevel) return 0;
    
    const requirements = currentLevel?.requirements;
    const dhiProgress = (systemHealth?.dhi_avg / requirements?.dhi) * 100;
    return Math.min(dhiProgress, 100);
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-400" />
          Autonomy Level Controller
        </h3>
        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Level {autonomyLevel}/5</span>
        </div>
      </div>
      {/* Current Level Display */}
      {currentLevel && (
        <div className={`border rounded-lg p-4 mb-6 ${getColorClasses(currentLevel?.color)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <currentLevel.icon className="w-6 h-6" />
              <div>
                <h4 className="text-lg font-semibold">
                  Niveau {currentLevel?.level}: {currentLevel?.name}
                </h4>
                <p className="text-sm opacity-80">{currentLevel?.description}</p>
              </div>
            </div>
            {transitionInProgress && (
              <div className="flex items-center space-x-2 text-sm">
                <Settings className="w-4 h-4 animate-spin" />
                <span>Transitioning...</span>
              </div>
            )}
          </div>

          {/* Capabilities */}
          <div className="mb-4">
            <h5 className="text-sm font-medium mb-2">Active Capabilities:</h5>
            <div className="grid grid-cols-1 gap-1">
              {currentLevel?.capabilities?.map((capability, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-3 h-3" />
                  <span>{capability}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Requirements */}
          <div>
            <h5 className="text-sm font-medium mb-2">Performance Status:</h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Data Health Index</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-current"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                  <span>{systemHealth ? (systemHealth?.dhi_avg * 100)?.toFixed(1) : '--'}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>System Mode</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  systemHealth?.mode === 'normal' ? 'bg-green-900/20 text-green-400' :
                  systemHealth?.mode === 'degraded'? 'bg-yellow-900/20 text-yellow-400' : 'bg-red-900/20 text-red-400'
                }`}>
                  {systemHealth?.mode || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Level Controls */}
      <div className="space-y-3">
        {/* Upgrade Button */}
        {nextLevel && (
          <button
            onClick={() => handleLevelChange(autonomyLevel + 1)}
            disabled={!canUpgrade() || transitionInProgress}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all"
          >
            <ChevronUp className="w-4 h-4" />
            <span>Upgrade to Level {nextLevel?.level}: {nextLevel?.name}</span>
          </button>
        )}

        {/* Downgrade Button */}
        {canDowngrade() && (
          <button
            onClick={() => handleLevelChange(autonomyLevel - 1)}
            disabled={transitionInProgress}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all"
          >
            <ChevronDown className="w-4 h-4" />
            <span>Downgrade to Level {prevLevel?.level}: {prevLevel?.name}</span>
          </button>
        )}
      </div>
      {/* Upgrade Requirements */}
      {nextLevel && !canUpgrade() && (
        <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">
              Requirements for Level {nextLevel?.level}
            </span>
          </div>
          <div className="text-sm text-yellow-300 space-y-1">
            <div>• DHI ≥ {(nextLevel?.requirements?.dhi * 100)?.toFixed(0)}% (Current: {systemHealth ? (systemHealth?.dhi_avg * 100)?.toFixed(1) : '--'}%)</div>
            <div>• System Mode: Normal (Current: {systemHealth?.mode || 'Unknown'})</div>
            <div>• No active kill switches</div>
          </div>
        </div>
      )}
      {/* Autonomy Level Timeline */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h4 className="text-lg font-medium mb-3 text-gray-300">Autonomy Progression</h4>
        <div className="space-y-2">
          {autonomyLevels?.map((level) => (
            <div key={level?.level} className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                level?.level === autonomyLevel 
                  ? `border-${level?.color}-500 bg-${level?.color}-900/20` 
                  : level?.level < autonomyLevel
                    ? 'border-green-500 bg-green-900/20' :'border-gray-600 bg-gray-800'
              }`}>
                {level?.level < autonomyLevel ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : level?.level === autonomyLevel ? (
                  <level.icon className={`w-4 h-4 text-${level?.color}-400`} />
                ) : (
                  <span className="text-xs text-gray-400">{level?.level}</span>
                )}
              </div>
              <div className="flex-1">
                <div className={`text-sm ${
                  level?.level <= autonomyLevel ? 'text-white' : 'text-gray-400'
                }`}>
                  Level {level?.level}: {level?.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutonomyLevelController;