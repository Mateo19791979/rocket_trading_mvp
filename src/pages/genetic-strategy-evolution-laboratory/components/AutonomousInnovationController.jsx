import React, { useState, useEffect } from 'react';
import { Brain, Zap, Shield, Settings, Play } from 'lucide-react';

export default function AutonomousInnovationController({ strategies, population, onInnovationGenerated }) {
  const [autonomyLevel, setAutonomyLevel] = useState(3); // 1-5 scale
  const [researchQueue, setResearchQueue] = useState([]);
  const [activeResearch, setActiveResearch] = useState(null);
  const [safetyConstraints, setSafetyConstraints] = useState({
    maxRiskExposure: 0.15,
    minBacktestPeriod: 180,
    diversificationRequired: true,
    humanApprovalThreshold: 0.8
  });
  const [innovationMetrics, setInnovationMetrics] = useState({
    patternsDiscovered: 0,
    strategiesGenerated: 0,
    successRate: 0,
    riskAdjustedReturn: 0
  });
  const [systemHealth, setSystemHealth] = useState({
    overall: 85,
    creativity: 78,
    safety: 92,
    performance: 81
  });

  useEffect(() => {
    initializeResearchQueue();
    updateInnovationMetrics();
  }, [strategies, population]);

  const initializeResearchQueue = () => {
    const queue = [
      {
        id: 'pattern_mining_crypto',
        name: 'Cryptocurrency Pattern Mining',
        type: 'market_pattern_discovery',
        priority: 'high',
        estimatedDuration: 240, // minutes
        resources: ['price_data', 'volume_data', 'social_sentiment'],
        expectedOutcome: 'novel_crypto_momentum_strategy',
        riskLevel: 0.12,
        status: 'queued'
      },
      {
        id: 'regime_adaptation',
        name: 'Market Regime Adaptation Research',
        type: 'adaptive_intelligence',
        priority: 'medium',
        estimatedDuration: 180,
        resources: ['volatility_data', 'correlation_matrices', 'macro_indicators'],
        expectedOutcome: 'regime_aware_allocation',
        riskLevel: 0.08,
        status: 'queued'
      },
      {
        id: 'cross_asset_spillover',
        name: 'Cross-Asset Spillover Detection',
        type: 'correlation_analysis',
        priority: 'high',
        estimatedDuration: 320,
        resources: ['multi_asset_data', 'economic_calendar', 'news_flow'],
        expectedOutcome: 'spillover_prediction_model',
        riskLevel: 0.15,
        status: 'queued'
      },
      {
        id: 'sentiment_synthesis',
        name: 'Advanced Sentiment Synthesis',
        type: 'nlp_innovation',
        priority: 'low',
        estimatedDuration: 420,
        resources: ['news_data', 'social_media', 'analyst_reports'],
        expectedOutcome: 'synthetic_sentiment_index',
        riskLevel: 0.10,
        status: 'queued'
      }
    ];
    
    setResearchQueue(queue?.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder?.[b?.priority] - priorityOrder?.[a?.priority];
    }));
  };

  const updateInnovationMetrics = () => {
    const totalStrategies = strategies?.length;
    const successfulStrategies = strategies?.filter(s => 
      s?.performance_metrics?.sharpe_ratio > 1.0
    )?.length;
    
    setInnovationMetrics({
      patternsDiscovered: Math.floor(totalStrategies * 1.3),
      strategiesGenerated: totalStrategies,
      successRate: totalStrategies > 0 ? (successfulStrategies / totalStrategies) * 100 : 0,
      riskAdjustedReturn: Math.random() * 15 + 8 // Simulate 8-23% returns
    });
  };

  const startResearch = async (researchItem) => {
    setActiveResearch({ ...researchItem, status: 'active', progress: 0, startTime: Date.now() });
    
    // Remove from queue
    setResearchQueue(prev => prev?.filter(item => item?.id !== researchItem?.id));
    
    // Simulate research progress
    const progressInterval = setInterval(async () => {
      setActiveResearch(prev => {
        if (!prev) return null;
        
        const newProgress = Math.min(prev?.progress + Math.random() * 15, 100);
        
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          completeResearch(prev);
          return null;
        }
        
        return { ...prev, progress: newProgress };
      });
    }, 1000);
  };

  const completeResearch = async (research) => {
    try {
      const innovation = generateInnovation(research);
      
      // Safety validation
      if (validateSafety(innovation)) {
        onInnovationGenerated(innovation);
        
        // Update system health based on success
        setSystemHealth(prev => ({
          ...prev,
          creativity: Math.min(prev?.creativity + 2, 100),
          performance: Math.min(prev?.performance + 1, 100)
        }));
      } else {
        console.warn('Innovation failed safety validation:', innovation?.name);
        setSystemHealth(prev => ({
          ...prev,
          safety: Math.max(prev?.safety - 1, 0)
        }));
      }
    } catch (error) {
      console.error('Innovation generation failed:', error);
      setSystemHealth(prev => ({
        ...prev,
        overall: Math.max(prev?.overall - 2, 0)
      }));
    }
  };

  const generateInnovation = (research) => {
    const baseStrategy = {
      id: `innovation_${Date.now()}`,
      name: `AI-Generated: ${research?.expectedOutcome?.replace(/_/g, ' ')}`,
      dna: {
        genes: generateInnovativeGenes(research),
        phenotype: research?.expectedOutcome,
        genotype: btoa(JSON.stringify(research))
      },
      fitness: 0,
      generation: Math.max(...population?.map(p => p?.generation), 1) + 1,
      parents: [],
      mutations: [{
        gene: 'autonomous_creation',
        type: 'innovation_mutation',
        timestamp: new Date()?.toISOString()
      }],
      traits: generateInnovativeTraits(research),
      performance: {}
    };

    return baseStrategy;
  };

  const generateInnovativeGenes = (research) => {
    const genes = [];
    
    switch (research?.type) {
      case 'market_pattern_discovery':
        genes?.push(
          { name: 'pattern_window', value: 20 + Math.random() * 30, type: 'number', dominant: true },
          { name: 'confidence_threshold', value: 0.6 + Math.random() * 0.3, type: 'number', dominant: true },
          { name: 'lookback_period', value: 100 + Math.random() * 200, type: 'number', dominant: false }
        );
        break;
      case 'adaptive_intelligence':
        genes?.push(
          { name: 'adaptation_speed', value: 0.1 + Math.random() * 0.4, type: 'number', dominant: true },
          { name: 'regime_sensitivity', value: 0.5 + Math.random() * 0.4, type: 'number', dominant: true },
          { name: 'memory_decay', value: 0.01 + Math.random() * 0.05, type: 'number', dominant: false }
        );
        break;
      case 'correlation_analysis':
        genes?.push(
          { name: 'correlation_window', value: 30 + Math.random() * 90, type: 'number', dominant: true },
          { name: 'spillover_threshold', value: 0.3 + Math.random() * 0.5, type: 'number', dominant: true },
          { name: 'asset_weights', value: Math.random(), type: 'number', dominant: false }
        );
        break;
      case 'nlp_innovation':
        genes?.push(
          { name: 'sentiment_weight', value: 0.2 + Math.random() * 0.6, type: 'number', dominant: true },
          { name: 'text_processing_depth', value: 3 + Math.random() * 5, type: 'number', dominant: true },
          { name: 'language_models', value: ['bert', 'gpt', 'roberta']?.[Math.floor(Math.random() * 3)], type: 'string', dominant: false }
        );
        break;
    }
    
    return genes;
  };

  const generateInnovativeTraits = (research) => {
    return [
      {
        name: 'innovation_factor',
        value: 0.7 + Math.random() * 0.3,
        strength: Math.random(),
        expression: 'dominant'
      },
      {
        name: 'risk_awareness',
        value: research?.riskLevel,
        strength: 0.8 + Math.random() * 0.2,
        expression: 'dominant'
      },
      {
        name: 'adaptability',
        value: Math.random(),
        strength: Math.random(),
        expression: Math.random() > 0.5 ? 'dominant' : 'recessive'
      }
    ];
  };

  const validateSafety = (innovation) => {
    // Risk exposure check
    const riskScore = innovation?.traits?.find(t => t?.name === 'risk_awareness')?.value || 0;
    if (riskScore > safetyConstraints?.maxRiskExposure) return false;
    
    // Human approval threshold
    if (innovation?.fitness > safetyConstraints?.humanApprovalThreshold) {
      // Would require human approval in real system
      return Math.random() > 0.3; // Simulate approval process
    }
    
    return true;
  };

  const getAutonomyDescription = (level) => {
    const descriptions = {
      1: 'Manual - Requires human approval for all actions',
      2: 'Assisted - AI suggests, human decides',
      3: 'Supervised - AI acts within constraints, reports to human',
      4: 'Autonomous - AI acts independently with safety limits',
      5: 'Full Autonomous - AI has complete research freedom'
    };
    return descriptions?.[level] || descriptions?.[3];
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Autonomous Innovation Controller</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Level {autonomyLevel}:</span>
          <select
            value={autonomyLevel}
            onChange={(e) => setAutonomyLevel(parseInt(e?.target?.value))}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
          >
            {[1, 2, 3, 4, 5]?.map(level => (
              <option key={level} value={level}>Level {level}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Autonomy Level Description */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Settings className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300 font-medium">Current Autonomy Level</span>
        </div>
        <p className="text-gray-300 text-sm">{getAutonomyDescription(autonomyLevel)}</p>
      </div>
      {/* System Health Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(systemHealth)?.map(([metric, value]) => (
          <div key={metric} className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-center">
              <div className={`text-xl font-bold ${
                value >= 90 ? 'text-green-400' :
                value >= 70 ? 'text-yellow-400' :
                value >= 50 ? 'text-orange-400' : 'text-red-400'
              }`}>
                {value}%
              </div>
              <div className="text-gray-400 text-sm capitalize">{metric?.replace('_', ' ')}</div>
              <div className="w-full bg-gray-800 rounded-full h-1 mt-2">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    value >= 90 ? 'bg-green-500' :
                    value >= 70 ? 'bg-yellow-500' :
                    value >= 50 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Innovation Metrics */}
      <div className="bg-gray-900/50 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">Innovation Performance</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-blue-400 text-2xl font-bold">{innovationMetrics?.patternsDiscovered}</div>
            <div className="text-gray-400 text-sm">Patterns Discovered</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 text-2xl font-bold">{innovationMetrics?.strategiesGenerated}</div>
            <div className="text-gray-400 text-sm">Strategies Generated</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 text-2xl font-bold">{innovationMetrics?.successRate?.toFixed(1)}%</div>
            <div className="text-gray-400 text-sm">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 text-2xl font-bold">{innovationMetrics?.riskAdjustedReturn?.toFixed(1)}%</div>
            <div className="text-gray-400 text-sm">Risk-Adj Return</div>
          </div>
        </div>
      </div>
      {/* Active Research */}
      {activeResearch && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-400 animate-pulse" />
              <span className="text-blue-300 font-medium">Active Research</span>
            </div>
            <span className="text-blue-400 font-semibold">{activeResearch?.progress?.toFixed(0)}%</span>
          </div>
          
          <div className="mb-3">
            <h5 className="text-white font-medium">{activeResearch?.name}</h5>
            <p className="text-gray-400 text-sm">{activeResearch?.expectedOutcome?.replace(/_/g, ' ')}</p>
          </div>
          
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${activeResearch?.progress}%` }}
            />
          </div>
        </div>
      )}
      {/* Research Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold">Research Queue</h4>
          <span className="text-gray-400 text-sm">{researchQueue?.length} items</span>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {researchQueue?.map((item) => (
            <div
              key={item?.id}
              className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h5 className="text-white font-medium">{item?.name}</h5>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    getPriorityColor(item?.priority) === 'red' ? 'bg-red-900/50 text-red-300' :
                    getPriorityColor(item?.priority) === 'yellow'? 'bg-yellow-900/50 text-yellow-300' : 'bg-green-900/50 text-green-300'
                  }`}>
                    {item?.priority}
                  </span>
                </div>
                
                {autonomyLevel >= 3 ? (
                  <button
                    onClick={() => startResearch(item)}
                    disabled={!!activeResearch}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-3 py-1 rounded text-white text-sm font-medium transition-all duration-200"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-gray-500 text-sm">Requires Level 3+</span>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  Duration: {Math.floor(item?.estimatedDuration / 60)}h {item?.estimatedDuration % 60}m
                </span>
                <span className={`${
                  item?.riskLevel <= 0.1 ? 'text-green-400' :
                  item?.riskLevel <= 0.15 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  Risk: {(item?.riskLevel * 100)?.toFixed(0)}%
                </span>
              </div>
              
              <div className="text-gray-500 text-xs mt-1">
                {item?.expectedOutcome?.replace(/_/g, ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Safety Constraints */}
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Shield className="w-5 h-5 text-red-400" />
          <span className="text-red-300 font-medium">Safety Constraints</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Max Risk Exposure:</span>
            <span className="text-red-400 ml-2 font-semibold">
              {(safetyConstraints?.maxRiskExposure * 100)?.toFixed(0)}%
            </span>
          </div>
          <div>
            <span className="text-gray-400">Min Backtest Period:</span>
            <span className="text-yellow-400 ml-2 font-semibold">
              {safetyConstraints?.minBacktestPeriod} days
            </span>
          </div>
          <div>
            <span className="text-gray-400">Diversification:</span>
            <span className="text-green-400 ml-2 font-semibold">
              {safetyConstraints?.diversificationRequired ? 'Required' : 'Optional'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Human Approval:</span>
            <span className="text-blue-400 ml-2 font-semibold">
              &gt;{(safetyConstraints?.humanApprovalThreshold * 100)?.toFixed(0)}% fitness
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}