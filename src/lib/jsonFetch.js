import { API, EDGE } from "@/lib/apiBase";

function isJson(res) {
  const ct = (res?.headers?.get("content-type") || "")?.toLowerCase();
  return ct?.includes("application/json");
}

async function tryFetch(url, init) {
  const r = await fetch(url, init);
  if (!isJson(r)) throw new Error(`Not JSON (content-type=${r.headers.get("content-type")})`);
  const j = await r?.json();
  if (!j || typeof j !== "object") throw new Error("Invalid JSON payload");
  return j;
}

/**
 * Get the actual Supabase project reference from the SUPABASE_URL
 */
function getSupabaseProjectRef() {
  const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    console.warn('⚠️ VITE_SUPABASE_URL not found in environment');
    return null;
  }
  
  try {
    const url = new URL(supabaseUrl);
    // Extract project ref from URL like https://project_ref.supabase.co
    const projectRef = url?.hostname?.split('.')?.[0];
    return projectRef;
  } catch (error) {
    console.error('❌ Failed to extract project ref from Supabase URL:', error);
    return null;
  }
}

/**
 * Construct the proper Edge Function URL by replacing <PROJECT_REF> with actual project ref
 */
function buildEdgeFunctionUrl(functionName) {
  let edgeBaseUrl = EDGE;
  
  if (!edgeBaseUrl) {
    return undefined;
  }

  // If the EDGE URL contains <PROJECT_REF> placeholder, replace it with the actual project reference
  if (edgeBaseUrl?.includes('<PROJECT_REF>')) {
    const projectRef = getSupabaseProjectRef();
    if (!projectRef) {
      console.warn('⚠️ Cannot build Edge Function URL: project reference not found');
      return undefined;
    }
    edgeBaseUrl = edgeBaseUrl?.replace('<PROJECT_REF>', projectRef);
  }

  // Construct the full Edge Function URL
  return `${edgeBaseUrl}/${functionName}`;
}

/** Tente d'abord l'API, sinon bascule sur l'Edge Function */
export async function jsonFetchWithFallback([primary, fallback], init) {
  // Add request timeout
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController?.abort(), 8000); // 8s timeout
  
  const requestInit = {
    ...init,
    signal: timeoutController?.signal
  };
  
  try { 
    console.log(`🚀 Attempting primary: ${primary}`);
    const result = await tryFetch(primary, requestInit);
    clearTimeout(timeoutId);
    console.log(`✅ Primary succeeded: ${primary}`);
    return result;
  } catch (e1) {
    clearTimeout(timeoutId);
    console.log(`⚠️ Primary failed: ${primary} - ${e1?.message}`);
    
    if (!fallback) throw e1;
    
    try { 
      console.log(`🔄 Attempting fallback: ${fallback}`);
      const fallbackController = new AbortController();
      const fallbackTimeoutId = setTimeout(() => fallbackController?.abort(), 8000);
      
      const result = await tryFetch(fallback, {
        ...requestInit,
        signal: fallbackController?.signal
      });
      
      clearTimeout(fallbackTimeoutId);
      console.log(`✅ Fallback succeeded: ${fallback}`);
      return result;
    } catch (e2) { 
      console.error(`❌ Both failed | primary=${e1?.message} | fallback=${e2?.message}`);
      throw new Error(`API & Edge failed | primary=${e1.message} | fallback=${e2.message}`); 
    }
  }
}

// --- Helpers dédiés ---
export function getRlsHealth() {
  const fallbackUrl = buildEdgeFunctionUrl('rls-health');
  return jsonFetchWithFallback(
    [`${API}/security/rls/health`, fallbackUrl],
    {}
  );
}

export function postRlsRepair() {
  const key = import.meta.env?.VITE_INTERNAL_ADMIN_KEY || "";
  return jsonFetchWithFallback(
    [`${API}/security/rls/repair`, undefined], // repair = API seulement
    { method: "POST", headers: { "x-internal-key": key } }
  );
}

export function getShadowPortfolios() {
  const key = import.meta.env?.VITE_INTERNAL_ADMIN_KEY || "";
  const fallbackUrl = buildEdgeFunctionUrl('shadow-portfolios');
  return jsonFetchWithFallback(
    [`${API}/ops/shadow-portfolios`, fallbackUrl],
    { headers: { "x-internal-key": key } }
  );
}

export function getTradingAudit() {
  const key = import.meta.env?.VITE_INTERNAL_ADMIN_KEY || "";
  const fallbackUrl = buildEdgeFunctionUrl('trading-audit');
  return jsonFetchWithFallback(
    [`${API}/ops/trading-audit`, fallbackUrl],
    { headers: { "x-internal-key": key } }
  );
}