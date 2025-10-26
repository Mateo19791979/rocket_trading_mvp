// Enhanced fetchJson utility with content-type control, timeouts, backoff
type BackoffOpts = { 
  attempts?: number; 
  baseMs?: number; 
  timeoutMs?: number; 
  signal?: AbortSignal;
  enableWeekendGate?: boolean;
};

export async function fetchJson(url: string, init: RequestInit = {}, opts: BackoffOpts = {}) {
  const attempts = Math.max(1, opts.attempts ?? 3);
  const baseMs = opts.baseMs ?? 300;
  const timeout = opts.timeoutMs ?? 3000;
  let lastErr: any;

  // Weekend gate check
  if (opts.enableWeekendGate && isWeekendUTC()) {
    console.info('Weekend gate active - skipping network request for closed markets');
    return { 
      ok: false, 
      status: 503, 
      error: 'MARKET_CLOSED', 
      text: 'Markets are closed during weekends' 
    };
  }

  for (let i = 0; i < attempts; i++) {
    const ctl = new AbortController();
    const timeoutId = setTimeout(() => ctl.abort(new Error('timeout')), timeout);

    try {
      const response = await fetch(url, {
        ...init,
        signal: init.signal ?? ctl.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(init.headers || {})
        }
      });

      clearTimeout(timeoutId);

      const contentType = (response.headers.get('content-type') || '').toLowerCase();
      if (!contentType.startsWith('application/json')) {
        const text = await response.text();
        return { 
          ok: false, 
          status: response.status, 
          error: 'NOT_JSON', 
          text,
          contentType 
        };
      }

      const json = await response.json();
      return { 
        ok: response.ok, 
        status: response.status, 
        data: json 
      };

    } catch (e: any) {
      clearTimeout(timeoutId);
      lastErr = e;

      // Enhanced error categorization
      if (e.name === 'AbortError' || e.message?.includes('timeout')) {
        lastErr.category = 'timeout';
      } else if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
        lastErr.category = 'network';
      } else {
        lastErr.category = 'unknown';
      }

      // Progressive backoff with jitter
      if (i < attempts - 1) {
        const wait = baseMs * Math.pow(2, i) + Math.random() * 100;
        await new Promise(resolve => setTimeout(resolve, wait));
      }
    }
  }

  return { 
    ok: false, 
    status: 0, 
    error: String(lastErr?.message || lastErr || 'fetch_failed'),
    category: lastErr?.category || 'unknown',
    attempts
  };
}

// Helper function for weekend detection
function isWeekendUTC(d = new Date()): boolean {
  const day = d.getUTCDay(); // 0 = Sun, 6 = Sat
  return day === 0 || day === 6;
}

// Enhanced fetch with automatic retry and weekend awareness
export async function fetchWithRetry(url: string, options: RequestInit = {}, retryOptions: BackoffOpts = {}) {
  return fetchJson(url, options, {
    attempts: 3,
    baseMs: 500,
    timeoutMs: 5000,
    enableWeekendGate: true,
    ...retryOptions
  });
}

export { isWeekendUTC };