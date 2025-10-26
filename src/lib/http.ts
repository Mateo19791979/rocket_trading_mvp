/**
 * Enhanced fetch wrapper that guarantees JSON responses
 * Prevents "Not JSON" errors by validating content-type headers
 */
export async function fetchJSON(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, {
    ...init,
    headers: { accept: 'application/json', ...(init?.headers || {}) },
    cache: init?.cache ?? 'no-store',
  });

  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Unexpected content-type: ${ct} — body: ${txt.slice(0,200)}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${body}`);
  }

  return res.json();
}

export async function safeJSON<T = any>(input: RequestInfo, init?: RequestInit): Promise<{ ok: boolean; data?: T; error?: string; }> {
  try {
    const data = await fetchJSON(input, init);
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) };
  }
}