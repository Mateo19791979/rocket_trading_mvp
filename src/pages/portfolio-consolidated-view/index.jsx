import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import portfolioConsolidatedService from '../../services/portfolioConsolidatedService';
import PortfolioMetrics from './components/PortfolioMetrics';
import PerformanceChart from './components/PerformanceChart';
import PositionsTable from './components/PositionsTable';
import AssetAllocation from './components/AssetAllocation';
import RiskAnalytics from './components/RiskAnalytics';
import { TrendingUp, Download, BarChart3, AlertTriangle } from 'lucide-react';

const PortfolioConsolidatedView = () => {
  const { user } = useAuth();
  const [portfolioData, setPortfolioData] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [allocationData, setAllocationData] = useState([]);
  const [topPositions, setTopPositions] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadPortfolioData();
    }
  }, [user?.id, selectedTimeframe]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      const consolidated = await portfolioConsolidatedService?.getConsolidatedPortfolioData(user?.id);
      setPortfolioData(consolidated);

      if (consolidated?.portfolios?.length > 0) {
        const mainPortfolio = consolidated?.portfolios?.find(p => p?.is_default) || consolidated?.portfolios?.[0];
        
        // Load performance history
        const performance = await portfolioConsolidatedService?.getPortfolioPerformanceHistory(
          mainPortfolio?.id, 
          selectedTimeframe
        );
        setPerformanceData(performance);

        // Load asset allocation
        const allocation = await portfolioConsolidatedService?.getAssetAllocation(mainPortfolio?.id);
        setAllocationData(allocation);

        // Load top positions
        const positions = await portfolioConsolidatedService?.getTopPositions(mainPortfolio?.id, 10);
        setTopPositions(positions);
      }
    } catch (err) {
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      if (!portfolioData?.portfolios?.length) return;
      
      const mainPortfolio = portfolioData?.portfolios?.find(p => p?.is_default) || portfolioData?.portfolios?.[0];
      const reportData = await portfolioConsolidatedService?.exportPortfolioReport(mainPortfolio?.id, 'csv');
      
      // Create and trigger download
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `portfolio-report-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement?.setAttribute('href', dataUri);
      linkElement?.setAttribute('download', exportFileDefaultName);
      linkElement?.click();
    } catch (err) {
      setError('Failed to export portfolio report');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)]?.map((_, i) => (
                <div key={i} className="h-32 bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Portfolio</h2>
            <p className="text-gray-400">{error}</p>
            <button 
              onClick={loadPortfolioData}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const mainPortfolio = portfolioData?.portfolios?.find(p => p?.is_default) || portfolioData?.portfolios?.[0];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <TrendingUp className="h-8 w-8 mr-3 text-blue-500" />
              Portfolio Consolidated View
            </h1>
            <p className="text-gray-400 mt-2">
              Comprehensive portfolio analytics and position management
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e?.target?.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
            >
              <option value="1d">1 Day</option>
              <option value="1w">1 Week</option>
              <option value="1m">1 Month</option>
              <option value="3m">3 Months</option>
              <option value="1y">1 Year</option>
            </select>
            
            <button
              onClick={handleExportReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Portfolio Metrics */}
        <PortfolioMetrics 
          portfolio={mainPortfolio}
          riskMetrics={portfolioData?.riskMetrics}
        />

        {/* Performance Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
              Portfolio Value Evolution
            </h2>
          </div>
          <PerformanceChart data={performanceData} timeframe={selectedTimeframe} />
        </div>

        {/* Asset Allocation & Risk Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssetAllocation data={allocationData} />
          <RiskAnalytics 
            riskMetrics={portfolioData?.riskMetrics}
            portfolio={mainPortfolio}
          />
        </div>

        {/* Positions Table */}
        <PositionsTable positions={topPositions} />
      </div>
    </div>
  );
};

export default PortfolioConsolidatedView;