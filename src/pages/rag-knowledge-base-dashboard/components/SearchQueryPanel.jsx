import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Clock,
  Star,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import ragKnowledgeBaseService from '../../../services/ragKnowledgeBaseService';

export default function SearchQueryPanel() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState(['QuantOracle']);
  const [recentQueries, setRecentQueries] = useState([
    'How to implement event sourcing patterns?',
    'Best practices for financial machine learning',
    'SRE alerting strategies for microservices',
    'Risk management in algorithmic trading'
  ]);

  const availableDomains = [
    'QuantOracle',
    'StrategyWeaver', 
    'DataPhoenix',
    'Deployer',
    'Telemetry',
    'ImmuneSentinel'
  ];

  const handleSearch = async () => {
    if (!query?.trim()) return;

    try {
      setLoading(true);
      const searchResults = await ragKnowledgeBaseService?.searchKnowledge({
        query: query?.trim(),
        domains: selectedDomains,
        k: 5
      });

      setResults(searchResults || []);
      
      // Add to recent queries if not already there
      if (!recentQueries?.includes(query?.trim())) {
        setRecentQueries(prev => [query?.trim(), ...prev?.slice(0, 3)]);
      }
    } catch (error) {
      console.error('Error searching knowledge:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDomainToggle = (domain) => {
    setSelectedDomains(prev => 
      prev?.includes(domain)
        ? prev?.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const handleRecentQueryClick = (recentQuery) => {
    setQuery(recentQuery);
  };

  const getSimilarityColor = (similarity) => {
    if (similarity >= 0.9) return 'text-green-400';
    if (similarity >= 0.8) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getSimilarityLabel = (similarity) => {
    if (similarity >= 0.9) return 'Excellent';
    if (similarity >= 0.8) return 'Good';
    if (similarity >= 0.7) return 'Fair';
    return 'Low';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <Search className="h-5 w-5 text-orange-400" />
        <h3 className="text-lg font-semibold">Search & Query Interface</h3>
      </div>
      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e?.target?.value)}
            onKeyPress={(e) => e?.key === 'Enter' && handleSearch()}
            placeholder="Search technical knowledge..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-4 pr-12 py-3 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query?.trim()}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-orange-400 hover:text-orange-300 disabled:text-gray-500"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-400"></div>
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      {/* Domain Filters */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-300">Agent Domains:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableDomains?.map((domain) => (
            <button
              key={domain}
              onClick={() => handleDomainToggle(domain)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedDomains?.includes(domain)
                  ? 'bg-orange-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>
      {/* Recent Queries */}
      {recentQueries?.length > 0 && !results?.length && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300">Recent Queries:</span>
          </div>
          <div className="space-y-2">
            {recentQueries?.map((recentQuery, index) => (
              <button
                key={index}
                onClick={() => handleRecentQueryClick(recentQuery)}
                className="w-full text-left p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 transition-colors"
              >
                {recentQuery}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Search Results */}
      {results?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-gray-300">Search Results ({results?.length}):</span>
          </div>
          
          {results?.map((result, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <BookOpen className="h-4 w-4 text-blue-400" />
                    <h4 className="font-medium text-white truncate">{result?.title}</h4>
                  </div>
                  <p className="text-sm text-gray-400">by {result?.author}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getSimilarityColor(result?.similarity)}`}>
                      {(result?.similarity * 100)?.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">
                      {getSimilarityLabel(result?.similarity)}
                    </div>
                  </div>
                  <Star className={`h-4 w-4 ${getSimilarityColor(result?.similarity)}`} />
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                {result?.content}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Chunk ID: {result?.chunk_id?.substring(0, 8)}...
                </div>
                <button className="flex items-center space-x-1 text-xs text-orange-400 hover:text-orange-300">
                  <span>View Context</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* No Results */}
      {!loading && query && results?.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No results found for "{query}"</p>
          <p className="text-sm">Try adjusting your search terms or domain filters</p>
        </div>
      )}
      {/* Search Tips */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-2">Search Tips:</p>
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Use specific technical terms for better results</p>
          <p>• Select relevant agent domains to filter results</p>
          <p>• Try related keywords if no results are found</p>
          <p>• Semantic search finds conceptually similar content</p>
        </div>
      </div>
    </div>
  );
}