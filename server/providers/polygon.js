import fetch from 'node-fetch';

// Polygon.io provider with enhanced error handling
export async function getLatestFromPolygon(symbol) {
  const apiKey = process.env?.POLYGON_API_KEY;
  
  if (!apiKey) {
    return { 
      ok: false, 
      code: 'provider_not_configured', 
      provider: 'polygon_io',
      message: 'POLYGON_API_KEY is missing in environment variables'
    };
  }

  const startTime = performance.now();

  try {
    // Use previous day's data endpoint for reliability
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TradingMVP/1.0'
      },
      timeout: 10000
    });

    const responseTime = Math.round(performance.now() - startTime);

    if (!response?.ok) {
      const errorText = await response?.text();
      return { 
        ok: false, 
        code: 'provider_http_error', 
        provider: 'polygon_io',
        status: response?.status,
        message: `Polygon API error: ${response?.status} ${response?.statusText}`,
        detail: errorText,
        responseTime
      };
    }

    const data = await response?.json();
    
    // Handle Polygon API response structure
    if (data?.status !== 'OK' || !data?.results || data?.results?.length === 0) {
      return { 
        ok: false, 
        code: 'no_data', 
        provider: 'polygon_io',
        message: 'No market data available for this symbol',
        responseTime
      };
    }

    const result = data?.results?.[0];
    
    return { 
      ok: true, 
      provider: 'polygon_io',
      symbol,
      data: {
        price: result?.c, // closing price
        open: result?.o,
        high: result?.h,
        low: result?.l,
        volume: result?.v,
        timestamp: new Date(result.t)?.toISOString(),
        source: 'polygon_io'
      },
      raw: data,
      responseTime
    };

  } catch (error) {
    const responseTime = Math.round(performance.now() - startTime);
    
    if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
      return { 
        ok: false, 
        code: 'timeout', 
        provider: 'polygon_io',
        message: 'Request timeout - Polygon API may be slow',
        responseTime
      };
    }

    return { 
      ok: false, 
      code: 'network_error', 
      provider: 'polygon_io',
      message: `Network error: ${error?.message}`,
      responseTime
    };
  }
}

// Alternative real-time quotes endpoint
export async function getRealTimeQuote(symbol) {
  const apiKey = process.env?.POLYGON_API_KEY;
  
  if (!apiKey) {
    return { 
      ok: false, 
      code: 'provider_not_configured',
      message: 'POLYGON_API_KEY is missing'
    };
  }

  try {
    const url = `https://api.polygon.io/v2/last/trade/${symbol}?apikey=${apiKey}`;
    
    const response = await fetch(url, {
      timeout: 8000,
      headers: { 'Accept': 'application/json' }
    });

    if (!response?.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response?.json();
    
    if (data?.status !== 'OK' || !data?.results) {
      return { 
        ok: false, 
        code: 'no_data',
        message: 'No real-time data available'
      };
    }

    return { 
      ok: true, 
      provider: 'polygon_io',
      symbol,
      data: {
        price: data?.results?.p,
        size: data?.results?.s,
        timestamp: new Date(data.results.t / 1000000)?.toISOString(), // Convert from nanoseconds
        source: 'polygon_io_realtime'
      },
      raw: data
    };

  } catch (error) {
    return { 
      ok: false, 
      code: 'error',
      message: error?.message
    };
  }
}

export default { getLatestFromPolygon, getRealTimeQuote };