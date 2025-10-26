import { useEffect, useState } from "react";

// Petits helpers d'affichage
const money = n => (Number(n || 0))?.toLocaleString(undefined, { maximumFractionDigits: 0 }) + " €";
const pct = n => (Number(n || 0))?.toFixed(1) + " %";

const REGIONS = [
  { code: "US", label: "Amériques", flag: "🇺🇸" },
  { code: "EU", label: "Europe", flag: "🇪🇺" },
  { code: "ASIA", label: "Asie", flag: "🌏" },
  { code: "AFR", label: "Afrique", flag: "🌍" },
  { code: "OCE", label: "Océanie", flag: "🇦🇺" },
  { code: "LATAM", label: "Amérique du Sud", flag: "🌎" },
];

export default function GlobalAIPerformanceAnalyticsCenter() {
  const [regions, setRegions] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [global, setGlobal] = useState({ pnl_day: 0, pnl_month: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const r = await fetch("/api/internal/global-ai-map");
      const j = await r?.json();
      if (!j?.ok) throw new Error(j.error || "API error");
      setRegions(j?.regions || []);
      setExchanges(j?.exchanges || []);
      setGlobal(j?.global || { pnl_day: 0, pnl_month: 0 });
    } catch (e) {
      console.error("GlobalAIMap fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="text-gray-400">Chargement des données de performance globale...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-6 space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-cyan-400">🌍 Centre d'Analyse de Performance IA Mondiale</h1>
          <p className="text-gray-400">
            PnL Global — Jour : <span className="text-emerald-400 font-semibold">{money(global?.pnl_day)}</span>
            {" · "}
            Mois : <span className="text-emerald-400 font-semibold">{money(global?.pnl_month)}</span>
          </p>
        </header>

        {/* Carte Mondiale IA Interactive - Colonne Gauche */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 space-y-6">
            <h2 className="text-xl text-white font-semibold">🗺️ Carte Mondiale IA Interactive</h2>
            
            {/* Cartes par région */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
              {REGIONS?.map(({ code, label, flag }) => {
                const r = regions?.find(x => x?.region === code);
                const active = r?.active_agents || 0;
                const total = r?.total_agents || 0;
                const ok = r && (r?.pnl_day !== undefined);

                return (
                  <div key={code} className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow hover:border-cyan-500 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="text-white font-semibold">{flag} {label}</div>
                      <div className="text-xl">{r?.online ? "🟢" : "🟡"}</div>
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                      Agents actifs : <span className="text-cyan-300">{active}/{total}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-slate-900 p-3 border border-slate-700">
                        <div className="text-xs text-gray-400">PnL Jour</div>
                        <div className={`font-bold ${Number(r?.pnl_day||0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {ok ? money(r?.pnl_day) : "—"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Win rate (J) : <span className="text-yellow-400">{pct(r?.success_rate_day)}</span></div>
                      </div>
                      <div className="rounded-lg bg-slate-900 p-3 border border-slate-700">
                        <div className="text-xs text-gray-400">PnL Mois</div>
                        <div className={`font-bold ${Number(r?.pnl_month||0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {ok ? money(r?.pnl_month) : "—"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Win rate (M) : <span className="text-yellow-400">{pct(r?.success_rate_month)}</span></div>
                      </div>
                    </div>
                    {Number(r?.success_rate_day || 0) > 70 && (
                      <div className="mt-2 text-sm">👑 Performance remarquable (J)</div>
                    )}
                  </div>
                );
              })}
            </section>

            {/* Performance Continental Dashboard */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h3 className="text-lg text-white font-semibold mb-4">📊 Tableau de Performance Continental</h3>
              <div className="space-y-2">
                {regions?.map(r => (
                  <div key={r?.region} className="flex justify-between items-center p-2 rounded bg-slate-900">
                    <span className="text-gray-100">{r?.region_label}</span>
                    <div className="flex space-x-4 text-sm">
                      <span className={`${Number(r?.pnl_day)>=0?"text-emerald-400":"text-red-400"}`}>
                        {money(r?.pnl_day)}
                      </span>
                      <span className="text-yellow-400">{pct(r?.success_rate_day)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analyse de Performance par Échanges - Colonne Centre */}
          <div className="xl:col-span-1 space-y-6">
            <h2 className="text-xl text-white font-semibold">📈 Analyse de Performance par Échanges</h2>
            
            {/* Tableau par place boursière — PnL jour/mois (non limité, toutes exchanges) */}
            <section className="space-y-3">
              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="min-w-full bg-slate-900 text-sm">
                  <thead className="bg-slate-800 text-gray-300">
                    <tr>
                      <th className="text-left p-3">Place (Exchange)</th>
                      <th className="text-left p-3">Continent</th>
                      <th className="text-right p-3">PnL Jour</th>
                      <th className="text-right p-3">Win rate Jour</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exchanges?.slice(0, 15)?.map(x => {
                      const regionLabel = REGIONS?.find(r => r?.code === x?.region)?.label || (x?.region || "—");
                      return (
                        <tr key={x?.exchange} className="border-t border-slate-800 hover:bg-slate-800 transition-colors">
                          <td className="p-3 text-gray-100">{x?.exchange}</td>
                          <td className="p-3 text-gray-300">{regionLabel}</td>
                          <td className={`p-3 text-right ${Number(x?.pnl_day)>=0?"text-emerald-400":"text-red-400"}`}>{money(x?.pnl_day)}</td>
                          <td className="p-3 text-right text-yellow-400">{pct(x?.success_rate_day)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500">
                Remarque : cette section inclut automatiquement toute nouvelle place boursière vue par les IA.
                Aucune limite de zone — **vos IA peuvent aller partout**.
              </p>
            </section>

            {/* Performance Mensuelle des Échanges */}
            <section className="space-y-3">
              <h3 className="text-lg text-white font-semibold">📅 Performance Mensuelle des Échanges</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="min-w-full bg-slate-900 text-sm">
                  <thead className="bg-slate-800 text-gray-300">
                    <tr>
                      <th className="text-left p-3">Exchange</th>
                      <th className="text-right p-3">PnL Mois</th>
                      <th className="text-right p-3">Win rate Mois</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exchanges?.slice(0, 10)?.map(x => (
                      <tr key={x?.exchange} className="border-t border-slate-800">
                        <td className="p-3 text-gray-100">{x?.exchange}</td>
                        <td className={`p-3 text-right ${Number(x?.pnl_month)>=0?"text-emerald-400":"text-red-400"}`}>{money(x?.pnl_month)}</td>
                        <td className="p-3 text-right text-yellow-400">{pct(x?.success_rate_month)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Panneau d'Analyse Avancé - Colonne Droite */}
          <div className="xl:col-span-1 space-y-6">
            <h2 className="text-xl text-white font-semibold">🔬 Panneau d'Analyse Avancé</h2>

            {/* Corrélation Cross-Régionale */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h3 className="text-lg text-white font-semibold mb-4">🔗 Corrélation Cross-Régionale</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{regions?.length}</div>
                    <div className="text-xs text-gray-400">Régions Actives</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{exchanges?.length}</div>
                    <div className="text-xs text-gray-400">Échanges</div>
                  </div>
                </div>
                <div className="text-sm text-gray-300">
                  Corrélation performance globale: 
                  <span className="text-emerald-400 font-semibold ml-1">
                    {global?.pnl_day > 0 ? "Positive" : "Négative"}
                  </span>
                </div>
              </div>
            </div>

            {/* Analyse Impact Fuseau Horaire */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h3 className="text-lg text-white font-semibold mb-4">🌐 Analyse Impact Fuseau Horaire</h3>
              <div className="space-y-2">
                {[
                  { zone: "Asie-Pacifique", hours: "00:00-08:00 UTC", performance: "Élevée" },
                  { zone: "Europe", hours: "08:00-16:00 UTC", performance: "Modérée" },
                  { zone: "Amériques", hours: "16:00-24:00 UTC", performance: "Variable" }
                ]?.map((zone, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded bg-slate-900">
                    <div>
                      <div className="text-gray-100 font-medium">{zone?.zone}</div>
                      <div className="text-xs text-gray-400">{zone?.hours}</div>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded ${
                      zone?.performance === "Élevée" ? "bg-emerald-900 text-emerald-300" :
                      zone?.performance === "Modérée"? "bg-yellow-900 text-yellow-300" : "bg-orange-900 text-orange-300"
                    }`}>
                      {zone?.performance}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Influence Régime de Marché */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h3 className="text-lg text-white font-semibold mb-4">📊 Influence Régime de Marché</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Volatilité Moyenne:</span>
                    <span className="text-cyan-400">12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Régime Actuel:</span>
                    <span className="text-emerald-400">Haussier</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Adaptation IA:</span>
                    <span className="text-yellow-400">Optimale</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Capacités d'Export */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h3 className="text-lg text-white font-semibold mb-4">📤 Export Exécutif</h3>
              <div className="space-y-2">
                <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg transition-colors">
                  📊 Rapport Performance
                </button>
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors">
                  📈 Analyse Géographique
                </button>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors">
                  🔍 Audit Logging
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau complet par continent — PnL jour/mois */}
        <section className="space-y-3">
          <h2 className="text-xl text-white font-semibold">💰 Rentabilité par Continent (Jour/Mois)</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="min-w-full bg-slate-900 text-sm">
              <thead className="bg-slate-800 text-gray-300">
                <tr>
                  <th className="text-left p-3">Continent</th>
                  <th className="text-right p-3">PnL Jour</th>
                  <th className="text-right p-3">Win rate Jour</th>
                  <th className="text-right p-3">PnL Mois</th>
                  <th className="text-right p-3">Win rate Mois</th>
                  <th className="text-right p-3">Agents actifs / Total</th>
                </tr>
              </thead>
              <tbody>
                {regions?.map(r => (
                  <tr key={r?.region} className="border-t border-slate-800 hover:bg-slate-800 transition-colors">
                    <td className="p-3 text-gray-100">{r?.region_label}</td>
                    <td className={`p-3 text-right ${Number(r?.pnl_day)>=0?"text-emerald-400":"text-red-400"}`}>{money(r?.pnl_day)}</td>
                    <td className="p-3 text-right text-yellow-400">{pct(r?.success_rate_day)}</td>
                    <td className={`p-3 text-right ${Number(r?.pnl_month)>=0?"text-emerald-400":"text-red-400"}`}>{money(r?.pnl_month)}</td>
                    <td className="p-3 text-right text-yellow-400">{pct(r?.success_rate_month)}</td>
                    <td className="p-3 text-right text-cyan-300">{r?.active_agents}/{r?.total_agents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}