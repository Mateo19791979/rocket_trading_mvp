import React, { useMemo } from 'react';
import { TrendingUp, BookOpen, Clock, Award, Target, Calendar, BarChart3 } from 'lucide-react';

const ReadingProgressDashboard = ({ readingMaterials, knowledgeStats }) => {
  // Calculate progress insights with fixed variable scoping
  const progressInsights = useMemo(() => {
    if (!readingMaterials?.length) {
      return {
        recentlyRead: [],
        inProgress: [],
        recommended: [],
        completed: [],
        totalPages: 0,
        readPages: 0
      };
    }

    const completed = readingMaterials?.filter(book => (book?.reading_progress || 0) >= 100);
    const inProgress = readingMaterials?.filter(book => 
      (book?.reading_progress || 0) > 0 && (book?.reading_progress || 0) < 100
    );
    const notStarted = readingMaterials?.filter(book => (book?.reading_progress || 0) === 0);
    
    // Sort by priority and difficulty for recommendations with proper variable naming
    const recommended = notStarted?.sort((bookA, bookB) => {
        const priorityDiff = bookA?.priority_level - bookB?.priority_level;
        if (priorityDiff !== 0) return priorityDiff;
        
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        return difficultyOrder?.[bookA?.difficulty_level] - difficultyOrder?.[bookB?.difficulty_level];
      })?.slice(0, 3);

    const totalPages = readingMaterials?.reduce((sum, book) => sum + (book?.page_count || 0), 0);
    const readPages = readingMaterials?.reduce((sum, book) => 
      sum + ((book?.page_count || 0) * (book?.reading_progress || 0) / 100), 0
    );

    return {
      recentlyRead: inProgress?.slice(0, 3),
      inProgress,
      recommended,
      completed,
      totalPages,
      readPages: Math.round(readPages)
    };
  }, [readingMaterials]);

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-green-400';
    if (progress >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getDifficultyColor = (level) => {
    const colors = {
      beginner: 'text-green-400 bg-green-400/10',
      intermediate: 'text-blue-400 bg-blue-400/10', 
      advanced: 'text-orange-400 bg-orange-400/10'
    };
    return colors?.[level] || 'text-gray-400 bg-gray-400/10';
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Reading Progress Dashboard</h2>
            <p className="text-gray-400">Track your knowledge acquisition journey</p>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <BookOpen className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{progressInsights?.completed?.length}</p>
            <p className="text-sm text-gray-400">Completed</p>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{progressInsights?.inProgress?.length}</p>
            <p className="text-sm text-gray-400">In Progress</p>
          </div>
        </div>

        {/* Pages Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Total Pages Read</span>
            <span className="text-sm font-medium text-white">
              {progressInsights?.readPages} / {progressInsights?.totalPages}
            </span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className="h-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full transition-all duration-300"
              style={{ 
                width: `${progressInsights?.totalPages > 0 
                  ? (progressInsights?.readPages / progressInsights?.totalPages) * 100 
                  : 0}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Overall Progress by Difficulty */}
        {knowledgeStats && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-300">Progress by Difficulty</h4>
            {Object.entries(knowledgeStats?.byDifficulty || {})?.map(([level, count], difficultyIndex) => {
              const levelBooks = readingMaterials?.filter(book => book?.difficulty_level === level) || [];
              const avgProgress = levelBooks?.length > 0 
                ? levelBooks?.reduce((sum, book) => sum + (book?.reading_progress || 0), 0) / levelBooks?.length
                : 0;

              return (
                <div key={`${level}-${difficultyIndex}`} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${getDifficultyColor(level)}`}>
                      {level}
                    </span>
                    <span className="text-sm text-gray-400">({count} books)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-600 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${getProgressColor(avgProgress)} transition-all duration-300`}
                        style={{ width: `${avgProgress}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs ${getProgressColor(avgProgress)}`}>
                      {avgProgress?.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Currently Reading */}
      {progressInsights?.inProgress?.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Currently Reading</h3>
          </div>
          <div className="space-y-3">
            {progressInsights?.inProgress?.map((book, bookIndex) => (
              <div key={`${book?.id}-${bookIndex}`} className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white truncate">{book?.title}</p>
                    <p className="text-xs text-gray-400">by {book?.author}</p>
                  </div>
                  <span className={`text-sm font-medium ${getProgressColor(book?.reading_progress || 0)}`}>
                    {book?.reading_progress || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${getProgressColor(book?.reading_progress || 0)} transition-all duration-300`}
                    style={{ width: `${book?.reading_progress || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Recommended Next */}
      {progressInsights?.recommended?.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Recommended Next</h3>
          </div>
          <div className="space-y-3">
            {progressInsights?.recommended?.map((book, index) => (
              <div key={`${book?.id}-rec-${index}`} className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-blue-400 text-sm font-medium">#{index + 1}</span>
                      <p className="text-sm font-medium text-white">{book?.title}</p>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">by {book?.author}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(book?.difficulty_level)}`}>
                        {book?.difficulty_level}
                      </span>
                      <span className="text-xs text-gray-400">{book?.page_count} pages</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Priority</div>
                    <div className="flex space-x-1">
                      {[1, 2, 3]?.map((priorityLevel) => (
                        <div
                          key={priorityLevel}
                          className={`w-2 h-2 rounded-full ${
                            priorityLevel <= (4 - (book?.priority_level || 4))
                              ? 'bg-orange-400' :'bg-gray-600'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Achievements */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Award className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Knowledge Achievements</h3>
        </div>
        <div className="space-y-3">
          {progressInsights?.completed?.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-400">Book Completion Master</p>
                  <p className="text-xs text-green-300">
                    Completed {progressInsights?.completed?.length} book{progressInsights?.completed?.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {progressInsights?.readPages >= 1000 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-400">Knowledge Explorer</p>
                  <p className="text-xs text-blue-300">Read over 1,000 pages</p>
                </div>
              </div>
            </div>
          )}

          {progressInsights?.inProgress?.length >= 3 && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-400">Multitasker</p>
                  <p className="text-xs text-purple-300">Reading 3+ books simultaneously</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Export Options */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-white">Knowledge Management</h3>
        </div>
        <div className="space-y-3">
          <button className="w-full bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 rounded-lg p-3 transition-colors">
            <div className="text-left">
              <p className="text-sm font-medium text-teal-400">Export Reading List</p>
              <p className="text-xs text-teal-300">Download personalized reading recommendations</p>
            </div>
          </button>
          <button className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg p-3 transition-colors">
            <div className="text-left">
              <p className="text-sm font-medium text-blue-400">Agent Learning Paths</p>
              <p className="text-xs text-blue-300">Get AI-specific study recommendations</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingProgressDashboard;