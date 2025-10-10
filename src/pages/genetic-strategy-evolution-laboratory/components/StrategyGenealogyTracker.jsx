import React, { useState, useEffect } from 'react';
import { GitBranch, Crown, History, Shuffle } from 'lucide-react';
import Icon from '@/components/AppIcon';


export default function StrategyGenealogyTracker({ population, generation }) {
  const [selectedLineage, setSelectedLineage] = useState(null);
  const [genealogyTree, setGenealogyTree] = useState({});
  const [viewMode, setViewMode] = useState('tree'); // tree, timeline, mutations
  const [familyStats, setFamilyStats] = useState({});

  useEffect(() => {
    buildGenealogyTree();
    calculateFamilyStats();
  }, [population, generation]);

  const buildGenealogyTree = () => {
    const tree = {};
    
    population?.forEach(individual => {
      if (!tree?.[individual?.id]) {
        tree[individual.id] = {
          individual,
          children: [],
          parents: individual?.parents || [],
          depth: individual?.generation,
          lineage: []
        };
      }

      // Build parent-child relationships
      if (individual?.parents && individual?.parents?.length > 0) {
        individual?.parents?.forEach(parentId => {
          if (!tree?.[parentId]) {
            tree[parentId] = {
              individual: { id: parentId, name: `Parent-${parentId}`, generation: individual?.generation - 1 },
              children: [],
              parents: [],
              depth: individual?.generation - 1,
              lineage: []
            };
          }
          tree?.[parentId]?.children?.push(individual?.id);
        });
      }

      // Build lineage paths
      tree[individual.id].lineage = traceLineage(individual, tree);
    });

    setGenealogyTree(tree);
  };

  const traceLineage = (individual, tree) => {
    const lineage = [individual?.id];
    
    if (individual?.parents && individual?.parents?.length > 0) {
      individual?.parents?.forEach(parentId => {
        if (tree?.[parentId]) {
          lineage?.unshift(...traceLineage(tree?.[parentId]?.individual, tree));
        }
      });
    }
    
    return lineage;
  };

  const calculateFamilyStats = () => {
    const stats = {};
    
    Object.values(genealogyTree)?.forEach(node => {
      const familyId = node?.lineage?.[0] || node?.individual?.id;
      
      if (!stats?.[familyId]) {
        stats[familyId] = {
          founder: node?.individual,
          descendants: 0,
          generations: 0,
          avgFitness: 0,
          bestPerformer: null,
          totalMutations: 0
        };
      }
      
      stats[familyId].descendants++;
      stats[familyId].generations = Math.max(stats?.[familyId]?.generations, node?.individual?.generation || 1);
      
      if (!stats?.[familyId]?.bestPerformer || node?.individual?.fitness > stats?.[familyId]?.bestPerformer?.fitness) {
        stats[familyId].bestPerformer = node?.individual;
      }
      
      stats[familyId].totalMutations += node?.individual?.mutations?.length || 0;
    });
    
    // Calculate average fitness
    Object.keys(stats)?.forEach(familyId => {
      const familyMembers = Object.values(genealogyTree)?.filter(node => 
        node?.lineage?.[0] === familyId || node?.individual?.id === familyId
      );
      
      const totalFitness = familyMembers?.reduce((sum, node) => sum + (node?.individual?.fitness || 0), 0);
      stats[familyId].avgFitness = totalFitness / familyMembers?.length;
    });
    
    setFamilyStats(stats);
  };

  const getSuccessionLine = (individual) => {
    const node = genealogyTree?.[individual?.id];
    if (!node) return [];
    
    return node?.lineage?.map(id => genealogyTree?.[id]?.individual)?.filter(Boolean);
  };

  const getMutationHistory = (individual) => {
    const mutations = individual?.mutations || [];
    const inheritedMutations = [];
    
    // Trace mutations through lineage
    if (individual?.parents) {
      individual?.parents?.forEach(parentId => {
        const parent = population?.find(p => p?.id === parentId);
        if (parent?.mutations) {
          inheritedMutations?.push(...parent?.mutations?.map(m => ({...m, inherited: true, from: parent?.name})));
        }
      });
    }
    
    return [...inheritedMutations, ...mutations?.map(m => ({...m, inherited: false}))];
  };

  const renderTreeView = () => {
    const rootNodes = Object.values(genealogyTree)?.filter(node => 
      !node?.parents || node?.parents?.length === 0
    );
    
    return (
      <div className="space-y-6">
        {rootNodes?.map(rootNode => (
          <div key={rootNode?.individual?.id} className="border border-gray-600 rounded-lg p-4">
            <div className="mb-4">
              <div className="flex items-center space-x-3">
                <Crown className="w-5 h-5 text-yellow-400" />
                <h4 className="text-white font-semibold">
                  {rootNode?.individual?.name} Dynasty
                </h4>
                <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 text-xs rounded">
                  Founder
                </span>
              </div>
              
              {familyStats?.[rootNode?.individual?.id] && (
                <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Descendants:</span>
                    <span className="text-blue-400 ml-1 font-semibold">
                      {familyStats?.[rootNode?.individual?.id]?.descendants}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Generations:</span>
                    <span className="text-green-400 ml-1 font-semibold">
                      {familyStats?.[rootNode?.individual?.id]?.generations}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Avg Fitness:</span>
                    <span className="text-purple-400 ml-1 font-semibold">
                      {familyStats?.[rootNode?.individual?.id]?.avgFitness?.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Mutations:</span>
                    <span className="text-red-400 ml-1 font-semibold">
                      {familyStats?.[rootNode?.individual?.id]?.totalMutations}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="pl-4 border-l-2 border-gray-600">
              {renderNode(rootNode, 0)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderNode = (node, depth) => {
    const children = node?.children?.map(childId => genealogyTree?.[childId])?.filter(Boolean);
    
    return (
      <div className="space-y-2">
        <div
          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
            selectedLineage === node?.individual?.id
              ? 'bg-blue-900/30 border-blue-500/50' :'bg-gray-900/30 border-gray-600/50 hover:border-gray-500/50'
          }`}
          onClick={() => setSelectedLineage(node?.individual?.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">{node?.individual?.name}</span>
              <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                Gen {node?.individual?.generation}
              </span>
              {node?.individual?.mutations?.length > 0 && (
                <span className="px-2 py-1 bg-red-900/50 text-red-300 text-xs rounded">
                  {node?.individual?.mutations?.length} mutations
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400 font-semibold">
                {node?.individual?.fitness?.toFixed(2) || '0.00'}
              </span>
              {children?.length > 0 && (
                <span className="text-blue-400 text-sm">
                  {children?.length} children
                </span>
              )}
            </div>
          </div>
        </div>
        {children?.length > 0 && (
          <div className="ml-6 space-y-2 border-l border-gray-700 pl-4">
            {children?.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderTimelineView = () => {
    const generations = {};
    
    population?.forEach(individual => {
      const gen = individual?.generation || 1;
      if (!generations?.[gen]) generations[gen] = [];
      generations?.[gen]?.push(individual);
    });
    
    return (
      <div className="space-y-6">
        {Object.entries(generations)?.sort(([a], [b]) => parseInt(a) - parseInt(b))?.map(([gen, individuals]) => (
          <div key={gen} className="border border-gray-600 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{gen}</span>
              </div>
              <h4 className="text-white font-semibold">Generation {gen}</h4>
              <span className="text-gray-400">({individuals?.length} individuals)</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {individuals?.map(individual => (
                <div
                  key={individual?.id}
                  className="bg-gray-900/50 rounded p-3 cursor-pointer hover:bg-gray-800/50 transition-all duration-200"
                  onClick={() => setSelectedLineage(individual?.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{individual?.name}</span>
                    <span className="text-green-400 font-semibold">
                      {individual?.fitness?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    {individual?.parents?.length > 0 && (
                      <span>Parents: {individual?.parents?.length}</span>
                    )}
                    {individual?.mutations?.length > 0 && (
                      <span className="text-red-400">
                        {individual?.mutations?.length} mutations
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMutationsView = () => {
    const selectedIndividual = population?.find(p => p?.id === selectedLineage);
    
    if (!selectedIndividual) {
      return (
        <div className="text-center py-12 text-gray-400">
          <Shuffle className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">Select an Individual</p>
          <p className="text-sm">Choose from the population to view mutation history</p>
        </div>
      );
    }
    
    const mutationHistory = getMutationHistory(selectedIndividual);
    
    return (
      <div className="space-y-4">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">
            {selectedIndividual?.name} - Mutation Timeline
          </h4>
          
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div className="text-center">
              <div className="text-blue-400 text-lg font-bold">
                {mutationHistory?.filter(m => !m?.inherited)?.length}
              </div>
              <div className="text-gray-400">Own Mutations</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 text-lg font-bold">
                {mutationHistory?.filter(m => m?.inherited)?.length}
              </div>
              <div className="text-gray-400">Inherited</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 text-lg font-bold">
                {selectedIndividual?.fitness?.toFixed(2) || '0.00'}
              </div>
              <div className="text-gray-400">Current Fitness</div>
            </div>
          </div>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {mutationHistory?.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <span>No mutations detected</span>
            </div>
          ) : (
            mutationHistory?.map((mutation, index) => (
              <div
                key={index}
                className={`rounded-lg p-3 border-l-4 ${
                  mutation?.inherited
                    ? 'bg-yellow-900/20 border-yellow-500' :'bg-red-900/20 border-red-500'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Shuffle className={`w-4 h-4 ${
                      mutation?.inherited ? 'text-yellow-400' : 'text-red-400'
                    }`} />
                    <span className="text-white font-medium">{mutation?.gene}</span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      mutation?.inherited
                        ? 'bg-yellow-900/50 text-yellow-300' :'bg-red-900/50 text-red-300'
                    }`}>
                      {mutation?.type}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs">
                    {new Date(mutation.timestamp)?.toLocaleDateString()}
                  </span>
                </div>
                
                {mutation?.inherited && mutation?.from && (
                  <div className="text-yellow-300 text-sm">
                    Inherited from: {mutation?.from}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <GitBranch className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Strategy Genealogy Tracker</h3>
        </div>
        
        <div className="flex space-x-2">
          {[
            { mode: 'tree', icon: GitBranch, label: 'Tree' },
            { mode: 'timeline', icon: History, label: 'Timeline' },
            { mode: 'mutations', icon: Shuffle, label: 'Mutations' }
          ]?.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                viewMode === mode
                  ? 'bg-blue-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {viewMode === 'tree' && renderTreeView()}
        {viewMode === 'timeline' && renderTimelineView()}
        {viewMode === 'mutations' && renderMutationsView()}
      </div>
    </div>
  );
}