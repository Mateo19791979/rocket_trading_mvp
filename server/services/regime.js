import { createClient } from "@supabase/supabase-js";
const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);

export async function setRegime({ regime, confidence = 0.7, drivers = {} }) {
  try {
    const as_of = new Date()?.toISOString();
    const { data, error } = await supa?.from("regime_state")?.upsert({ 
      as_of, 
      regime, 
      confidence, 
      drivers,
      created_at: as_of,
      updated_at: as_of
    })?.select()?.single();

    if (error) throw error;

    return { ok: true, as_of, regime, confidence, data };
  } catch (error) {
    console.error('Set regime error:', error);
    return { ok: false, error: error?.message };
  }
}

export async function getRegimeLatest() {
  try {
    const { data, error } = await supa?.from("regime_state")?.select("*")?.order("as_of", { ascending: false })?.limit(1)?.single();

    if (error && error?.code !== 'PGRST116') throw error;

    return { ok: true, data: data || null };
  } catch (error) {
    console.error('Get regime error:', error);
    return { ok: false, error: error?.message, data: null };
  }
}