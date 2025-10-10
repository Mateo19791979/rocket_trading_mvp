import React, { useState, useEffect } from 'react';
import { FileText, Zap, BarChart3, Download, Play, Pause, RefreshCw, Brain, TrendingUp, Calendar, ChevronRight, Target } from 'lucide-react';

export default function IntelligentReportGenerator({ stats = {} }) {
  const [generationMode, setGenerationMode] = useState('auto');
  const [activeTemplate, setActiveTemplate] = useState('market_analysis');
  const [recentReports, setRecentReports] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTemplates = [
    {
      id: 'market_analysis',
      name: 'Market Analysis',
      icon: TrendingUp,
      color: 'text-blue-400 bg-blue-500/10',
      description: 'Comprehensive market trend analysis',
      lastGenerated: '2 hours ago',
      autoFrequency: 'Every 4 hours'
    },
    {
      id: 'risk_assessment',
      name: 'Risk Assessment',
      icon: BarChart3,
      color: 'text-red-400 bg-red-500/10',
      description: 'Portfolio risk evaluation and metrics',
      lastGenerated: '6 hours ago',
      autoFrequency: 'Daily at 6 AM'
    },
    {
      id: 'strategy_performance',
      name: 'Strategy Performance',
      icon: Target,
      color: 'text-green-400 bg-green-500/10',
      description: 'AI strategy performance review',
      lastGenerated: '1 hour ago',
      autoFrequency: 'Every 2 hours'
    },
    {
      id: 'market_scenarios',
      name: 'Predictive Scenarios',
      icon: Brain,
      color: 'text-purple-400 bg-purple-500/10',
      description: 'AI-generated market scenario planning',
      lastGenerated: '4 hours ago',
      autoFrequency: 'Every 6 hours'
    }
  ];

  const mockRecentReports = [
    {
      id: 1,
      title: 'Weekly Options Strategy Review',
      type: 'strategy_performance',
      generatedAt: '2025-01-05T14:30:00Z',
      pages: 12,
      insights: 8,
      status: 'completed'
    },
    {
      id: 2,
      title: 'Market Volatility Analysis',
      type: 'market_analysis',
      generatedAt: '2025-01-05T12:15:00Z',
      pages: 8,
      insights: 5,
      status: 'completed'
    },
    {
      id: 3,
      title: 'Risk Exposure Report',
      type: 'risk_assessment',
      generatedAt: '2025-01-05T09:00:00Z',
      pages: 15,
      insights: 12,
      status: 'completed'
    }
  ];

  const generateReport = async (templateId) => {
    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newReport = {
        id: Date.now(),
        title: `${reportTemplates?.find(t => t?.id === templateId)?.name} - ${new Date()?.toLocaleString()}`,
        type: templateId,
        generatedAt: new Date()?.toISOString(),
        pages: Math.floor(Math.random() * 15) + 5,
        insights: Math.floor(Math.random() * 10) + 3,
        status: 'completed'
      };
      
      setRecentReports(prev => [newReport, ...prev?.slice(0, 4)]);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    setRecentReports(mockRecentReports);
  }, []);

  const getTemplateIcon = (templateId) => {
    const template = reportTemplates?.find(t => t?.id === templateId);
    return template?.icon || FileText;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <FileText className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Intelligent Report Generator</h3>
            <p className="text-sm text-gray-400">Natural language generation with fine-tuned models</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setGenerationMode(generationMode === 'auto' ? 'manual' : 'auto')}
            className={`px-3 py-1 rounded-lg text-xs font-medium ${
              generationMode === 'auto' ?'bg-green-500/10 text-green-400 border border-green-500/20' :'bg-gray-700 text-gray-400'
            }`}
          >
            {generationMode === 'auto' ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            {generationMode === 'auto' ? 'Auto' : 'Manual'}
          </button>
        </div>
      </div>
      {/* Report Templates */}
      <div className="space-y-3 mb-6">
        <h4 className="font-medium text-gray-300 mb-3">Report Templates</h4>
        {reportTemplates?.map((template) => (
          <div
            key={template?.id}
            onClick={() => setActiveTemplate(template?.id)}
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-gray-500 ${
              activeTemplate === template?.id 
                ? 'border-gray-500 bg-gray-700/50' :'border-gray-600 bg-gray-700/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${template?.color}`}>
                  <template.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{template?.name}</div>
                  <div className="text-sm text-gray-400">{template?.description}</div>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-500">{template?.lastGenerated}</span>
                    </div>
                    {generationMode === 'auto' && (
                      <div className="flex items-center space-x-1">
                        <RefreshCw className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-green-400">{template?.autoFrequency}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    generateReport(template?.id);
                  }}
                  disabled={isGenerating}
                  className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                </button>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Recent Reports */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-300">Recent Reports</h4>
          <span className="text-sm text-gray-400">{stats?.generatedReports || 0} total</span>
        </div>
        
        {recentReports?.length > 0 ? (
          <div className="space-y-2">
            {recentReports?.map((report) => {
              const TemplateIcon = getTemplateIcon(report?.type);
              return (
                <div key={report?.id} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-1 bg-gray-600 rounded">
                        <TemplateIcon className="h-3 w-3 text-gray-300" />
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{report?.title}</div>
                        <div className="flex items-center space-x-3 text-xs text-gray-400">
                          <span>{new Date(report?.generatedAt)?.toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{report?.pages} pages</span>
                          <span>•</span>
                          <span>{report?.insights} insights</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-green-400 capitalize">{report?.status}</span>
                      </div>
                      <button className="p-1 text-gray-400 hover:text-white">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-400">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No reports generated yet</p>
          </div>
        )}
      </div>
      {/* Generation Progress */}
      {isGenerating && (
        <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
            <div>
              <div className="text-sm font-medium text-blue-400">Generating Report...</div>
              <div className="text-xs text-gray-400">Using fine-tuned language models for narrative construction</div>
            </div>
          </div>
          <div className="mt-3 w-full h-1 bg-gray-600 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-green-400 animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
}