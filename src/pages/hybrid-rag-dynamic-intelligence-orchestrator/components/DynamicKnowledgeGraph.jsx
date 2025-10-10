import React, { useState, useEffect } from 'react';
import { Network, Brain, GitBranch, Clock, RefreshCw } from 'lucide-react';

export default function DynamicKnowledgeGraph({ nodes = [] }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [graphUpdate, setGraphUpdate] = useState('live');
  const [temporalView, setTemporalView] = useState('current');

  const mockGraphData = {
    nodes: [
      { id: 1, label: 'Trading Strategies', connections: 45, strength: 0.92, type: 'primary', lastUpdate: '2m ago' },
      { id: 2, label: 'Risk Management', connections: 38, strength: 0.87, type: 'secondary', lastUpdate: '5m ago' },
      { id: 3, label: 'Market Patterns', connections: 52, strength: 0.95, type: 'primary', lastUpdate: '1m ago' },
      { id: 4, label: 'AI Models', connections: 29, strength: 0.84, type: 'tertiary', lastUpdate: '8m ago' },
      { id: 5, label: 'Options Theory', connections: 33, strength: 0.89, type: 'secondary', lastUpdate: '3m ago' },
      { id: 6, label: 'Portfolio Analytics', connections: 41, strength: 0.91, type: 'primary', lastUpdate: '4m ago' }
    ],
    relationships: [
      { source: 1, target: 2, weight: 0.85, type: 'correlation' },
      { source: 1, target: 3, weight: 0.92, type: 'dependency' },
      { source: 2, target: 4, weight: 0.78, type: 'enhancement' },
      { source: 3, target: 5, weight: 0.89, type: 'application' },
      { source: 4, target: 6, weight: 0.83, type: 'integration' }
    ]
  };

  const getNodeTypeColor = (type) => {
    switch (type) {
      case 'primary': return 'bg-blue-500 border-blue-400 text-blue-100';
      case 'secondary': return 'bg-green-500 border-green-400 text-green-100';
      case 'tertiary': return 'bg-orange-500 border-orange-400 text-orange-100';
      default: return 'bg-gray-500 border-gray-400 text-gray-100';
    }
  };

  const getStrengthColor = (strength) => {
    if (strength >= 0.9) return 'text-green-400';
    if (strength >= 0.8) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Network className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Dynamic Knowledge Graph</h3>
            <p className="text-sm text-gray-400">Real-time entity extraction & neural reasoning</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setGraphUpdate(graphUpdate === 'live' ? 'paused' : 'live')}
            className={`p-2 rounded-lg transition-colors ${
              graphUpdate === 'live' ?'bg-green-500/10 text-green-400' :'bg-gray-700 text-gray-400 hover:text-gray-300'
            }`}
          >
            {graphUpdate === 'live' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Temporal Controls */}
      <div className="flex space-x-2 mb-6">
        {['current', 'hourly', 'daily', 'versioned']?.map((view) => (
          <button
            key={view}
            onClick={() => setTemporalView(view)}
            className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              temporalView === view
                ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20' :'text-gray-400 hover:text-gray-300 bg-gray-700/50'
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Graph Visualization Area */}
      <div className="relative bg-gray-900/50 rounded-lg p-6 mb-6 min-h-[300px]">
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Live Updates</span>
          </div>
        </div>

        {/* Graph Neural Network Visualization */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {mockGraphData?.nodes?.map((node) => (
            <div
              key={node?.id}
              onClick={() => setSelectedNode(node?.id === selectedNode ? null : node?.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                getNodeTypeColor(node?.type)
              } ${
                selectedNode === node?.id ? 'ring-2 ring-white/20 scale-105' : ''
              }`}
            >
              <div className="text-center">
                <div className="font-bold text-sm mb-1">{node?.label}</div>
                <div className="text-xs opacity-80 mb-2">{node?.connections} connections</div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${getStrengthColor(node?.strength)?.replace('text-', 'bg-')}`}></div>
                  <span className="text-xs">{(node?.strength * 100)?.toFixed(0)}% strength</span>
                </div>
                <div className="text-xs opacity-60">{node?.lastUpdate}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Connection Lines Visualization */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <h4 className="text-sm font-medium mb-3 flex items-center">
            <GitBranch className="h-4 w-4 mr-2 text-purple-400" />
            Active Relationships
          </h4>
          <div className="space-y-2">
            {mockGraphData?.relationships?.map((rel, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">
                  Node {rel?.source} ↔ Node {rel?.target}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 capitalize">{rel?.type}</span>
                  <div className="w-12 h-1 bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
                      style={{ width: `${rel?.weight * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graph Analytics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Brain className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium">Neural Reasoning</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Graph Complexity</span>
            <span className="text-sm font-bold text-purple-400">Advanced</span>
          </div>
        </div>
        
        <div className="p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium">Update Frequency</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Refresh Rate</span>
            <span className="text-sm font-bold text-green-400">Real-time</span>
          </div>
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          {(() => {
            const node = mockGraphData?.nodes?.find(n => n?.id === selectedNode);
            return (
              <div>
                <h4 className="font-medium text-blue-400 mb-2">{node?.label} Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Connections:</span>
                    <span className="ml-2 text-white">{node?.connections}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Strength:</span>
                    <span className={`ml-2 ${getStrengthColor(node?.strength)}`}>
                      {(node?.strength * 100)?.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <span className="ml-2 text-white capitalize">{node?.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Last Update:</span>
                    <span className="ml-2 text-white">{node?.lastUpdate}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}