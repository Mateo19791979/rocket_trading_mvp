import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

const KnowledgeSearchPanel = ({
  searchTerm,
  onSearch,
  selectedDifficulty,
  onDifficultyChange,
  selectedAgent,
  onAgentSelect,
  aiAgents
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);

  const handleSearchChange = (e) => {
    onSearch?.(e?.target?.value);
  };

  const handleClearSearch = () => {
    onSearch?.('');
  };

  const handleDifficultySelect = (level) => {
    onDifficultyChange?.(level);
  };

  const handleAgentSelect = (agentName) => {
    onAgentSelect?.(agentName === selectedAgent ? null : agentName);
    setShowAgentDropdown(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedDifficulty && selectedDifficulty !== 'all') count++;
    if (selectedAgent) count++;
    return count;
  };

  // Get unique agent names from reading materials for the dropdown
  const availableAgents = [
    'Data Phoenix', 'Deployer', 'Telemetry', 'Compliance Guard', 'KillSwitch', 
    'Immune Sentinel', 'Quant Oracle', 'Strategy Weaver', 'Correlation Hunter',
    'Execution Guru', 'FinOps', 'DataGov', 'NewsMiner', 'Community Pulse', 'Narrative Builder'
  ];

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Search className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Knowledge Discovery</h2>
          <p className="text-gray-400">Search and filter technical resources</p>
        </div>
      </div>
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search books, authors, topics, or AI agents..."
          className="w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      {/* Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">Filters</span>
          {getActiveFiltersCount() > 0 && (
            <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Active Filters Display */}
        <div className="flex items-center space-x-2">
          {selectedDifficulty && selectedDifficulty !== 'all' && (
            <div className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
              <span>Difficulty: {selectedDifficulty}</span>
              <button
                onClick={() => handleDifficultySelect('all')}
                className="text-blue-400 hover:text-blue-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {selectedAgent && (
            <div className="flex items-center space-x-1 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-sm">
              <span>Agent: {selectedAgent}</span>
              <button
                onClick={() => handleAgentSelect(null)}
                className="text-teal-400 hover:text-teal-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-700/30 rounded-lg border border-gray-600/50 p-4 space-y-4">
          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty Level
            </label>
            <div className="flex flex-wrap gap-2">
              {['all', 'beginner', 'intermediate', 'advanced']?.map((level) => (
                <button
                  key={level}
                  onClick={() => handleDifficultySelect(level)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors capitalize ${
                    selectedDifficulty === level
                      ? 'bg-blue-500 text-white' :'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Agent Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              AI Agent Focus
            </label>
            <div className="relative">
              <button
                onClick={() => setShowAgentDropdown(!showAgentDropdown)}
                className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-left text-white flex items-center justify-between hover:bg-gray-500 transition-colors"
              >
                <span>{selectedAgent || 'Select an AI agent...'}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showAgentDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showAgentDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  <button
                    onClick={() => handleAgentSelect(null)}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600 transition-colors"
                  >
                    All agents
                  </button>
                  {availableAgents?.map((agent) => (
                    <button
                      key={agent}
                      onClick={() => handleAgentSelect(agent)}
                      className={`w-full px-4 py-2 text-left transition-colors ${
                        selectedAgent === agent
                          ? 'bg-teal-500/20 text-teal-300' :'text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {agent}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Clear All Filters */}
          {getActiveFiltersCount() > 0 && (
            <div className="pt-2 border-t border-gray-600/50">
              <button
                onClick={() => {
                  handleDifficultySelect('all');
                  handleAgentSelect(null);
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
      {/* Search Tips */}
      {!searchTerm && (
        <div className="mt-4 p-3 bg-gray-700/20 rounded-lg border border-gray-600/30">
          <p className="text-xs text-gray-400 mb-2">💡 Search Tips:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Search by book title: "Designing Data-Intensive"</p>
            <p>• Find by author: "Martin Kleppmann"</p>
            <p>• Filter by topic: "CQRS", "Security", "Machine Learning"</p>
            <p>• Discover agent-specific books: "Data Phoenix", "Quant Oracle"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeSearchPanel;