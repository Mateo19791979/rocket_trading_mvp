import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Handshake, AlertTriangle, CheckCircle, Clock, Network, Plus, Eye, FileText } from 'lucide-react';

export default function AgentTreatyManagement({ diplomaticState, systemStatus, onToggleModule }) {
  const [selectedTreaty, setSelectedTreaty] = useState(null);
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [treatyHistory, setTreatyHistory] = useState([]);

  // Mock treaty data (in production, this would come from agent_treaties table)
  const mockTreaties = [
    {
      id: 1,
      partyA: 'strategy_weaver',
      partyB: 'execution_guru', 
      terms: 'Resource sharing: 70/30 split on compute allocation',
      status: 'active',
      effectiveness: 0.87,
      created: new Date(Date.now() - 86400000 * 2),
      resources: { cpu: 4, memory: '8GB', priority: 'high' }
    },
    {
      id: 2,
      partyA: 'newsminer',
      partyB: 'sentiment_analyzer',
      terms: 'Data exchange: news sentiment for market signals',
      status: 'active', 
      effectiveness: 0.92,
      created: new Date(Date.now() - 86400000 * 5),
      resources: { bandwidth: '100MB/s', updates: '24/7', priority: 'medium' }
    },
    {
      id: 3,
      partyA: 'risk_controller',
      partyB: 'portfolio_optimizer',
      terms: 'Safety protocol: immediate halt on risk threshold breach',
      status: 'negotiating',
      effectiveness: null,
      created: new Date(Date.now() - 3600000 * 6),
      resources: { response_time: '<100ms', coverage: '100%', priority: 'critical' }
    }
  ];

  useEffect(() => {
    // Simulate treaty history updates
    const history = [
      { time: new Date(Date.now() - 3600000), event: 'Treaty signed: strategy_weaver ↔ execution_guru', type: 'success' },
      { time: new Date(Date.now() - 7200000), event: 'Negotiation started: risk_controller ↔ portfolio_optimizer', type: 'info' },
      { time: new Date(Date.now() - 10800000), event: 'Resource allocation adjusted: newsminer ↔ sentiment_analyzer', type: 'warning' }
    ];
    setTreatyHistory(history);
  }, [diplomaticState]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'negotiating': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'suspended': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'negotiating': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'suspended': return 'text-red-400 bg-red-900/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const getEffectivenessColor = (effectiveness) => {
    if (effectiveness >= 0.9) return 'text-green-400';
    if (effectiveness >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const initiateNegotiation = () => {
    setShowNegotiation(true);
    // In production, this would trigger actual negotiation logic
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center space-x-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Handshake className="w-5 h-5" />
          </div>
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Agent Treaty Management
          </span>
        </h3>
        
        <button
          onClick={initiateNegotiation}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-600/20 border border-blue-500 rounded-lg text-blue-400 hover:bg-blue-600/30 transition-colors text-xs"
        >
          <Plus className="w-3 h-3" />
          <span>New Treaty</span>
        </button>
      </div>
      {/* Diplomatic Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-blue-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium text-gray-300">Active Treaties</span>
          </div>
          <div className="text-lg font-bold text-green-400">
            {diplomaticState?.activeTreaties || 0}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 border border-yellow-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-medium text-gray-300">Negotiations</span>
          </div>
          <div className="text-lg font-bold text-yellow-400">
            {diplomaticState?.negotiations || 0}
          </div>
        </div>
      </div>
      {/* Consensus Level */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Global Consensus Level</span>
          <span className="text-sm text-blue-400">
            {(diplomaticState?.consensusLevel * 100)?.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-300"
            style={{ width: `${(diplomaticState?.consensusLevel || 0) * 100}%` }}
          />
        </div>
      </div>
      {/* Treaty List */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span>Active Diplomatic Relations</span>
        </h4>
        
        <div className="space-y-2">
          {mockTreaties?.map((treaty) => (
            <motion.div
              key={treaty?.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-blue-400/50 ${getStatusColor(treaty?.status)}`}
              onClick={() => setSelectedTreaty(selectedTreaty === treaty?.id ? null : treaty?.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(treaty?.status)}
                  <div>
                    <div className="text-sm font-medium">
                      {treaty?.partyA} ↔ {treaty?.partyB}
                    </div>
                    <div className="text-xs text-gray-400 truncate max-w-48">
                      {treaty?.terms}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {treaty?.effectiveness && (
                    <div className={`text-xs font-medium ${getEffectivenessColor(treaty?.effectiveness)}`}>
                      {(treaty?.effectiveness * 100)?.toFixed(0)}%
                    </div>
                  )}
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              {selectedTreaty === treaty?.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-gray-600"
                >
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400">Signed:</span>
                      <div className="text-white">{treaty?.created?.toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <div className="text-white capitalize">{treaty?.status}</div>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <span className="text-gray-400 text-xs">Resource Allocation:</span>
                    <div className="text-white text-xs mt-1">
                      {Object.entries(treaty?.resources || {})?.map(([key, value]) => (
                        <span key={key} className="inline-block mr-3">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      {/* Protocol Status */}
      <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Diplomatic Protocol Status</span>
          <div className={`px-2 py-1 rounded text-xs ${
            systemStatus?.diplomatic_protocol 
              ? 'bg-green-900/30 text-green-400' :'bg-red-900/30 text-red-400'
          }`}>
            {systemStatus?.diplomatic_protocol ? 'ACTIVE' : 'OFFLINE'}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Network className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">Inter-Agent Communication</span>
          </div>
          
          <button
            onClick={() => onToggleModule?.('diplomatic_protocol')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              systemStatus?.diplomatic_protocol
                ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30' :'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30'
            }`}
          >
            {systemStatus?.diplomatic_protocol ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
      {/* Recent History */}
      {treatyHistory?.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Diplomatic Activity</h4>
          <div className="space-y-1">
            {treatyHistory?.slice(0, 3)?.map((item, index) => (
              <div key={index} className="text-xs border-l-2 border-gray-600 pl-2 py-1">
                <div className="flex items-center justify-between">
                  <span className={
                    item?.type === 'success' ? 'text-green-400' :
                    item?.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                  }>
                    {item?.event}
                  </span>
                  <span className="text-gray-500">
                    {item?.time?.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}