import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);

function extractGenes(yamlString) {
  if (!yamlString) return { features: [], logic: "" };
  const featuresMatch = yamlString?.match(/features:\s*\n([\s\S]*?)\n\w/);
  const features = featuresMatch ? featuresMatch?.[1]?.replace(/- /g, '')?.split('\n')?.map(s => s?.trim())?.filter(Boolean) : [];
  return { features };
}

function breedYAML(parentA, parentB) {
  const genesA = extractGenes(parentA?.spec_yaml);
  const genesB = extractGenes(parentB?.spec_yaml);
  const mutationPool = ["RSI(14)", "BB(20,2)", "ATR(14)", "VWAP", "HMA(50)", "ADX(14)", "MACD(12,26,9)", "STOCH(14,3,3)"];
  const childFeatures = new Set([
    ...genesA.features.slice(0, Math.ceil(genesA.features.length / 2)), 
    ...genesB.features.slice(0, Math.ceil(genesB.features.length / 2))
  ]);

  if (Math.random() < 0.15) { 
    childFeatures?.add(mutationPool?.[Math.floor(Math.random() * mutationPool?.length)]); 
  }
  
  while (childFeatures?.size < 2) { 
    childFeatures?.add(mutationPool?.[Math.floor(Math.random() * mutationPool?.length)]); 
  }
  
  const childLogic = `entry: "if ${[...childFeatures]?.[0]}_signal and vol_z < 2 => long"`;
  return `strategy_id: STR-${crypto?.randomBytes(3)?.toString("hex")}\nfeatures:\n  - ${[...childFeatures]?.join('\n  - ')}\nlogic:\n  ${childLogic}\nrisk:\n  capital_pct: 0.5\n  max_dd_pct: 6`;
}

async function topParents(limit = 10) {
  try {
    const { data, error } = await supa?.from("strategy_candidates")?.select("id, iqs, spec_yaml")?.neq("iqs", null)?.order("iqs", { ascending: false })?.limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Top parents fetch error:', error);
    return [];
  }
}

export async function breedCandidates(k = 20) {
  try {
    const parents = await topParents(10);
    if (parents?.length === 0) return { created: 0, notes: "No parents found to breed." };

    const out = [];
    for (let i = 0; i < k; i++) {
      const pa = parents?.[Math.floor(Math.random() * parents?.length)];
      const pb = parents?.[Math.floor(Math.random() * parents?.length)];
      out?.push({ 
        parent_ids: [pa?.id, pb?.id]?.filter(Boolean), 
        spec_yaml: breedYAML(pa, pb), 
        status: "pending",
        created_at: new Date()?.toISOString(),
        updated_at: new Date()?.toISOString()
      });
    }

    const { data, error } = await supa?.from("strategy_candidates")?.insert(out)?.select("id");
    if (error) throw error;

    return { created: data?.length || 0 };
  } catch (error) {
    console.error('Breed candidates error:', error);
    return { created: 0, notes: `Breeding failed: ${error?.message}` };
  }
}

export async function naturalSelection({ minIQS = 0.75 } = {}) {
  try {
    const { data, error } = await supa?.from("strategy_candidates")?.select("id, iqs, status")?.in("status", ["testing", "paper", "canary", "live"]);

    if (error) throw error;

    const updates = (data || [])?.map(row => {
      const next = row?.iqs >= minIQS ? 
        (row?.status === "paper" ? "canary" : 
         (row?.status === "canary" ? "live" : row?.status)) : 
        (row?.status === "live" ? "canary" : 
         (row?.status === "canary" ? "paper" : "rejected"));
      return { 
        id: row?.id, 
        status: next,
        updated_at: new Date()?.toISOString()
      };
    });

    if (!updates?.length) return { ok: true, updated: 0 };

    const { error: e2 } = await supa?.from("strategy_candidates")?.upsert(updates);
    if (e2) throw e2;

    return { ok: true, updated: updates?.length };
  } catch (error) {
    console.error('Natural selection error:', error);
    return { ok: false, updated: 0, error: error?.message };
  }
}