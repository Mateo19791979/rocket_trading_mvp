// Market calendar (Weekend gate simple) + provider normalization

export const MARKET_TZ = 'America/New_York'; // pour extension future

// Jours fériés de base (exemples US); à enrichir si besoin
const HOLIDAYS_YYYY = (year: number) => new Set<string>([
  `${year}-01-01`, // New Year
  `${year}-07-04`, // Independence Day
  `${year}-12-25`, // Christmas
]);

export function isWeekend(d = new Date()): boolean {
  const day = d.getUTCDay(); // 0=Sun,6=Sat
  return day === 0 || day === 6;
}

export function isHoliday(d = new Date()): boolean {
  const y = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return HOLIDAYS_YYYY(y).has(`${y}-${mm}-${dd}`);
}

/**
 * Marché US ouvert ? (heuristique simple : 14:30-21:00 UTC ≈ 9:30-16:00 ET hors DST exact)
 * NOTE: on simplifie volontairement; si besoin on branchera une lib "trading-hours".
 */
export function isUsEquitiesSessionNow(d = new Date()): boolean {
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const minutes = h * 60 + m;
  const open = 14 * 60 + 30; // 14:30 UTC
  const close = 21 * 60;     // 21:00 UTC
  return minutes >= open && minutes < close;
}

/** Flag global : marché actions fermé */
export function isEquitiesMarketClosed(now = new Date()): boolean {
  if (import.meta.env.VITE_FORCE_MARKET_CLOSED === '1') return true;
  if (import.meta.env.VITE_FORCE_MARKET_OPEN === '1') return false;
  return isWeekend(now) || isHoliday(now) || !isUsEquitiesSessionNow(now);
}

/** Autoriser crypto/FX 24/7 si activés */
export function isCryptoFxAllowed(): boolean {
  return import.meta.env.VITE_ENABLE_CRYPTO_FX === '1';
}

export function isWeekendUTC(d = new Date()){
  const day = d.getUTCDay(); // 0 = Sun, 6 = Sat
  return day===0 || day===6;
}

const PROVIDER_MAP: Record<string,string> = {
  'polygon_io': 'polygon',
  'ib': 'ibkr',
  'ibkr': 'ibkr',
  'google_finance': 'google'
};

export function normalizeProvider(name?: string){
  if (!name) return 'unknown';
  const k = name.toLowerCase().trim();
  return PROVIDER_MAP[k] || k;
}