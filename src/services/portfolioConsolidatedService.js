import { supabase } from '../lib/supabase';

class PortfolioConsolidatedService {
  async getConsolidatedPortfolioData(userId) {
    try {
      const { data: portfolios, error: portfolioError } = await supabase?.from('portfolios')?.select(`
          *,
          positions (
            *,
            assets (
              symbol,
              name,
              sector,
              logo_url
            )
          )
        `)?.eq('user_id', userId)?.order('is_default', { ascending: false });

      if (portfolioError) throw portfolioError;

      const { data: riskMetrics, error: riskError } = await supabase?.from('risk_metrics')?.select('*')?.eq('user_id', userId)?.order('calculated_at', { ascending: false })?.limit(1)?.single();

      if (riskError && riskError?.code !== 'PGRST116') throw riskError;

      return {
        portfolios: portfolios || [],
        riskMetrics: riskMetrics || null
      };
    } catch (error) {
      throw new Error(`Failed to fetch consolidated portfolio data: ${error.message}`);
    }
  }

  async getPortfolioPerformanceHistory(portfolioId, timeframe = '30d') {
    try {
      const { data: trades, error } = await supabase?.from('trades')?.select(`
          executed_at,
          pnl,
          trade_value,
          assets (
            symbol,
            name
          )
        `)?.eq('portfolio_id', portfolioId)?.order('executed_at', { ascending: true });

      if (error) throw error;

      // Calculate cumulative performance
      let cumulativePnL = 0;
      const performanceData = trades?.map(trade => {
        cumulativePnL += parseFloat(trade?.pnl || 0);
        return {
          date: trade?.executed_at,
          value: cumulativePnL,
          tradeValue: parseFloat(trade?.trade_value || 0),
          symbol: trade?.assets?.symbol
        };
      }) || [];

      return performanceData;
    } catch (error) {
      throw new Error(`Failed to fetch portfolio performance: ${error.message}`);
    }
  }

  async getAssetAllocation(portfolioId) {
    try {
      const { data: positions, error } = await supabase?.from('positions')?.select(`
          market_value,
          quantity,
          assets (
            symbol,
            name,
            sector
          )
        `)?.eq('portfolio_id', portfolioId)?.eq('position_status', 'open');

      if (error) throw error;

      const totalValue = positions?.reduce((sum, pos) => sum + parseFloat(pos?.market_value || 0), 0) || 0;
      
      return positions?.map(position => ({
        symbol: position?.assets?.symbol,
        name: position?.assets?.name,
        sector: position?.assets?.sector,
        value: parseFloat(position?.market_value || 0),
        percentage: totalValue > 0 ? (parseFloat(position?.market_value || 0) / totalValue * 100) : 0,
        quantity: parseFloat(position?.quantity || 0)
      })) || [];
    } catch (error) {
      throw new Error(`Failed to fetch asset allocation: ${error.message}`);
    }
  }

  async getTopPositions(portfolioId, limit = 10) {
    try {
      const { data: positions, error } = await supabase?.from('positions')?.select(`
          *,
          assets (
            symbol,
            name,
            logo_url
          )
        `)?.eq('portfolio_id', portfolioId)?.eq('position_status', 'open')?.order('market_value', { ascending: false })?.limit(limit);

      if (error) throw error;

      return positions?.map(position => ({
        id: position?.id,
        symbol: position?.assets?.symbol,
        name: position?.assets?.name,
        logoUrl: position?.assets?.logo_url,
        quantity: parseFloat(position?.quantity || 0),
        avgEntryPrice: parseFloat(position?.avg_entry_price || 0),
        currentPrice: parseFloat(position?.current_price || 0),
        marketValue: parseFloat(position?.market_value || 0),
        unrealizedPnL: parseFloat(position?.unrealized_pnl || 0),
        unrealizedPnLPercent: parseFloat(position?.unrealized_pnl_percent || 0),
        duration: this.calculateHoldingDuration(position?.opened_at)
      })) || [];
    } catch (error) {
      throw new Error(`Failed to fetch top positions: ${error.message}`);
    }
  }

  calculateHoldingDuration(openedAt) {
    if (!openedAt) return 'N/A';
    const now = new Date();
    const opened = new Date(openedAt);
    const diffTime = Math.abs(now - opened);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays}d`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`;
    return `${Math.floor(diffDays / 365)}y`;
  }

  async exportPortfolioReport(portfolioId, format = 'csv') {
    try {
      const { data: portfolio, error: portfolioError } = await supabase?.from('portfolios')?.select('*')?.eq('id', portfolioId)?.single();

      if (portfolioError) throw portfolioError;

      const { data: positions, error: positionsError } = await supabase?.from('positions')?.select(`
          *,
          assets (
            symbol,
            name,
            sector
          )
        `)?.eq('portfolio_id', portfolioId);

      if (positionsError) throw positionsError;

      const reportData = {
        portfolio,
        positions: positions || [],
        generatedAt: new Date()?.toISOString(),
        format
      };

      return reportData;
    } catch (error) {
      throw new Error(`Failed to generate portfolio report: ${error.message}`);
    }
  }
}

export default new PortfolioConsolidatedService();