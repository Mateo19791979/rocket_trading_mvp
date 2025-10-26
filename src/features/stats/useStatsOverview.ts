import { useEffect, useState } from "react";
import { postgrestRPC } from "@/lib/supabaseRest";

export type StatsOverview = {
  positions: number;
  trades: number;
  last_tick_at: string;
};

export function useStatsOverview() {
  const [data, setData] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [hide, setHide] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        const json = await postgrestRPC<StatsOverview>("rpc_stats_overview_json", {});
        if (!mounted) return;
        
        setData(json);
        setHide(false);
        setError(null);
      } catch (e: any) {
        console.warn("[Stats] fallback hide_stats_card, reason:", e?.message || e);
        setError(e?.message || "Stats unavailable");
        setHide(true); // 🔴 on masque par défaut si erreur
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    
    return () => { 
      mounted = false; 
    };
  }, []);

  return { data, loading, hide, error };
}