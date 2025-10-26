/**
 * Agrège par continent & par place boursière avec PnL day/month et stats agents.
 * Hypothèses de schéma min :
 * - agents(id, name, region, exchange, status)
 * - agent_metrics(agent_id, region, exchange, pnl, success_rate, online, ts)
 *   où `pnl` est le PnL de la période de mesure (tick/5m/1h). On cumule par jour/mois.
 * 
 * Si vos colonnes diffèrent, adaptez simplement les noms de champs dans les reduce().
 */
import { createClient } from '@supabase/supabase-js';
import express from 'express';

const router = express?.Router();
const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);

// util date → limite jour/mois en ISO
const isoStartOfDayUTC = () => {
  const d = new Date();
  d?.setUTCHours(0,0,0,0);
  return d?.toISOString();
};

const isoStartOfMonthUTC = () => {
  const d = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1, 0,0,0));
  return d?.toISOString();
};

router?.get('/', async (req, res) => {
  try {
    // 1) Agents pour compter actifs/total par region
    const { data: agents, error: eA } = await supa?.from('agents')?.select('id, region, exchange, status');
    if (eA) throw eA;

    // 2) Metrics (jour & mois) — si volumétrie grosse, filtrer côté SQL par ts >= bornes
    const dayFrom = isoStartOfDayUTC();
    const monthFrom = isoStartOfMonthUTC();

    const { data: metricsDay, error: eD } = await supa?.from('agent_metrics')?.select('agent_id, region, exchange, pnl, success_rate, online, ts')?.gte('ts', dayFrom);
    if (eD) throw eD;

    const { data: metricsMonth, error: eM } = await supa?.from('agent_metrics')?.select('agent_id, region, exchange, pnl, success_rate, online, ts')?.gte('ts', monthFrom);
    if (eM) throw eM;

    // Regions connues (mais on ne limite rien : si d'autres apparaissent, on les inclut)
    const regionNames = {
      US: 'Amériques',
      EU: 'Europe',
      ASIA: 'Asie',
      AFR: 'Afrique',
      OCE: 'Océanie',
      LATAM: 'Amérique du Sud'
    };

    // Helper: group by key
    const groupBy = (arr, keyFn) => arr?.reduce((acc, x) => {
      const k = keyFn(x) ?? 'UNKNOWN';
      (acc[k] ||= [])?.push(x);
      return acc;
    }, {});

    // --- Comptes agents par région
    const agentsByRegion = groupBy(agents, a => a?.region || 'UNKNOWN');

    // --- Agrégations jour & mois par région
    const mDayByRegion = groupBy(metricsDay, m => m?.region || 'UNKNOWN');
    const mMonthByRegion = groupBy(metricsMonth, m => m?.region || 'UNKNOWN');

    const regionsAgg = Array.from(
      new Set(
        Object.keys(agentsByRegion)
          .concat(Object.keys(mDayByRegion))
          .concat(Object.keys(mMonthByRegion))
      )
    )?.map(region => {
      const regAgents = agentsByRegion?.[region] || [];
      const total = regAgents?.length;
      const active = regAgents?.filter(a => a?.status === 'active')?.length;

      const regDay = mDayByRegion?.[region] || [];
      const pnlDay = regDay?.reduce((s, r) => s + (Number(r?.pnl) || 0), 0);
      const succDay = regDay?.length ? regDay?.reduce((s, r) => s + (Number(r?.success_rate) || 0), 0) / regDay?.length : 0;
      const online = regDay?.some(r => !!r?.online);

      const regMonth = mMonthByRegion?.[region] || [];
      const pnlMonth = regMonth?.reduce((s, r) => s + (Number(r?.pnl) || 0), 0);
      const succMonth = regMonth?.length ? regMonth?.reduce((s, r) => s + (Number(r?.success_rate) || 0), 0) / regMonth?.length : 0;

      return {
        region,
        region_label: regionNames?.[region] || region,
        total_agents: total,
        active_agents: active,
        online,
        pnl_day: pnlDay,
        pnl_month: pnlMonth,
        success_rate_day: succDay * 100,
        success_rate_month: succMonth * 100
      };
    });

    // --- Agrégations par place boursière (exchange) — jour & mois — non limitées
    const mDayByEx = groupBy(metricsDay, m => m?.exchange || 'UNKNOWN');
    const mMonthByEx = groupBy(metricsMonth, m => m?.exchange || 'UNKNOWN');

    const exchangesAgg = Array.from(
      new Set(Object.keys(mDayByEx).concat(Object.keys(mMonthByEx)))
    )?.map(ex => {
      const d = mDayByEx?.[ex] || [];
      const pnlDay = d?.reduce((s, r) => s + (Number(r?.pnl) || 0), 0);
      const succDay = d?.length ? d?.reduce((s, r) => s + (Number(r?.success_rate) || 0), 0) / d?.length : 0;

      const m = mMonthByEx?.[ex] || [];
      const pnlMonth = m?.reduce((s, r) => s + (Number(r?.pnl) || 0), 0);
      const succMonth = m?.length ? m?.reduce((s, r) => s + (Number(r?.success_rate) || 0), 0) / m?.length : 0;

      // rattacher à une région (si vos données la portent au niveau metrics ; sinon laissez vide)
      const any = d?.[0] || m?.[0] || {};
      const region = any?.region || null;

      return {
        exchange: ex,
        region,
        pnl_day: pnlDay,
        pnl_month: pnlMonth,
        success_rate_day: succDay * 100,
        success_rate_month: succMonth * 100
      };
    });

    const global_pnl_day = regionsAgg?.reduce((s, r) => s + r?.pnl_day, 0);
    const global_pnl_month = regionsAgg?.reduce((s, r) => s + r?.pnl_month, 0);

    res?.json({
      ok: true,
      regions: regionsAgg,
      exchanges: exchangesAgg,
      global: { pnl_day: global_pnl_day, pnl_month: global_pnl_month }
    });
  } catch (e) {
    console.error('[global-ai-map] error', e);
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

export default router;
export function globalAiMap(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: globalAiMap is not implemented yet.', args);
  return null;
}
