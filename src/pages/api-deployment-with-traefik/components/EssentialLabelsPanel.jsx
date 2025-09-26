import React, { useState } from 'react';
import { Settings, Copy, CheckCircle, XCircle, AlertCircle, Activity, Check } from 'lucide-react';

export default function EssentialLabelsPanel({ status }) {
  const [copiedLabel, setCopiedLabel] = useState(null);

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

  const traefikLabels = [
    {
      label: 'traefik.enable',
      value: 'true',
      description: 'Active le routage Traefik pour le service'
    },
    {
      label: 'traefik.http.routers.api.rule',
      value: 'Host(`api.trading-mvp.com`)',
      description: 'Règle de routage basée sur le nom de domaine'
    },
    {
      label: 'traefik.http.routers.api.entrypoints',
      value: 'websecure',
      description: 'Utilise le point d\'entrée HTTPS sécurisé'
    },
    {
      label: 'traefik.http.routers.api.tls.certresolver',
      value: 'letsencrypt',
      description: 'Utilise Let\'s Encrypt pour les certificats TLS'
    },
    {
      label: 'traefik.http.services.api.loadbalancer.server.port',
      value: '8080',
      description: 'Port du service backend pour le load balancer'
    }
  ];

  const handleCopyLabel = async (label, value) => {
    const fullLabel = `${label}=${value}`;
    try {
      await navigator.clipboard?.writeText(fullLabel);
      setCopiedLabel(label);
      setTimeout(() => setCopiedLabel(null), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          <h3 className="text-xl font-semibold text-teal-400">Labels essentiels</h3>
        </div>
        {getStatusIcon(status)}
      </div>
      <div className="space-y-3">
        {traefikLabels?.map((item, index) => (
          <div 
            key={index} 
            className="bg-slate-900/50 border border-slate-600/50 rounded-lg p-4 hover:border-slate-500/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-blue-400 text-sm font-mono bg-blue-500/10 px-2 py-1 rounded">
                    {item?.label}
                  </code>
                  <button
                    onClick={() => handleCopyLabel(item?.label, item?.value)}
                    className="p-1 hover:bg-slate-700 rounded transition-colors"
                    title="Copier le label"
                  >
                    {copiedLabel === item?.label ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400 hover:text-white" />
                    )}
                  </button>
                </div>
                <code className="text-orange-400 text-sm font-mono bg-slate-800/50 px-2 py-1 rounded block mb-2">
                  {item?.value}
                </code>
                <p className="text-slate-400 text-xs">{item?.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Configuration Example */}
      <div className="mt-6 p-4 bg-slate-900/30 rounded-lg border border-slate-600/30">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-teal-400" />
          <span className="text-slate-300 text-sm font-medium">Exemple docker-compose.yml</span>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 overflow-x-auto">
          <code className="text-xs font-mono text-slate-300 whitespace-pre">
{`version: '3.8'
services:
  api:
    image: trading-mvp-api:latest
    labels:
      - traefik.enable=true
      - traefik.http.routers.api.rule=Host(\`api.trading-mvp.com\`)
      - traefik.http.routers.api.entrypoints=websecure
      - traefik.http.routers.api.tls.certresolver=letsencrypt
      - traefik.http.services.api.loadbalancer.server.port=8080
    networks:
      - internal`}
          </code>
        </div>
      </div>
    </div>
  );
}