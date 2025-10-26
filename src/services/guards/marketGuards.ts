// src/services/guards/marketGuards.ts
import { isEquitiesMarketClosed } from '@/lib/market/utils';

/** Empêche les appels "equities live" quand le marché est fermé */
export function assertEquitiesOpenOrThrow() {
  if (isEquitiesMarketClosed()) {
    const e = new Error('MARKET_CLOSED');
    (e as any).code = 'MARKET_CLOSED';
    throw e;
  }
}

/** Helper: ignorer gentiment si marché fermé */
export async function skipIfClosed<T>(fn: () => Promise<T>): Promise<T | null> {
  if (isEquitiesMarketClosed()) return null as any;
  return fn();
}