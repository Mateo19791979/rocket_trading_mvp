import React, { useState } from 'react';
import { Book, Star, Clock, Target, ExternalLink, Bookmark, Users, TrendingUp } from 'lucide-react';

const TechnicalLibraryPanel = ({ 
  readingMaterials, 
  onProgressUpdate, 
  getDifficultyColor, 
  getPriorityColor 
}) => {
  const [expandedBook, setExpandedBook] = useState(null);

  const handleProgressChange = (materialId, progress) => {
    onProgressUpdate?.(materialId, parseFloat(progress));
  };

  const toggleBookExpansion = (bookId) => {
    setExpandedBook(expandedBook === bookId ? null : bookId);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Book className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Technical Library</h2>
              <p className="text-gray-400">Comprehensive collection of specialized technical books</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {readingMaterials?.length || 0} books
          </div>
        </div>

        {/* Books Grid */}
        <div className="space-y-4">
          {readingMaterials?.map((book) => (
            <div key={book?.id} className="bg-gray-700/30 rounded-lg border border-gray-600/50 overflow-hidden">
              {/* Book Header */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
                onClick={() => toggleBookExpansion(book?.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-16 bg-gradient-to-b from-blue-500/20 to-teal-500/20 rounded border border-gray-600 flex items-center justify-center">
                        <Book className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {book?.title}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          by <span className="font-medium">{book?.author}</span>
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`text-sm ${getDifficultyColor(book?.difficulty_level)}`}>
                            <Target className="w-4 h-4 inline mr-1" />
                            {book?.difficulty_level}
                          </span>
                          <span className={`text-sm ${getPriorityColor(book?.priority_level)}`}>
                            <Star className="w-4 h-4 inline mr-1" />
                            Priority {book?.priority_level}
                          </span>
                          <span className="text-gray-400 text-sm">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {book?.page_count} pages
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Reading Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Reading Progress</span>
                        <span className="text-sm font-medium text-white">
                          {book?.reading_progress || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(book?.reading_progress || 0)}`}
                          style={{ width: `${book?.reading_progress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Applied To Agents */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {book?.applies_to?.map((agent, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 text-xs bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/30"
                        >
                          <Users className="w-3 h-3 inline mr-1" />
                          {agent}
                        </span>
                      ))}
                    </div>

                    <p className="text-gray-400 text-sm">
                      {book?.purpose}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 hover:bg-gray-600/50 rounded-lg transition-colors">
                      <Bookmark className="w-5 h-5 text-gray-400 hover:text-yellow-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-600/50 rounded-lg transition-colors">
                      <ExternalLink className="w-5 h-5 text-gray-400 hover:text-blue-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedBook === book?.id && (
                <div className="px-4 pb-4 border-t border-gray-600/50">
                  <div className="pt-4 space-y-4">
                    {/* Key Topics */}
                    {book?.key_topics && book?.key_topics?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Key Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          {book?.key_topics?.map((topic, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Agent Mappings */}
                    {book?.agent_mappings && Object.keys(book?.agent_mappings)?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Agent-Specific Insights</h4>
                        <div className="space-y-2">
                          {Object.entries(book?.agent_mappings)?.map(([agent, mapping], index) => (
                            <div key={index} className="bg-gray-600/30 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white">{agent}</span>
                                <div className="flex items-center space-x-2">
                                  <TrendingUp className="w-4 h-4 text-green-400" />
                                  <span className="text-sm text-green-400">
                                    {(mapping?.confidence * 100)?.toFixed(0)}% match
                                  </span>
                                </div>
                              </div>
                              {mapping?.chapters && (
                                <p className="text-xs text-gray-400">
                                  Relevant chapters: {mapping?.chapters?.join(', ')}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Progress Update Controls */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Update Progress</h4>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={book?.reading_progress || 0}
                          onChange={(e) => handleProgressChange(book?.id, e?.target?.value)}
                          className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={book?.reading_progress || 0}
                          onChange={(e) => handleProgressChange(book?.id, e?.target?.value)}
                          className="w-16 px-2 py-1 text-sm bg-gray-600 border border-gray-500 rounded text-white"
                        />
                        <span className="text-sm text-gray-400">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {(!readingMaterials || readingMaterials?.length === 0) && (
          <div className="text-center py-12">
            <Book className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No reading materials found</p>
            <p className="text-gray-500 text-sm">
              Try adjusting your search criteria or check your database connection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicalLibraryPanel;