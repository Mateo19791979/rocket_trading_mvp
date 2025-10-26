/* eslint-disable */
import express from 'express';
import { createClient } from '@supabase/supabase-js';

export const diag = express?.Router();

const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);
const INTERNAL_KEY = process.env?.INTERNAL_ADMIN_KEY || '';

function requireInternal(req, res) {
  const k = req?.headers?.['x-internal-key'];
  if (!INTERNAL_KEY || k === INTERNAL_KEY) return true;
  res?.status(401)?.json({ ok:false, error:'unauthorized' });
  return false;
}

// Santé JSON (évite "Not JSON")
diag?.get('/health', (_req, res) => {
  res?.set('content-type','application/json; charset=utf-8');
  res?.json({ ok:true, service:'rocket-api', ts: new Date()?.toISOString() });
});

// Diagnostic RLS/DB lecture-seule
diag?.get('/rls-check', async (_req, res) => {
  res?.set('content-type','application/json; charset=utf-8');
  try {
    const { data, error } = await supa?.from('schema_audit_status')?.select('*');
    if (error) return res?.status(200)?.json({ ok:false, kind:'query_error', error:String(error?.message||error) });
    return res?.json({ ok:true, status:data||[] });
  } catch(e) {
    return res?.status(200)?.json({ ok:false, kind:'exception', error:String(e?.message||e) });
  }
});

// Audit DB (exécute le check SANS réparer) — protégé
diag?.post('/audit-run', async (req,res)=>{
  res?.set('content-type','application/json; charset=utf-8');
  if (!requireInternal(req,res)) return;

  try {
    const { data, error } = await supa?.rpc('audit_ensure_boolean_column', { 
      p_schema: 'public', p_table: 'positions', p_column: 'is_active', p_default: true, p_do_repair: false 
    });
    if (error) return res?.status(200)?.json({ ok:false, error:String(error?.message||error) });
    return res?.json({ ok:true, result: data });
  } catch(e) {
    return res?.status(200)?.json({ ok:false, error:String(e?.message||e) });
  }
});

// Réparation ciblée (uniquement si explicitement appelée) — protégé
diag?.post('/repair/positions-is_active', async (req,res)=>{
  res?.set('content-type','application/json; charset=utf-8');
  if (!requireInternal(req,res)) return;

  try {
    const { data, error } = await supa?.rpc('audit_ensure_boolean_column', { 
      p_schema:'public', p_table:'positions', p_column:'is_active', p_default:true, p_do_repair:true 
    });
    if (error) return res?.status(200)?.json({ ok:false, error:String(error?.message||error) });
    return res?.json({ ok:true, result: data });
  } catch(e) {
    return res?.status(200)?.json({ ok:false, error:String(e?.message||e) });
  }
});

export default diag;