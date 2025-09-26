import React from 'react';
import { Network, Server, Database, Route, CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react';

export default function SimpleArchitecturePanel({ status }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Activity className="w-5 h-5 text-blue-400 animate-pulse" />;
    }
  };

  const architectureItems = [
    {
      icon: Server,
      text: "Traefik écoute en 80/443, gère TLS (Let's Encrypt)",
      status: 'success'
    },
    {
      icon: Network,
      text: "Réseau Docker 'web' (externe) + réseau 'internal'",
      status: 'success'
    },
    {
      icon: Database,
      text: "backend (Express) + services IA (FastAPI) sur 'internal'",
      status: 'warning'
    },
    {
      icon: Route,
      text: "Routage par labels → Host(`api.trading-mvp.com`)",
      status: 'success'
    }
  ];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧭</span>
          <h3 className="text-xl font-semibold text-teal-400">Architecture simple</h3>
        </div>
        {getStatusIcon(status)}
      </div>
      <div className="space-y-4">
        {architectureItems?.map((item, index) => {
          const IconComponent = item?.icon;
          return (
            <div key={index} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-600/50">
              <div className="p-2 bg-slate-700/50 rounded-lg">
                <IconComponent className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm leading-relaxed">{item?.text}</p>
              </div>
              <div className="flex-shrink-0">
                {getStatusIcon(item?.status)}
              </div>
            </div>
          );
        })}
      </div>
      {/* Network Topology Visualization */}
      <div className="mt-6 p-4 bg-slate-900/30 rounded-lg border border-slate-600/30">
        <div className="text-center text-slate-300 text-sm mb-3">Topologie réseau</div>
        <div className="flex justify-between items-center text-xs">
          <div className="text-center">
            <div className="w-12 h-8 bg-blue-500/20 border border-blue-500 rounded mb-1 flex items-center justify-center">
              <Network className="w-3 h-3 text-blue-400" />
            </div>
            <div className="text-blue-400">Traefik</div>
          </div>
          <div className="flex-1 h-px bg-slate-600 mx-2"></div>
          <div className="text-center">
            <div className="w-12 h-8 bg-teal-500/20 border border-teal-500 rounded mb-1 flex items-center justify-center">
              <Server className="w-3 h-3 text-teal-400" />
            </div>
            <div className="text-teal-400">Backend</div>
          </div>
          <div className="flex-1 h-px bg-slate-600 mx-2"></div>
          <div className="text-center">
            <div className="w-12 h-8 bg-orange-500/20 border border-orange-500 rounded mb-1 flex items-center justify-center">
              <Database className="w-3 h-3 text-orange-400" />
            </div>
            <div className="text-orange-400">Services IA</div>
          </div>
        </div>
      </div>
    </div>
  );
}