import React, { useState, useMemo } from 'react';
import { Users, TrendingUp, Brain, Target, Zap } from 'lucide-react';

const AgentResourceMappingPanel = ({ readingMaterials, aiAgents }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Calculate agent-book mappings with fixed variable scoping
  const agentMappings = useMemo(() => {
    const mappings = {};
    
    readingMaterials?.forEach((book, bookIndex) => {
      book?.applies_to?.forEach((agentName, agentIndex) => {
        if (!mappings?.[agentName]) {
          mappings[agentName] = {
            books: [],
            totalConfidence: 0,
            bookCount: 0
          };
        }
        
        const confidence = book?.agent_mappings?.[agentName]?.confidence || 0.5;
        mappings?.[agentName]?.books?.push({
          ...book,
          confidence,
          chapters: book?.agent_mappings?.[agentName]?.chapters || []
        });
        mappings[agentName].totalConfidence += confidence;
        mappings[agentName].bookCount++;
      });
    });

    // Calculate average confidence for each agent
    Object.keys(mappings)?.forEach((agent, index) => {
      if (mappings?.[agent] && mappings?.[agent]?.bookCount > 0) {
        mappings[agent].averageConfidence = mappings?.[agent]?.totalConfidence / mappings?.[agent]?.bookCount;
      }
    });

    return mappings;
  }, [readingMaterials]);

  // Get agent groups for organization with fixed variable scoping
  const agentGroups = useMemo(() => {
    const groups = {};
    Object.keys(agentMappings)?.forEach((agentName, idx) => {
      const category = getAgentCategory(agentName);
      if (!groups?.[category]) {
        groups[category] = [];
      }
      groups?.[category]?.push(agentName);
    });
    return groups;
  }, [agentMappings]);

  const getAgentCategory = (agentName) => {
    // Categorize agents based on their names
    const categories = {
      'Data & Infrastructure': ['Data Phoenix', 'Deployer', 'Telemetry'],
      'Security & Compliance': ['Compliance Guard', 'KillSwitch', 'Immune Sentinel'],
      'Quantitative Analysis': ['Quant Oracle', 'Strategy Weaver', 'Correlation Hunter'],
      'Execution & Trading': ['Execution Guru'],
      'Operations & Management': ['FinOps', 'DataGov'],
      'Market Intelligence': ['NewsMiner', 'Community Pulse', 'Narrative Builder']
    };

    for (const [category, agents] of Object.entries(categories)) {
      if (agents?.includes(agentName)) {
        return category;
      }
    }
    return 'Other';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-400 bg-green-400/20';
    if (confidence >= 0.8) return 'text-blue-400 bg-blue-400/20';
    if (confidence >= 0.7) return 'text-yellow-400 bg-yellow-400/20';
    return 'text-gray-400 bg-gray-400/20';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Data & Infrastructure': Target,
      'Security & Compliance': Users,
      'Quantitative Analysis': Brain,
      'Execution & Trading': Zap,
      'Operations & Management': TrendingUp,
      'Market Intelligence': Users
    };
    return icons?.[category] || Users;
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-teal-500/20 rounded-lg">
            <Users className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Agent-Resource Mapping</h2>
            <p className="text-gray-400">Intelligent recommendations linking books to AI agents</p>
          </div>
        </div>

        {/* Agent Groups */}
        <div className="space-y-6">
          {Object.entries(agentGroups)?.map(([category, agents]) => {
            const CategoryIcon = getCategoryIcon(category);
            
            return (
              <div key={category} className="bg-gray-700/30 rounded-lg border border-gray-600/50">
                <div className="p-4 border-b border-gray-600/50">
                  <div className="flex items-center space-x-3">
                    <CategoryIcon className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">{category}</h3>
                    <span className="text-sm text-gray-400">
                      ({agents?.length} agent{agents?.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agents?.map((agentName) => {
                      const mapping = agentMappings?.[agentName];
                      const isSelected = selectedAgent === agentName;

                      return (
                        <div 
                          key={agentName}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-blue-500/50 bg-blue-500/10' :'border-gray-600/50 bg-gray-600/30 hover:border-gray-500/50'
                          }`}
                          onClick={() => setSelectedAgent(isSelected ? null : agentName)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-white">{agentName}</h4>
                            <div className="flex items-center space-x-2">
                              <div className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(mapping?.averageConfidence)}`}>
                                {(mapping?.averageConfidence * 100)?.toFixed(0)}%
                              </div>
                              <div className="text-xs text-gray-400">
                                {mapping?.bookCount} book{mapping?.bookCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {mapping?.books?.slice(0, isSelected ? mapping?.books?.length : 2)?.map((book, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-sm text-gray-300 truncate">
                                    {book?.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    by {book?.author}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2 ml-3">
                                  <TrendingUp className="w-3 h-3 text-green-400" />
                                  <span className="text-xs text-green-400">
                                    {(book?.confidence * 100)?.toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            ))}

                            {!isSelected && mapping?.books?.length > 2 && (
                              <p className="text-xs text-gray-400">
                                +{mapping?.books?.length - 2} more...
                              </p>
                            )}

                            {isSelected && (
                              <div className="mt-3 pt-3 border-t border-gray-600/50">
                                <h5 className="text-xs font-medium text-gray-400 mb-2">Learning Path Suggestions</h5>
                                <div className="space-y-1">
                                  {mapping?.books?.map((book, index) => (
                                    <div key={index} className="text-xs text-gray-300">
                                      <span className="text-blue-400">
                                        {index + 1}.
                                      </span>
                                      {' '}
                                      Start with {book?.title}
                                      {book?.chapters?.length > 0 && (
                                        <span className="text-gray-500">
                                          {' '}(focus on {book?.chapters?.slice(0, 2)?.join(', ')})
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {Object.keys(agentMappings)?.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No agent mappings available</p>
            <p className="text-gray-500 text-sm">
              Reading materials with agent mappings will appear here.
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Confidence Levels</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-400/20 border border-green-400"></div>
              <span className="text-gray-400">90-100% - Excellent match</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-400/20 border border-blue-400"></div>
              <span className="text-gray-400">80-89% - Good match</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400/20 border border-yellow-400"></div>
              <span className="text-gray-400">70-79% - Fair match</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-400/20 border border-gray-400"></div>
              <span className="text-gray-400">Below 70% - Basic relevance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentResourceMappingPanel;