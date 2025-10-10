import express from 'express';
import { providerRouterService } from '../services/providerRouterService.js';
import ProviderRouter from '../lib/providerRouter';

const router = express?.Router();
let providerRouter = null;

// Initialize provider router
async function initializeProviderRouter() {
  if (!providerRouter) {
    try {
      providerRouter = new ProviderRouter('./providers.yaml');
      await providerRouter?.initialize();
      console.log('✅ Provider router initialized for API routes');
    } catch (error) {
      console.error('❌ Provider router initialization failed:', error?.message);
      throw error;
    }
  }
  return providerRouter;
}

// Middleware to ensure provider router is initialized
const ensureProviderRouter = async (req, res, next) => {
  try {
    if (!providerRouter) {
      await initializeProviderRouter();
    }
    req.providerRouter = providerRouter;
    next();
  } catch (error) {
    res?.status(503)?.json({
      success: false,
      error: 'provider_router_unavailable',
      message: 'Provider router is not available',
      timestamp: new Date()?.toISOString()
    });
  }
};

// Apply middleware to all routes
router?.use(ensureProviderRouter);

// POST /providers/keys - Set provider API keys
router?.post('/keys', async (req, res) => {
  try {
    const keys = req?.body;
    
    if (!keys || typeof keys !== 'object') {
      return res?.status(400)?.json({
        success: false,
        error: 'invalid_request_body',
        message: 'Request body must contain API keys object',
        timestamp: new Date()?.toISOString()
      });
    }

    const result = await providerRouterService?.updateKeys?.(keys);
    
    res?.json({
      success: true,
      message: 'API keys updated successfully',
      timestamp: new Date()?.toISOString()
    });

  } catch (error) {
    res?.status(500)?.json({
      success: false,
      error: 'keys_update_failed',
      message: error?.message,
      timestamp: new Date()?.toISOString()
    });
  }
});

// Enhanced quotes endpoint with Supabase integration
router?.get('/quotes', async (req, res) => {
  try {
    const { symbols, asset = 'equity', market = 'US', src = 'auto' } = req?.query;
    
    if (!symbols) {
      return res?.status(400)?.json({
        success: false,
        error: 'missing_symbols',
        message: 'Symbols parameter is required',
        timestamp: new Date()?.toISOString()
      });
    }

    const symbolList = symbols?.split(',')?.map(s => s?.trim()?.toUpperCase());
    const result = await providerRouterService?.getQuotes?.(symbolList);
    
    res?.json(result);

  } catch (error) {
    res?.status(500)?.json({
      success: false,
      error: 'quotes_request_failed',
      message: error?.message,
      timestamp: new Date()?.toISOString()
    });
  }
});

// GET /providers/history - Get historical data
router?.get('/history', async (req, res) => {
  try {
    const { symbol, range = '1d', asset = 'equity', src = 'auto' } = req?.query;
    
    if (!symbol) {
      return res?.status(400)?.json({
        success: false,
        error: 'missing_symbol',
        message: 'Symbol parameter is required',
        timestamp: new Date()?.toISOString()
      });
    }

    // Map range to provider-specific parameters
    let period, interval;
    switch (range) {
      case '1d':
        period = '1day';
        interval = '5min';
        break;
      case '5d':
        period = '5day';
        interval = '15min';
        break;
      case '1m':
        period = '1month';
        interval = '1hour';
        break;
      case '6m':
        period = '6month';
        interval = '1day';
        break;
      case '1y':
        period = '1year';
        interval = '1day';
        break;
      default:
        period = '1day';
        interval = '5min';
    }

    let endpoint = `/history?symbol=${symbol}&period=${period}&interval=${interval}`;
    
    const result = await req?.providerRouter?.requestWithFallback(endpoint, {
      asset,
      market: 'US', // Default to US market
      method: 'GET'
    });

    res?.json({
      success: true,
      symbol: symbol?.toUpperCase(),
      range,
      data: result?.data?.prices || result?.data || [],
      provider_used: result?.provider_used,
      latency_ms: result?.latency_ms,
      timestamp: new Date()?.toISOString()
    });

  } catch (error) {
    res?.status(500)?.json({
      success: false,
      error: 'history_request_failed',
      message: error?.message,
      timestamp: new Date()?.toISOString()
    });
  }
});

// Enhanced health endpoint with Supabase integration
router?.get('/health', async (req, res) => {
  try {
    const healthStatus = await providerRouterService?.providersHealth?.();
    
    const statusCode = healthStatus?.ok ? 200 : 503;
    res?.status(statusCode)?.json(healthStatus);

  } catch (error) {
    res?.status(500)?.json({
      success: false,
      error: 'health_check_failed',
      message: error?.message,
      timestamp: new Date()?.toISOString()
    });
  }
});

// GET /providers/config - Provider configuration
router?.get('/config', async (req, res) => {
  try {
    const configuration = req?.providerRouter?.getConfiguration();
    
    res?.json({
      success: true,
      ...configuration
    });

  } catch (error) {
    res?.status(500)?.json({
      success: false,
      error: 'config_request_failed',
      message: error?.message,
      timestamp: new Date()?.toISOString()
    });
  }
});

// POST /providers/test - Test specific provider
router?.post('/test', async (req, res) => {
  try {
    const { provider_name, symbol = 'AAPL' } = req?.body;
    
    if (!provider_name) {
      return res?.status(400)?.json({
        success: false,
        error: 'missing_provider_name',
        message: 'Provider name is required',
        timestamp: new Date()?.toISOString()
      });
    }

    // Force use of specific provider
    let endpoint = `/quote?symbol=${symbol}`;
    const startTime = Date.now();
    
    try {
      const result = await req?.providerRouter?.requestWithFallback(endpoint, {
        asset: 'equity',
        market: 'US',
        method: 'GET'
      });

      res?.json({
        success: true,
        provider_name,
        symbol,
        test_result: 'success',
        response_time_ms: Date.now() - startTime,
        data: result?.data,
        provider_used: result?.provider_used,
        timestamp: new Date()?.toISOString()
      });

    } catch (error) {
      res?.json({
        success: false,
        provider_name,
        symbol,
        test_result: 'failed',
        error: error?.message,
        response_time_ms: Date.now() - startTime,
        timestamp: new Date()?.toISOString()
      });
    }

  } catch (error) {
    res?.status(500)?.json({
      success: false,
      error: 'provider_test_failed',
      message: error?.message,
      timestamp: new Date()?.toISOString()
    });
  }
});

export default router;
export function fetchQuoteUpstream(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: fetchQuoteUpstream is not implemented yet.', args);
  return null;
}
