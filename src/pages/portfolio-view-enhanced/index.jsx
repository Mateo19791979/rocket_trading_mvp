import React, { useState, useEffect } from 'react';
import { PieChart, TrendingUp, Shield, Download, Settings, Target } from 'lucide-react';
import { portfolioEnhancedService } from '../../services/portfolioEnhancedService';
import { useAuth } from '../../contexts/AuthContext';
import PortfolioMetrics from './components/PortfolioMetrics';
import PerformanceChart from './components/PerformanceChart';
import SectorAllocation from './components/SectorAllocation';
import RiskAnalytics from './components/RiskAnalytics';
import PositionsTable from './components/PositionsTable';
import RebalancingSuggestions from './components/RebalancingSuggestions';

const PortfolioViewEnhanced = () => {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [portfolioMetrics, setPortfolioMetrics] = useState(null);
  const [sectorAllocation, setSectorAllocation] = useState({});
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [performanceHistory, setPerformanceHistory] = useState([]);
  const [topPerformers, setTopPerformers] = useState({ winners: [], losers: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadPortfolioData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPortfolio?.id) {
      loadPortfolioAnalytics();
    }
  }, [selectedPortfolio]);

  const loadPortfolioData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');
      
      const portfolioData = await portfolioEnhancedService?.getEnhancedPortfolioData(user?.id);
      setPortfolios(portfolioData);
      
      if (portfolioData?.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(portfolioData?.[0]);
      }
    } catch (err) {
      setError(`Failed to load portfolio data: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolioAnalytics = async () => {
    if (!selectedPortfolio?.id) return;

    try {
      setLoading(true);
      
      const [metrics, sectorData, riskData, performance, performers] = await Promise.all([
        portfolioEnhancedService?.calculatePortfolioMetrics(selectedPortfolio?.id),
        portfolioEnhancedService?.getPortfolioSectorAllocation(selectedPortfolio?.id),
        portfolioEnhancedService?.calculateRiskMetrics(selectedPortfolio?.id),
        portfolioEnhancedService?.getPortfolioPerformanceHistory(selectedPortfolio?.id),
        portfolioEnhancedService?.getTopPerformers(selectedPortfolio?.id)
      ]);

      setPortfolioMetrics(metrics);
      setSectorAllocation(sectorData);
      setRiskMetrics(riskData);
      setPerformanceHistory(performance);
      setTopPerformers(performers);
    } catch (err) {
      setError(`Failed to load analytics: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPortfolio = async () => {
    if (!selectedPortfolio?.id) return;

    try {
      const exportData = await portfolioEnhancedService?.exportPortfolioData(selectedPortfolio?.id, 'json');
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-${selectedPortfolio?.name?.replace(/\s+/g, '-')}-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
      document.body?.appendChild(a);
      a?.click();
      document.body?.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to export portfolio: ${err?.message || 'Unknown error'}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400">Please sign in to view your portfolio analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <PieChart className="h-8 w-8 text-purple-500" />
            <div>
              <h1 className="text-2xl font-bold">Portfolio View Enhanced</h1>
              <p className="text-gray-400">Advanced portfolio analytics and risk management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Portfolio Selector */}
            {portfolios?.length > 1 && (
              <select
                value={selectedPortfolio?.id || ''}
                onChange={(e) => {
                  const portfolio = portfolios?.find(p => p?.id === e?.target?.value);
                  setSelectedPortfolio(portfolio);
                }}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                {portfolios?.map(portfolio => (
                  <option key={portfolio?.id} value={portfolio?.id}>
                    {portfolio?.name}
                  </option>
                ))}
              </select>
            )}
            
            <button
              onClick={handleExportPortfolio}
              disabled={!selectedPortfolio}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center space-x-3">
            <Shield className="h-5 w-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        {loading && !selectedPortfolio ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="text-gray-300">Loading portfolio data...</span>
            </div>
          </div>
        ) : selectedPortfolio ? (
          <>
            {/* Portfolio Overview */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedPortfolio?.name}</h2>
                  <p className="text-gray-400">{selectedPortfolio?.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-400">
                    ${portfolioMetrics?.totalValue?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-gray-400">Total Value</div>
                </div>
              </div>

              <PortfolioMetrics 
                metrics={portfolioMetrics}
                loading={loading}
              />
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                  <h3 className="text-xl font-semibold">Performance History</h3>
                </div>
                <PerformanceChart 
                  data={performanceHistory}
                  loading={loading}
                />
              </div>

              {/* Sector Allocation */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <PieChart className="h-6 w-6 text-green-500" />
                  <h3 className="text-xl font-semibold">Sector Allocation</h3>
                </div>
                <SectorAllocation 
                  allocation={sectorAllocation}
                  loading={loading}
                />
              </div>
            </div>

            {/* Risk Analytics */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="h-6 w-6 text-red-500" />
                <h3 className="text-xl font-semibold">Risk Analytics</h3>
              </div>
              <RiskAnalytics 
                riskMetrics={riskMetrics}
                loading={loading}
              />
            </div>

            {/* Enhanced Positions Table */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Target className="h-6 w-6 text-yellow-500" />
                  <h3 className="text-xl font-semibold">Position Analysis</h3>
                </div>
                <div className="text-sm text-gray-400">
                  {selectedPortfolio?.positions?.length || 0} positions
                </div>
              </div>
              <PositionsTable 
                positions={selectedPortfolio?.positions || []}
                topPerformers={topPerformers}
                loading={loading}
              />
            </div>

            {/* Rebalancing Suggestions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="h-6 w-6 text-purple-500" />
                <h3 className="text-xl font-semibold">Rebalancing Suggestions</h3>
              </div>
              <RebalancingSuggestions 
                portfolioId={selectedPortfolio?.id}
                currentAllocation={sectorAllocation}
                loading={loading}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <PieChart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Portfolio Found</h3>
            <p className="text-gray-500">Create a portfolio to start tracking your investments</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioViewEnhanced;