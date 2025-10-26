/* eslint-disable */
import { createClient } from '@supabase/supabase-js';

const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_ANON_KEY);

/**
 * Fetch active positions with fallback for missing is_active column
 * This prevents crashes if the database schema is missing the is_active column
 */
export async function fetchActivePositionsSafe() {
  try {
    // Try to select with is_active column first
    const fields = 'id,symbol,quantity,price,pnl,is_active';
    let { data, error } = await supa?.from('positions')?.select(fields)?.order('id', { ascending: true });

    // If error contains is_active reference, it means column is missing
    if (error && /is_active/?.test(error?.message || '')) {
      console.warn('⚠️ positions.is_active column missing — using fallback without column');
      
      // Fallback: select without is_active column
      const fallbackFields = 'id,symbol,quantity,price,pnl';
      const fallbackResult = await supa?.from('positions')?.select(fallbackFields)?.order('id', { ascending: true });
      
      data = fallbackResult?.data || [];
      error = fallbackResult?.error;
      
      // Inject is_active=true by default for UI compatibility
      data = data?.map(record => ({ ...record, is_active: true }));
    }

    if (error) {
      console.error('[PORTFOLIO SERVICE] Database error:', error?.message || error);
      throw error;
    }

    return data || [];
    
  } catch (e) {
    console.error('[PORTFOLIO SERVICE] Fetch positions error:', e?.message || e);
    throw e;
  }
}

export async function fetchPortfolioBalance(userId) {
  try {
    const { data, error } = await supa?.from('user_profiles')?.select('balance,pnl')?.eq('id', userId)?.single();

    if (error) throw error;

    return {
      balance: data?.balance || 0,
      pnl: data?.pnl || 0,
      pnlPercentage: data?.balance ? (data?.pnl / data?.balance) * 100 : 0
    };
  } catch (error) {
    console.warn('Portfolio balance fetch failed:', error?.message);
    
    // Return safe defaults
    return {
      balance: 0,
      pnl: 0,
      pnlPercentage: 0,
      error: error?.message
    };
  }
}

// Safe positions fetch with comprehensive error handling
export async function fetchPositionsSafely(userId) {
  try {
    const positions = await fetchActivePositionsSafe();
    const balance = await fetchPortfolioBalance(userId);
    
    return {
      positions: positions?.filter(p => p?.quantity > 0),
      balance: balance?.balance,
      pnl: balance?.pnl,
      pnlPercentage: balance?.pnlPercentage,
      success: true
    };
  } catch (error) {
    console.warn('Portfolio data fetch failed:', error?.message);
    
    return {
      positions: [],
      balance: 0,
      pnl: 0,
      pnlPercentage: 0,
      success: false,
      error: error?.message
    };
  }
}