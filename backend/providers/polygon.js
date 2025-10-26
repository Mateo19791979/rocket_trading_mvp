// Enhanced Polygon API Provider - Fixes "Unknown data source: polygon_io" error
import fetch from 'node-fetch';

// Normalize provider names to prevent "Unknown data source" errors
function normalizeSource(src) {
  const s = (src || '')?.toLowerCase();
  if (s === 'polygon_io' || s === 'polygonio' || s === 'polygon.io') {
    return 'polygon';
  }
  return s;
}

export async function getLatestFromPolygon(symbol, sourceParam = 'polygon_io') {
  const normalizedSource = normalizeSource(sourceParam);
  
  try {
    const key = process.env?.POLYGON_API_KEY;
    if (!key) {
      return { 
        ok: false, 
        code: 'provider_not_configured', 
        msg: 'POLYGON_API_KEY is missing',
        provider: normalizedSource
      };
    }

    // Enhanced API endpoint with better error handling
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol?.toUpperCase()}/prev?adjusted=true&apiKey=${key}`;
    
    console.log(`🔄 Fetching ${symbol} from Polygon API...`);
    
    // Add this block - declare startTime variable
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
        'User-Agent': 'TradingMVP/1.0',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    if (!response?.ok) {
      const errorText = await response?.text()?.catch(() => 'Unknown error');
      return { 
        ok: false, 
        code: 'provider_http_error', 
        status: response?.status,
        msg: `Polygon API error: ${response?.status} - ${errorText}`,
        provider: normalizedSource
      };
    }

    const data = await response?.json();

    // Validate response structure
    if (!data || !data?.results || data?.results?.length === 0) {
      return {
        ok: false,
        code: 'no_data',
        msg: `No market data available for ${symbol}`,
        provider: normalizedSource,
        raw: data
      };
    }

    // Transform Polygon response to standard format
    const result = data?.results?.[0];
    const transformedData = {
      symbol: symbol?.toUpperCase(),
      timestamp: new Date(result.t)?.toISOString(),
      open: result?.o,
      high: result?.h,
      low: result?.l,
      close: result?.c,
      volume: result?.v,
      vwap: result?.vw || null,
      transactions: result?.n || null,
      previousClose: data?.adjusted || result?.c,
      change: null, // Calculate if needed
      changePercent: null // Calculate if needed
    };

    // Calculate change if we have previous close
    if (transformedData?.previousClose && transformedData?.close) {
      transformedData.change = transformedData?.close - transformedData?.previousClose;
      transformedData.changePercent = (transformedData?.change / transformedData?.previousClose) * 100;
    }

    console.log(`✅ Successfully fetched ${symbol} from Polygon`);

    return { 
      ok: true, 
      provider: normalizedSource,
      data: transformedData,
      raw: data,
      source: 'polygon_api',
      responseTime: Date.now() - startTime
    };

  } catch (error) {
    console.error(`❌ Polygon API error for ${symbol}:`, error?.message);
    
    // Enhanced error classification
    let errorCode = 'unknown_error';
    let errorMessage = error?.message;

    if (error?.code === 'ENOTFOUND' || error?.code === 'EAI_AGAIN') {
      errorCode = 'network_error';
      errorMessage = 'DNS resolution failed - check internet connection';
    } else if (error?.code === 'ECONNREFUSED') {
      errorCode = 'connection_refused';
      errorMessage = 'Connection refused by Polygon API';
    } else if (error?.code === 'ETIMEDOUT' || error?.message?.includes('timeout')) {
      errorCode = 'timeout_error';
      errorMessage = 'Polygon API request timeout';
    } else if (error?.name === 'AbortError') {
      errorCode = 'request_aborted';
      errorMessage = 'Request was cancelled or aborted';
    }

    return { 
      ok: false, 
      code: errorCode,
      msg: `Polygon provider error: ${errorMessage}`,
      provider: normalizedSource,
      error: error?.message
    };
  }
}

// Enhanced market data endpoint handler
export async function handlePolygonRequest(req, res) {
  const symbol = (req?.query?.symbol || req?.params?.symbol || 'AAPL')?.toString()?.toUpperCase();
  const provider = req?.query?.provider || 'polygon_io';
  
  try {
    const result = await getLatestFromPolygon(symbol, provider);
    
    if (!result?.ok) {
      // Return structured error response instead of throwing
      return res?.status(200)?.json({ 
        ok: false, 
        success: false,
        symbol,
        provider: result?.provider,
        error: result?.msg,
        code: result?.code,
        timestamp: new Date()?.toISOString()
      });
    }

    return res?.json({ 
      ok: true, 
      success: true,
      symbol,
      provider: result?.provider,
      data: result?.data,
      source: 'polygon',
      timestamp: new Date()?.toISOString(),
      responseTime: result?.responseTime
    });

  } catch (error) {
    console.error(`Polygon request handler error:`, error);
    
    return res?.status(200)?.json({ 
      ok: false, 
      success: false,
      symbol,
      provider: normalizeSource(provider),
      error: 'Internal server error processing Polygon request',
      code: 'handler_error',
      timestamp: new Date()?.toISOString()
    });
  }
}

export default {
  getLatestFromPolygon,
  handlePolygonRequest,
  normalizeSource
};
export { normalizeSource };