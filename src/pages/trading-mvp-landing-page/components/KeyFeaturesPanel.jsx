import React from 'react';
import { Brain } from 'lucide-react';

export default function KeyFeaturesPanel() {
  const features = [
    "Registry v0.1 (10 stratégies) — extensible à 500+",
    "Mean Reversion Bollinger(9)/RSI(21/79), Trend MA(10/30), Options (hedging), Stat-Arb, Risk Parity",
    "Scoring live (Sharpe adj., MDD, stabilité) + sélection/alloc auto",
    "Contraintes: vol cible, max DD, tailles, filtres Sharia"
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
      <div className="flex items-center mb-4">
        <Brain className="h-6 w-6 text-teal-400 mr-3" />
        <h2 className="text-2xl font-bold text-teal-400">
          Fonctionnalités clés
        </h2>
      </div>
      <ul className="space-y-3">
        {features?.map((feature, index) => (
          <li key={index} className="flex items-start text-white">
            <span className="text-orange-400 mr-3 mt-1">•</span>
            <span className="text-gray-100 leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}