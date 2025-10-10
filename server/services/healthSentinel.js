import { createClient } from "@supabase/supabase-js";
const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);

/** Calcule la santé système et (optionnel) active un kill switch si critique */
export async function computeSystemHealthAndAct() {
  try {
    // 1) DHI moyen (qualité des flux)
    const { data: dhiRows } = await supa?.from("data_health_index")?.select("dhi")?.limit(1000);
    const dhi_avg = (dhiRows || [])?.reduce((a, b) => a + Number(b?.dhi || 0), 0) / Math.max(1, (dhiRows || [])?.length);

    // 2) Erreurs 1h (ex: via decisions_log outcome=error)
    const since = new Date(Date.now() - 3600 * 1000)?.toISOString();
    const { count: errors_1h } = await supa?.from("decisions_log")?.select("id", { count: "exact", head: true })?.eq("outcome", "error")?.gt("ts", since);

    // 3) Décroissance alpha (placeholder → branche ton PnL/alpha 30j)
    const alpha_decay = 0;         // -0.1 = -10% vs 30j, à relier à ta métrique réelle
    const compute_alpha = 1;       // normalisé; branche ton coût/alpha

    // 4) Mode
    let mode = "normal";
    if (dhi_avg < 0.70 || (errors_1h || 0) > 50) mode = "degraded";
    if (dhi_avg < 0.60 || (errors_1h || 0) > 200) mode = "safe";

    // 5) Persistance
    await supa?.from("system_health")?.insert({ 
      dhi_avg, 
      alpha_decay, 
      compute_alpha, 
      errors_1h: errors_1h || 0, 
      mode,
      health_status: mode,
      created_at: new Date()?.toISOString(),
      updated_at: new Date()?.toISOString()
    });

    // 6) Action automatique (N5): activer le Kill Switch trading live si mode=safe
    if (mode === "safe") {
      await supa?.from("kill_switches")?.upsert({
        module: "LIVE_TRADING", 
        is_active: true,
        reason: "Health Sentinel: mode SAFE", 
        activated_by: "health_sentinel", 
        updated_at: new Date()?.toISOString()
      });
    }

    return { 
      ok: true, 
      mode, 
      dhi_avg, 
      errors_1h: errors_1h || 0, 
      alpha_decay, 
      compute_alpha 
    };
  } catch (error) {
    console.error('Health Sentinel error:', error);
    return { 
      ok: false, 
      error: error?.message,
      mode: "critical", 
      dhi_avg: 0, 
      errors_1h: 0, 
      alpha_decay: 0, 
      compute_alpha: 0 
    };
  }
}