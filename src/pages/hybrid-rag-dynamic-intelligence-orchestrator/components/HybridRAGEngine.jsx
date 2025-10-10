import React, { useState, useEffect } from 'react';
import { Search, Database, Layers, Zap, Brain, BarChart3, Eye, ChevronRight, FileText, TrendingUp } from 'lucide-react';

export default function HybridRAGEngine() {
  const [searchQuery, setSearchQuery] = useState('');
  const [retrievalResults, setRetrievalResults] = useState([]);
  const [searchMode, setSearchMode] = useState('hybrid'); // hybrid, semantic, keyword
  const [loading, setLoading] = useState(false);

  const searchModes = [
    { id: 'hybrid', label: 'Hybrid RAG', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'semantic', label: 'Semantic', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'keyword', label: 'BM25', color: 'text-green-400', bg: 'bg-green-500/10' }
  ];

  const performRetrieval = async () => {
    if (!searchQuery?.trim()) return;
    
    setLoading(true);
    try {
      // Simulate retrieval with realistic results
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockResults = [
        {
          id: 1,
          type: 'text',
          title: 'Options Trading Strategies',
          content: 'Advanced techniques for volatility-based option strategies...',
          relevanceScore: 0.95,
          source: 'Options as Strategic Investment',
          dataType: 'Dense Passage'
        },
        {
          id: 2,
          type: 'chart',
          title: 'Market Volatility Patterns',
          content: 'Historical VIX analysis and correlation matrices...',
          relevanceScore: 0.89,
          source: 'Market Data Analytics',
          dataType: 'Visual Chart'
        },
        {
          id: 3,
          type: 'numerical',
          title: 'Risk-Adjusted Returns',
          content: 'Sharpe ratio calculations and portfolio optimization...',
          relevanceScore: 0.87,
          source: 'Quantitative Finance Handbook',
          dataType: 'Numerical Data'
        }
      ];
      
      setRetrievalResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery?.trim()) {
        performRetrieval();
      } else {
        setRetrievalResults([]);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchMode]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'chart': return <BarChart3 className="h-4 w-4" />;
      case 'numerical': return <TrendingUp className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'text': return 'text-blue-400 bg-blue-500/10';
      case 'chart': return 'text-green-400 bg-green-500/10';
      case 'numerical': return 'text-orange-400 bg-orange-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Brain className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Hybrid RAG Engine</h3>
          <p className="text-sm text-gray-400">Multi-modal knowledge retrieval with FAISS indexing</p>
        </div>
      </div>
      {/* Search Mode Selector */}
      <div className="flex space-x-2 mb-4">
        {searchModes?.map((mode) => (
          <button
            key={mode?.id}
            onClick={() => setSearchMode(mode?.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchMode === mode?.id
                ? `${mode?.color} ${mode?.bg} border border-current`
                : 'text-gray-400 hover:text-gray-300 bg-gray-700/50'
            }`}
          >
            {mode?.label}
          </button>
        ))}
      </div>
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e?.target?.value)}
          placeholder="Search knowledge base with semantic understanding..."
          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
          </div>
        )}
      </div>
      {/* Retrieval Results */}
      {retrievalResults?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-300">Dense Passage Retrieval Results</h4>
            <span className="text-sm text-gray-400">{retrievalResults?.length} matches</span>
          </div>
          
          {retrievalResults?.map((result) => (
            <div key={result?.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-purple-500/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded ${getTypeColor(result?.type)}`}>
                    {getTypeIcon(result?.type)}
                  </div>
                  <div>
                    <h5 className="font-medium text-white">{result?.title}</h5>
                    <p className="text-xs text-gray-400">{result?.source} • {result?.dataType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{(result?.relevanceScore * 100)?.toFixed(1)}%</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-3">{result?.content}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Layers className="h-3 w-3 text-blue-400" />
                    <span className="text-xs text-blue-400">Cross-Attention</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-green-400">Enhanced Relevance</span>
                  </div>
                </div>
                
                {/* Relevance Score Bar */}
                <div className="w-20 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-500"
                    style={{ width: `${result?.relevanceScore * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Feature Highlights */}
      {retrievalResults?.length === 0 && !loading && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-300 mb-4">Hybrid RAG Capabilities</h4>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Search className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium">Semantic Search</span>
              </div>
              <p className="text-xs text-gray-400">Dense passage retrieval with 1536-dimensional embeddings</p>
            </div>
            
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Layers className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">Contextual Fusion</span>
              </div>
              <p className="text-xs text-gray-400">Cross-attention mechanisms for enhanced relevance scoring</p>
            </div>
            
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Database className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium">Multi-Modal Index</span>
              </div>
              <p className="text-xs text-gray-400">Text, numerical data, and visual charts in unified search</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}