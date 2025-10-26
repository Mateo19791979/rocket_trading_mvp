export async function postgrestRPC<T>(
  rpcName: string,
  body: Record<string, unknown> = {},
  signal?: AbortSignal,
  timeoutMs = 10000
): Promise<T> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/${rpcName}`;
  const apikey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "apikey": apikey,
        "Authorization": `Bearer ${apikey}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body),
      signal: signal ?? ctrl.signal
    });
    
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`POSTGREST ${res.status}: ${txt || res.statusText}`);
    }
    
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}