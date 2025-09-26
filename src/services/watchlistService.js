import { supabase } from '../lib/supabase';

export const watchlistService = {
  // Get user's default watchlist with market data
  async getDefaultWatchlist(userId) {
    if (!userId) throw new Error('User ID is required');
    
    try {
      const { data: watchlist, error: watchlistError } = await supabase?.from('watchlists')?.select(`id,name,description,watchlist_items (id,sort_order,notes,target_price,asset:assets (id,symbol,name,logo_url,sector,currency,exchange))`)?.eq('user_id', userId)?.eq('is_default', true)?.single();

      if (watchlistError) throw watchlistError;

      if (!watchlist?.watchlist_items?.length) {
        return {
          id: watchlist?.id,
          name: watchlist?.name,
          items: []
        };
      }

      // Get latest market data for watchlist assets
      const assetIds = watchlist?.watchlist_items?.map(item => item?.asset?.id) || [];
      
      const { data: marketData, error: marketError } = await supabase?.from('market_data')?.select('*')?.in('asset_id', assetIds)?.order('timestamp', { ascending: false });

      if (marketError) throw marketError;

      // Create a map of latest market data by asset_id
      const latestMarketData = {};
      marketData?.forEach(data => {
        if (!latestMarketData?.[data?.asset_id]) {
          latestMarketData[data?.asset_id] = data;
        }
      });

      // Combine watchlist items with market data
      const items = watchlist?.watchlist_items?.map(item => {
        const market = latestMarketData?.[item?.asset?.id];
        const changeValue = market ? market?.close_price - market?.open_price : 0;
        const changePercent = market?.open_price ? (changeValue / market?.open_price) * 100 : 0;

        return {
          id: item?.id,
          symbol: item?.asset?.symbol,
          name: item?.asset?.name,
          price: market?.close_price || 0,
          change: changeValue,
          changePercent: changePercent,
          volume: market?.volume || 0,
          logo_url: item?.asset?.logo_url,
          sector: item?.asset?.sector,
          currency: item?.asset?.currency,
          exchange: item?.asset?.exchange,
          target_price: item?.target_price,
          notes: item?.notes,
          sort_order: item?.sort_order
        };
      })?.sort((a, b) => (a?.sort_order || 0) - (b?.sort_order || 0)) || [];

      return {
        id: watchlist?.id,
        name: watchlist?.name,
        description: watchlist?.description,
        items
      };
    } catch (error) {
      throw error;
    }
  },

  // Add asset to user's default watchlist
  async addToWatchlist(userId, assetSymbol) {
    if (!userId || !assetSymbol) throw new Error('User ID and asset symbol are required');
    
    try {
      // Get user's default watchlist
      const { data: watchlist, error: watchlistError } = await supabase?.from('watchlists')?.select('id')?.eq('user_id', userId)?.eq('is_default', true)?.single();

      if (watchlistError) throw watchlistError;

      // Get asset by symbol
      const { data: asset, error: assetError } = await supabase?.from('assets')?.select('id')?.eq('symbol', assetSymbol)?.single();

      if (assetError) throw assetError;

      // Add to watchlist
      const { data, error } = await supabase?.from('watchlist_items')?.insert({
          watchlist_id: watchlist?.id,
          asset_id: asset?.id,
          added_at: new Date()?.toISOString()
        })?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Remove asset from watchlist
  async removeFromWatchlist(watchlistItemId) {
    if (!watchlistItemId) throw new Error('Watchlist item ID is required');
    
    try {
      const { error } = await supabase?.from('watchlist_items')?.delete()?.eq('id', watchlistItemId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }
};