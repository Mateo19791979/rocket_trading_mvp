// backend/routes/marketData.routes.js - Proxy route for secure market data ingestion
import express from 'express';
import { createClient } from '@supabase/supabase-js';

export const md = express?.Router();

const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);

// Force JSON content-type for all responses
md?.use((req, res, next) => {
  res?.setHeader('content-type', 'application/json; charset=utf-8');
  next();
});

// Market data ingestion endpoint - uses secure RPC
md?.post('/ingest', async (req, res) => {
  try {
    const payload = req?.body;
    
    // Validate required fields
    if (!payload?.symbol || !payload?.ts) {
      return res?.status(400)?.json({ 
        ok: false, 
        error: 'symbol & ts required',
        received: Object.keys(payload || {}),
        timestamp: new Date()?.toISOString()
      });
    }

    // Normalize provider name
    if (payload?.source === 'polygon_io') {
      payload.source = 'polygon';
    }

    // Call secure upsert function
    const { error } = await supa?.rpc('secure_upsert_market_data', { 
      p_row: payload 
    });
    
    if (error) {
      return res?.status(200)?.json({ 
        ok: false, 
        error: String(error?.message || error),
        code: error?.code,
        timestamp: new Date()?.toISOString()
      });
    }

    return res?.status(200)?.json({ 
      ok: true,
      symbol: payload?.symbol,
      source: payload?.source,
      timestamp: new Date()?.toISOString()
    });
    
  } catch (e) {
    return res?.status(200)?.json({ 
      ok: false, 
      error: String(e?.message || e),
      timestamp: new Date()?.toISOString()
    });
  }
});

// Get latest market data with provider normalization
md?.get('/latest', async (req, res) => {
  try {
    const { symbol, provider } = req?.query;
    
    if (!symbol) {
      return res?.status(400)?.json({
        ok: false,
        error: 'symbol parameter required',
        timestamp: new Date()?.toISOString()
      });
    }

    // Normalize provider name for query
    const normalizedProvider = provider === 'polygon_io' ? 'polygon' : provider;

    let query = supa?.from('market_data')?.select('*')?.eq('symbol', symbol?.toString()?.toUpperCase())?.order('ts', { ascending: false })?.limit(1);

    if (normalizedProvider) {
      query = query?.eq('source', normalizedProvider);
    }

    const { data, error } = await query?.single();

    if (error) {
      return res?.status(200)?.json({
        ok: false,
        error: String(error?.message || error),
        code: error?.code,
        symbol,
        provider: normalizedProvider,
        timestamp: new Date()?.toISOString()
      });
    }

    return res?.status(200)?.json({
      ok: true,
      data,
      symbol,
      provider: normalizedProvider,
      timestamp: new Date()?.toISOString()
    });

  } catch (e) {
    return res?.status(200)?.json({
      ok: false,
      error: String(e?.message || e),
      timestamp: new Date()?.toISOString()
    });
  }
});

// Bulk market data retrieval
md?.post('/bulk', async (req, res) => {
  try {
    const { symbols, provider } = req?.body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return res?.status(400)?.json({
        ok: false,
        error: 'symbols array required',
        timestamp: new Date()?.toISOString()
      });
    }

    const normalizedProvider = provider === 'polygon_io' ? 'polygon' : provider;
    const upperSymbols = symbols?.map(s => s?.toString()?.toUpperCase());

    let query = supa?.from('market_data')?.select('*')?.in('symbol', upperSymbols)?.order('ts', { ascending: false });

    if (normalizedProvider) {
      query = query?.eq('source', normalizedProvider);
    }

    const { data, error } = await query;

    if (error) {
      return res?.status(200)?.json({
        ok: false,
        error: String(error?.message || error),
        code: error?.code,
        symbols: upperSymbols,
        provider: normalizedProvider,
        timestamp: new Date()?.toISOString()
      });
    }

    // Group by symbol to get latest for each
    const latestBySymbol = {};
    data?.forEach(row => {
      if (!latestBySymbol?.[row?.symbol] || new Date(row.ts) > new Date(latestBySymbol[row.symbol].ts)) {
        latestBySymbol[row.symbol] = row;
      }
    });

    return res?.status(200)?.json({
      ok: true,
      data: Object.values(latestBySymbol),
      count: Object.keys(latestBySymbol)?.length,
      requested: upperSymbols?.length,
      provider: normalizedProvider,
      timestamp: new Date()?.toISOString()
    });

  } catch (e) {
    return res?.status(200)?.json({
      ok: false,
      error: String(e?.message || e),
      timestamp: new Date()?.toISOString()
    });
  }
});

export default md;