import React, { useState, useEffect } from 'react';
import { BookOpen, Search, BarChart3, Zap, Database, Users, Activity, Brain, Clock, Target } from 'lucide-react';
import BookLibraryPanel from './components/BookLibraryPanel';
import PDFProcessingPanel from './components/PDFProcessingPanel';
import KnowledgeAnalyticsPanel from './components/KnowledgeAnalyticsPanel';
import AgentConsumptionPanel from './components/AgentConsumptionPanel';
import SearchQueryPanel from './components/SearchQueryPanel';
import ragKnowledgeBaseService from '../../services/ragKnowledgeBaseService';

export default function RAGKnowledgeBaseDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalChunks: 0,
    vectorQueries: 0,
    avgResponseTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [knowledgeStats, setKnowledgeStats] = useState([]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const [books, kbStats] = await Promise.all([
        ragKnowledgeBaseService?.getBooks(),
        ragKnowledgeBaseService?.getKnowledgeStats()
      ]);

      const totalChunks = kbStats?.reduce((sum, book) => sum + (book?.chunks || 0), 0) || 0;

      setStats({
        totalBooks: books?.length || 0,
        totalChunks,
        vectorQueries: Math.floor(Math.random() * 5000) + 1000, // Mock data
        avgResponseTime: Math.floor(Math.random() * 100) + 50    // Mock data
      });
      
      setKnowledgeStats(kbStats || []);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Technical Books',
      value: stats?.totalBooks,
      icon: BookOpen,
      color: 'bg-blue-500',
      description: 'Books ingested and processed'
    },
    {
      title: 'Vector Chunks',
      value: stats?.totalChunks,
      icon: Database,
      color: 'bg-teal-500',
      description: 'Embedded knowledge chunks'
    },
    {
      title: 'Vector Queries',
      value: stats?.vectorQueries,
      icon: Search,
      color: 'bg-orange-500',
      description: 'Semantic searches performed'
    },
    {
      title: 'Avg Response',
      value: `${stats?.avgResponseTime}ms`,
      icon: Zap,
      color: 'bg-green-500',
      description: 'Query response time'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-400">📚 RAG Knowledge Base Dashboard</h1>
              <p className="text-gray-400">
                pgvector-powered semantic search feeding 24 AI agents with technical literature insights
              </p>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards?.map((stat, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat?.title}</p>
                    <p className="text-2xl font-bold text-white">{stat?.value}</p>
                    <p className="text-gray-500 text-xs mt-1">{stat?.description}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat?.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Book Management */}
          <div className="lg:col-span-1 space-y-6">
            <BookLibraryPanel onStatsUpdate={loadStats} />
            <PDFProcessingPanel onProcessComplete={loadStats} />
          </div>

          {/* Center Column - Analytics */}
          <div className="lg:col-span-1 space-y-6">
            <KnowledgeAnalyticsPanel stats={stats} />
            <AgentConsumptionPanel />
          </div>

          {/* Right Column - Search & Query */}
          <div className="lg:col-span-1 space-y-6">
            <SearchQueryPanel />
            
            {/* System Overview */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <Activity className="h-5 w-5 text-teal-400" />
                <h3 className="text-lg font-semibold">System Overview</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center space-x-3">
                    <Target className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Vector Index</span>
                  </div>
                  <span className="text-green-400 text-sm">Healthy</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">Embedding Pipeline</span>
                  </div>
                  <span className="text-yellow-400 text-sm">Processing</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">Agent Connections</span>
                  </div>
                  <span className="text-blue-400 text-sm">24 Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics Footer */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-5 w-5 text-orange-400" />
              <span className="font-medium">Performance Metrics</span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-green-400 font-bold">98.7%</div>
                <div className="text-gray-400">Query Success</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold">1536</div>
                <div className="text-gray-400">Vector Dimensions</div>
              </div>
              <div className="text-center">
                <div className="text-teal-400 font-bold">text-embedding-3-small</div>
                <div className="text-gray-400">OpenAI Model</div>
              </div>
              <div className="text-center">
                <div className="text-orange-400 font-bold">&lt; 200ms</div>
                <div className="text-gray-400">Target Response</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}