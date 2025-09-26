import React from 'react';
import { Plug } from 'lucide-react';

export default function IntegrationDeploymentPanel() {
  const integrations = [
    "Front: Rocket.new (https://trading-mvp.com)",
    "Back: https://api.trading-mvp.com (Docker + TLS Traefik)",
    "Endpoints: /registry • /scores • /select • /allocate • /status",
    "Monitoring: healthchecks + logs + rate-limit /orders"
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
      <div className="flex items-center mb-4">
        <Plug className="h-6 w-6 text-orange-400 mr-3" />
        <h2 className="text-2xl font-bold text-orange-400">
          Intégration & Déploiement
        </h2>
      </div>
      <ul className="space-y-3">
        {integrations?.map((integration, index) => (
          <li key={index} className="flex items-start text-white">
            <span className="text-teal-400 mr-3 mt-1">•</span>
            <span className="text-gray-100 leading-relaxed">{integration}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}