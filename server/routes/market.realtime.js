/* eslint-disable */
import express from 'express';
import { getFreshQuote, getAllFreshQuotes } from '../services/market/cacheRepo.js';

export const marketRealtime = express?.Router();

/**
 * GET /api/realtime/quote?symbol=AAPL
 * Get real-time quote for a specific symbol
 */
marketRealtime?.get('/quote', async (req, res) => {
  try {
    res?.set('content-type', 'application/json; charset=utf-8');
    
    const symbol = String(req?.query?.symbol || '')?.trim()?.toUpperCase();
    if (!symbol) {
      return res?.status(400)?.json({ 
        ok: false, 
        error: 'symbol required',
        hint: 'Provide symbol as query parameter: /quote?symbol=AAPL'
      });
    }

    const quote = await getFreshQuote(symbol);
    
    if (quote) {
      return res?.json({ 
        ok: true, 
        source: 'cache', 
        data: quote,
        age_ms: Date.now() - new Date(quote.ts)?.getTime()
      });
    }

    // No fresh cache -> return 202 (accepted but not available)
    return res?.status(202)?.json({ 
      ok: false, 
      error: 'stale_or_missing', 
      hint: 'No fresh cache available (age > CACHE_MAX_AGE_MS)',
      symbol: symbol
    });

  } catch (e) {
    console.error('[REALTIME API] Quote error:', e?.message || e);
    return res?.status(500)?.json({ 
      ok: false, 
      error: String(e?.message || e) 
    });
  }
});

/**
 * GET /api/realtime/quotes
 * Get all fresh quotes
 */
marketRealtime?.get('/quotes', async (req, res) => {
  try {
    res?.set('content-type', 'application/json; charset=utf-8');
    
    const quotes = await getAllFreshQuotes();
    
    return res?.json({
      ok: true,
      source: 'cache',
      data: quotes,
      count: quotes?.length
    });

  } catch (e) {
    console.error('[REALTIME API] Quotes error:', e?.message || e);
    return res?.status(500)?.json({ 
      ok: false, 
      error: String(e?.message || e) 
    });
  }
});

/**
 * GET /api/realtime/health
 * Health check for realtime API
 */
marketRealtime?.get('/health', (req, res) => {
  try {
    res?.set('content-type', 'application/json; charset=utf-8');
    
    res?.json({ 
      ok: true,
      service: 'market-realtime',
      cache_max_age_ms: Number(process.env?.CACHE_MAX_AGE_MS || 5000),
      feed_heartbeat_ms: Number(process.env?.FEED_HEARTBEAT_MS || 2000),
      feed_stall_ms: Number(process.env?.FEED_STALL_MS || 10000),
      timestamp: new Date()?.toISOString()
    });
  } catch (e) {
    return res?.status(500)?.json({ 
      ok: false, 
      error: String(e?.message || e) 
    });
  }
});

/**
 * POST /api/realtime/symbols
 * Update subscribed symbols (for testing/management)
 */
marketRealtime?.post('/symbols', async (req, res) => {
  try {
    res?.set('content-type', 'application/json; charset=utf-8');
    
    const { symbols } = req?.body;
    
    if (!Array.isArray(symbols)) {
      return res?.status(400)?.json({
        ok: false,
        error: 'symbols must be an array',
        example: { symbols: ['AAPL', 'MSFT', 'TSLA'] }
      });
    }

    // Note: This would integrate with the IBKR mux when available
    // For now, just acknowledge the request
    return res?.json({
      ok: true,
      message: 'Symbols updated (IBKR integration pending)',
      symbols: symbols?.map(s => s?.toUpperCase())
    });

  } catch (e) {
    console.error('[REALTIME API] Symbols update error:', e?.message || e);
    return res?.status(500)?.json({ 
      ok: false, 
      error: String(e?.message || e) 
    });
  }
});