// src/utils/sslSecurity.ts
type EnforceHttpsOpts = {
  enabled?: boolean;
  domains?: string[];     // ex: ['trading-mvp.com']
  excludeHosts?: string[]; // ex: ['localhost', '127.0.0.1', 'rockettra3991.builtwithrocket.new']
};

export function enforceHttps(opts: EnforceHttpsOpts = {}) {
  if (typeof window === 'undefined') return;

  const {
    enabled = true,
    domains = [],
    excludeHosts = ['localhost', '127.0.0.1', '0.0.0.0', 'rockettra3991.builtwithrocket.new'],
  } = opts;

  const host = window.location.hostname;
  const isExcluded = excludeHosts.includes(host);
  const domainAllowed = domains.length === 0 || domains.includes(host);

  if (!enabled || isExcluded || !domainAllowed) return;

  const isHttps = window.location.protocol === 'https:';
  if (!isHttps) {
    const { host, pathname, search, hash } = window.location;
    const target = `https://${host}${pathname}${search}${hash}`;
    window.location.replace(target);
  }
}

// petite surface de debug si besoin dans la console
// (évite ReferenceError si quelqu'un tente d'appeler sslSecurity)
declare global {
  interface Window { __sslSecurity?: any }
}
if (typeof window !== 'undefined') {
  window.__sslSecurity = { enforceHttps };
}

export default enforceHttps;