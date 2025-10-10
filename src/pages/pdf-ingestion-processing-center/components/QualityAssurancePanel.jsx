import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, Eye, RefreshCw, Download } from 'lucide-react';

export default function QualityAssurancePanel() {
  const [qualityMetrics, setQualityMetrics] = useState({
    contentValidation: {
      passed: 0,
      failed: 0,
      warnings: 0
    },
    embeddingQuality: {
      score: 0,
      consistency: 0,
      coverage: 0
    },
    similarityTesting: {
      accuracy: 0,
      precision: 0,
      recall: 0
    },
    validationResults: []
  });

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [runningValidation, setRunningValidation] = useState(false);

  useEffect(() => {
    // Load quality metrics
    loadQualityMetrics();
  }, []);

  const loadQualityMetrics = async () => {
    // Simulate loading quality metrics
    setQualityMetrics({
      contentValidation: {
        passed: 142,
        failed: 3,
        warnings: 8
      },
      embeddingQuality: {
        score: 87.3,
        consistency: 92.1,
        coverage: 89.7
      },
      similarityTesting: {
        accuracy: 91.4,
        precision: 88.9,
        recall: 93.2
      },
      validationResults: [
        {
          id: '1',
          document: 'Designing Data-Intensive Applications',
          status: 'passed',
          score: 94.2,
          issues: 0,
          lastChecked: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: '2',
          document: 'Financial Machine Learning',
          status: 'warning',
          score: 82.1,
          issues: 2,
          lastChecked: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        {
          id: '3',
          document: 'SRE Workbook',
          status: 'passed',
          score: 91.8,
          issues: 0,
          lastChecked: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      ]
    });
  };

  const runValidation = async () => {
    setRunningValidation(true);
    
    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Refresh metrics
    await loadQualityMetrics();
    
    setRunningValidation(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return <Shield className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const exportReport = () => {
    // In a real implementation, this would generate a comprehensive quality report
    const report = {
      timestamp: new Date()?.toISOString(),
      metrics: qualityMetrics,
      summary: {
        totalDocuments: qualityMetrics?.validationResults?.length,
        qualityScore: qualityMetrics?.embeddingQuality?.score,
        recommendations: [
          'Review documents with scores below 85%',
          'Monitor embedding consistency trends',
          'Validate semantic similarity accuracy'
        ]
      }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quality-report-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
    a?.click();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-semibold">Quality Assurance</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={runValidation}
            disabled={runningValidation}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
            title="Run validation"
          >
            <RefreshCw className={`h-4 w-4 ${runningValidation ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportReport}
            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            title="Export report"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* Quality Metrics Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {qualityMetrics?.embeddingQuality?.score?.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400">Embedding Quality</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {qualityMetrics?.similarityTesting?.accuracy?.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400">Search Accuracy</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-teal-400">
            {qualityMetrics?.contentValidation?.passed}
          </div>
          <div className="text-xs text-gray-400">Docs Validated</div>
        </div>
      </div>
      {/* Content Validation Summary */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Content Validation Summary</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">Passed</span>
            </div>
            <div className="text-lg font-bold text-white">
              {qualityMetrics?.contentValidation?.passed}
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">Warnings</span>
            </div>
            <div className="text-lg font-bold text-white">
              {qualityMetrics?.contentValidation?.warnings}
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-400">Failed</span>
            </div>
            <div className="text-lg font-bold text-white">
              {qualityMetrics?.contentValidation?.failed}
            </div>
          </div>
        </div>
      </div>
      {/* Quality Metrics Details */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Quality Metrics</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Embedding Consistency</span>
              <span className="text-white">{qualityMetrics?.embeddingQuality?.consistency?.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${qualityMetrics?.embeddingQuality?.consistency}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Content Coverage</span>
              <span className="text-white">{qualityMetrics?.embeddingQuality?.coverage?.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${qualityMetrics?.embeddingQuality?.coverage}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Semantic Precision</span>
              <span className="text-white">{qualityMetrics?.similarityTesting?.precision?.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${qualityMetrics?.similarityTesting?.precision}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      {/* Document Validation Results */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Recent Validation Results</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {qualityMetrics?.validationResults?.map((result) => (
            <div key={result?.id} className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result?.status)}
                  <div>
                    <h5 className="font-medium text-white truncate max-w-xs">
                      {result?.document}
                    </h5>
                    <p className="text-xs text-gray-400">
                      Last checked: {result?.lastChecked?.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-sm font-medium ${getScoreColor(result?.score)}`}>
                    {result?.score?.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400">
                    {result?.issues} issues
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded capitalize ${getStatusColor(result?.status)}`}>
                  {result?.status}
                </span>
                <button 
                  onClick={() => setSelectedDocument(result)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                >
                  <Eye className="h-3 w-3" />
                  <span>Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Manual Review Section */}
      <div className="pt-4 border-t border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Manual Review</h4>
        <div className="text-sm text-gray-400 space-y-2">
          <p>• Automated validation checks semantic similarity accuracy</p>
          <p>• Content relevance scoring based on technical criteria</p>
          <p>• Embedding quality assessment using cosine similarity</p>
          <p>• Manual spot-checks recommended for critical documents</p>
        </div>
        
        {runningValidation && (
          <div className="mt-3 p-3 bg-blue-600/20 rounded-lg border border-blue-600">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
              <span className="text-sm text-blue-400">Running comprehensive validation...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}