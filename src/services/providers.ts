/**
 * Provider normalization utilities to prevent "Unknown data source" errors
 */

/**
 * Normalize provider names to consistent format
 * @param p - Provider name (may be undefined or inconsistent)
 * @returns Normalized provider name
 */
export function normalizeProvider(p?: string): string {
  if (!p) return 'unknown';

  const normalized = p.toLowerCase().trim();
  
  // Handle common variations
  if (normalized === 'polygon_io' || normalized === 'polygon-io') return 'polygon';
  if (normalized === 'alpha_vantage' || normalized === 'alpha-vantage') return 'alphavantage';
  if (normalized === 'yahoo_finance' || normalized === 'yahoo-finance') return 'yahoo';
  if (normalized === 'interactive_brokers' || normalized === 'interactive-brokers') return 'ibkr';
  if (normalized === 'finnhub_io' || normalized === 'finnhub-io') return 'finnhub';
  
  return normalized;
}

/**
 * Get provider display name for UI
 * @param provider - Normalized provider name
 * @returns Human-readable provider name
 */
export function getProviderDisplayName(provider: string): string {
  const displays: Record<string, string> = {
    'polygon': 'Polygon.io',
    'alphavantage': 'Alpha Vantage',
    'yahoo': 'Yahoo Finance',
    'ibkr': 'Interactive Brokers',
    'finnhub': 'Finnhub',
    'unknown': 'Unknown Source'
  };
  
  return displays[provider] || provider.charAt(0).toUpperCase() + provider.slice(1);
}

/**
 * Validate if provider is supported
 * @param provider - Provider name to validate
 * @returns true if provider is supported
 */
export function isProviderSupported(provider: string): boolean {
  const supported = ['polygon', 'alphavantage', 'yahoo', 'ibkr', 'finnhub'];
  return supported.includes(normalizeProvider(provider));
}

/**
 * Get provider configuration defaults
 * @param provider - Normalized provider name
 * @returns Provider configuration object
 */
export function getProviderConfig(provider: string) {
  const configs: Record<string, any> = {
    'polygon': {
      baseUrl: 'https://api.polygon.io',
      rateLimit: 5, // requests per minute for free tier
      requiresAuth: true
    },
    'alphavantage': {
      baseUrl: 'https://www.alphavantage.co',
      rateLimit: 5, // requests per minute for free tier
      requiresAuth: true
    },
    'yahoo': {
      baseUrl: 'https://query1.finance.yahoo.com',
      rateLimit: 2000, // higher limit, no auth required
      requiresAuth: false
    },
    'ibkr': {
      baseUrl: process.env.VITE_IBKR_API_BASE || 'http://localhost:5000',
      rateLimit: 50, // higher limit for local/paid service
      requiresAuth: true
    },
    'finnhub': {
      baseUrl: 'https://finnhub.io/api/v1',
      rateLimit: 60, // requests per minute for free tier
      requiresAuth: true
    }
  };
  
  return configs[provider] || {
    baseUrl: '',
    rateLimit: 1,
    requiresAuth: false
  };
}

/**
 * Format provider error for consistent handling
 * @param provider - Provider name
 * @param error - Error object or message
 * @returns Formatted error object
 */
export function formatProviderError(provider: string, error: any) {
  const displayName = getProviderDisplayName(provider);
  
  return {
    provider: normalizeProvider(provider),
    providerDisplay: displayName,
    message: String(error?.message || error || 'Unknown error'),
    timestamp: new Date().toISOString()
  };
}