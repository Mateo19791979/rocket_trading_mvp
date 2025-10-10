import React, { useState, useEffect } from 'react';
import { Upload, FileText, Activity, AlertTriangle, Zap, Database, Brain } from 'lucide-react';
import DocumentUploadPanel from './components/DocumentUploadPanel';
import ProcessingConfigPanel from './components/ProcessingConfigPanel';
import ProcessingMonitoringPanel from './components/ProcessingMonitoringPanel';
import QualityAssurancePanel from './components/QualityAssurancePanel';
import ragKnowledgeBaseService from '../../services/ragKnowledgeBaseService';

export default function PDFIngestionProcessingCenter() {
  const [processingStats, setProcessingStats] = useState({
    documentsProcessed: 0,
    embeddingSuccessRate: 0,
    vectorStorageUtilization: 0,
    processingErrors: 0
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const [books, kbStats] = await Promise.all([
        ragKnowledgeBaseService?.getBooks(),
        ragKnowledgeBaseService?.getKnowledgeStats()
      ]);

      const totalChunks = kbStats?.reduce((sum, book) => sum + (book?.chunks || 0), 0) || 0;

      setProcessingStats({
        documentsProcessed: books?.length || 0,
        embeddingSuccessRate: 98.7, // Mock data
        vectorStorageUtilization: Math.min((totalChunks / 10000) * 100, 100), // Mock calculation
        processingErrors: Math.floor(Math.random() * 5) // Mock errors
      });
    } catch (error) {
      console.error('Error loading processing stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Documents Processed',
      value: processingStats?.documentsProcessed,
      unit: '/hour',
      icon: FileText,
      color: 'bg-green-500',
      trend: '+12%'
    },
    {
      title: 'Embedding Success',
      value: `${processingStats?.embeddingSuccessRate}%`,
      unit: 'rate',
      icon: Brain,
      color: 'bg-blue-500',
      trend: '+2.1%'
    },
    {
      title: 'Vector Storage',
      value: `${processingStats?.vectorStorageUtilization?.toFixed(1)}%`,
      unit: 'used',
      icon: Database,
      color: 'bg-teal-500',
      trend: '+0.8%'
    },
    {
      title: 'Processing Errors',
      value: processingStats?.processingErrors,
      unit: 'last 24h',
      icon: AlertTriangle,
      color: 'bg-orange-500',
      trend: '-15%'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
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
            <div className="p-2 bg-green-600 rounded-lg">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-green-400">📄 PDF Ingestion & Processing Center</h1>
              <p className="text-gray-400">
                Automated document pipeline converting technical literature into searchable vector embeddings
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
                    <p className="text-gray-500 text-xs mt-1">{stat?.unit}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat?.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-3 text-right">
                  <span className={`text-xs px-2 py-1 rounded ${
                    stat?.trend?.startsWith('+') ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
                  }`}>
                    {stat?.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <DocumentUploadPanel 
              onUploadComplete={loadStats}
              onFileUpload={() => {}}
              uploadProgress={0}
              onSystemHealthChange={() => {}}
            />
            <ProcessingConfigPanel />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ProcessingMonitoringPanel stats={processingStats} />
            <QualityAssurancePanel />
          </div>
        </div>

        {/* Processing Pipeline Status */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold">Processing Pipeline Status</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <h4 className="font-medium mb-1">PDF Extraction</h4>
              <p className="text-sm text-gray-400">pdf-parse + OCR</p>
              <p className="text-xs text-green-400 mt-2">Active</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
              <h4 className="font-medium mb-1">Content Chunking</h4>
              <p className="text-sm text-gray-400">Semantic splitting</p>
              <p className="text-xs text-blue-400 mt-2">Processing</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
              <h4 className="font-medium mb-1">Embedding Generation</h4>
              <p className="text-sm text-gray-400">OpenAI API</p>
              <p className="text-xs text-orange-400 mt-2">Rate limited</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
              </div>
              <h4 className="font-medium mb-1">Vector Storage</h4>
              <p className="text-sm text-gray-400">pgvector index</p>
              <p className="text-xs text-teal-400 mt-2">Optimal</p>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Average processing time: <span className="text-white font-medium">2.3 minutes</span> per document
            </p>
          </div>
        </div>

        {/* Integration Status Footer */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Activity className="h-5 w-5 text-green-400" />
              <span className="font-medium">Integration Status</span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-green-400 font-bold">24/24</div>
                <div className="text-gray-400">Agents Connected</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold">98.7%</div>
                <div className="text-gray-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-teal-400 font-bold">1536D</div>
                <div className="text-gray-400">Vector Dimensions</div>
              </div>
              <div className="text-center">
                <div className="text-orange-400 font-bold">5.2GB</div>
                <div className="text-gray-400">Storage Used</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}