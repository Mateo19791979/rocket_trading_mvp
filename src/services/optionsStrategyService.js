import { supabase } from '../lib/supabase.js';

class OptionsStrategyService {
  // Get screening results with comprehensive data
  async getScreeningResults(filters = {}) {
    try {
      let query = supabase?.from('ai_screening_results')?.select(`
          id,
          composite_score,
          valuation_score,
          quality_score,
          momentum_score,
          sentiment_score,
          liquidity_score,
          pe_zscore,
          roe,
          roic,
          iv_rank,
          performance_vs_sector,
          recommended_strategy,
          screening_status,
          created_at,
          assets:asset_id (
            symbol,
            name,
            sector,
            market_cap,
            currency,
            exchange
          ),
          fundamental_data:asset_id (
            pe_ratio,
            ev_ebitda,
            peg_ratio,
            gross_margin,
            ma_50,
            ma_200,
            performance_3m,
            performance_6m,
            performance_12m
          )
        `)?.eq('screening_status', 'completed')?.order('composite_score', { ascending: false });

      // Apply filters
      if (filters?.minScore) {
        query = query?.gte('composite_score', filters?.minScore);
      }
      if (filters?.minMarketCap) {
        query = query?.gte('assets.market_cap', filters?.minMarketCap);
      }
      if (filters?.sector) {
        query = query?.eq('assets.sector', filters?.sector);
      }
      if (filters?.strategy) {
        query = query?.eq('recommended_strategy', filters?.strategy);
      }

      const { data, error } = await query?.limit(50);
      
      if (error) {
        throw error;
      }

      return data?.map(result => ({
        id: result?.id,
        symbol: result?.assets?.symbol,
        name: result?.assets?.name,
        sector: result?.assets?.sector,
        market_cap: result?.assets?.market_cap,
        exchange: result?.assets?.exchange,
        composite_score: result?.composite_score,
        valuation_score: result?.valuation_score,
        quality_score: result?.quality_score,
        momentum_score: result?.momentum_score,
        pe_zscore: result?.pe_zscore,
        roe: result?.roe,
        roic: result?.roic,
        iv_rank: result?.iv_rank,
        performance_vs_sector: result?.performance_vs_sector,
        recommended_strategy: result?.recommended_strategy,
        pe_ratio: result?.fundamental_data?.[0]?.pe_ratio,
        ev_ebitda: result?.fundamental_data?.[0]?.ev_ebitda,
        peg_ratio: result?.fundamental_data?.[0]?.peg_ratio,
        gross_margin: result?.fundamental_data?.[0]?.gross_margin,
        performance_3m: result?.fundamental_data?.[0]?.performance_3m,
        performance_12m: result?.fundamental_data?.[0]?.performance_12m
      })) || [];

    } catch (error) {
      console.error('Error fetching screening results:', error);
      throw error;
    }
  }

  // Get options strategies for a specific asset
  async getOptionsStrategies(assetSymbol) {
    try {
      const { data, error } = await supabase?.from('options_strategies')?.select(`
          *,
          assets:asset_id (
            symbol,
            name,
            current_price:market_data(close_price)
          )
        `)?.eq('assets.symbol', assetSymbol)?.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data?.map(strategy => ({
        id: strategy?.id,
        asset_symbol: strategy?.assets?.symbol,
        asset_name: strategy?.assets?.name,
        strategy_type: strategy?.strategy_type,
        expiration_date: strategy?.expiration_date,
        max_profit: strategy?.max_profit,
        max_loss: strategy?.max_loss,
        break_even_points: strategy?.break_even_points,
        strategy_legs: strategy?.strategy_legs,
        risk_parameters: strategy?.risk_parameters,
        created_at: strategy?.created_at
      })) || [];

    } catch (error) {
      console.error('Error fetching options strategies:', error);
      throw error;
    }
  }

  // Run AI screening for value rebound opportunities
  async runValueReboundScreening(parameters = {}) {
    try {
      // Get underperforming but undervalued stocks
      const { data, error } = await supabase?.from('ai_screening_results')?.select(`
          *,
          assets:asset_id (
            symbol,
            name,
            sector,
            market_cap
          )
        `)?.lte('pe_zscore', parameters?.maxPEZScore || -0.5)?.gte('roe', parameters?.minROE || 0.08)?.lte('performance_vs_sector', parameters?.maxUnderperformance || -0.05)?.gte('composite_score', parameters?.minScore || 70)?.eq('screening_status', 'completed')?.order('composite_score', { ascending: false })?.limit(20);

      if (error) {
        throw error;
      }

      return data?.map(result => ({
        symbol: result?.assets?.symbol,
        name: result?.assets?.name,
        sector: result?.assets?.sector,
        market_cap: result?.assets?.market_cap,
        composite_score: result?.composite_score,
        pe_zscore: result?.pe_zscore,
        roe: result?.roe,
        performance_vs_sector: result?.performance_vs_sector,
        recommended_strategy: result?.recommended_strategy,
        reason: `Sous-perf 12m ${Math.round((result?.performance_vs_sector || 0) * 100)}%, PER z=${(result?.pe_zscore || 0)?.toFixed(1)}, qualité OK`
      })) || [];

    } catch (error) {
      console.error('Error running value rebound screening:', error);
      throw error;
    }
  }

  // Get best quality growth stocks
  async getBestQualityGrowthStocks(parameters = {}) {
    try {
      const { data, error } = await supabase?.from('ai_screening_results')?.select(`
          *,
          assets:asset_id (
            symbol,
            name,
            sector,
            market_cap
          )
        `)?.gte('quality_score', parameters?.minQuality || 80)?.gte('momentum_score', parameters?.minMomentum || 75)?.gte('roe', parameters?.minROE || 0.15)?.gte('composite_score', parameters?.minScore || 75)?.eq('screening_status', 'completed')?.order('composite_score', { ascending: false })?.limit(15);

      if (error) {
        throw error;
      }

      return data?.map(result => ({
        symbol: result?.assets?.symbol,
        name: result?.assets?.name,
        sector: result?.assets?.sector,
        market_cap: result?.assets?.market_cap,
        composite_score: result?.composite_score,
        quality_score: result?.quality_score,
        momentum_score: result?.momentum_score,
        roe: result?.roe,
        roic: result?.roic,
        iv_rank: result?.iv_rank,
        recommended_strategy: result?.recommended_strategy
      })) || [];

    } catch (error) {
      console.error('Error getting best quality growth stocks:', error);
      throw error;
    }
  }

  // Get options trades for a specific symbol
  async getOptionsTrades(symbol, horizon = '6m', objective = 'rebound') {
    try {
      // Get options contracts for the symbol
      const { data: contracts, error: contractsError } = await supabase?.from('options_contracts')?.select(`
          *,
          assets:asset_id (
            symbol,
            name,
            current_price:market_data(close_price)
          )
        `)?.eq('assets.symbol', symbol)?.gte('expiration_date', new Date()?.toISOString()?.split('T')?.[0])?.order('expiration_date', { ascending: true });

      if (contractsError) {
        throw contractsError;
      }

      // Generate strategy recommendations based on objective
      const strategies = this.generateStrategies(contracts || [], horizon, objective, symbol);
      
      return strategies;

    } catch (error) {
      console.error('Error getting options trades:', error);
      throw error;
    }
  }

  // Generate strategy recommendations
  generateStrategies(contracts, horizon, objective, symbol) {
    if (!contracts?.length) {
      return [];
    }

    const strategies = [];
    const currentPrice = contracts?.[0]?.assets?.current_price?.[0]?.close_price || 100;

    // Bull Call Spread for rebound objective
    if (objective === 'rebound') {
      const atmCall = contracts?.find(c => 
        c?.option_type === 'call' && 
        Math.abs(c?.strike_price - currentPrice) <= currentPrice * 0.05
      );
      
      const otmCall = contracts?.find(c => 
        c?.option_type === 'call' && 
        c?.strike_price > currentPrice * 1.1 && 
        c?.strike_price <= currentPrice * 1.2
      );

      if (atmCall && otmCall) {
        strategies?.push({
          symbol,
          strategy_type: 'bull_call_spread',
          expiration_date: atmCall?.expiration_date,
          long_leg: {
            strike: atmCall?.strike_price,
            premium: atmCall?.last_price || 0,
            delta: atmCall?.delta || 0
          },
          short_leg: {
            strike: otmCall?.strike_price,
            premium: otmCall?.last_price || 0,
            delta: otmCall?.delta || 0
          },
          max_profit: (otmCall?.strike_price - atmCall?.strike_price) - (atmCall?.last_price - otmCall?.last_price),
          max_loss: atmCall?.last_price - otmCall?.last_price,
          break_even: atmCall?.strike_price + (atmCall?.last_price - otmCall?.last_price),
          risk_parameters: {
            max_cap_per_trade: 0.01,
            avoid_earnings: true
          },
          reason: `Sous-perf récente mais valorisation attractive`
        });
      }
    }

    // Cash Secured Put
    const otmPut = contracts?.find(c => 
      c?.option_type === 'put' && 
      c?.strike_price < currentPrice * 0.95 && 
      c?.strike_price >= currentPrice * 0.85
    );

    if (otmPut) {
      strategies?.push({
        symbol,
        strategy_type: 'cash_secured_put',
        expiration_date: otmPut?.expiration_date,
        short_leg: {
          strike: otmPut?.strike_price,
          premium: otmPut?.last_price || 0,
          delta: otmPut?.delta || 0
        },
        max_profit: otmPut?.last_price || 0,
        max_loss: (otmPut?.strike_price - otmPut?.last_price) * 100,
        break_even: otmPut?.strike_price - otmPut?.last_price,
        cash_required: otmPut?.strike_price * 100,
        risk_parameters: {
          max_cap_per_trade: 0.015,
          avoid_earnings: true
        },
        reason: 'Collecte de prime avec acquisition potentielle'
      });
    }

    return strategies;
  }

  // Create a new options strategy
  async createOptionsStrategy(strategyData) {
    try {
      // Get asset ID from symbol
      const { data: asset, error: assetError } = await supabase?.from('assets')?.select('id')?.eq('symbol', strategyData?.symbol)?.single();

      if (assetError) {
        throw assetError;
      }

      const { data, error } = await supabase?.from('options_strategies')?.insert([{
          asset_id: asset?.id,
          strategy_type: strategyData?.strategy_type,
          expiration_date: strategyData?.expiration_date,
          max_profit: strategyData?.max_profit,
          max_loss: strategyData?.max_loss,
          break_even_points: strategyData?.break_even_points,
          strategy_legs: strategyData?.strategy_legs,
          risk_parameters: strategyData?.risk_parameters
        }])?.select()?.single();

      if (error) {
        throw error;
      }

      return data;

    } catch (error) {
      console.error('Error creating options strategy:', error);
      throw error;
    }
  }

  // Get IV Rank and skew for a symbol
  async getIVRank(symbol) {
    try {
      const { data, error } = await supabase?.from('options_contracts')?.select(`
          implied_volatility,
          strike_price,
          option_type,
          assets:asset_id (
            symbol,
            current_price:market_data(close_price)
          )
        `)?.eq('assets.symbol', symbol)?.not('implied_volatility', 'is', null);

      if (error) {
        throw error;
      }

      if (!data?.length) {
        return {
          symbol,
          iv_rank: null,
          iv_skew: null,
          message: 'No IV data available'
        };
      }

      // Calculate IV rank (simplified)
      const ivValues = data?.map(d => d?.implied_volatility)?.filter(Boolean);
      const currentIV = ivValues?.[0] || 0;
      const maxIV = Math.max(...ivValues);
      const minIV = Math.min(...ivValues);
      const ivRank = maxIV > minIV ? ((currentIV - minIV) / (maxIV - minIV)) * 100 : 50;

      // Calculate put/call skew
      const putIVs = data?.filter(d => d?.option_type === 'put')?.map(d => d?.implied_volatility)?.filter(Boolean);
      const callIVs = data?.filter(d => d?.option_type === 'call')?.map(d => d?.implied_volatility)?.filter(Boolean);
      
      const avgPutIV = putIVs?.length ? putIVs?.reduce((a, b) => a + b, 0) / putIVs?.length : 0;
      const avgCallIV = callIVs?.length ? callIVs?.reduce((a, b) => a + b, 0) / callIVs?.length : 0;
      const ivSkew = avgPutIV && avgCallIV ? avgPutIV - avgCallIV : 0;

      return {
        symbol,
        iv_rank: Math.round(ivRank * 100) / 100,
        iv_skew: Math.round(ivSkew * 10000) / 10000,
        current_iv: Math.round(currentIV * 10000) / 10000,
        put_call_ratio: putIVs?.length && callIVs?.length ? putIVs?.length / callIVs?.length : null
      };

    } catch (error) {
      console.error('Error getting IV rank:', error);
      throw error;
    }
  }

  // Get score details for a symbol
  async getScoreDetails(symbol) {
    try {
      const { data, error } = await supabase?.from('ai_screening_results')?.select(`
          *,
          assets:asset_id (
            symbol,
            name,
            sector,
            market_cap
          ),
          fundamental_data:asset_id (
            pe_ratio,
            ev_ebitda,
            peg_ratio,
            gross_margin,
            operating_cash_flow,
            ma_50,
            ma_200,
            performance_3m,
            performance_6m,
            performance_12m
          )
        `)?.eq('assets.symbol', symbol)?.eq('screening_status', 'completed')?.order('created_at', { ascending: false })?.limit(1)?.single();

      if (error) {
        throw error;
      }

      return {
        symbol: data?.assets?.symbol,
        name: data?.assets?.name,
        sector: data?.assets?.sector,
        market_cap: data?.assets?.market_cap,
        composite_score: data?.composite_score,
        breakdown: {
          valuation: {
            score: data?.valuation_score,
            pe_ratio: data?.fundamental_data?.[0]?.pe_ratio,
            pe_zscore: data?.pe_zscore,
            ev_ebitda: data?.fundamental_data?.[0]?.ev_ebitda,
            peg_ratio: data?.fundamental_data?.[0]?.peg_ratio
          },
          quality: {
            score: data?.quality_score,
            roe: data?.roe,
            roic: data?.roic,
            gross_margin: data?.fundamental_data?.[0]?.gross_margin,
            operating_cash_flow: data?.fundamental_data?.[0]?.operating_cash_flow
          },
          momentum: {
            score: data?.momentum_score,
            performance_3m: data?.fundamental_data?.[0]?.performance_3m,
            performance_6m: data?.fundamental_data?.[0]?.performance_6m,
            performance_12m: data?.fundamental_data?.[0]?.performance_12m,
            ma_trend: data?.fundamental_data?.[0]?.ma_50 > data?.fundamental_data?.[0]?.ma_200
          },
          sentiment: {
            score: data?.sentiment_score,
            performance_vs_sector: data?.performance_vs_sector
          },
          liquidity: {
            score: data?.liquidity_score,
            iv_rank: data?.iv_rank
          }
        },
        recommended_strategy: data?.recommended_strategy,
        last_updated: data?.updated_at
      };

    } catch (error) {
      console.error('Error getting score details:', error);
      throw error;
    }
  }

  // Send strategy to paper trading
  async sendToPaperTrading(strategy) {
    try {
      // Create paper trading orders based on strategy
      const orders = [];

      if (strategy?.strategy_type === 'bull_call_spread') {
        // Long call order
        orders?.push({
          asset_symbol: strategy?.symbol,
          order_type: 'limit',
          order_side: 'buy',
          quantity: 1,
          price: strategy?.long_leg?.premium,
          order_details: {
            instrument_type: 'option',
            option_type: 'call',
            strike_price: strategy?.long_leg?.strike,
            expiration_date: strategy?.expiration_date,
            strategy_leg: 'long'
          }
        });

        // Short call order
        orders?.push({
          asset_symbol: strategy?.symbol,
          order_type: 'limit',
          order_side: 'sell',
          quantity: 1,
          price: strategy?.short_leg?.premium,
          order_details: {
            instrument_type: 'option',
            option_type: 'call',
            strike_price: strategy?.short_leg?.strike,
            expiration_date: strategy?.expiration_date,
            strategy_leg: 'short'
          }
        });
      }

      // Save orders using existing trading service
      const savedOrders = [];
      for (const order of orders) {
        const { data: asset } = await supabase?.from('assets')?.select('id')?.eq('symbol', order?.asset_symbol)?.single();

        if (asset) {
          const { data: savedOrder } = await supabase?.from('orders')?.insert([{
              asset_id: asset?.id,
              order_type: order?.order_type,
              order_side: order?.order_side,
              quantity: order?.quantity,
              price: order?.price,
              broker_info: {
                ...order?.order_details,
                strategy_id: strategy?.id,
                strategy_type: strategy?.strategy_type
              }
            }])?.select()?.single();

          if (savedOrder) {
            savedOrders?.push(savedOrder);
          }
        }
      }

      return {
        success: true,
        orders: savedOrders,
        message: `${orders?.length} orders sent to paper trading`
      };

    } catch (error) {
      console.error('Error sending to paper trading:', error);
      throw error;
    }
  }

  // Enhanced screening specifically for IA Strategies Brancher
  async runStrategiesBrancherScreening(parameters = {}) {
    try {
      // Advanced screening for large cap undervalued stocks with rebound potential
      const { data, error } = await supabase
        ?.from('ai_screening_results')
        ?.select(`
          *,
          assets:asset_id (
            symbol,
            name,
            sector,
            market_cap,
            exchange,
            currency
          ),
          fundamental_data:asset_id (
            pe_ratio,
            ev_ebitda,
            peg_ratio,
            gross_margin,
            operating_cash_flow,
            ma_50,
            ma_200,
            performance_3m,
            performance_6m,
            performance_12m
          )
        `)
        // Market cap > 50M CHF
        ?.gte('assets.market_cap', parameters?.minMarketCap || 50000000)
        // P/E Z-Score indicates undervaluation
        ?.lte('pe_zscore', parameters?.maxPEZScore || -0.3)
        // Good fundamental quality (ROE > 12%)
        ?.gte('roe', parameters?.minROE || 0.12)
        // Recent underperformance vs sector (opportunity)
        ?.lte('performance_vs_sector', parameters?.maxUnderperformance || -0.03)
        // Minimum composite score for quality filter
        ?.gte('composite_score', parameters?.minScore || 65)
        ?.eq('screening_status', 'completed')
        ?.order('composite_score', { ascending: false })
        ?.limit(25);

      if (error) {
        throw error;
      }

      return data?.map(result => ({
        symbol: result?.assets?.symbol,
        name: result?.assets?.name,
        sector: result?.assets?.sector,
        market_cap: result?.assets?.market_cap,
        exchange: result?.assets?.exchange,
        currency: result?.assets?.currency,
        composite_score: result?.composite_score,
        valuation_score: result?.valuation_score,
        quality_score: result?.quality_score,
        momentum_score: result?.momentum_score,
        pe_zscore: result?.pe_zscore,
        roe: result?.roe,
        roic: result?.roic,
        iv_rank: result?.iv_rank,
        performance_vs_sector: result?.performance_vs_sector,
        recommended_strategy: result?.recommended_strategy,
        // Fundamental data
        pe_ratio: result?.fundamental_data?.[0]?.pe_ratio,
        ev_ebitda: result?.fundamental_data?.[0]?.ev_ebitda,
        peg_ratio: result?.fundamental_data?.[0]?.peg_ratio,
        gross_margin: result?.fundamental_data?.[0]?.gross_margin,
        performance_3m: result?.fundamental_data?.[0]?.performance_3m,
        performance_12m: result?.fundamental_data?.[0]?.performance_12m,
        ma_trend: result?.fundamental_data?.[0]?.ma_50 > result?.fundamental_data?.[0]?.ma_200,
        // Analysis reason
        reason: `Sous-valorisation P/E (z=${(result?.pe_zscore)?.toFixed(1)}), ROE solide ${((result?.roe || 0) * 100)?.toFixed(1)}%, cap ${result?.assets?.market_cap >= 1000000000 ? `${(result?.assets?.market_cap / 1000000000)?.toFixed(1)}B` : `${Math.round(result?.assets?.market_cap / 1000000)}M`} CHF`,
        opportunity_type: 'value_rebound',
        risk_level: result?.composite_score >= 75 ? 'low' : result?.composite_score >= 65 ? 'medium' : 'high'
      })) || [];

    } catch (error) {
      console.error('Error running IA Strategies Brancher screening:', error);
      throw error;
    }
  }
}

export default new OptionsStrategyService();