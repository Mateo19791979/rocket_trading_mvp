import { supabase } from '../lib/supabase';

export const portfolioService = {
  // Get user's default portfolio with calculated metrics
  async getDefaultPortfolio(userId) {
    if (!userId) throw new Error('User ID is required');
    
    try {
      const { data, error } = await supabase?.from('portfolios')?.select(`*,positions (id,quantity,current_price,market_value,unrealized_pnl,unrealized_pnl_percent,cost_basis,avg_entry_price,position_type,position_status,asset:assets (id,symbol,name,logo_url,sector))`)?.eq('user_id', userId)?.eq('is_default', true)?.single();

      if (error) throw error;

      return {
        ...data,
        total_balance: (data?.total_value || 0) + (data?.cash_balance || 0),
        total_pnl: (data?.realized_pnl || 0) + (data?.unrealized_pnl || 0)
      };
    } catch (error) {
      throw error;
    }
  },

  // Get recent trades for the portfolio
  async getRecentTrades(userId, limit = 10) {
    if (!userId) throw new Error('User ID is required');
    
    try {
      const { data, error } = await supabase?.from('trades')?.select(`
          *,
          asset:assets (
            id,
            symbol,
            name,
            logo_url
          )
        `)?.eq('user_id', userId)?.order('executed_at', { ascending: false })?.limit(limit);

      if (error) throw error;

      return data?.map(trade => ({
        id: trade?.id,
        symbol: trade?.asset?.symbol,
        name: trade?.asset?.name,
        type: trade?.trade_side,
        quantity: trade?.quantity,
        price: trade?.price,
        timestamp: new Date(trade?.executed_at),
        logo_url: trade?.asset?.logo_url
      })) || [];
    } catch (error) {
      throw error;
    }
  },

  // Update portfolio balance (for virtual trading)
  async updatePortfolioBalance(portfolioId, updates) {
    if (!portfolioId) throw new Error('Portfolio ID is required');
    
    try {
      const { data, error } = await supabase?.from('portfolios')?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.eq('id', portfolioId)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }
};