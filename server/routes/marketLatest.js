import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { getLatestFromPolygon } from '../providers/polygon.js';

const router = express?.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env?.SUPABASE_URL,
  process.env?.SUPABASE_SERVICE_KEY
);

// Helper function to normalize provider names
function normalizeProvider(provider) {
  const normalized = (provider || '')?.toLowerCase()?.trim();
  switch (normalized) {
    case 'polygon_io': case'polygonio':
      return 'polygon';
    case 'alpha_vantage': case'alphavantage':
      return 'alpha_vantage';
    case 'yahoo_finance': case'yahoofinance':
      return 'yahoo';
    case 'finnhub_io': case'finnhub':
      return 'finnhub';
    default:
      return normalized || 'unknown';
  }
}

// GET /api/market/latest - Get latest market data
router?.get('/latest', async (req, res) => {
  try {
    const symbol = (req?.query?.symbol || 'AAPL')?.toString()?.toUpperCase();
    const provider = normalizeProvider(req?.query?.provider || 'polygon');

    console.log(`Fetching market data for ${symbol} from ${provider}`);

    // First try to get from database (recent data)
    const { data: existingData, error: dbError } = await supabase?.from('market_data')?.select('*')?.eq('symbol', symbol)?.eq('source', provider)?.order('ts', { ascending: false })?.limit(1)?.maybeSingle();

    // If we have recent data (within last 5 minutes), return it
    if (existingData && !dbError) {
      const dataAge = Date.now() - new Date(existingData.ts)?.getTime();
      if (dataAge < 5 * 60 * 1000) { // 5 minutes
        return res?.json({
          ok: true,
          source: provider,
          symbol,
          data: {
            price: existingData?.price,
            timestamp: existingData?.ts,
            source: existingData?.source,
            response_time_ms: existingData?.response_time_ms
          },
          cached: true,
          age_ms: dataAge
        });
      }
    }

    // Fetch fresh data from provider
    let providerResult;
    
    switch (provider) {
      case 'polygon':
        providerResult = await getLatestFromPolygon(symbol);
        break;
      case 'alpha_vantage':
        providerResult = { ok: false, code: 'provider_not_implemented', message: 'Alpha Vantage provider not yet implemented' };
        break;
      case 'yahoo':
        providerResult = { ok: false, code: 'provider_not_implemented', message: 'Yahoo Finance provider not yet implemented' };
        break;
      default:
        providerResult = { ok: false, code: 'unknown_provider', message: `Provider '${provider}' not supported` };
    }

    if (!providerResult?.ok) {
      // Return graceful error response instead of throwing
      return res?.status(200)?.json({
        ok: false,
        source: provider,
        symbol,
        error: providerResult?.code,
        message: providerResult?.message,
        detail: providerResult?.detail,
        response_time_ms: providerResult?.responseTime
      });
    }

    // Store fresh data in database
    const { error: insertError } = await supabase?.from('market_data')?.insert({
        symbol,
        price: providerResult?.data?.price,
        source: provider,
        response_time_ms: providerResult?.responseTime,
        meta: {
          raw_data: providerResult?.raw,
          open: providerResult?.data?.open,
          high: providerResult?.data?.high,
          low: providerResult?.data?.low,
          volume: providerResult?.data?.volume
        }
      });

    if (insertError) {
      console.warn('Failed to store market data in database:', insertError?.message);
    }

    // Return successful response
    return res?.json({
      ok: true,
      source: provider,
      symbol,
      data: providerResult?.data,
      response_time_ms: providerResult?.responseTime,
      cached: false
    });

  } catch (error) {
    console.error('Market data API error:', error);
    
    return res?.status(500)?.json({
      ok: false,
      error: 'internal_server_error',
      message: 'Failed to fetch market data',
      detail: error?.message
    });
  }
});

// GET /api/market/providers - List available providers
router?.get('/providers', (req, res) => {
  res?.json({
    providers: [
      {
        name: 'polygon',
        display_name: 'Polygon.io',
        status: process.env?.POLYGON_API_KEY ? 'configured' : 'missing_api_key',
        description: 'Real-time and historical market data'
      },
      {
        name: 'alpha_vantage',
        display_name: 'Alpha Vantage',
        status: 'not_implemented',
        description: 'Stock market data and indicators'
      },
      {
        name: 'yahoo',
        display_name: 'Yahoo Finance',
        status: 'not_implemented',
        description: 'Free stock market data'
      }
    ]
  });
});

// POST /api/market - Insert market data manually (for testing)
router?.post('/', async (req, res) => {
  try {
    const { symbol, price, source, responseTimeMs, meta } = req?.body;
    
    if (!symbol || price == null) {
      return res?.status(400)?.json({
        ok: false,
        error: 'missing_required_fields',
        message: 'symbol and price are required'
      });
    }

    const { data, error } = await supabase?.from('market_data')?.insert({
        symbol: symbol?.toUpperCase(),
        price: Number(price),
        source: normalizeProvider(source || 'manual'),
        response_time_ms: Number.isFinite(responseTimeMs) ? Math.floor(responseTimeMs) : null,
        meta: meta || null
      })?.select()?.single();

    if (error) {
      throw error;
    }

    return res?.json({
      ok: true,
      data,
      message: 'Market data inserted successfully'
    });

  } catch (error) {
    console.error('Failed to insert market data:', error);
    
    return res?.status(500)?.json({
      ok: false,
      error: 'insert_failed',
      message: 'Failed to insert market data',
      detail: error?.message
    });
  }
});

export default router;