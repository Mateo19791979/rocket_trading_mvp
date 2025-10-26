/**
 * 🚀 Enhanced fetchJSON - Stabilisation Chirurgicale
 * Prevents ALL HTML/JSON errors with robust content-type validation
 */
export async function fetchJSON(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, { 
    ...init, 
    headers: { 
      'accept': 'application/json', 
      ...(init?.headers || {}) 
    },
    cache: 'no-store' // Prevent caching issues
  });
  
  const ct = res.headers.get('content-type') || '';
  
  // Enhanced content-type validation
  if (!ct.includes('application/json')) {
    const sample = await res.text().catch(() => '');
    throw new Error(`Expected JSON, got: ${ct} — sample: ${sample.slice(0,120)}`);
  }
  
  // Enhanced error handling
  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status} — ${txt}`);
  }
  
  return res.json();
}

// Export for compatibility
export default fetchJSON;