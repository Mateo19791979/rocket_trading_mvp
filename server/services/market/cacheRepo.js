/* eslint-disable */
import { createClient } from '@supabase/supabase-js';

const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);
const MAX_AGE = Number(process.env?.CACHE_MAX_AGE_MS || 5000);

/**
 * Upsert market tick data into cache
 * @param {Object} tick - Tick data
 * @param {string} tick.symbol - Symbol name
 * @param {number} [tick.bid] - Bid price
 * @param {number} [tick.ask] - Ask price  
 * @param {number} [tick.last] - Last price
 * @param {number} [tick.volume] - Volume
 * @param {string} [tick.source] - Data source
 */
export async function upsertTick({ symbol, bid = null, ask = null, last = null, volume = null, source = 'ibkr' }) {
  if (!symbol) return;

  const { error } = await supa?.from('market_ticks_cache')?.upsert({
    symbol, 
    bid, 
    ask, 
    last, 
    volume, 
    source, 
    ts: new Date()?.toISOString()
  }, { onConflict: 'symbol' });

  if (error) {
    console.warn('[CACHE REPO] Error upserting tick:', error?.message || error);
  }
}

/**
 * Get fresh quote from cache if within MAX_AGE
 * @param {string} symbol - Symbol to lookup
 * @returns {Object|null} Fresh quote data or null
 */
export async function getFreshQuote(symbol) {
  if (!symbol) return null;

  const { data, error } = await supa?.from('market_ticks_cache')?.select('*')?.eq('symbol', symbol?.toUpperCase())?.single();

  if (error || !data?.ts) return null;

  const age = Date.now() - new Date(data.ts)?.getTime();
  if (age <= MAX_AGE) return data;

  return null;
}

/**
 * Get all fresh quotes from cache
 * @returns {Array} Array of fresh quotes
 */
export async function getAllFreshQuotes() {
  const { data, error } = await supa?.from('market_ticks_fresh')?.select('*')?.order('ts', { ascending: false });

  if (error) {
    console.warn('[CACHE REPO] Error fetching fresh quotes:', error?.message || error);
    return [];
  }

  return data || [];
}

/**
 * Cleanup old cache entries
 * @param {number} [maxAgeHours=24] - Maximum age in hours
 */
export async function cleanupOldCache(maxAgeHours = 24) {
  const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000))?.toISOString();
  
  const { error } = await supa?.from('market_ticks_cache')?.delete()?.lt('ts', cutoffTime);

  if (error) {
    console.warn('[CACHE REPO] Error cleaning up old cache:', error?.message || error);
  }
}