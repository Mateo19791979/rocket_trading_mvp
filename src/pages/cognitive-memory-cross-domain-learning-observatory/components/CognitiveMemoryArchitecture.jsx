import React, { useState, useEffect } from 'react';
import { Brain, Database, Network, Zap, Layers, GitBranch, Target } from 'lucide-react';

const CognitiveMemoryArchitecture = ({ knowledgeBlocks, systemMetrics }) => {
  const [memoryTopology, setMemoryTopology] = useState({});
  const [consolidationProgress, setConsolidationProgress] = useState({});
  const [selectedDomain, setSelectedDomain] = useState('all');
  
  // Analyze memory topology and consolidation patterns
  useEffect(() => {
    if (knowledgeBlocks?.length > 0) {
      // Analyze domain distribution
      const domainStats = {};
      const trustLevels = {};
      
      knowledgeBlocks?.forEach(block => {
        // Domain statistics
        if (!domainStats?.[block?.domain]) {
          domainStats[block.domain] = {
            count: 0,
            avgTrust: 0,
            totalTrust: 0,
            highTrust: 0,
            recent: 0
          };
        }
        
        domainStats[block.domain].count++;
        domainStats[block.domain].totalTrust += block?.trust_score || 0;
        domainStats[block.domain].avgTrust = domainStats?.[block?.domain]?.totalTrust / domainStats?.[block?.domain]?.count;
        
        if ((block?.trust_score || 0) > 0.7) {
          domainStats[block.domain].highTrust++;
        }
        
        // Recent knowledge (last 7 days)
        const daysAgo = (Date.now() - new Date(block?.discovered_at || 0)) / (1000 * 60 * 60 * 24);
        if (daysAgo <= 7) {
          domainStats[block.domain].recent++;
        }
        
        // Trust level distribution
        const trustLevel = block?.trust_level || 'low';
        if (!trustLevels?.[trustLevel]) {
          trustLevels[trustLevel] = 0;
        }
        trustLevels[trustLevel]++;
      });
      
      setMemoryTopology(domainStats);
      
      // Calculate consolidation progress
      const totalConcepts = knowledgeBlocks?.length || 1;
      const consolidation = {
        validated: knowledgeBlocks?.filter(b => (b?.validation_count || 0) > 0)?.length,
        highTrust: knowledgeBlocks?.filter(b => (b?.trust_score || 0) > 0.7)?.length,
        applied: knowledgeBlocks?.filter(b => (b?.application_count || 0) > 0)?.length,
        verified: knowledgeBlocks?.filter(b => b?.trust_level === 'verified')?.length
      };
      
      Object.keys(consolidation)?.forEach(key => {
        consolidation[key] = (consolidation?.[key] / totalConcepts) * 100;
      });
      
      setConsolidationProgress(consolidation);
    }
  }, [knowledgeBlocks]);

  const domains = Object.keys(memoryTopology || {});
  const filteredBlocks = selectedDomain === 'all' 
    ? knowledgeBlocks 
    : knowledgeBlocks?.filter(b => b?.domain === selectedDomain);

  const getDomainColor = (domain) => {
    const colors = {
      'math': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      'physics': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      'finance': 'text-green-400 bg-green-500/10 border-green-500/20',
      'trading': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      'ifrs': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      'accounting': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      'ai': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      'law': 'text-red-400 bg-red-500/10 border-red-500/20',
      'governance': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    };
    return colors?.[domain] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  const getTrustLevelColor = (level) => {
    const colors = {
      'verified': 'text-green-400',
      'very_high': 'text-blue-400', 
      'high': 'text-cyan-400',
      'medium': 'text-yellow-400',
      'low': 'text-orange-400',
      'very_low': 'text-red-400'
    };
    return colors?.[level] || 'text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Memory Architecture Overview */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Cognitive Memory Architecture</h3>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e?.target?.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-white text-sm"
            >
              <option value="all">All Domains</option>
              {domains?.map(domain => (
                <option key={domain} value={domain}>
                  {domain?.charAt(0)?.toUpperCase() + domain?.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Domain Memory Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Object.entries(memoryTopology || {})?.map(([domain, stats]) => (
            <div 
              key={domain}
              className={`p-4 rounded-lg border ${getDomainColor(domain)} cursor-pointer transition-all hover:bg-opacity-20`}
              onClick={() => setSelectedDomain(domain)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold capitalize">{domain}</h4>
                <span className="text-sm">{stats?.count} concepts</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Trust Score</span>
                  <span>{(stats?.avgTrust * 100)?.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${(stats?.avgTrust || 0) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-slate-400">
                  <span>High Trust: {stats?.highTrust}</span>
                  <span>Recent: {stats?.recent}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Memory Consolidation Process */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Layers className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Memory Consolidation Process</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Consolidation Metrics */}
          <div className="space-y-4">
            {Object.entries(consolidationProgress || {})?.map(([stage, percentage]) => (
              <div key={stage} className="space-y-2">
                <div className="flex justify-between">
                  <span className="capitalize text-slate-300">{stage} Concepts</span>
                  <span className="text-white font-semibold">{percentage?.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      stage === 'verified' ? 'bg-green-500' :
                      stage === 'applied' ? 'bg-blue-500' :
                      stage === 'highTrust'? 'bg-purple-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(percentage || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Memory Network Topology */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">Network Topology</h4>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Network className="w-5 h-5 text-blue-400" />
                <span className="text-slate-300">Total Nodes</span>
              </div>
              <span className="text-white font-semibold">{systemMetrics?.totalConcepts}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300">Connections</span>
              </div>
              <span className="text-white font-semibold">{systemMetrics?.crossDomainConnections}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-400" />
                <span className="text-slate-300">Density</span>
              </div>
              <span className="text-white font-semibold">
                {systemMetrics?.totalConcepts > 0 
                  ? ((systemMetrics?.crossDomainConnections / systemMetrics?.totalConcepts) * 100)?.toFixed(1)
                  : '0'
                }%
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Recent Knowledge Formation */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-gold-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Zap className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Recent Memory Formation</h3>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {filteredBlocks?.slice(0, 10)?.map((block, index) => (
            <div key={block?.id || index} className="flex items-center space-x-4 p-3 bg-slate-700/30 rounded-lg">
              <div className={`p-2 rounded-lg ${getDomainColor(block?.domain)}`}>
                <Database className="w-4 h-4" />
              </div>
              
              <div className="flex-1">
                <h4 className="text-white font-medium">{block?.concept}</h4>
                <p className="text-slate-400 text-sm">
                  {block?.domain?.charAt(0)?.toUpperCase() + block?.domain?.slice(1)} • 
                  Trust: {((block?.trust_score || 0) * 100)?.toFixed(0)}%
                </p>
              </div>
              
              <div className="text-right">
                <div className={`text-sm font-medium ${getTrustLevelColor(block?.trust_level)}`}>
                  {block?.trust_level?.replace('_', ' ')?.toUpperCase()}
                </div>
                <div className="text-xs text-slate-500">
                  {block?.discovered_at ? new Date(block.discovered_at)?.toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CognitiveMemoryArchitecture;