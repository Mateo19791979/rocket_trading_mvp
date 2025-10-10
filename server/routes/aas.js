import express from "express";
import { createClient } from "@supabase/supabase-js";
import { computeSystemHealthAndAct } from "../services/healthSentinel.js";
import { setRegime, getRegimeLatest } from "../services/regime.js";
import { breedCandidates, naturalSelection } from "../services/strategyBreeder.js";

export const aas = express?.Router();
const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);

// Security middleware (implement as needed)
const guard = (req, res, next) => {
  if ((req?.headers?.["x-internal-key"] || "") !== process.env?.INTERNAL_ADMIN_KEY) {
    return res?.status(401)?.json({ ok: false, error: "unauthorized" });
  }
  next();
};

const checkKillSwitch = (module) => {
  return async (req, res, next) => {
    try {
      const { data } = await supa?.from("kill_switches")?.select("is_active")?.eq("module", module)?.single();
      if (data?.is_active) {
        return res?.status(503)?.json({ 
          ok: false, 
          error: `Service Unavailable: Kill switch for module '${module}' is active.` 
        });
      }
      next();
    } catch (error) {
      console.error('Kill switch check error:', error);
      next(); // Continue if check fails
    }
  };
};

/* --- EXISTING ROUTES --- */
aas?.post("/breed", guard, checkKillSwitch('STRATEGY_GENERATION'), async (req, res) => {
  try {
    const result = await breedCandidates(req?.body?.k || 20);
    res?.json(result);
  } catch (error) {
    res?.status(500)?.json({ ok: false, error: error?.message });
  }
});

aas?.post("/selection", guard, checkKillSwitch('STRATEGY_GENERATION'), async (req, res) => {
  try {
    const result = await naturalSelection({ minIQS: req?.body?.minIQS || 0.75 });
    res?.json(result);
  } catch (error) {
    res?.status(500)?.json({ ok: false, error: error?.message });
  }
});

/* --- NEW ROUTES --- */
// Health sentinel (calcul + action auto si critique)
aas?.post("/health/compute", guard, async (req, res) => {
  try {
    const result = await computeSystemHealthAndAct();
    res?.json(result);
  } catch (error) {
    res?.status(500)?.json({ ok: false, error: error?.message });
  }
});

// Régime (set + latest)
aas?.post("/regime/set", guard, async (req, res) => {
  try {
    const result = await setRegime(req?.body || {});
    res?.json(result);
  } catch (error) {
    res?.status(500)?.json({ ok: false, error: error?.message });
  }
});

aas?.get("/regime/latest", guard, async (req, res) => {
  try {
    const result = await getRegimeLatest();
    res?.json(result);
  } catch (error) {
    res?.status(500)?.json({ ok: false, error: error?.message });
  }
});

// Kill switch toggle (UI)
aas?.post("/kill/toggle", guard, async (req, res) => {
  try {
    const { module = "LIVE_TRADING", is_active = true, reason = "manual_toggle" } = req?.body || {};
    const { error } = await supa?.from("kill_switches")?.upsert({ 
      module, 
      is_active, 
      reason, 
      activated_by: "ui", 
      updated_at: new Date()?.toISOString() 
    });

    if (error) return res?.status(500)?.json({ ok: false, error: error?.message });
    res?.json({ ok: true, module, is_active });
  } catch (error) {
    res?.status(500)?.json({ ok: false, error: error?.message });
  }
});

// IQS summary rapide (pour UI métrique)
aas?.get("/iqs/summary", guard, async (req, res) => {
  try {
    const { data } = await supa?.from("iq_scores")?.select("iqs")?.order("ts", { ascending: false })?.limit(500);
    const arr = (data || [])?.map(d => Number(d?.iqs || 0));
    const avg = arr?.reduce((a, b) => a + b, 0) / Math.max(1, arr?.length);
    res?.json({ ok: true, avg, count: arr?.length });
  } catch (error) {
    res?.status(500)?.json({ ok: false, error: error?.message, avg: 0, count: 0 });
  }
});

export default aas;