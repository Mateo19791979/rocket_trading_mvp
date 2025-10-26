// Enhanced Market Latest Route - Fixes polygon_io source normalization
import express from 'express';
import { getLatestFromPolygon, normalizeSource } from '../providers/polygon.js';

const router = express?.Router();

// Helper: Normalize provider names to prevent "Unknown data source" errors
function getProviderHandler(provider) {
  const normalized = normalizeSource(provider);
  
  switch (normalized) {
    case 'polygon':
      return getLatestFromPolygon;
    case 'alpha_vantage':
      return getLatestFromAlphaVantage; // Implement if needed
    case 'yahoo_finance':
      return getLatestFromYahoo; // Implement if needed
    default:
      return null;
  }
}

// Enhanced /api/market/latest endpoint with provider normalization
router?.get('/latest', async (req, res) => {
  const symbol = (req?.query?.symbol || 'AAPL')?.toString()?.toUpperCase();
  const provider = req?.query?.provider || 'polygon_io';
  const normalizedProvider = normalizeSource(provider);
  
  try {
    console.log(`📊 Market data request: ${symbol} from ${provider} (normalized: ${normalizedProvider})`);
    
    const providerHandler = getProviderHandler(normalizedProvider);
    
    if (!providerHandler) {
      // Instead of "Unknown data source" error, provide fallback
      console.warn(`⚠️ Unsupported provider: ${provider}, using fallback data`);
      
      return res?.json({
        ok: false,
        success: false,
        symbol,
        provider: normalizedProvider,
        error: `Provider '${provider}' not supported`,
        code: 'unsupported_provider',
        fallback: true,
        data: generateFallbackData(symbol),
        timestamp: new Date()?.toISOString()
      });
    }

    // Call the provider handler
    const result = await providerHandler(symbol, provider);
    
    if (!result?.ok) {
      // Provider returned an error - return structured response
      return res?.json({
        ok: false,
        success: false,
        symbol,
        provider: result?.provider || normalizedProvider,
        error: result?.msg || 'Provider error',
        code: result?.code || 'provider_error',
        timestamp: new Date()?.toISOString(),
        details: result
      });
    }

    // Success response
    return res?.json({
      ok: true,
      success: true,
      symbol,
      provider: result?.provider || normalizedProvider,
      data: result?.data,
      source: result?.source || 'api',
      timestamp: new Date()?.toISOString(),
      responseTimeMs: result?.responseTime || 0
    });

  } catch (error) {
    console.error(`❌ Market latest error for ${symbol}:`, error?.message);
    
    // Enhanced error response with fallback data
    return res?.json({
      ok: false,
      success: false,
      symbol,
      provider: normalizedProvider,
      error: 'Internal server error',
      code: 'server_error',
      fallback: true,
      data: generateFallbackData(symbol),
      timestamp: new Date()?.toISOString(),
      details: {
        message: error?.message,
        stack: error?.stack?.substring(0, 200)
      }
    });
  }
});

// Enhanced /api/health endpoint for network recovery
router?.get('/health', async (req, res) => {
  try {
    const healthCheck = {
      ok: true,
      status: 'healthy',
      timestamp: new Date()?.toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      providers: {
        polygon: !!process.env?.POLYGON_API_KEY,
        alpha_vantage: !!process.env?.ALPHA_VANTAGE_KEY,
        yahoo_finance: true // Usually doesn't require key
      }
    };

    // Quick provider connectivity test
    try {
      const testResult = await getLatestFromPolygon('AAPL');
      healthCheck.providers.polygon_status = testResult?.ok ? 'online' : 'degraded';
      healthCheck.providers.polygon_message = testResult?.msg || 'OK';
    } catch (providerError) {
      healthCheck.providers.polygon_status = 'offline';
      healthCheck.providers.polygon_message = providerError?.message;
    }

    return res?.json(healthCheck);

  } catch (error) {
    return res?.status(500)?.json({
      ok: false,
      status: 'error',
      error: error?.message,
      timestamp: new Date()?.toISOString()
    });
  }
});

// Helper: Generate fallback market data when providers fail
function generateFallbackData(symbol) {
  const basePrice = {
    'AAPL': 175.43,
    'GOOGL': 138.21,
    'MSFT': 378.85,
    'AMZN': 145.86,
    'TSLA': 248.50
  }?.[symbol] || (100 + Math.random() * 200);

  const change = (Math.random() - 0.5) * 10;
  const changePercent = (change / basePrice) * 100;

  return {
    symbol,
    timestamp: new Date()?.toISOString(),
    open: Math.round((basePrice - change * 0.5) * 100) / 100,
    high: Math.round((basePrice + Math.abs(change * 0.3)) * 100) / 100,
    low: Math.round((basePrice - Math.abs(change * 0.8)) * 100) / 100,
    close: Math.round(basePrice * 100) / 100,
    volume: Math.floor(Math.random() * 5000000),
    previousClose: Math.round((basePrice - change) * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    source: 'fallback',
    note: 'Synthetic data - provider unavailable'
  };
}

// Placeholder functions for other providers
async function getLatestFromAlphaVantage(symbol, provider) {
  return {
    ok: false,
    code: 'not_implemented',
    msg: 'Alpha Vantage provider not yet implemented',
    provider: 'alpha_vantage'
  };
}

async function getLatestFromYahoo(symbol, provider) {
  return {
    ok: false,
    code: 'not_implemented', 
    msg: 'Yahoo Finance provider not yet implemented',
    provider: 'yahoo_finance'
  };
}

export default router;