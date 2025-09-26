import React from 'react';
import { Rocket } from 'lucide-react';

export default function ValuePropositionPanel() {
  const features = [
    "IA qui lit des centaines de documents (open-access + livres fournis)",
    "Extraction automatique de stratégies (BUY/SELL/ALLOC/RISK)",
    "Orchestrateur qui choisit et pondère la meilleure stratégie en continu",
    "Dashboard Rocket.new avec /status, /registry, /scores, /select"
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
      <div className="flex items-center mb-4">
        <Rocket className="h-6 w-6 text-teal-400 mr-3" />
        <h2 className="text-2xl font-bold text-teal-400">
          Proposition de valeur
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