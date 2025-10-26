/**
 * Market scheduler utilities for handling market hours and weekend closures
 * Prevents unnecessary API calls when markets are closed
 */

/**
 * Check if market is closed based on type and current time
 * @param kind - Market type: 'equity' for stock markets, 'crypto' for cryptocurrency
 * @returns true if market is currently closed
 */
export function isMarketClosedNow(kind: 'equity' | 'crypto'): boolean {
  if (kind === 'crypto') return false; // Crypto markets are 24/7

  const day = new Date().getUTCDay(); // 0=Sunday, 6=Saturday
  return day === 0 || day === 6; // Close equity markets on weekends
}

/**
 * Execute function only when market is open for the specified type
 * @param kind - Market type
 * @param fn - Function to execute when market is open
 */
export function onlyWhenOpen(kind: 'equity' | 'crypto', fn: () => void): void {
  if (!isMarketClosedNow(kind)) {
    fn();
  }
}

/**
 * Get market status information
 * @param kind - Market type
 * @returns Market status object
 */
export function getMarketStatus(kind: 'equity' | 'crypto') {
  const isClosed = isMarketClosedNow(kind);
  const now = new Date();
  
  return {
    kind,
    isClosed,
    isOpen: !isClosed,
    currentTime: now.toISOString(),
    nextOpenTime: kind === 'equity' && isClosed ? getNextMarketOpen() : null,
    reason: isClosed ? (kind === 'equity' ? 'Weekend closure' : 'Unknown') : 'Market hours'
  };
}

/**
 * Calculate next market open time for equity markets
 * @private
 */
function getNextMarketOpen(): string {
  const now = new Date();
  const day = now.getUTCDay();
  
  let nextOpen = new Date(now);
  
  if (day === 0) { // Sunday
    nextOpen.setUTCDate(now.getUTCDate() + 1); // Monday
  } else if (day === 6) { // Saturday  
    nextOpen.setUTCDate(now.getUTCDate() + 2); // Monday
  }
  
  // Set to market open time (approximate - 9:30 AM ET = 13:30 UTC, 14:30 UTC during DST)
  nextOpen.setUTCHours(13, 30, 0, 0);
  
  return nextOpen.toISOString();
}

/**
 * Create a scheduler that respects market hours
 * @param kind - Market type
 * @param intervalMs - Interval in milliseconds
 * @param callback - Function to call when market is open
 * @returns Cleanup function
 */
export function createMarketScheduler(
  kind: 'equity' | 'crypto',
  intervalMs: number,
  callback: () => void
): () => void {
  let intervalId: NodeJS.Timeout | null = null;
  let stopped = false;

  const tick = () => {
    if (stopped) return;
    
    if (!isMarketClosedNow(kind)) {
      try {
        callback();
      } catch (error) {
        console.error(`[Market Scheduler ${kind}] Callback error:`, error);
      }
    }
    
    if (!stopped) {
      intervalId = setTimeout(tick, intervalMs);
    }
  };

  // Start immediately
  tick();

  // Return cleanup function
  return () => {
    stopped = true;
    if (intervalId) {
      clearTimeout(intervalId);
      intervalId = null;
    }
  };
}