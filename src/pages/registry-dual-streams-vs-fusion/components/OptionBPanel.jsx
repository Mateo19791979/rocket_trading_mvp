import React from 'react';
import { AlertTriangle, Database, Clock, Shield, ArrowRight } from 'lucide-react';

export default function OptionBPanel() {
  const risks = [
    {
      icon: AlertTriangle,
      title: "Schémas hétérogènes", 
      description: "plantage front"
    },
    {
      icon: AlertTriangle,
      title: "Une erreur",
      description: "casse la vue globale"
    }
  ];

  const whenToDo = [
    {
      icon: Shield,
      title: "Une fois les schémas stabilisés"
    },
    {
      icon: Database,
      title: "Avec un validateur JSON et dédoublonnage"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl p-6 border border-slate-600 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">B</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-yellow-400">
            Fusion en un /registry unique
          </h2>
          <span className="text-sm bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full border border-yellow-500">
            PLUS TARD
          </span>
        </div>
      </div>
      {/* Endpoint */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Endpoint:
        </h3>
        <div className="p-4 rounded-lg border-2 bg-blue-500/20 border-blue-500">
          <div className="flex items-center gap-2 mb-2">
            <code className="text-sm font-mono text-blue-400">/registry</code>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">
              concat([...private],[...open]) + normalisation
            </span>
          </div>
        </div>
      </div>
      {/* Risques à court terme */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Risques à court terme:
        </h3>
        <div className="space-y-3">
          {risks?.map((risk, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-red-900/30 rounded-lg border border-red-500/50">
              <risk.icon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-red-300">{risk?.title}</span>
                <ArrowRight className="w-4 h-4 text-gray-400 inline mx-2" />
                <span className="text-gray-300">{risk?.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quand la faire */}
      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-500">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Quand la faire:
        </h3>
        <div className="space-y-3">
          {whenToDo?.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-sm text-gray-300">{item?.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}