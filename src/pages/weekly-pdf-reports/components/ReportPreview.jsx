import React, { useState, useEffect } from 'react';
import { FileText, ZoomIn, ZoomOut, RotateCcw, Settings, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import { weeklyReportsService } from '../../../services/weeklyReportsService';

export default function ReportPreview({ 
  selectedTemplate, 
  templates, 
  onTemplateSelect, 
  userId 
}) {
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    if (userId && selectedTemplate) {
      loadPreviewData();
    }
  }, [userId, selectedTemplate]);

  const loadPreviewData = async () => {
    setLoading(true);
    
    try {
      // Get portfolio performance data for preview
      const { data: portfolios, error } = await weeklyReportsService?.getPortfolioPerformanceData(
        userId, 
        [], // All portfolios
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)?.toISOString(), // Last week
        new Date()?.toISOString()
      );

      if (error) throw new Error(error);

      setPortfolioData(portfolios || []);
      
      // Generate preview data structure
      generatePreviewData(portfolios || []);
      
    } catch (error) {
      console.error('Error loading preview data:', error);
      setPortfolioData([]);
      generatePreviewData([]);
    } finally {
      setLoading(false);
    }
  };

  const generatePreviewData = (portfolios) => {
    const totalValue = portfolios?.reduce((sum, p) => sum + (parseFloat(p?.total_value) || 0), 0);
    const totalPnL = portfolios?.reduce((sum, p) => sum + (parseFloat(p?.unrealized_pnl) || 0), 0);
    const totalCost = portfolios?.reduce((sum, p) => sum + (parseFloat(p?.total_cost) || 0), 0);
    const performancePercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost * 100) : 0;

    // Get top positions across all portfolios
    const allPositions = portfolios?.flatMap(p => p?.positions || []);
    const topPositions = allPositions?.sort((a, b) => (parseFloat(b?.market_value) || 0) - (parseFloat(a?.market_value) || 0))?.slice(0, 10);

    // Get sector allocation
    const sectorAllocation = {};
    allPositions?.forEach(position => {
      const sector = position?.asset?.sector || 'Unknown';
      const value = parseFloat(position?.market_value) || 0;
      sectorAllocation[sector] = (sectorAllocation?.[sector] || 0) + value;
    });

    setPreviewData({
      summary: {
        totalValue,
        totalPnL,
        performancePercent,
        portfoliosCount: portfolios?.length,
        positionsCount: allPositions?.length
      },
      topPositions,
      sectorAllocation,
      portfolios: portfolios?.map(p => ({
        name: p?.name,
        value: parseFloat(p?.total_value) || 0,
        pnl: parseFloat(p?.unrealized_pnl) || 0,
        performance1w: parseFloat(p?.performance_1w) || 0,
        performance1m: parseFloat(p?.performance_1m) || 0,
        riskScore: parseFloat(p?.risk_score) || 0
      }))
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value || 0);
  };

  const formatPercent = (value) => {
    return `${(value || 0)?.toFixed(2)}%`;
  };

  const getTemplateColors = () => {
    if (!selectedTemplate?.branding_config) {
      return { primary: '#1e40af', secondary: '#f3f4f6' };
    }
    
    try {
      const config = typeof selectedTemplate?.branding_config === 'string' 
        ? JSON.parse(selectedTemplate?.branding_config)
        : selectedTemplate?.branding_config;
      
      return {
        primary: config?.primaryColor || '#1e40af',
        secondary: config?.secondaryColor || '#f3f4f6'
      };
    } catch {
      return { primary: '#1e40af', secondary: '#f3f4f6' };
    }
  };

  const getTemplateSections = () => {
    if (!selectedTemplate?.sections_config) {
      return ['performance_overview', 'key_metrics', 'top_positions'];
    }
    
    try {
      const config = typeof selectedTemplate?.sections_config === 'string' 
        ? JSON.parse(selectedTemplate?.sections_config)
        : selectedTemplate?.sections_config;
      
      return config?.sections || [];
    } catch {
      return ['performance_overview', 'key_metrics', 'top_positions'];
    }
  };

  const renderPreviewSection = (sectionType) => {
    const colors = getTemplateColors();
    
    switch (sectionType) {
      case 'performance_overview':
        return (
          <div key={sectionType} className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex items-center mb-4" style={{ color: colors?.primary }}>
              <TrendingUp className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">Performance Overview</h2>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(previewData?.summary?.totalValue)}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  (previewData?.summary?.totalPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(previewData?.summary?.totalPnL)}
                </div>
                <div className="text-sm text-gray-600">Unrealized P&L</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  (previewData?.summary?.performancePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercent(previewData?.summary?.performancePercent)}
                </div>
                <div className="text-sm text-gray-600">Performance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {previewData?.summary?.portfoliosCount || 0}
                </div>
                <div className="text-sm text-gray-600">Portfolios</div>
              </div>
            </div>
          </div>
        );

      case 'key_metrics':
        return (
          <div key={sectionType} className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex items-center mb-4" style={{ color: colors?.primary }}>
              <BarChart3 className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">Key Metrics</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previewData?.portfolios?.slice(0, 4)?.map((portfolio, index) => (
                <div key={index} className="border rounded-lg p-3" style={{ borderColor: colors?.secondary }}>
                  <div className="font-medium text-gray-900 mb-1">{portfolio?.name}</div>
                  <div className="text-sm text-gray-600">
                    <div>Value: {formatCurrency(portfolio?.value)}</div>
                    <div>1W: {formatPercent(portfolio?.performance1w)}</div>
                    <div>1M: {formatPercent(portfolio?.performance1m)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'top_positions':
        return (
          <div key={sectionType} className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex items-center mb-4" style={{ color: colors?.primary }}>
              <PieChart className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">Top Positions</h2>
            </div>
            <div className="space-y-3">
              {previewData?.topPositions?.slice(0, 5)?.map((position, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg" style={{ borderColor: colors?.secondary }}>
                  <div>
                    <div className="font-medium text-gray-900">{position?.asset?.symbol || 'N/A'}</div>
                    <div className="text-sm text-gray-600">{position?.asset?.name || 'Unknown'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{formatCurrency(position?.market_value)}</div>
                    <div className={`text-sm ${
                      (parseFloat(position?.unrealized_pnl) || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercent(position?.unrealized_pnl_percent)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'risk_summary':
        return (
          <div key={sectionType} className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex items-center mb-4" style={{ color: colors?.primary }}>
              <BarChart3 className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-semibold">Risk Analysis</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Risk Score Distribution</div>
                {previewData?.portfolios?.map((portfolio, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{portfolio?.name}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      portfolio?.riskScore <= 3 ? 'bg-green-100 text-green-700' :
                      portfolio?.riskScore <= 7 ? 'bg-yellow-100 text-yellow-700': 'bg-red-100 text-red-700'
                    }`}>
                      {portfolio?.riskScore?.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Sector Allocation</div>
                <div className="space-y-1">
                  {Object.entries(previewData?.sectorAllocation || {})?.slice(0, 4)?.map(([sector, value]) => (
                    <div key={sector} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900">{sector}</span>
                      <span className="text-gray-600">{formatCurrency(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
        <div className="animate-pulse">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <div className="text-gray-400">Generating preview...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Report Preview</h2>
          <p className="text-gray-400">Preview your report template with real portfolio data</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Template Selector */}
          <select
            value={selectedTemplate?.id || ''}
            onChange={(e) => {
              const template = templates?.find(t => t?.id === e?.target?.value);
              onTemplateSelect(template);
            }}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a template</option>
            {templates?.map(template => (
              <option key={template?.id} value={template?.id}>
                {template?.template_name}
              </option>
            ))}
          </select>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-400 min-w-[4rem] text-center">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Preview Area */}
      {selectedTemplate ? (
        <div className="bg-gray-100 rounded-lg border border-gray-300 overflow-hidden">
          <div 
            className="bg-white shadow-lg mx-auto transition-transform origin-top"
            style={{ 
              width: '210mm', // A4 width
              minHeight: '297mm', // A4 height
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center'
            }}
          >
            {/* Report Header */}
            <div 
              className="px-8 py-6 border-b-2"
              style={{ borderColor: getTemplateColors()?.primary }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Weekly Trading Performance Report
                  </h1>
                  <p className="text-gray-600">Generated on {new Date()?.toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Report Type</div>
                  <div className="font-medium text-gray-900">
                    {weeklyReportsService?.getTemplateTypeLabel(selectedTemplate?.template_type)}
                  </div>
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div className="px-8 py-6 space-y-6">
              {getTemplateSections()?.map(section => renderPreviewSection(section))}
            </div>

            {/* Report Footer */}
            <div className="px-8 py-4 border-t border-gray-200 mt-8">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  Generated by Rocket Trading AI Platform
                </div>
                <div>
                  Page 1 of 1 • {new Date()?.toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <Settings className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No Template Selected</h3>
          <p className="text-gray-500">Choose a template from the dropdown to see the preview</p>
        </div>
      )}
    </div>
  );
}