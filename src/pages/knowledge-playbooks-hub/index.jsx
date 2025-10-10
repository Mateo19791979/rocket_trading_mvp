import React, { useState, useEffect } from 'react';
import { Search, Book, Users, TrendingUp, Star, Filter } from 'lucide-react';
import knowledgeBaseService from '../../services/knowledgeBaseService';

// Component imports
import TechnicalLibraryPanel from './components/TechnicalLibraryPanel';
import AgentResourceMappingPanel from './components/AgentResourceMappingPanel';
import ReadingProgressDashboard from './components/ReadingProgressDashboard';
import KnowledgeSearchPanel from './components/KnowledgeSearchPanel';

const KnowledgePlaybooksHub = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readingMaterials, setReadingMaterials] = useState([]);
  const [aiAgents, setAiAgents] = useState([]);
  const [knowledgeStats, setKnowledgeStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Load initial data
  useEffect(() => {
    loadKnowledgeData();
  }, []);

  const loadKnowledgeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [materialsResult, agentsResult, statsResult] = await Promise.all([
        knowledgeBaseService?.getAllReadingMaterials(),
        knowledgeBaseService?.getAIAgents(),
        knowledgeBaseService?.getKnowledgeStats()
      ]);

      if (materialsResult?.error) {
        throw new Error(`Failed to load reading materials: ${materialsResult.error}`);
      }
      if (agentsResult?.error) {
        throw new Error(`Failed to load AI agents: ${agentsResult.error}`);
      }
      if (statsResult?.error) {
        throw new Error(`Failed to load knowledge stats: ${statsResult.error}`);
      }

      setReadingMaterials(materialsResult?.data || []);
      setAiAgents(agentsResult?.data || []);
      setKnowledgeStats(statsResult?.data);

    } catch (err) {
      setError(err?.message);
      // Set fallback data for development
      setReadingMaterials([]);
      setAiAgents([]);
      setKnowledgeStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (!term?.trim()) {
      loadKnowledgeData();
      return;
    }

    try {
      const result = await knowledgeBaseService?.searchReadingMaterials(term);
      if (result?.error) {
        setError(`Search failed: ${result?.error}`);
        return;
      }
      setReadingMaterials(result?.data || []);
    } catch (err) {
      setError(`Search error: ${err?.message}`);
    }
  };

  // Handle difficulty filter
  const handleDifficultyFilter = async (level) => {
    setSelectedDifficulty(level);
    
    if (level === 'all') {
      loadKnowledgeData();
      return;
    }

    try {
      const result = await knowledgeBaseService?.getReadingMaterialsByDifficulty(level);
      if (result?.error) {
        setError(`Filter failed: ${result?.error}`);
        return;
      }
      setReadingMaterials(result?.data || []);
    } catch (err) {
      setError(`Filter error: ${err?.message}`);
    }
  };

  // Handle agent selection
  const handleAgentSelect = async (agentName) => {
    setSelectedAgent(agentName);
    
    if (!agentName) {
      loadKnowledgeData();
      return;
    }

    try {
      const result = await knowledgeBaseService?.getReadingMaterialsByAgent(agentName);
      if (result?.error) {
        setError(`Agent filter failed: ${result?.error}`);
        return;
      }
      setReadingMaterials(result?.data || []);
    } catch (err) {
      setError(`Agent filter error: ${err?.message}`);
    }
  };

  // Handle reading progress update
  const handleProgressUpdate = async (materialId, progress) => {
    try {
      const result = await knowledgeBaseService?.updateReadingProgress(materialId, progress);
      if (result?.error) {
        setError(`Failed to update progress: ${result?.error}`);
        return;
      }
      
      // Update local state
      setReadingMaterials(prev => 
        prev?.map(material => 
          material?.id === materialId 
            ? { ...material, reading_progress: progress }
            : material
        )
      );
    } catch (err) {
      setError(`Progress update error: ${err?.message}`);
    }
  };

  const getDifficultyColor = (level) => {
    const colors = {
      beginner: 'text-green-400',
      intermediate: 'text-blue-400', 
      advanced: 'text-orange-400'
    };
    return colors?.[level] || 'text-gray-400';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      1: 'text-red-400',
      2: 'text-yellow-400',
      3: 'text-gray-400'
    };
    return colors?.[priority] || 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-300">Loading Knowledge Base...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-teal-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Book className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Knowledge & Playbooks Hub</h1>
              <p className="text-gray-300 text-lg">
                Technical library with 7 specialized books mapped to 24 AI agents
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          {knowledgeStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center space-x-3">
                  <Book className="w-6 h-6 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Total Books</p>
                    <p className="text-xl font-semibold text-white">{knowledgeStats?.totalBooks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-teal-400" />
                  <div>
                    <p className="text-sm text-gray-400">AI Agents</p>
                    <p className="text-xl font-semibold text-white">{Object.keys(knowledgeStats?.agentCoverage || {})?.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                  <div>
                    <p className="text-sm text-gray-400">Avg Progress</p>
                    <p className="text-xl font-semibold text-white">{knowledgeStats?.averageProgress?.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center space-x-3">
                  <Star className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Advanced Books</p>
                    <p className="text-xl font-semibold text-white">{knowledgeStats?.byDifficulty?.advanced || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-300">
                {error}
                <button 
                  onClick={loadKnowledgeData}
                  className="ml-4 text-red-400 hover:text-red-300 underline"
                >
                  Retry
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Technical Library */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <KnowledgeSearchPanel
              searchTerm={searchTerm}
              onSearch={handleSearch}
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={handleDifficultyFilter}
              selectedAgent={selectedAgent}
              onAgentSelect={handleAgentSelect}
              aiAgents={aiAgents}
            />

            {/* Technical Library */}
            <TechnicalLibraryPanel
              readingMaterials={readingMaterials}
              onProgressUpdate={handleProgressUpdate}
              getDifficultyColor={getDifficultyColor}
              getPriorityColor={getPriorityColor}
            />

            {/* Agent-Resource Mapping */}
            <AgentResourceMappingPanel
              readingMaterials={readingMaterials}
              aiAgents={aiAgents}
            />
          </div>

          {/* Right Column - Reading Progress Dashboard */}
          <div className="space-y-6">
            <ReadingProgressDashboard
              readingMaterials={readingMaterials}
              knowledgeStats={knowledgeStats}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgePlaybooksHub;