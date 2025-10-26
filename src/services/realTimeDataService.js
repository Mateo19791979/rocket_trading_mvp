import { supabase } from '../lib/supabase';

export const realTimeDataService = {
  // Enhanced method to get latest market data with better error handling
  async getLatestMarketData(symbols = []) {
    const startTime = Date.now();
    
    try {
      let query = supabase?.from('market_data')
        ?.select(`
          id,
          timestamp,
          open_price,
          high_price,
          low_price,
          close_price,
          volume,
          change_percent,
          api_provider,
          data_source,
          is_real_time,
          asset:assets!inner (
            id,
            symbol,
            name,
            exchange,
            currency,
            asset_type
          )
        `);

      // Apply symbol filter if provided
      if (symbols?.length > 0) {
        query = query?.in('assets.symbol', symbols);
      }

      // Get the most recent data for each symbol using a window function approach
      // First, get all recent data (last 24 hours) and then deduplicate in JS
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)?.toISOString();
      
      const { data, error } = await Promise.race([
        query
          ?.gte('timestamp', oneDayAgo)
          ?.order('timestamp', { ascending: false })
          ?.limit(symbols?.length > 0 ? symbols?.length * 5 : 200), // Get multiple entries per symbol
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 8000)
        )
      ]);

      if (error) {
        console.error('Database query error:', error);
        throw error;
      }

      if (!data?.length) {
        console.warn(`No market data found for symbols: ${symbols?.join(', ') || 'all'}`);
        return [];
      }

      // Deduplicate to get latest entry per symbol
      const latestBySymbol = new Map();
      
      for (const item of data) {
        const symbol = item?.asset?.symbol;
        if (!symbol) continue;
        
        const existing = latestBySymbol?.get(symbol);
        const itemTime = new Date(item?.timestamp)?.getTime();
        
        if (!existing || itemTime > new Date(existing?.timestamp)?.getTime()) {
          latestBySymbol?.set(symbol, item);
        }
      }

      const result = Array.from(latestBySymbol?.values());
      const elapsed = Date.now() - startTime;
      
      console.log(`📊 Retrieved ${result?.length} market data records in ${elapsed}ms`);
      
      return result?.map(item => ({
        id: item?.id,
        symbol: item?.asset?.symbol,
        name: item?.asset?.name,
        exchange: item?.asset?.exchange,
        currency: item?.asset?.currency,
        assetType: item?.asset?.asset_type,
        timestamp: item?.timestamp,
        openPrice: item?.open_price,
        highPrice: item?.high_price,
        lowPrice: item?.low_price,
        closePrice: item?.close_price,
        currentPrice: item?.close_price, // Alias for compatibility
        volume: item?.volume,
        changePercent: item?.change_percent,
        apiProvider: item?.api_provider,
        dataSource: item?.data_source,
        isRealTime: item?.is_real_time,
        dataAge: Math.round((Date.now() - new Date(item?.timestamp)?.getTime()) / 60000) // Age in minutes
      })) || [];

    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error(`❌ Failed to get latest market data after ${elapsed}ms:`, error?.message);
      
      // Try a simplified fallback query
      try {
        console.log('🔄 Attempting simplified fallback query...');
        const { data: fallbackData } = await supabase?.from('market_data')
          ?.select('*, asset:assets(symbol, name)')
          ?.order('timestamp', { ascending: false })
          ?.limit(20);
          
        if (fallbackData?.length > 0) {
          console.log(`✅ Fallback query returned ${fallbackData?.length} records`);
          return fallbackData?.map(item => ({
            symbol: item?.asset?.symbol,
            name: item?.asset?.name,
            currentPrice: item?.close_price,
            changePercent: item?.change_percent,
            timestamp: item?.timestamp,
            apiProvider: item?.api_provider || 'fallback',
            dataAge: Math.round((Date.now() - new Date(item?.timestamp)?.getTime()) / 60000)
          }));
        }
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError?.message);
      }
      
      throw new Error(`Market data retrieval failed: ${error?.message}`);
    }
  },

  // Enhanced market status with multiple checks
  async getMarketStatus() {
    try {
      // Try to get market status from recent data first
      const { data: recentData } = await Promise.race([
        supabase?.from('market_data')
          ?.select('timestamp, api_provider')
          ?.order('timestamp', { ascending: false })
          ?.limit(5),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Status query timeout')), 3000)
        )
      ]);

      let isOpen = false;
      let status = 'CLOSED';
      let source = 'fallback';
      let dataFreshness = 'stale';

      if (recentData?.length > 0) {
        const latestDataTime = new Date(recentData[0].timestamp)?.getTime();
        const ageMinutes = (Date.now() - latestDataTime) / 60000;
        
        // If we have data less than 15 minutes old, market is likely open
        if (ageMinutes < 15) {
          isOpen = true;
          status = 'REGULAR';
          dataFreshness = 'fresh';
          source = recentData?.[0]?.api_provider || 'database';
        }
      }

      // Enhanced fallback logic based on time
      const now = new Date();
      const utcHour = now?.getUTCHours();
      const dayOfWeek = now?.getUTCDay();
      
      // US market hours: 14:30 - 21:00 UTC (9:30 AM - 4:00 PM EST)
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      const isMarketHours = utcHour >= 14 && utcHour < 21;
      
      // If fallback logic suggests market should be open but we have no fresh data
      if (isWeekday && isMarketHours && !isOpen) {
        status = 'MAYBE_OPEN'; // Indicate uncertainty
      }

      return {
        isOpen,
        status,
        source,
        timestamp: new Date()?.toISOString(),
        dataFreshness,
        marketHours: {
          open: '14:30 UTC',
          close: '21:00 UTC',
          timezone: 'UTC',
          isWeekday
        },
        lastDataAge: recentData?.length > 0 
          ? Math.round((Date.now() - new Date(recentData[0].timestamp)?.getTime()) / 60000)
          : null
      };

    } catch (error) {
      console.warn('Market status check failed:', error?.message);
      
      // Ultimate fallback
      const now = new Date();
      const utcHour = now?.getUTCHours();
      const dayOfWeek = now?.getUTCDay();
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      const isMarketHours = utcHour >= 14 && utcHour < 21;
      
      return {
        isOpen: isWeekday && isMarketHours,
        status: isWeekday && isMarketHours ? 'UNCERTAIN' : 'CLOSED',
        source: 'time_fallback',
        timestamp: new Date()?.toISOString(),
        error: error?.message,
        marketHours: {
          open: '14:30 UTC',
          close: '21:00 UTC',
          timezone: 'UTC',
          isWeekday
        }
      };
    }
  },

  // Enhanced subscription with better error handling
  async subscribeToMarketData(callback, symbols = []) {
    if (!callback) {
      throw new Error('Callback function is required');
    }

    console.log(`📡 Setting up real-time subscription for ${symbols?.length || 'all'} symbols`);

    try {
      // Create base subscription
      let subscription = supabase
        ?.channel('market_data_changes')
        ?.on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'market_data',
          ...(symbols?.length > 0 && { filter: `asset.symbol=in.(${symbols?.join(',')})` })
        }, (payload) => {
          console.log('📊 Real-time market data update:', payload?.new);
          
          try {
            // Enhanced payload processing
            const newData = payload?.new;
            if (newData) {
              // Add computed fields
              newData.dataAge = 0; // Fresh data
              newData.isRealTime = true;
              newData.timestamp = newData?.timestamp || new Date()?.toISOString();
              
              callback(newData);
            }
          } catch (callbackError) {
            console.error('Error in subscription callback:', callbackError?.message);
          }
        })
        ?.subscribe((status) => {
          console.log(`📡 Subscription status: ${status}`);
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to real-time market data');
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            console.error('❌ Subscription failed or closed:', status);
          }
        });

      // Add error handling for subscription
      if (subscription?.error) {
        throw new Error(`Subscription error: ${subscription.error}`);
      }

      // Return unsubscribe function with error handling
      return () => {
        try {
          console.log('🔌 Unsubscribing from market data');
          subscription?.unsubscribe();
        } catch (unsubError) {
          console.error('Error unsubscribing:', unsubError?.message);
        }
      };

    } catch (error) {
      console.error('Failed to set up real-time subscription:', error?.message);
      throw new Error(`Subscription setup failed: ${error?.message}`);
    }
  },

  // Enhanced method to get data freshness info
  async getDataFreshness(symbols = []) {
    try {
      let query = supabase?.from('market_data')
        ?.select(`
          timestamp,
          api_provider,
          asset:assets!inner(symbol)
        `);

      if (symbols?.length > 0) {
        query = query?.in('assets.symbol', symbols);
      }

      const { data, error } = await Promise.race([
        query
          ?.order('timestamp', { ascending: false })
          ?.limit(symbols?.length > 0 ? symbols?.length : 10),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Freshness query timeout')), 3000)
        )
      ]);

      if (error) throw error;

      if (!data?.length) {
        return {
          isFresh: false,
          lastUpdate: null,
          ageMinutes: Infinity,
          source: null,
          reason: 'No data available'
        };
      }

      const latestTimestamp = new Date(data[0].timestamp)?.getTime();
      const ageMinutes = (Date.now() - latestTimestamp) / 60000;
      const isFresh = ageMinutes < 30; // Consider fresh if less than 30 minutes old

      return {
        isFresh,
        lastUpdate: data?.[0]?.timestamp,
        ageMinutes: Math.round(ageMinutes),
        source: data?.[0]?.api_provider,
        totalRecords: data?.length,
        reason: isFresh ? 'Data is recent' : `Data is ${Math.round(ageMinutes)} minutes old`
      };

    } catch (error) {
      console.error('Data freshness check failed:', error?.message);
      return {
        isFresh: false,
        lastUpdate: null,
        ageMinutes: Infinity,
        source: null,
        error: error?.message,
        reason: 'Freshness check failed'
      };
    }
  }
};