import React, { useState, useEffect, useRef } from 'react';
import { Network, Eye, Search, Filter, ZoomIn, ZoomOut, Move, RotateCcw } from 'lucide-react';

const KnowledgeGraphVisualization = ({ knowledgeBlocks, relationships }) => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState('all');
  const [viewMode, setViewMode] = useState('network'); // network, hierarchy, circular
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Initialize graph data
  useEffect(() => {
    if (knowledgeBlocks?.length > 0) {
      const graphNodes = knowledgeBlocks?.map((block, index) => ({
        id: block?.id,
        concept: block?.concept,
        domain: block?.domain,
        trust_score: block?.trust_score || 0,
        trust_level: block?.trust_level,
        applications: block?.application_count || 0,
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100,
        vx: 0,
        vy: 0,
        size: Math.max(5, Math.min(15, (block?.trust_score || 0) * 20 + (block?.application_count || 0))),
        color: getDomainColor(block?.domain)
      }));
      
      const graphEdges = relationships?.map(rel => ({
        source: rel?.source_concept_id,
        target: rel?.target_concept_id,
        type: rel?.relationship_type,
        strength: rel?.strength || 0,
        validation_score: rel?.validation_score || 0
      }))?.filter(edge => 
        graphNodes?.some(n => n?.id === edge?.source) && 
        graphNodes?.some(n => n?.id === edge?.target)
      );
      
      setNodes(graphNodes);
      setEdges(graphEdges);
    }
  }, [knowledgeBlocks, relationships]);

  // Filter nodes based on search and domain filter
  const filteredNodes = nodes?.filter(node => {
    const matchesSearch = !searchTerm || 
      node?.concept?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesDomain = filterDomain === 'all' || node?.domain === filterDomain;
    return matchesSearch && matchesDomain;
  });

  const filteredEdges = edges?.filter(edge => {
    const sourceInFiltered = filteredNodes?.some(n => n?.id === edge?.source);
    const targetInFiltered = filteredNodes?.some(n => n?.id === edge?.target);
    return sourceInFiltered && targetInFiltered;
  });

  // Canvas interaction handlers
  const handleCanvasMouseDown = (e) => {
    const rect = canvasRef?.current?.getBoundingClientRect();
    const x = e?.clientX - rect?.left;
    const y = e?.clientY - rect?.top;
    
    // Check if clicking on a node
    const clickedNode = findNodeAtPosition(x, y);
    if (clickedNode) {
      setSelectedNode(clickedNode);
      return;
    }
    
    // Start panning
    setIsDragging(true);
    setDragStart({ x: e?.clientX - panOffset?.x, y: e?.clientY - panOffset?.y });
  };

  const handleCanvasMouseMove = (e) => {
    if (isDragging) {
      setPanOffset({
        x: e?.clientX - dragStart?.x,
        y: e?.clientY - dragStart?.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const findNodeAtPosition = (x, y) => {
    return filteredNodes?.find(node => {
      const nodeX = node?.x * zoomLevel + panOffset?.x;
      const nodeY = node?.y * zoomLevel + panOffset?.y;
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      return distance <= node?.size * zoomLevel;
    });
  };

  // Domain colors
  const getDomainColor = (domain) => {
    const colors = {
      'math': '#3b82f6',
      'physics': '#8b5cf6',
      'finance': '#10b981',
      'trading': '#f59e0b',
      'ifrs': '#f97316',
      'accounting': '#ec4899',
      'ai': '#06b6d4',
      'law': '#ef4444',
      'governance': '#6366f1'
    };
    return colors?.[domain] || '#64748b';
  };

  const getTrustColor = (trustScore) => {
    if (trustScore >= 0.8) return '#10b981';
    if (trustScore >= 0.6) return '#3b82f6';
    if (trustScore >= 0.4) return '#f59e0b';
    if (trustScore >= 0.2) return '#f97316';
    return '#ef4444';
  };

  // Graph layout algorithms
  const applyForceLayout = () => {
    const newNodes = [...filteredNodes];
    const iterations = 50;
    
    for (let i = 0; i < iterations; i++) {
      // Repulsion forces between nodes
      for (let j = 0; j < newNodes?.length; j++) {
        for (let k = j + 1; k < newNodes?.length; k++) {
          const dx = newNodes?.[k]?.x - newNodes?.[j]?.x;
          const dy = newNodes?.[k]?.y - newNodes?.[j]?.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const repulsion = 1000 / (distance * distance);
          
          newNodes[j].vx -= (dx / distance) * repulsion;
          newNodes[j].vy -= (dy / distance) * repulsion;
          newNodes[k].vx += (dx / distance) * repulsion;
          newNodes[k].vy += (dy / distance) * repulsion;
        }
      }
      
      // Attraction forces for connected nodes
      filteredEdges?.forEach(edge => {
        const source = newNodes?.find(n => n?.id === edge?.source);
        const target = newNodes?.find(n => n?.id === edge?.target);
        
        if (source && target) {
          const dx = target?.x - source?.x;
          const dy = target?.y - source?.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const attraction = edge?.strength * 0.1;
          
          source.vx += (dx / distance) * attraction;
          source.vy += (dy / distance) * attraction;
          target.vx -= (dx / distance) * attraction;
          target.vy -= (dy / distance) * attraction;
        }
      });
      
      // Update positions with damping
      newNodes?.forEach(node => {
        node.x += node?.vx * 0.1;
        node.y += node?.vy * 0.1;
        node.vx *= 0.9;
        node.vy *= 0.9;
        
        // Keep nodes within bounds
        node.x = Math.max(50, Math.min(canvasSize?.width - 50, node?.x));
        node.y = Math.max(50, Math.min(canvasSize?.height - 50, node?.y));
      });
    }
    
    setNodes(prevNodes => 
      prevNodes?.map(node => {
        const updated = newNodes?.find(n => n?.id === node?.id);
        return updated || node;
      })
    );
  };

  const resetLayout = () => {
    setNodes(prevNodes => 
      prevNodes?.map((node, index) => ({
        ...node,
        x: Math.random() * (canvasSize?.width - 200) + 100,
        y: Math.random() * (canvasSize?.height - 200) + 100,
        vx: 0,
        vy: 0
      }))
    );
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(1);
  };

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    
    const ctx = canvas?.getContext('2d');
    ctx?.clearRect(0, 0, canvas?.width, canvas?.height);
    
    // Set transform for zoom and pan
    ctx?.save();
    ctx?.translate(panOffset?.x, panOffset?.y);
    ctx?.scale(zoomLevel, zoomLevel);
    
    // Draw edges
    filteredEdges?.forEach(edge => {
      const source = filteredNodes?.find(n => n?.id === edge?.source);
      const target = filteredNodes?.find(n => n?.id === edge?.target);
      
      if (source && target) {
        ctx?.beginPath();
        ctx?.moveTo(source?.x, source?.y);
        ctx?.lineTo(target?.x, target?.y);
        ctx.strokeStyle = `rgba(148, 163, 184, ${edge?.strength || 0.3})`;
        ctx.lineWidth = Math.max(0.5, (edge?.strength || 0.3) * 3);
        ctx?.stroke();
        
        // Draw relationship type label for strong connections
        if (edge?.strength > 0.7) {
          const midX = (source?.x + target?.x) / 2;
          const midY = (source?.y + target?.y) / 2;
          ctx.fillStyle = '#64748b';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx?.fillText(edge?.type?.replace('_', ' '), midX, midY);
        }
      }
    });
    
    // Draw nodes
    filteredNodes?.forEach(node => {
      ctx?.beginPath();
      ctx?.arc(node?.x, node?.y, node?.size, 0, 2 * Math.PI);
      
      // Node color based on trust score
      ctx.fillStyle = getTrustColor(node?.trust_score);
      ctx?.fill();
      
      // Node border
      ctx.strokeStyle = node?.id === selectedNode?.id ? '#ffffff' : node?.color;
      ctx.lineWidth = node?.id === selectedNode?.id ? 3 : 1;
      ctx?.stroke();
      
      // Node label
      if (zoomLevel > 0.5) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.max(10, 12 * zoomLevel)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx?.fillText(
          node?.concept?.length > 20 ? 
            node?.concept?.substring(0, 20) + '...' : 
            node?.concept, 
          node?.x, 
          node?.y + node?.size + 15
        );
      }
    });
    
    ctx?.restore();
  }, [filteredNodes, filteredEdges, selectedNode, zoomLevel, panOffset]);

  const domains = [...new Set(knowledgeBlocks?.map(b => b?.domain))];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Network className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Knowledge Graph Visualization</h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search concepts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm w-48"
            />
          </div>
          
          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e?.target?.value)}
            className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm"
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
      {/* Visualization Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev * 1.2, 3))}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev / 1.2, 0.3))}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <button
            onClick={applyForceLayout}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
            title="Apply Force Layout"
          >
            <Move className="w-4 h-4" />
          </button>
          
          <button
            onClick={resetLayout}
            className="p-2 bg-purple-600 hover:bg-purple-700 rounded text-white transition-colors"
            title="Reset Layout"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-sm text-slate-400">
          Nodes: {filteredNodes?.length} | Connections: {filteredEdges?.length} | Zoom: {(zoomLevel * 100)?.toFixed(0)}%
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph Canvas */}
        <div className="lg:col-span-3">
          <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="cursor-move"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
          </div>
        </div>

        {/* Node Details Panel */}
        <div className="lg:col-span-1">
          <div className="bg-slate-700/30 rounded-lg p-4">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-white">Node Details</h4>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-400">Concept</p>
                    <p className="text-white font-medium">{selectedNode?.concept}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-400">Domain</p>
                    <span 
                      className="inline-block px-2 py-1 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: `${selectedNode?.color}20`,
                        color: selectedNode?.color
                      }}
                    >
                      {selectedNode?.domain?.toUpperCase()}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-400">Trust Score</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-600 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${(selectedNode?.trust_score || 0) * 100}%`,
                            backgroundColor: getTrustColor(selectedNode?.trust_score)
                          }}
                        />
                      </div>
                      <span className="text-white text-sm">
                        {((selectedNode?.trust_score || 0) * 100)?.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-400">Applications</p>
                    <p className="text-white font-medium">{selectedNode?.applications}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-400">Trust Level</p>
                    <p className="text-white font-medium capitalize">
                      {selectedNode?.trust_level?.replace('_', ' ') || 'Unknown'}
                    </p>
                  </div>
                </div>
                
                {/* Connected Nodes */}
                <div>
                  <p className="text-sm text-slate-400 mb-2">Connected Concepts</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {filteredEdges
                      ?.filter(edge => 
                        edge?.source === selectedNode?.id || edge?.target === selectedNode?.id
                      )
                      ?.map((edge, index) => {
                        const connectedId = edge?.source === selectedNode?.id ? edge?.target : edge?.source;
                        const connectedNode = filteredNodes?.find(n => n?.id === connectedId);
                        
                        return connectedNode ? (
                          <div 
                            key={index}
                            className="text-xs p-2 bg-slate-800 rounded cursor-pointer hover:bg-slate-750 transition-colors"
                            onClick={() => setSelectedNode(connectedNode)}
                          >
                            <span className="text-white">{connectedNode?.concept}</span>
                            <span className="text-slate-400 ml-2">
                              ({edge?.type?.replace('_', ' ')})
                            </span>
                          </div>
                        ) : null;
                      })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Click on a node to view details</p>
                <p className="text-sm mt-2">
                  Use mouse to pan and scroll to zoom
                </p>
              </div>
            )}
          </div>
          
          {/* Legend */}
          <div className="bg-slate-700/30 rounded-lg p-4 mt-4">
            <h4 className="text-white font-semibold mb-3">Legend</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-slate-300">High Trust (80%+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-slate-300">Good Trust (60-80%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-slate-300">Medium Trust (40-60%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-slate-300">Low Trust (&lt;40%)</span>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-600">
              <p className="text-xs text-slate-400">
                Node size reflects trust score and applications.
                Edge thickness shows relationship strength.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphVisualization;