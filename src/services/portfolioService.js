import { supabase } from '../lib/supabase';

export async function fetchActivePositionsSafe() {
  // Use positions_final view for safe access with is_active column
  try {
    const { data, error } = await supabase
      ?.from('positions_final')
      ?.select('*')
      ?.order('symbol', { ascending: true });
    
    if (error) {
      console.warn('⚠️ positions_final view error - fallback to positions table:', error);
      
      // Fallback to original positions table without is_active
      const fallback = await supabase
        ?.from('positions')
        ?.select('id,symbol,quantity,price,pnl')
        ?.order('id', { ascending: true });
      
      const data = fallback?.data || [];
      
      // Inject is_active=true by default for UI flow
      return data?.map(r => ({ ...r, is_active: true }));
    }
    
    return data || [];
  } catch (error) {
    console.error('fetchActivePositionsSafe error:', error);
    return [];
  }
}

export const portfolioService = {
  // Get user's default portfolio with calculated metrics
  async getDefaultPortfolio(userId) {
    if (!userId) throw new Error('User ID is required');
    
    try {
      // Enhanced error handling with fallback queries for production resilience
      let portfolioData = null;
      
      try {
        // Primary query using positions_final view for compatibility
        const { data, error } = await supabase
          ?.from('portfolios')?.select(`*,positions_final!inner (*,asset:assets (id,symbol,name,logo_url,sector))`)?.eq('user_id', userId)?.eq('is_default', true)
          ?.single();

        if (error) {
          console.error('Primary portfolio query error:', error);
          throw error;
        }
        portfolioData = data;
      } catch (primaryError) {
        console.warn('Primary query failed, attempting fallback without positions_final:', primaryError);
        
        // Fallback query without positions view if it doesn't exist
        try {
          const { data, error } = await supabase
            ?.from('portfolios')
            ?.select(`
              *,
              positions (
                id,
                quantity,
                current_price,
                market_value,
                unrealized_pnl,
                unrealized_pnl_percent,
                cost_basis,
                avg_entry_price,
                position_type,
                asset:assets (
                  id,
                  symbol,
                  name,
                  logo_url,
                  sector
                )
              )
            `)
            ?.eq('user_id', userId)
            ?.eq('is_default', true)
            ?.single();

          if (error) {
            console.error('Fallback portfolio query error:', error);
            throw error;
          }
          portfolioData = data;
        } catch (fallbackError) {
          console.error('Both portfolio queries failed, returning mock data for production resilience');
          
          // Final fallback: return mock portfolio data
          return {
            id: 'mock-portfolio',
            user_id: userId,
            name: 'Default Portfolio',
            total_value: 100000,
            cash_balance: 50000,
            total_balance: 100000,
            total_pnl: 0,
            positions: [],
            created_at: new Date()?.toISOString(),
            is_mock: true
          };
        }
      }

      return {
        ...portfolioData,
        total_balance: (portfolioData?.total_value || 0) + (portfolioData?.cash_balance || 0),
        total_pnl: (portfolioData?.realized_pnl || 0) + (portfolioData?.unrealized_pnl || 0)
      };
    } catch (error) {
      console.error('getDefaultPortfolio complete failure:', error);
      
      // Final safety net: return basic mock data to prevent app crashes
      return {
        id: 'emergency-mock-portfolio',
        user_id: userId,
        name: 'Emergency Portfolio',
        total_value: 10000,
        cash_balance: 10000,
        total_balance: 20000,
        total_pnl: 0,
        positions: [],
        created_at: new Date()?.toISOString(),
        is_emergency_mock: true
      };
    }
  },

  // Get recent trades using trades_pnl_view for compatibility
  async getRecentTrades(userId, limit = 10) {
    if (!userId) throw new Error('User ID is required');
    
    try {
      // Try using the new trades_pnl_view first
      const { data, error } = await supabase
        ?.from('trades_pnl_view')
        ?.select('*')
        ?.order('ts', { ascending: false })
        ?.limit(limit);

      if (error) {
        console.error('trades_pnl_view query error, falling back to trades table:', error);
        
        // Fallback to direct trades table
        const fallback = await supabase
          ?.from('trades')
          ?.select(`
            *,
            asset:assets (
              id,
              symbol,
              name,
              logo_url
            )
          `)
          ?.eq('user_id', userId)
          ?.order('executed_at', { ascending: false })
          ?.limit(limit);
        
        if (fallback?.error) {
          console.error('Fallback trades query error:', fallback?.error);
          return [];
        }

        return fallback?.data?.map(trade => ({
          id: trade?.id,
          symbol: trade?.asset?.symbol,
          name: trade?.asset?.name,
          type: trade?.trade_side,
          quantity: trade?.quantity,
          price: trade?.price,
          timestamp: new Date(trade?.executed_at),
          logo_url: trade?.asset?.logo_url
        })) || [];
      }

      // Map trades_pnl_view data to expected format
      return data?.map(trade => ({
        id: trade?.id,
        symbol: trade?.symbol,
        name: trade?.symbol, // Use symbol as name fallback
        type: trade?.side,
        quantity: trade?.qty,
        price: trade?.price,
        realized_pnl: trade?.realized_pnl,
        unrealized_pnl: trade?.unrealized_pnl,
        timestamp: new Date(trade?.ts),
        logo_url: null // No asset info in view
      })) || [];
    } catch (error) {
      console.error('getRecentTrades error:', error);
      
      // Return empty array for production resilience
      return [];
    }
  },

  // Update portfolio balance (for virtual trading)
  async updatePortfolioBalance(portfolioId, updates) {
    if (!portfolioId) throw new Error('Portfolio ID is required');
    
    try {
      const { data, error } = await supabase
        ?.from('portfolios')
        ?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', portfolioId)
        ?.select()
        ?.single();

      if (error) {
        console.error('Update portfolio balance error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('updatePortfolioBalance error:', error);
      throw error;
    }
  },

  // Set portfolio balance to specific amount (new method)
  async setPortfolioBalance(userId, targetAmount = 10000) {
    if (!userId) throw new Error('User ID is required');
    
    try {
      // Get user's default portfolio
      const { data: portfolio, error: portfolioError } = await supabase
        ?.from('portfolios')
        ?.select('id')
        ?.eq('user_id', userId)
        ?.eq('is_default', true)
        ?.single();

      if (portfolioError) {
        console.error('Get portfolio error:', portfolioError);
        throw portfolioError;
      }

      // Update portfolio values
      const { data, error } = await supabase
        ?.from('portfolios')
        ?.update({
          total_value: targetAmount,
          cash_balance: targetAmount / 2,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', portfolio?.id)
        ?.select()
        ?.single();

      if (error) {
        console.error('Set portfolio balance error:', error);
        throw error;
      }

      // Also update user account balance
      await supabase
        ?.from('user_profiles')
        ?.update({
          account_balance: targetAmount,
          available_balance: targetAmount * 0.8,
          buying_power: targetAmount,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', userId);

      return data;
    } catch (error) {
      console.error('setPortfolioBalance error:', error);
      throw error;
    }
  },

  // New method: Production-safe broker flag check
  async getBrokerFlags(userId) {
    if (!userId) {
      console.warn('No user ID provided for broker flags check');
      return { 
        ibkr_enabled: false, 
        paper_trading: true,
        is_mock: true 
      };
    }
    
    try {
      // Try to get broker configuration from user profile or settings
      const { data: profile, error } = await supabase
        ?.from('user_profiles')
        ?.select('broker_settings, trading_preferences')
        ?.eq('id', userId)
        ?.single();

      if (error || !profile) {
        console.warn('Could not fetch broker settings, using defaults:', error);
        return { 
          ibkr_enabled: false, 
          paper_trading: true,
          is_fallback: true 
        };
      }

      return {
        ibkr_enabled: profile?.broker_settings?.ibkr_enabled || false,
        paper_trading: profile?.trading_preferences?.paper_mode !== false,
        live_trading_approved: profile?.broker_settings?.live_trading_approved || false,
        last_updated: new Date()?.toISOString()
      };
    } catch (error) {
      console.error('Error getting broker flags:', error);
      
      // Always return safe defaults to prevent frontend crashes
      return { 
        ibkr_enabled: false, 
        paper_trading: true,
        error: error?.message,
        is_error_fallback: true 
      };
    }
  }
};