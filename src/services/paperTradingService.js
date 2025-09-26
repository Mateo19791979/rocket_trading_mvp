import { supabase } from '../lib/supabase';

/**
 * Paper Trading Service - Handles all Supabase operations for paper trading
 * Integrates with existing trading database schema
 */

// ===== PORTFOLIO OPERATIONS =====
export const getDefaultPortfolio = async (userId) => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      ?.from('portfolios')
      ?.select('*')
      ?.eq('user_id', userId)
      ?.eq('is_default', true)
      ?.single();
    
    if (error && error?.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  } catch (error) {
    return null;
  }
};

export const createDefaultPortfolio = async (userId) => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      ?.from('portfolios')
      ?.insert({
        user_id: userId,
        name: 'Paper Trading Portfolio',
        description: 'Virtual trading portfolio for testing strategies',
        is_default: true,
        cash_balance: 100000.00 // Starting balance: 100,000 CHF
      })
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

export const updatePortfolioBalance = async (portfolioId, newBalance) => {
  if (!portfolioId) return null;
  
  try {
    const { data, error } = await supabase
      ?.from('portfolios')
      ?.update({ 
        cash_balance: newBalance,
        total_value: newBalance // Will be updated by triggers
      })
      ?.eq('id', portfolioId)
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

// ===== ASSET OPERATIONS =====
export const getAssetBySymbol = async (symbol) => {
  if (!symbol) return null;
  
  try {
    const { data, error } = await supabase
      ?.from('assets')
      ?.select('*')
      ?.eq('symbol', symbol?.toUpperCase())
      ?.eq('is_active', true)
      ?.single();
    
    if (error && error?.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    return null;
  }
};

export const createAssetIfNotExists = async (assetData) => {
  if (!assetData?.symbol) return null;
  
  try {
    // First try to find existing asset
    let asset = await getAssetBySymbol(assetData?.symbol);
    if (asset) return asset;
    
    // Create new asset if not found
    const { data, error } = await supabase
      ?.from('assets')
      ?.insert({
        symbol: assetData?.symbol?.toUpperCase(),
        name: assetData?.name || assetData?.symbol,
        asset_type: assetData?.asset_type || 'stock',
        exchange: assetData?.exchange || 'NASDAQ',
        currency: assetData?.currency || 'USD',
        is_active: true,
        is_tradable: true
      })
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

// ===== ORDER OPERATIONS =====
export const placeOrder = async (orderData, userId, portfolioId, assetId) => {
  if (!userId || !portfolioId || !assetId) return null;
  
  try {
    const { data, error } = await supabase
      ?.from('orders')
      ?.insert({
        user_id: userId,
        portfolio_id: portfolioId,
        asset_id: assetId,
        order_side: orderData?.side === 'buy' ? 'buy' : 'sell',
        order_type: orderData?.type || 'market',
        quantity: orderData?.quantity,
        price: orderData?.price,
        order_value: orderData?.quantity * orderData?.price,
        order_status: 'filled', // Paper trading - instant execution
        filled_quantity: orderData?.quantity,
        avg_fill_price: orderData?.price,
        executed_at: new Date()?.toISOString(),
        commission: 0,
        fees: 0
      })
      ?.select(`
        *,
        assets!inner(symbol, name, asset_type)
      `)
      ?.single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

export const getUserOrders = async (userId, limit = 50) => {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      ?.from('orders')
      ?.select(`
        *,
        assets!inner(symbol, name, asset_type, currency)
      `)
      ?.eq('user_id', userId)
      ?.order('created_at', { ascending: false })
      ?.limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
  }
};

// ===== TRADE OPERATIONS =====
export const createTrade = async (tradeData, userId, portfolioId, assetId, orderId) => {
  if (!userId || !portfolioId || !assetId) return null;
  
  try {
    const { data, error } = await supabase
      ?.from('trades')
      ?.insert({
        user_id: userId,
        portfolio_id: portfolioId,
        asset_id: assetId,
        order_id: orderId,
        trade_side: tradeData?.side === 'buy' ? 'buy' : 'sell',
        quantity: tradeData?.quantity,
        price: tradeData?.price,
        trade_value: tradeData?.quantity * tradeData?.price,
        net_value: tradeData?.quantity * tradeData?.price,
        executed_at: new Date()?.toISOString(),
        commission: 0,
        fees: 0,
        trade_sentiment: tradeData?.sentiment || 'neutral'
      })
      ?.select(`
        *,
        assets!inner(symbol, name, asset_type)
      `)
      ?.single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

export const getUserTrades = async (userId, limit = 100) => {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      ?.from('trades')
      ?.select(`
        *,
        assets!inner(symbol, name, asset_type, currency)
      `)
      ?.eq('user_id', userId)
      ?.order('executed_at', { ascending: false })
      ?.limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
  }
};

// ===== POSITION OPERATIONS =====
export const getUserPositions = async (userId) => {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      ?.from('positions')
      ?.select(`
        *,
        assets!inner(symbol, name, asset_type, currency),
        portfolios!inner(user_id)
      `)
      ?.eq('portfolios.user_id', userId)
      ?.eq('position_status', 'open');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
  }
};

export const upsertPosition = async (positionData, userId, portfolioId, assetId) => {
  if (!userId || !portfolioId || !assetId) return null;
  
  try {
    // Check if position already exists
    const { data: existingPosition } = await supabase
      ?.from('positions')
      ?.select('*')
      ?.eq('portfolio_id', portfolioId)
      ?.eq('asset_id', assetId)
      ?.eq('position_status', 'open')
      ?.single();
    
    if (existingPosition) {
      // Update existing position
      const newQuantity = existingPosition?.quantity + positionData?.quantity;
      
      if (newQuantity <= 0) {
        // Close position
        const { data, error } = await supabase
          ?.from('positions')
          ?.update({
            position_status: 'closed',
            closed_at: new Date()?.toISOString(),
            realized_pnl: positionData?.realized_pnl || 0
          })
          ?.eq('id', existingPosition?.id)
          ?.select(`
            *,
            assets!inner(symbol, name)
          `)
          ?.single();
        
        if (error) throw error;
        return data;
      } else {
        // Update position quantity and average price
        const totalCost = (existingPosition?.quantity * existingPosition?.avg_entry_price) + 
                         (positionData?.quantity * positionData?.entry_price);
        const newAvgPrice = totalCost / newQuantity;
        
        const { data, error } = await supabase
          ?.from('positions')
          ?.update({
            quantity: newQuantity,
            avg_entry_price: newAvgPrice,
            market_value: newQuantity * (positionData?.current_price || positionData?.entry_price)
          })
          ?.eq('id', existingPosition?.id)
          ?.select(`
            *,
            assets!inner(symbol, name)
          `)
          ?.single();
        
        if (error) throw error;
        return data;
      }
    } else if (positionData?.quantity > 0) {
      // Create new position
      const { data, error } = await supabase
        ?.from('positions')
        ?.insert({
          portfolio_id: portfolioId,
          asset_id: assetId,
          quantity: positionData?.quantity,
          avg_entry_price: positionData?.entry_price,
          current_price: positionData?.current_price || positionData?.entry_price,
          market_value: positionData?.quantity * (positionData?.current_price || positionData?.entry_price),
          position_type: 'long',
          position_status: 'open',
          opened_at: new Date()?.toISOString(),
          cost_basis: positionData?.quantity * positionData?.entry_price
        })
        ?.select(`
          *,
          assets!inner(symbol, name)
        `)
        ?.single();
      
      if (error) throw error;
      return data;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

export const updatePositionPrices = async (positions, currentPrices) => {
  if (!positions?.length || !currentPrices) return [];
  
  try {
    const updates = positions?.map(position => {
      const currentPrice = currentPrices?.[position?.assets?.symbol];
      if (!currentPrice) return null;
      
      const marketValue = position?.quantity * currentPrice;
      const unrealizedPnl = marketValue - (position?.quantity * position?.avg_entry_price);
      const unrealizedPnlPercent = ((currentPrice - position?.avg_entry_price) / position?.avg_entry_price) * 100;
      
      return {
        id: position?.id,
        current_price: currentPrice,
        market_value: marketValue,
        unrealized_pnl: unrealizedPnl,
        unrealized_pnl_percent: unrealizedPnlPercent
      };
    })?.filter(Boolean);
    
    if (!updates?.length) return [];
    
    const { data, error } = await supabase
      ?.from('positions')
      ?.upsert(updates)
      ?.select(`
        *,
        assets!inner(symbol, name, asset_type)
      `);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
  }
};

// ===== WATCHLIST OPERATIONS =====
export const getDefaultWatchlist = async (userId) => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      ?.from('watchlists')
      ?.select('*')
      ?.eq('user_id', userId)
      ?.eq('is_default', true)
      ?.single();
    
    if (error && error?.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    return null;
  }
};

export const createDefaultWatchlist = async (userId) => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      ?.from('watchlists')
      ?.insert({
        user_id: userId,
        name: 'Paper Trading Watchlist',
        description: 'Default watchlist for paper trading',
        is_default: true
      })
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
};

// ===== REAL-TIME SUBSCRIPTIONS =====
export const subscribeToUserTrades = (userId, callback) => {
  if (!userId || !callback) return null;
  
  return supabase
    ?.channel(`user-trades-${userId}`)
    ?.on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'trades',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    ?.subscribe();
};

export const subscribeToUserPositions = (userId, callback) => {
  if (!userId || !callback) return null;
  
  return supabase
    ?.channel(`user-positions-${userId}`)
    ?.on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'positions',
        filter: `portfolio_id=in.(select id from portfolios where user_id=eq.${userId})`
      },
      callback
    )
    ?.subscribe();
};

// ===== UTILITY FUNCTIONS =====
export const resetPaperTradingData = async (userId) => {
  if (!userId) return false;
  
  try {
    // Get user's default portfolio
    const portfolio = await getDefaultPortfolio(userId);
    if (!portfolio) return false;
    
    // Delete all positions, trades, and orders for this portfolio
    await Promise.all([
      supabase?.from('positions')?.delete()?.eq('portfolio_id', portfolio?.id),
      supabase?.from('trades')?.delete()?.eq('portfolio_id', portfolio?.id),
      supabase?.from('orders')?.delete()?.eq('portfolio_id', portfolio?.id)
    ]);
    
    // Reset portfolio balance
    await updatePortfolioBalance(portfolio?.id, 100000.00);
    
    return true;
  } catch (error) {
    return false;
  }
};

export const exportTradingHistory = async (userId) => {
  if (!userId) return null;
  
  try {
    const trades = await getUserTrades(userId);
    if (!trades?.length) return null;
    
    const csvHeaders = ['Date', 'Time', 'Symbol', 'Side', 'Quantity', 'Price', 'Value', 'Status'];
    const csvData = trades?.map(trade => [
      new Date(trade?.executed_at)?.toLocaleDateString('fr-CH'),
      new Date(trade?.executed_at)?.toLocaleTimeString('fr-CH'),
      trade?.assets?.symbol,
      trade?.trade_side === 'buy' ? 'Achat' : 'Vente',
      trade?.quantity,
      trade?.price?.toFixed(2),
      trade?.trade_value?.toFixed(2),
      'Exécuté'
    ]);
    
    return [csvHeaders, ...csvData]?.map(row => row?.join(','))?.join('\n');
  } catch (error) {
    return null;
  }
};
function paperTradingService(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: paperTradingService is not implemented yet.', args);
  return null;
}

export default paperTradingService;