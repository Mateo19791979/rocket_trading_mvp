import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, Users, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, Activity, Eye } from 'lucide-react';

export default function DiplomaticRelationsMatrix({ diplomaticState, activityLog }) {
  const [relationshipMatrix, setRelationshipMatrix] = useState([]);
  const [performanceIndicators, setPerformanceIndicators] = useState([]);
  const [selectedRelation, setSelectedRelation] = useState(null);

  // Generate diplomatic relations matrix
  useEffect(() => {
    const generateMatrix = () => {
      const agents = [
        'strategy_weaver',
        'execution_guru', 
        'newsminer',
        'sentiment_analyzer',
        'risk_controller',
        'portfolio_optimizer'
      ];

      const matrix = [];
      
      for (let i = 0; i < agents?.length; i++) {
        for (let j = i + 1; j < agents?.length; j++) {
          const relationship = {
            id: `${i}-${j}`,
            agentA: agents?.[i],
            agentB: agents?.[j],
            trustLevel: Math.random() * 0.4 + 0.6, // 0.6-1.0
            collaborationScore: Math.random() * 0.3 + 0.7, // 0.7-1.0
            conflictLevel: Math.random() * 0.2, // 0-0.2
            status: Math.random() > 0.8 ? 'negotiating' : Math.random() > 0.1 ? 'active' : 'suspended',
            lastInteraction: new Date(Date.now() - Math.random() * 86400000 * 7),
            communicationFrequency: Math.floor(Math.random() * 50) + 10,
            resourceSharing: Math.random() * 0.5 + 0.5
          };
          
          matrix?.push(relationship);
        }
      }
      
      setRelationshipMatrix(matrix);
    };

    // Generate performance indicators
    const generatePerformance = () => {
      const indicators = [
        {
          metric: 'Treaty Effectiveness',
          value: 0.87,
          trend: '+2.3%',
          status: 'good'
        },
        {
          metric: 'Conflict Resolution',
          value: 0.94,
          trend: '+1.8%',
          status: 'excellent'
        },
        {
          metric: 'Resource Efficiency',
          value: 0.76,
          trend: '-0.4%',
          status: 'needs_attention'
        },
        {
          metric: 'Collaboration Index',
          value: 0.91,
          trend: '+3.2%',
          status: 'excellent'
        }
      ];
      
      setPerformanceIndicators(indicators);
    };

    generateMatrix();
    generatePerformance();
  }, [diplomaticState]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20';
      case 'negotiating': return 'text-yellow-400 bg-yellow-900/20';
      case 'suspended': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getTrustColor = (trust) => {
    if (trust >= 0.9) return 'text-green-400';
    if (trust >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'needs_attention': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend) => {
    return trend?.startsWith('+') ? 
      <TrendingUp className="w-3 h-3 text-green-400" /> : 
      <TrendingDown className="w-3 h-3 text-red-400" />;
  };

  const formatAgentName = (name) => {
    return name?.split('_')?.map(word => 
      word?.charAt(0)?.toUpperCase() + word?.slice(1)
    )?.join(' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center space-x-2">
          <div className="p-2 bg-cyan-600 rounded-lg">
            <Network className="w-5 h-5" />
          </div>
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Diplomatic Relations Matrix
          </span>
        </h3>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Live Relations</span>
        </div>
      </div>
      {/* Performance Indicators */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {performanceIndicators?.map((indicator, index) => (
          <motion.div
            key={indicator?.metric}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-300">{indicator?.metric}</span>
              <div className="flex items-center space-x-1">
                {getTrendIcon(indicator?.trend)}
                <span className={`text-xs ${indicator?.trend?.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {indicator?.trend}
                </span>
              </div>
            </div>
            
            <div className={`text-lg font-bold ${getPerformanceColor(indicator?.status)}`}>
              {(indicator?.value * 100)?.toFixed(1)}%
            </div>
          </motion.div>
        ))}
      </div>
      {/* Relations Matrix */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Inter-Agent Relationships</span>
        </h4>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {relationshipMatrix?.slice(0, 8)?.map((relation) => (
            <motion.div
              key={relation?.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-cyan-400/50 ${
                relation?.status === 'active' ? 'border-green-500/30 bg-green-900/10' :
                relation?.status === 'negotiating'? 'border-yellow-500/30 bg-yellow-900/10' : 'border-red-500/30 bg-red-900/10'
              }`}
              onClick={() => setSelectedRelation(selectedRelation === relation?.id ? null : relation?.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {relation?.status === 'active' ? 
                      <CheckCircle className="w-4 h-4 text-green-400" /> :
                      relation?.status === 'negotiating' ?
                      <Clock className="w-4 h-4 text-yellow-400" /> :
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    }
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium">
                      {formatAgentName(relation?.agentA)} ↔ {formatAgentName(relation?.agentB)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Trust: {getTrustColor(relation?.trustLevel)} {(relation?.trustLevel * 100)?.toFixed(0)}% | 
                      Collab: {(relation?.collaborationScore * 100)?.toFixed(0)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(relation?.status)}`}>
                    {relation?.status?.toUpperCase()}
                  </span>
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              {selectedRelation === relation?.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-gray-600"
                >
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400">Communication:</span>
                      <div className="text-white">{relation?.communicationFrequency}/day</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Resource Sharing:</span>
                      <div className="text-white">{(relation?.resourceSharing * 100)?.toFixed(0)}%</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Conflict Level:</span>
                      <div className={getTrustColor(1 - relation?.conflictLevel)}>
                        {(relation?.conflictLevel * 100)?.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Contact:</span>
                      <div className="text-white">
                        {relation?.lastInteraction?.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      {/* Recent Diplomatic Activity */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <span>Recent Diplomatic Activity</span>
        </h4>
        
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {activityLog?.filter(log => 
            log?.message?.includes('treaty') || 
            log?.message?.includes('negotiation') ||
            log?.message?.includes('diplomatic') ||
            log?.module === 'attention_market'
          )?.slice(0, 5)?.map((activity) => (
            <div key={activity?.id} className="text-xs border-l-2 border-cyan-600 pl-2 py-1">
              <div className="flex items-center justify-between">
                <span className="text-cyan-400">{activity?.message}</span>
                <span className="text-gray-500">
                  {activity?.timestamp?.toLocaleTimeString()}
                </span>
              </div>
            </div>
          )) || (
            <div className="text-center text-gray-500 py-2 text-xs">
              No recent diplomatic activity
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}