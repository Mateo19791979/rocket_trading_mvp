import { supabase } from '../lib/supabase';

export const tradingService = {
  // Get market quotes with real-time updates - removed mock data fallback
  async getMarketQuotes(symbols = []) {
    try {
      // If no symbols provided, get popular assets
      if (symbols?.length === 0) {
        const { data: assets, error: assetsError } = await supabase?.from('assets')?.select('symbol')?.eq('is_active', true)?.limit(20);
        
        if (!assetsError && assets?.length > 0) {
          symbols = assets?.map(asset => asset?.symbol) || [];
        }
      }

      // Get latest market data for symbols
      let query = supabase?.from('market_data')?.select(`
          *,
          asset:assets!inner (
            id,
            symbol,
            name,
            logo_url,
            sector,
            currency,
            exchange
          )
        `)?.order('timestamp', { ascending: false });

      if (symbols?.length > 0) {
        query = query?.in('assets.symbol', symbols);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform and deduplicate data (latest per symbol)
      const latestQuotes = {};
      data?.forEach(item => {
        const symbol = item?.asset?.symbol;
        if (!latestQuotes?.[symbol]) {
          const changeValue = item?.close_price - item?.open_price;
          const changePercent = item?.open_price ? (changeValue / item?.open_price) * 100 : 0;

          latestQuotes[symbol] = {
            symbol: symbol,
            name: item?.asset?.name,
            price: item?.close_price,
            change: changeValue,
            changePercent: changePercent,
            volume: item?.volume || 0,
            high: item?.high_price,
            low: item?.low_price,
            open: item?.open_price,
            logo_url: item?.asset?.logo_url,
            sector: item?.asset?.sector,
            currency: item?.asset?.currency,
            exchange: item?.asset?.exchange,
            timestamp: item?.timestamp
          };
        }
      });

      return Object.values(latestQuotes);
    } catch (error) {
      throw new Error(`Failed to fetch market quotes: ${error.message}`);
    }
  },

  // Execute a trade
  async executeTrade(userId, tradeData) {
    if (!userId) throw new Error('User ID is required');
    
    try {
      // Get user's default portfolio
      const { data: portfolio, error: portfolioError } = await supabase?.from('portfolios')?.select('id')?.eq('user_id', userId)?.eq('is_default', true)?.single();

      if (portfolioError) throw portfolioError;

      // Get asset by symbol
      const { data: asset, error: assetError } = await supabase?.from('assets')?.select('id')?.eq('symbol', tradeData?.symbol)?.single();

      if (assetError) throw assetError;

      // Create order first
      const orderData = {
        user_id: userId,
        portfolio_id: portfolio?.id,
        asset_id: asset?.id,
        order_type: tradeData?.orderType || 'market',
        order_side: tradeData?.side,
        quantity: tradeData?.quantity,
        price: tradeData?.price || null,
        status: 'filled', // For paper trading, assume immediate fill
        created_at: new Date()?.toISOString()
      };

      const { data: order, error: orderError } = await supabase?.from('orders')?.insert(orderData)?.select()?.single();

      if (orderError) throw orderError;

      // Create trade record
      const tradeRecord = {
        user_id: userId,
        portfolio_id: portfolio?.id,
        asset_id: asset?.id,
        order_id: order?.id,
        trade_side: tradeData?.side,
        quantity: tradeData?.quantity,
        price: tradeData?.price,
        executed_at: new Date()?.toISOString(),
        trade_sentiment: tradeData?.sentiment || 'neutral'
      };

      const { data: trade, error: tradeError } = await supabase?.from('trades')?.insert(tradeRecord)?.select()?.single();

      if (tradeError) throw tradeError;

      return {
        orderId: order?.id,
        tradeId: trade?.id,
        status: 'filled',
        executedAt: trade?.executed_at,
        executedPrice: trade?.price,
        executedQuantity: trade?.quantity
      };
    } catch (error) {
      throw error;
    }
  },

  // Get user's trade history
  async getTradeHistory(userId, limit = 50) {
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
        side: trade?.trade_side,
        quantity: trade?.quantity,
        price: trade?.price,
        executedAt: new Date(trade?.executed_at),
        sentiment: trade?.trade_sentiment,
        logo_url: trade?.asset?.logo_url
      })) || [];
    } catch (error) {
      throw error;
    }
  },

  // Get current positions
  async getPositions(userId) {
    if (!userId) throw new Error('User ID is required');
    
    try {
      const { data: portfolio, error: portfolioError } = await supabase?.from('portfolios')?.select('id')?.eq('user_id', userId)?.eq('is_default', true)?.single();

      if (portfolioError) throw portfolioError;

      const { data, error } = await supabase?.from('positions')?.select(`
          *,
          asset:assets (
            id,
            symbol,
            name,
            logo_url,
            sector
          )
        `)?.eq('portfolio_id', portfolio?.id)?.eq('position_status', 'open');

      if (error) throw error;

      return data?.map(position => ({
        id: position?.id,
        symbol: position?.asset?.symbol,
        name: position?.asset?.name,
        type: position?.position_type,
        quantity: position?.quantity,
        avgPrice: position?.avg_entry_price,
        currentPrice: position?.current_price,
        marketValue: position?.market_value,
        unrealizedPnL: position?.unrealized_pnl,
        unrealizedPnLPercent: position?.unrealized_pnl_percent,
        costBasis: position?.cost_basis,
        logo_url: position?.asset?.logo_url,
        sector: position?.asset?.sector
      })) || [];
    } catch (error) {
      throw error;
    }
  }
};