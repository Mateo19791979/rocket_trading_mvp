import React from "react";
import { useStatsOverview } from "@/features/stats/useStatsOverview";

export function StatsCard() {
  const { data, loading, hide, error } = useStatsOverview();

  if (hide) return null; // ✅ on ne rend rien → pas d'appel bloquant

  return (
    <div className="rounded-2xl shadow p-4" data-state={error ? "degraded" : "ok"}>
      <div className="font-semibold mb-2">Statistiques (Supabase)</div>
      {loading ? (
        <div>Chargement…</div>
      ) : error ? (
        <div className="text-amber-600 text-sm">Mode dégradé : {error}</div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Positions" value={data?.positions ?? 0} />
          <Stat label="Trades" value={data?.trades ?? 0} />
          <Stat label="Dernier tick" value={new Date(data?.last_tick_at || new Date()).toLocaleString()} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}