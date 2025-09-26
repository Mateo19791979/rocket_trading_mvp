import { supabase } from '../lib/supabase';

// Enhanced service for comprehensive portfolio management and analytics
export const portfolioEnhancedService = {
  // Get enhanced portfolio data with advanced metrics
  async getEnhancedPortfolioData(userId) {
    const { data: portfolios, error } = await supabase?.from('portfolios')?.select(`
        *,
        positions!inner(
          *,
          assets!inner(id, symbol, name, sector, logo_url, market_cap)
        )
      `)?.eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }
    return portfolios || [];
  },

  // Calculate portfolio sector allocation
  async getPortfolioSectorAllocation(portfolioId) {
    const { data, error } = await supabase?.from('positions')?.select(`
        quantity,
        current_price,
        assets!inner(sector)
      `)?.eq('portfolio_id', portfolioId)?.eq('position_status', 'open');

    if (error) {
      throw new Error(error.message);
    }

    const sectorAllocation = {};
    let totalValue = 0;

    data?.forEach(position => {
      const sector = position?.assets?.sector || 'Unknown';
      const value = (position?.quantity || 0) * (position?.current_price || 0);
      
      if (!sectorAllocation?.[sector]) {
        sectorAllocation[sector] = 0;
      }
      sectorAllocation[sector] += value;
      totalValue += value;
    });

    // Convert to percentages
    const sectorPercentages = {};
    Object.keys(sectorAllocation)?.forEach(sector => {
      sectorPercentages[sector] = totalValue > 0 ? 
        (sectorAllocation?.[sector] / totalValue) * 100 : 0;
    });

    return sectorPercentages;
  },

  // Calculate portfolio performance metrics
  async calculatePortfolioMetrics(portfolioId) {
    const { data: positions, error } = await supabase?.from('positions')?.select('*')?.eq('portfolio_id', portfolioId);

    if (error) {
      throw new Error(error.message);
    }

    let totalValue = 0;
    let totalCost = 0;
    let totalUnrealizedPnL = 0;

    positions?.forEach(position => {
      const marketValue = (position?.quantity || 0) * (position?.current_price || 0);
      totalValue += marketValue;
      totalCost += position?.cost_basis || 0;
      totalUnrealizedPnL += position?.unrealized_pnl || 0;
    });

    const totalReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalReturn,
      totalUnrealizedPnL,
      positionCount: positions?.length || 0
    };
  },

  // Get portfolio performance over time
  async getPortfolioPerformanceHistory(portfolioId, days = 30) {
    const startDate = new Date();
    startDate?.setDate(startDate?.getDate() - days);

    // Get historical portfolio value by calculating historical positions
    const { data: positions, error } = await supabase?.from('positions')?.select(`
        *,
        assets!inner(
          id,
          market_data!inner(close_price, timestamp)
        )
      `)?.eq('portfolio_id', portfolioId)?.gte('assets.market_data.timestamp', startDate?.toISOString());

    if (error) {
      throw new Error(error.message);
    }

    // Group market data by date and calculate portfolio value
    const performanceHistory = {};
    
    positions?.forEach(position => {
      position?.assets?.market_data?.forEach(marketData => {
        const date = new Date(marketData?.timestamp)?.toDateString();
        const value = (position?.quantity || 0) * (marketData?.close_price || 0);
        
        if (!performanceHistory?.[date]) {
          performanceHistory[date] = 0;
        }
        performanceHistory[date] += value;
      });
    });

    return Object.entries(performanceHistory)?.map(([date, value]) => ({
      date,
      value
    }))?.sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  // Calculate portfolio risk metrics
  async calculateRiskMetrics(portfolioId) {
    const { data: positions, error } = await supabase?.from('positions')?.select(`
        *,
        assets!inner(id, symbol, sector)
      `)?.eq('portfolio_id', portfolioId)?.eq('position_status', 'open');

    if (error) {
      throw new Error(error.message);
    }

    // Calculate concentration risk
    let totalValue = 0;
    const assetWeights = {};
    const sectorWeights = {};

    positions?.forEach(position => {
      const value = (position?.quantity || 0) * (position?.current_price || 0);
      const symbol = position?.assets?.symbol;
      const sector = position?.assets?.sector || 'Unknown';
      
      totalValue += value;
      assetWeights[symbol] = (assetWeights?.[symbol] || 0) + value;
      sectorWeights[sector] = (sectorWeights?.[sector] || 0) + value;
    });

    // Convert to percentages and find concentrations
    const maxAssetWeight = Math.max(...Object.values(assetWeights)?.map(w => (w / totalValue) * 100));
    const maxSectorWeight = Math.max(...Object.values(sectorWeights)?.map(w => (w / totalValue) * 100));

    // Calculate diversification metrics
    const numAssets = Object.keys(assetWeights)?.length;
    const numSectors = Object.keys(sectorWeights)?.length;

    return {
      maxAssetConcentration: maxAssetWeight,
      maxSectorConcentration: maxSectorWeight,
      numberOfAssets: numAssets,
      numberOfSectors: numSectors,
      diversificationScore: Math.min(numAssets * 10, 100) // Simple score out of 100
    };
  },

  // Get top performers and losers
  async getTopPerformers(portfolioId, limit = 5) {
    const { data: positions, error } = await supabase?.from('positions')?.select(`
        *,
        assets!inner(symbol, name, logo_url)
      `)?.eq('portfolio_id', portfolioId)?.eq('position_status', 'open')?.order('unrealized_pnl_percent', { ascending: false })?.limit(limit * 2); // Get more to separate winners and losers

    if (error) {
      throw new Error(error.message);
    }

    const winners = positions?.filter(p => (p?.unrealized_pnl_percent || 0) > 0)?.slice(0, limit) || [];
    const losers = positions?.filter(p => (p?.unrealized_pnl_percent || 0) < 0)
      ?.sort((a, b) => (a?.unrealized_pnl_percent || 0) - (b?.unrealized_pnl_percent || 0))
      ?.slice(0, limit) || [];

    return { winners, losers };
  },

  // Generate portfolio rebalancing suggestions
  async getRebalancingSuggestions(portfolioId, targetAllocation = {}) {
    const currentAllocation = await this.getPortfolioSectorAllocation(portfolioId);
    const suggestions = [];

    Object.keys(targetAllocation)?.forEach(sector => {
      const current = currentAllocation?.[sector] || 0;
      const target = targetAllocation?.[sector] || 0;
      const difference = target - current;

      if (Math.abs(difference) > 5) { // 5% threshold
        suggestions?.push({
          sector,
          currentAllocation: current,
          targetAllocation: target,
          difference,
          action: difference > 0 ? 'increase' : 'decrease',
          priority: Math.abs(difference) > 10 ? 'high' : 'medium'
        });
      }
    });

    return suggestions?.sort((a, b) => Math.abs(b?.difference) - Math.abs(a?.difference));
  },

  // Export portfolio data
  async exportPortfolioData(portfolioId, format = 'json') {
    const portfolio = await this.getEnhancedPortfolioData(portfolioId);
    const metrics = await this.calculatePortfolioMetrics(portfolioId);
    const riskMetrics = await this.calculateRiskMetrics(portfolioId);
    const sectorAllocation = await this.getPortfolioSectorAllocation(portfolioId);

    const exportData = {
      portfolio: portfolio?.[0],
      metrics,
      riskMetrics,
      sectorAllocation,
      exportDate: new Date()?.toISOString()
    };

    if (format === 'csv') {
      // Convert to CSV format for positions
      const csvHeaders = ['Symbol', 'Name', 'Quantity', 'Current Price', 'Market Value', 'Unrealized PnL', 'Sector'];
      const csvRows = portfolio?.[0]?.positions?.map(pos => [
        pos?.assets?.symbol,
        pos?.assets?.name,
        pos?.quantity,
        pos?.current_price,
        pos?.market_value,
        pos?.unrealized_pnl,
        pos?.assets?.sector
      ]) || [];

      return {
        headers: csvHeaders,
        rows: csvRows,
        summary: metrics
      };
    }

    return exportData;
  }
};