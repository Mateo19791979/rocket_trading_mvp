import React from 'react';
import { FileJson, CheckCircle, Circle } from 'lucide-react';

export default function JsonContractPanel() {
  const exampleData = [
    { "name": "Bollinger_RSI_Contrarian", "category": "mean_reversion" },
    { "name": "Momentum_MA_Crossover", "category": "trend" }
  ];

  const requiredFields = [
    { field: "name", type: "string", required: true },
    { field: "category", type: "string", required: true }
  ];

  const optionalFields = [
    { field: "instruments[]", type: "array", required: false },
    { field: "timeframe", type: "string", required: false },
    { field: "risk{}", type: "object", required: false }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl p-6 border border-slate-600 h-full">
      <div className="flex items-center gap-3 mb-6">
        <FileJson className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">
          Contrat JSON
        </h2>
        <span className="text-sm text-gray-400">(à respecter pour les 2 flux)</span>
      </div>
      {/* Format requis */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">
          Toujours un TABLEAU:
        </h3>
        <div className="bg-slate-900/70 rounded-lg p-4 border border-slate-600">
          <pre className="text-sm text-gray-300 overflow-x-auto">
            <code>
{JSON.stringify(exampleData, null, 2)}
            </code>
          </pre>
        </div>
      </div>
      {/* Champs requis */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Champs minimaux:
        </h3>
        <div className="space-y-2">
          {requiredFields?.map((field, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-green-900/30 rounded border border-green-500/50">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <code className="text-sm font-mono text-green-300">{field?.field}</code>
              <span className="text-xs text-gray-400">({field?.type})</span>
            </div>
          ))}
        </div>
      </div>
      {/* Champs optionnels */}
      <div>
        <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
          <Circle className="w-5 h-5" />
          Champs optionnels:
        </h3>
        <div className="space-y-2">
          {optionalFields?.map((field, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-yellow-900/30 rounded border border-yellow-500/50">
              <Circle className="w-4 h-4 text-yellow-400" />
              <code className="text-sm font-mono text-yellow-300">{field?.field}</code>
              <span className="text-xs text-gray-400">({field?.type})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}