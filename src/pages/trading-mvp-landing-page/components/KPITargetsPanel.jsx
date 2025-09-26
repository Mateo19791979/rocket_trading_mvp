import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function KPITargetsPanel() {
  const kpis = [
    "Uptime > 99% • Latence /status < 400 ms",
    "Sharpe live du portefeuille > 1.0", 
    "Sélection correcte > 60% vs benchmark"
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
      <div className="flex items-center mb-4">
        <TrendingUp className="h-6 w-6 text-orange-400 mr-3" />
        <h2 className="text-2xl font-bold text-orange-400">
          KPIs cibles
        </h2>
      </div>
      <ul className="space-y-3">
        {kpis?.map((kpi, index) => (
          <li key={index} className="flex items-start text-white">
            <span className="text-teal-400 mr-3 mt-1">•</span>
            <span className="text-gray-100 leading-relaxed">{kpi}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}