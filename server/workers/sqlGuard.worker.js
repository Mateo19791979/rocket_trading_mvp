/* eslint-disable */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);

const INTERVAL_MS = Number(process.env?.SQL_GUARD_INTERVAL_MS || 10 * 60 * 1000); // 10 minutes default
const AUTO_REPAIR = String(process.env?.SQL_GUARD_AUTO_REPAIR || 'false')?.toLowerCase() === 'true';

/**
 * Run SQL Guard check once
 */
async function runOnce() {
  try {
    console.log('[SQL GUARD] Running schema check...');

    // Call the ensure_positions_is_active function from migration
    const { data, error } = await supa?.rpc('ensure_positions_is_active', { 
      do_repair: AUTO_REPAIR 
    });

    if (error) {
      console.error('[SQL GUARD] RPC error:', error?.message || error);
    } else {
      console.log('[SQL GUARD] Check result:', data);
    }

    // Additional checks can be added here
    await checkMarketTicksCache();

  } catch (e) {
    console.error('[SQL GUARD] Unhandled error:', e?.message || e);
  }
}

/**
 * Check market_ticks_cache table health
 */
async function checkMarketTicksCache() {
  try {
    const { data, error } = await supa?.from('market_ticks_cache')?.select('symbol')?.limit(1);

    if (error) {
      console.warn('[SQL GUARD] market_ticks_cache issue:', error?.message || error);
    } else {
      console.log('[SQL GUARD] market_ticks_cache: OK');
    }
  } catch (e) {
    console.warn('[SQL GUARD] market_ticks_cache check failed:', e?.message || e);
  }
}

/**
 * Start SQL Guard worker
 */
export async function startSqlGuard() {
  console.log(`[SQL GUARD] Worker started. Interval=${INTERVAL_MS}ms, AUTO_REPAIR=${AUTO_REPAIR}`);
  
  // Run immediately on startup
  await runOnce();
  
  // Set up recurring checks
  setInterval(runOnce, INTERVAL_MS);
}

// Entry point for direct execution via PM2
if (import.meta.url === `file://${process.argv?.[1]}`) {
  startSqlGuard()?.catch(error => {
    console.error('[SQL GUARD] FATAL startup error:', error?.message || error);
    process.exit(1);
  });
}