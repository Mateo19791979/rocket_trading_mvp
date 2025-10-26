/* eslint-disable */
import 'dotenv/config';
import fetch from 'node-fetch';

const API = process.env?.SELF_URL?.replace(/\/+$/,'') || 'http://127.0.0.1:' + (process.env?.PORT||3000);
const LOOP_MS = Number(process.env?.SUPERVISOR_LOOP_MS || 15000);
const STALL_MS = Number(process.env?.SUPERVISOR_STALL_MS || 45000);

let lastOk = Date.now();

async function pingJson(url, name){
  try {
    const r = await fetch(url, { 
      headers: { 'accept':'application/json' }, 
      timeout: 5000 
    });
    
    const ct = r?.headers?.get('content-type')||'';
    const isJson = ct?.includes('application/json');
    const body = isJson ? await r?.json() : await r?.text();
    const ok = r?.ok && isJson && (body?.ok !== false);
    
    if (!ok) {
      console.warn(`[SUP] ${name} WARN`, { 
        status: r?.status, 
        ct, 
        sample: isJson ? body : String(body)?.slice(0,160) 
      });
    }
    
    return { ok, ct, status: r?.status };
  } catch (e) {
    console.warn(`[SUP] ${name} FAIL`, String(e?.message||e));
    return { ok: false, ct: null, status: 0 };
  }
}

async function tick(){
  // 1) API health JSON
  const h1 = await pingJson(`${API}/health`, 'api/health');
  
  // 2) Market feed health (si route branchée)
  const h2 = await pingJson(`${API}/api/market/health`, 'market/health');
  
  // 3) RLS-check (si montée via routes internes)
  const h3 = await pingJson(`${API}/internal/rls-check`, 'internal/rls-check');
  
  // 4) Internal health check
  const h4 = await pingJson(`${API}/internal/health`, 'internal/health');

  const anyOk = [h1,h2,h3,h4]?.some(x=>x?.ok);
  
  if (anyOk) lastOk = Date.now();
  
  const stalledFor = Date.now() - lastOk;
  
  if (stalledFor > STALL_MS) {
    // On ne redémarre PAS — on log seulement : ops décide (safe)
    console.error(`[SUP] STALL > ${STALL_MS}ms — vérifier logs backend / Nginx / IBKR gateway`);
  }
}

export async function startSupervisor(){
  console.log(`[SUP] Orchestrator reconnect supervisor started. API=${API} LOOP=${LOOP_MS}ms STALL=${STALL_MS}ms`);
  setInterval(tick, LOOP_MS);
}

// Auto-start si lancé directement
if (process.argv?.[1]?.includes('ai_orchestrator_reconnect.js')) {
  startSupervisor()?.catch(e=>{ 
    console.error('[SUP] FATAL', e); 
    process.exit(1); 
  });
}