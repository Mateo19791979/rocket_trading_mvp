// ======================================================================
// Worker OpsSupervisor — server/workers/opsSupervisor.js
// Supervise API/Market health + audit SQL multi-tables, envoie alertes Slack si pb.
// ======================================================================

/* eslint-disable */
import 'dotenv/config';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { slackAlert } from '../services/alerts/slack.js';

const API = process.env?.SELF_URL?.replace(/\/+$/, '') || `http://127.0.0.1:${process.env?.PORT || 3000}`;
const LOOP_MS = Number(process.env?.OPSSUP_LOOP_MS || 20000);
const STALL_MS = Number(process.env?.OPSSUP_STALL_MS || 60000);

const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);

let lastOk = Date.now();

async function pingJson(url) {
  try {
    const r = await fetch(url, { headers: { 'accept': 'application/json' }, timeout: 6000 });
    const ct = r?.headers?.get('content-type') || '';
    const ok = r?.ok && ct?.includes('application/json');
    const data = ok ? await r?.json() : { ok: false, status: r?.status, ct };
    return { ok, status: r?.status, data, ct };
  } catch (e) {
    return { ok: false, status: 0, data: { error: String(e?.message || e) } };
  }
}

async function runAudit() {
  try {
    const { data, error } = await supa?.rpc('audit_run_all');
    if (error) return { ok: false, error: String(error?.message || error) };

    const results = data?.results || [];
    const missing = results?.filter(r => r?.required && r?.ok === false);

    return { ok: missing?.length === 0, missing, all: results };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

async function tick() {
  const api = await pingJson(`${API}/api/health`);
  const market = await pingJson(`${API}/api/market/health`);

  if (api?.ok || market?.ok) lastOk = Date.now();

  // SQL audit
  const audit = await runAudit();

  const stalled = (Date.now() - lastOk) > STALL_MS;

  if (stalled || !api?.ok || !market?.ok || !audit?.ok) {
    await slackAlert('🚨 OPS ALERT',
      { 
        stalled, 
        api_ok: api?.ok, 
        market_ok: market?.ok, 
        audit_ok: audit?.ok, 
        missing: audit?.missing || [], 
        ts: new Date()?.toISOString() 
      }
    );
  }
}

export async function startOpsSupervisor() {
  console.log(`[OPS] Supervisor started. loop=${LOOP_MS}ms stall=${STALL_MS}ms API=${API}`);
  setInterval(tick, LOOP_MS);
}

if (process.argv?.[1]?.includes('opsSupervisor.js')) {
  startOpsSupervisor()?.catch(e => { console.error('[OPS] FATAL', e); process.exit(1); });
}