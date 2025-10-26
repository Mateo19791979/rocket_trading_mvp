// ======================================
// (B) Backend — /analytics/trades (JSON)
// ======================================
/* Fichier: server/routes/analytics.trades.routes.js */
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { rateLimitLight } from '../middlewares/rateLimitLight.js';

export function makeAnalyticsTradesRoutes() {
  const r = express?.Router();
  const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);

  r?.use((req,res,next)=>{ res?.setHeader('content-type','application/json; charset=utf-8'); next(); });

  // Rate limiting for analytics endpoints
  r?.use(rateLimitLight('analytics', 100, 60000)); // 100 requests per minute

  r?.get('/trades', async (req, res) => {
    try {
      const hours = Math.max(1, Math.min(168, Number(req?.query?.hours||24)));
      const p_since = new Date(Date.now() - hours*3600*1000)?.toISOString();
      let rows = [];
      let src = 'rpc';

      const rpc = await supa?.rpc('get_trades_with_pnl', { p_since });
      if (rpc?.error) {
        src = 'view';
        const vr = await supa?.from('trades_pnl_view')?.select('id,symbol,side,qty,price,realized_pnl,unrealized_pnl,ts,px_now')?.gte('ts', p_since)?.order('ts', { ascending:false });
        if (vr?.error) return res?.status(200)?.json({ ok:false, error:String(vr?.error?.message||vr?.error), source:src });
        rows = vr?.data||[];
      } else {
        rows = Array.isArray(rpc?.data) ? rpc?.data : [];
      }

      const limit = Math.min(Math.max(Number(req?.query?.limit||200),1),1000);
      const offset = Math.max(Number(req?.query?.offset||0),0);
      const total = rows?.length;
      const slice = rows?.slice(offset, offset+limit);

      res?.json({ ok:true, rows:slice, meta:{ total, limit, offset, p_since, source:src } });
    } catch (e) {
      res?.status(200)?.json({ ok:false, error:String(e?.message||e) });
    }
  });

  // Additional analytics endpoints
  r?.get('/today', async (req, res) => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())?.toISOString();
      
      const rpc = await supa?.rpc('get_trades_with_pnl', { p_since: startOfDay });
      let rows = [];
      let src = 'rpc';

      if (rpc?.error) {
        src = 'view';
        const vr = await supa?.from('trades_pnl_view')?.select('realized_pnl,unrealized_pnl')?.gte('ts', startOfDay);
        if (vr?.error) return res?.status(200)?.json({ ok:false, error:String(vr?.error?.message||vr?.error), source:src });
        rows = vr?.data||[];
      } else {
        rows = Array.isArray(rpc?.data) ? rpc?.data : [];
      }

      const summary = rows?.reduce((acc, trade) => ({
        trades_count: acc?.trades_count + 1,
        realized_sum: acc?.realized_sum + (Number(trade?.realized_pnl) || 0),
        unrealized_sum: acc?.unrealized_sum + (Number(trade?.unrealized_pnl) || 0)
      }), {
        trades_count: 0,
        realized_sum: 0,
        unrealized_sum: 0
      });

      res?.json({ 
        ok: true, 
        summary: {
          ...summary,
          total_pnl: summary?.realized_sum + summary?.unrealized_sum,
          as_of: new Date()?.toISOString(),
          period_start: startOfDay
        },
        meta: { source: src }
      });
    } catch (e) {
      res?.status(200)?.json({ ok:false, error:String(e?.message||e) });
    }
  });

  return r;
}