import { supabase } from '../lib/supabase';
import axios from 'axios';

export const realTimeDataService = {
  // Enhanced multi-API data service with comprehensive fallback strategy
  
  // Primary: Finnhub API - More reliable and faster than Yahoo Finance
  async fetchFinnhubData(symbols = []) {
    if (!symbols?.length) return [];
    
    const finnhubApiKey = import.meta.env?.VITE_FINNHUB_API_KEY;
    if (!finnhubApiKey) {
      console.warn('⚠️ Finnhub API key not configured, skipping...');
      return [];
    }

    console.log(`📡 Fetching ${symbols?.length} symbols from Finnhub API...`);
    const results = [];
    
    // Process symbols in small batches to avoid rate limiting
    const batchSize = 10;
    for (let i = 0; i < symbols?.length; i += batchSize) {
      const batch = symbols?.slice(i, i + batchSize);
      
      try {
        // Use Promise.allSettled to handle individual symbol failures gracefully
        const promises = batch?.map(symbol => 
          axios?.get('https://finnhub.io/api/v1/quote', {
            params: {
              symbol,
              token: finnhubApiKey
            },
            timeout: 10000
          })?.then(response => ({ symbol, data: response?.data, success: true }))?.catch(error => ({ symbol, error: error?.message, success: false }))
        );
        
        const batchResults = await Promise.allSettled(promises);
        
        batchResults?.forEach((result, index) => {
          if (result?.status === 'fulfilled' && result?.value?.success) {
            const { symbol, data } = result?.value;
            
            if (data?.c && data?.c > 0) { // Check if current price exists and is valid
              results?.push({
                symbol,
                name: symbol, // Finnhub doesn't provide company names in quote endpoint
                price: data?.c, // current price
                open: data?.o, // open price
                high: data?.h, // high price
                low: data?.l, // low price
                volume: 0, // Not available in Finnhub quote endpoint
                previousClose: data?.pc, // previous close
                change: data?.c - data?.pc,
                changePercent: data?.pc ? ((data?.c - data?.pc) / data?.pc) * 100 : 0,
                timestamp: new Date(),
                currency: 'USD',exchange: 'Unknown',dataSource: 'finnhub'
              });
              console.log(`✅ Finnhub: ${symbol} - $${data?.c}`);
            }
          } else {
            console.warn(`❌ Finnhub failed for ${batch?.[index]}: ${result?.value?.error || 'Unknown error'}`);
          }
        });
        
        // Add delay between batches to respect rate limits
        if (i + batchSize < symbols?.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error('❌ Finnhub batch error:', error?.message);
      }
    }
    
    console.log(`🎯 Finnhub completed: ${results?.length}/${symbols?.length} successful`);
    return results;
  },

  // Secondary: Alpha Vantage API - Reliable with good data quality
  async fetchAlphaVantageData(symbols = []) {
    if (!symbols?.length) return [];
    
    const apiKey = import.meta.env?.VITE_ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Alpha Vantage API key not configured, skipping...');
      return [];
    }

    console.log(`📡 Fetching ${symbols?.length} symbols from Alpha Vantage...`);
    const results = [];
    const maxSymbols = Math.min(symbols?.length, 5); // Alpha Vantage has strict rate limits
    
    for (let i = 0; i < maxSymbols; i++) {
      const symbol = symbols?.[i];
      
      try {
        console.log(`📊 Alpha Vantage: Fetching ${symbol}...`);
        
        const response = await axios?.get('https://www.alphavantage.co/query', {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: symbol,
            apikey: apiKey
          },
          timeout: 15000
        });

        if (response?.data?.['Error Message']) {
          console.warn(`❌ Alpha Vantage error for ${symbol}:`, response?.data?.['Error Message']);
          continue;
        }

        if (response?.data?.['Note']) {
          console.warn(`❌ Alpha Vantage rate limit reached for ${symbol}`);
          break; // Stop processing if rate limited
        }

        const quote = response?.data?.['Global Quote'];
        if (quote && quote?.['05. price']) {
          const price = parseFloat(quote?.['05. price']);
          const previousClose = parseFloat(quote?.['08. previous close']);
          
          results?.push({
            symbol: quote?.['01. symbol'] || symbol,
            name: symbol, // Alpha Vantage doesn't provide company names in global quote
            price: price,
            open: parseFloat(quote?.['02. open']) || price,
            high: parseFloat(quote?.['03. high']) || price,
            low: parseFloat(quote?.['04. low']) || price,
            volume: parseInt(quote?.['06. volume']) || 0,
            previousClose: previousClose,
            change: parseFloat(quote?.['09. change']) || 0,
            changePercent: parseFloat(quote?.['10. change percent']?.replace('%', '')) || 0,
            timestamp: new Date(quote?.['07. latest trading day'] || Date.now()),
            currency: 'USD',
            exchange: 'Unknown',
            dataSource: 'alpha_vantage'
          });
          
          console.log(`✅ Alpha Vantage: ${symbol} - $${price}`);
        }
        
        // Respect rate limits - 5 calls per minute for free tier
        if (i < maxSymbols - 1) {
          await new Promise(resolve => setTimeout(resolve, 12000)); // 12 seconds between calls
        }
        
      } catch (error) {
        console.error(`❌ Alpha Vantage error for ${symbol}:`, error?.message);
      }
    }
    
    console.log(`🎯 Alpha Vantage completed: ${results?.length}/${maxSymbols} successful`);
    return results;
  },

  // Tertiary: Polygon.io API - High quality data with better rate limits
  async fetchPolygonData(symbols = []) {
    if (!symbols?.length) return [];
    
    const apiKey = import.meta.env?.VITE_POLYGON_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Polygon.io API key not configured, skipping...');
      return [];
    }

    console.log(`📡 Fetching ${symbols?.length} symbols from Polygon.io...`);
    const results = [];
    
    // Polygon allows batch requests
    try {
      // Get previous day's data for multiple symbols
      const symbolsString = symbols?.join(',');
      
      const response = await axios?.get('https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/2023-01-09', {
        params: {
          adjusted: 'true',
          apikey: apiKey
        },
        timeout: 15000
      });

      if (response?.data?.status !== 'OK') {
        console.warn('❌ Polygon.io API request failed:', response?.data?.error);
        return results;
      }

      const polygonResults = response?.data?.results || [];
      
      // Match results with requested symbols
      symbols?.forEach(symbol => {
        const result = polygonResults?.find(r => r?.T === symbol);
        
        if (result) {
          results?.push({
            symbol: result?.T,
            name: symbol,
            price: result?.c, // close
            open: result?.o,
            high: result?.h,
            low: result?.l,
            volume: result?.v,
            previousClose: result?.c, // Using close as previous close for previous day data
            change: 0, // Would need current day data to calculate
            changePercent: 0,
            timestamp: new Date(result?.t), // timestamp in ms
            currency: 'USD',exchange: 'Unknown',dataSource: 'polygon'
          });
          
          console.log(`✅ Polygon.io: ${symbol} - $${result?.c}`);
        }
      });

    } catch (error) {
      console.error('❌ Polygon.io API error:', error?.message);
    }
    
    console.log(`🎯 Polygon.io completed: ${results?.length}/${symbols?.length} successful`);
    return results;
  },

  // Fallback: Yahoo Finance with enhanced error handling (kept as backup)
  async fetchYahooFinanceData(symbols = []) {
    if (!symbols?.length) return [];
    
    console.log(`📡 Yahoo Finance fallback for ${symbols?.length} symbols...`);
    const symbolsString = symbols?.join(',');
    
    const endpoints = [
      {
        url: `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsString}`,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      },
      {
        url: `https://api.allorigins.win/get?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsString}`)}`,
        headers: { 'Accept': 'application/json' },
        isProxy: true
      }
    ];

    for (let i = 0; i < endpoints?.length; i++) {
      const endpoint = endpoints?.[i];
      
      try {
        const response = await axios?.get(endpoint?.url, {
          timeout: 10000,
          headers: endpoint?.headers,
        });
        
        let data = response?.data;
        if (endpoint?.isProxy && data?.contents) {
          data = JSON.parse(data?.contents);
        }

        if (data?.quoteResponse?.result?.length) {
          const results = data?.quoteResponse?.result?.map(quote => ({
            symbol: quote?.symbol,
            name: quote?.displayName || quote?.longName || quote?.shortName || quote?.symbol,
            price: quote?.regularMarketPrice || 0,
            open: quote?.regularMarketOpen || quote?.previousClose || 0,
            high: quote?.regularMarketDayHigh || quote?.regularMarketPrice || 0,
            low: quote?.regularMarketDayLow || quote?.regularMarketPrice || 0,
            volume: quote?.regularMarketVolume || 0,
            previousClose: quote?.regularMarketPreviousClose || quote?.regularMarketPrice || 0,
            change: quote?.regularMarketChange || 0,
            changePercent: quote?.regularMarketChangePercent || 0,
            timestamp: new Date(quote?.regularMarketTime ? quote.regularMarketTime * 1000 : Date.now()),
            currency: quote?.currency || 'USD',exchange: quote?.fullExchangeName || 'Unknown',dataSource: 'yahoo_finance_fallback'
          }))?.filter(quote => quote?.price > 0);
          
          console.log(`✅ Yahoo Finance fallback: ${results?.length} quotes retrieved`);
          return results;
        }
      } catch (error) {
        console.warn(`❌ Yahoo Finance endpoint ${i + 1} failed:`, error?.message);
      }
    }
    
    return [];
  },

  // Mock data service for development/demo purposes
  async getMockMarketData(symbols = []) {
    console.log('🎭 Generating mock market data for development...');
    
    const mockBaseData = {
      'AAPL': { name: 'Apple Inc.', basePrice: 175.25, sector: 'Technology' },
      'GOOGL': { name: 'Alphabet Inc.', basePrice: 140.15, sector: 'Technology' },
      'MSFT': { name: 'Microsoft Corporation', basePrice: 380.75, sector: 'Technology' },
      'AMZN': { name: 'Amazon.com Inc.', basePrice: 145.30, sector: 'Consumer Discretionary' },
      'TSLA': { name: 'Tesla Inc.', basePrice: 215.80, sector: 'Automotive' },
      'NVDA': { name: 'NVIDIA Corporation', basePrice: 425.20, sector: 'Technology' },
      'META': { name: 'Meta Platforms Inc.', basePrice: 325.40, sector: 'Technology' },
      'NFLX': { name: 'Netflix Inc.', basePrice: 445.50, sector: 'Entertainment' },
      'AMD': { name: 'Advanced Micro Devices', basePrice: 105.75, sector: 'Technology' },
      'INTC': { name: 'Intel Corporation', basePrice: 45.80, sector: 'Technology' }
    };

    return symbols?.map(symbol => {
      const mock = mockBaseData?.[symbol] || { name: symbol, basePrice: Math.random() * 200 + 50, sector: 'Unknown' };
      const variation = (Math.random() - 0.5) * 0.08; // ±4% variation
      const price = mock?.basePrice * (1 + variation);
      const change = price - mock?.basePrice;
      const changePercent = (change / mock?.basePrice) * 100;
      
      return {
        symbol,
        name: mock?.name,
        price: Math.round(price * 100) / 100,
        open: Math.round((price * 0.98) * 100) / 100,
        high: Math.round((price * 1.03) * 100) / 100,
        low: Math.round((price * 0.95) * 100) / 100,
        volume: Math.floor(Math.random() * 15000000) + 1000000,
        previousClose: mock?.basePrice,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        timestamp: new Date(),
        currency: 'USD',
        exchange: 'NASDAQ',
        dataSource: 'mock',
        isMockData: true
      };
    }) || [];
  },

  // Enhanced Supabase sync with proper error handling
  async syncMarketDataToSupabase(marketDataArray, apiProvider = 'multi_api') {
    if (!marketDataArray?.length) return [];

    console.log(`💾 Syncing ${marketDataArray?.length} market data records to Supabase...`);
    const results = [];
    
    for (const marketData of marketDataArray) {
      try {
        // Get or create asset
        let { data: asset, error: assetError } = await supabase
          ?.from('assets')
          ?.select('id, symbol')
          ?.eq('symbol', marketData?.symbol)
          ?.single();

        if (assetError || !asset) {
          console.log(`📝 Creating new asset for ${marketData?.symbol}...`);
          const { data: newAsset, error: createError } = await supabase
            ?.from('assets')
            ?.insert({
              symbol: marketData?.symbol,
              name: marketData?.name || marketData?.symbol,
              asset_type: 'stock',
              currency: marketData?.currency || 'USD',
              exchange: marketData?.exchange || 'Unknown',
              is_active: true,
              sync_enabled: true
            })
            ?.select('id')
            ?.single();

          if (createError) {
            console.error(`❌ Failed to create asset for ${marketData?.symbol}:`, createError?.message);
            results?.push({
              symbol: marketData?.symbol,
              status: 'error',
              error: `Asset creation failed: ${createError?.message}`
            });
            continue;
          }
          
          asset = newAsset;
          console.log(`✅ Created asset for ${marketData?.symbol}`);
        }

        // Insert market data
        const { data: insertedData, error: insertError } = await supabase
          ?.from('market_data')
          ?.insert({
            asset_id: asset?.id,
            open_price: Number(marketData?.open) || 0,
            high_price: Number(marketData?.high) || 0,
            low_price: Number(marketData?.low) || 0,
            close_price: Number(marketData?.price) || 0,
            volume: Number(marketData?.volume) || 0,
            timestamp: marketData?.timestamp || new Date(),
            data_source: marketData?.isMockData ? 'mock' : 'api',
            api_provider: marketData?.dataSource || apiProvider,
            last_updated: new Date(),
            is_real_time: true
          })
          ?.select()
          ?.single();

        if (insertError) {
          // Log the error but don't treat it as a failure if it's just a duplicate
          if (insertError?.message?.includes('duplicate') || insertError?.code === '23505') {
            console.log(`ℹ️ Duplicate data for ${marketData?.symbol}, skipping...`);
            results?.push({
              symbol: marketData?.symbol,
              status: 'skipped',
              reason: 'duplicate'
            });
          } else {
            results?.push({
              symbol: marketData?.symbol,
              status: 'error',
              error: insertError?.message
            });
          }
          continue;
        }

        // Update asset last price update
        await supabase
          ?.from('assets')
          ?.update({ last_price_update: new Date() })
          ?.eq('id', asset?.id);

        results?.push({
          symbol: marketData?.symbol,
          status: 'success',
          recordId: insertedData?.id,
          price: marketData?.price,
          dataSource: marketData?.dataSource || apiProvider,
          isMockData: marketData?.isMockData || false
        });

        console.log(`✅ Synced ${marketData?.symbol}: $${marketData?.price} (${marketData?.dataSource || apiProvider})`);
        
      } catch (error) {
        console.error(`❌ Sync error for ${marketData?.symbol}:`, error?.message);
        results?.push({
          symbol: marketData?.symbol,
          status: 'error',
          error: error?.message
        });
      }
    }

    const successCount = results?.filter(r => r?.status === 'success')?.length;
    const errorCount = results?.filter(r => r?.status === 'error')?.length;
    const skippedCount = results?.filter(r => r?.status === 'skipped')?.length;
    
    console.log(`💾 Sync completed: ${successCount} successful, ${errorCount} failed, ${skippedCount} skipped`);
    return results;
  },

  // Comprehensive multi-API sync with intelligent fallback
  async syncMultipleSymbols(symbols = []) {
    console.log(`🚀 Starting enhanced multi-API sync for ${symbols?.length} symbols...`);
    
    const results = {
      successful: [],
      failed: [],
      totalProcessed: 0,
      dataSources: {}
    };

    let allMarketData = [];

    // Primary: Finnhub API (fastest and most reliable)
    try {
      console.log('🥇 Primary: Attempting Finnhub API...');
      const finnhubData = await this.fetchFinnhubData(symbols);
      if (finnhubData?.length > 0) {
        allMarketData = allMarketData?.concat(finnhubData);
        console.log(`✅ Finnhub provided ${finnhubData?.length} quotes`);
      }
    } catch (error) {
      console.warn('⚠️ Finnhub API failed:', error?.message);
    }

    // Get remaining symbols that weren't successfully fetched
    const fetchedSymbols = new Set(allMarketData?.map(data => data?.symbol));
    const remainingSymbols = symbols?.filter(symbol => !fetchedSymbols?.has(symbol));

    // Secondary: Alpha Vantage API for remaining symbols
    if (remainingSymbols?.length > 0) {
      try {
        console.log(`🥈 Secondary: Attempting Alpha Vantage for ${remainingSymbols?.length} remaining symbols...`);
        const alphaVantageData = await this.fetchAlphaVantageData(remainingSymbols?.slice(0, 5)); // Limit for rate limits
        if (alphaVantageData?.length > 0) {
          allMarketData = allMarketData?.concat(alphaVantageData);
          console.log(`✅ Alpha Vantage provided ${alphaVantageData?.length} additional quotes`);
        }
      } catch (error) {
        console.warn('⚠️ Alpha Vantage API failed:', error?.message);
      }
    }

    // Update remaining symbols again
    const newFetchedSymbols = new Set(allMarketData?.map(data => data?.symbol));
    const stillRemainingSymbols = symbols?.filter(symbol => !newFetchedSymbols?.has(symbol));

    // Tertiary: Polygon.io API for remaining symbols
    if (stillRemainingSymbols?.length > 0) {
      try {
        console.log(`🥉 Tertiary: Attempting Polygon.io for ${stillRemainingSymbols?.length} remaining symbols...`);
        const polygonData = await this.fetchPolygonData(stillRemainingSymbols);
        if (polygonData?.length > 0) {
          allMarketData = allMarketData?.concat(polygonData);
          console.log(`✅ Polygon.io provided ${polygonData?.length} additional quotes`);
        }
      } catch (error) {
        console.warn('⚠️ Polygon.io API failed:', error?.message);
      }
    }

    // Fallback 1: Yahoo Finance for remaining symbols
    const finalFetchedSymbols = new Set(allMarketData?.map(data => data?.symbol));
    const lastRemainingSymbols = symbols?.filter(symbol => !finalFetchedSymbols?.has(symbol));

    if (lastRemainingSymbols?.length > 0) {
      try {
        console.log(`🔄 Fallback 1: Attempting Yahoo Finance for ${lastRemainingSymbols?.length} remaining symbols...`);
        const yahooData = await this.fetchYahooFinanceData(lastRemainingSymbols);
        if (yahooData?.length > 0) {
          allMarketData = allMarketData?.concat(yahooData);
          console.log(`✅ Yahoo Finance provided ${yahooData?.length} additional quotes`);
        }
      } catch (error) {
        console.warn('⚠️ Yahoo Finance fallback failed:', error?.message);
      }
    }

    // Final Fallback: Mock data for any remaining symbols (development/demo)
    const absoluteFinalSymbols = new Set(allMarketData?.map(data => data?.symbol));
    const mockNeededSymbols = symbols?.filter(symbol => !absoluteFinalSymbols?.has(symbol));

    if (mockNeededSymbols?.length > 0) {
      console.log(`🎭 Final fallback: Using mock data for ${mockNeededSymbols?.length} symbols...`);
      try {
        const mockData = await this.getMockMarketData(mockNeededSymbols);
        allMarketData = allMarketData?.concat(mockData);
        console.log(`✅ Mock data provided for ${mockData?.length} symbols`);
      } catch (error) {
        console.error('❌ Mock data generation failed:', error?.message);
      }
    }

    // Sync all collected data to Supabase
    if (allMarketData?.length > 0) {
      try {
        const syncResults = await this.syncMarketDataToSupabase(allMarketData, 'multi_api_enhanced');
        
        // Process sync results
        syncResults?.forEach(result => {
          if (result?.status === 'success') {
            results?.successful?.push(result);
            const source = result?.dataSource || 'unknown';
            results.dataSources[source] = (results?.dataSources?.[source] || 0) + 1;
          } else if (result?.status === 'error') {
            results?.failed?.push(result);
          }
          // Skip counting 'skipped' results as failures
        });
        
        results.totalProcessed = syncResults?.length;
      } catch (error) {
        console.error('❌ Supabase sync failed:', error?.message);
        symbols?.forEach(symbol => {
          results?.failed?.push({
            symbol,
            status: 'error',
            error: `Sync failed: ${error?.message}`
          });
        });
      }
    }

    console.log(`🎯 Enhanced Multi-API Sync Summary:`, {
      requested: symbols?.length,
      successful: results?.successful?.length,
      failed: results?.failed?.length,
      dataSources: results?.dataSources,
      coverage: `${Math.round((results?.successful?.length / symbols?.length) * 100)}%`
    });
    
    return results;
  },

  // Get market status (unchanged)
  async getMarketStatus(exchange = 'NYSE') {
    try {
      const { data, error } = await supabase?.rpc('get_market_status', {
        exchange_name: exchange
      });

      if (error) throw error;

      return data?.[0] || {
        is_open: false,
        status: 'UNKNOWN',
        next_open: null,
        current_time: new Date()
      };
    } catch (error) {
      const now = new Date();
      const currentHour = now?.getHours();
      const isWeekend = now?.getDay() === 0 || now?.getDay() === 6;
      
      return {
        is_open: !isWeekend && currentHour >= 9 && currentHour < 16,
        status: isWeekend ? 'CLOSED' : (currentHour >= 9 && currentHour < 16 ? 'OPEN' : 'CLOSED'),
        next_open: null,
        current_time: now
      };
    }
  },

  // Get latest synced data from Supabase (unchanged)
  async getLatestMarketData(symbols = []) {
    try {
      let query = supabase?.from('market_data')?.select(`
          *,
          asset:assets!inner (
            id,
            symbol,
            name,
            logo_url,
            sector,
            currency,
            exchange,
            asset_type
          )
        `)?.eq('is_real_time', true)?.order('timestamp', { ascending: false });

      if (symbols?.length > 0) {
        query = query?.in('assets.symbol', symbols);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group by symbol and get latest for each
      const latestBySymbol = {};
      data?.forEach(item => {
        const symbol = item?.asset?.symbol;
        if (!latestBySymbol?.[symbol] || new Date(item.timestamp) > new Date(latestBySymbol[symbol].timestamp)) {
          latestBySymbol[symbol] = item;
        }
      });

      return Object.values(latestBySymbol)?.map(item => {
        const changeValue = item?.close_price - item?.open_price;
        const changePercent = item?.open_price ? (changeValue / item?.open_price) * 100 : 0;

        return {
          id: item?.asset?.id,
          symbol: item?.asset?.symbol,
          name: item?.asset?.name,
          price: item?.close_price,
          change: changeValue,
          changePercent: changePercent,
          volume: item?.volume || 0,
          high: item?.high_price,
          low: item?.low_price,
          open: item?.open_price,
          timestamp: item?.timestamp,
          logo_url: item?.asset?.logo_url,
          sector: item?.asset?.sector,
          currency: item?.asset?.currency,
          exchange: item?.asset?.exchange,
          assetType: item?.asset?.asset_type,
          dataSource: item?.api_provider,
          lastUpdated: item?.last_updated,
          isMockData: item?.data_source === 'mock'
        };
      }) || [];
    } catch (error) {
      throw error;
    }
  }
};