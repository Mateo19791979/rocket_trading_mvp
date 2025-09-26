import React from 'react';
import { Container, Shield, CheckCircle, XCircle, AlertCircle, Terminal, Lock } from 'lucide-react';

export default function DockerReverseProxyPanel({ status }) {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-emerald-400';
      case 'warning': return 'text-amber-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Container className="w-5 h-5 text-blue-400" />;
    }
  };

  const routes = [
    { path: '/status', description: 'État système', status: 'active' },
    { path: '/registry', description: 'Registre stratégies', status: 'active' },
    { path: '/scores', description: 'Scores performance', status: 'active' },
    { path: '/select', description: 'Sélection stratégie', status: 'active' },
    { path: '/allocate', description: 'Allocation portfolio', status: status === 'success' ? 'active' : 'pending' }
  ];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        {getStatusIcon()}
        <h2 className={`text-xl font-semibold ${getStatusColor()}`}>
          3) Docker & Reverse-proxy
        </h2>
      </div>
      {/* Docker Compose Command */}
      <div className="mb-6">
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300 text-sm">Commande de déploiement</span>
          </div>
          <code className="text-emerald-300 font-mono text-sm">
            docker compose up -d --build
          </code>
        </div>
      </div>
      {/* TLS Configuration */}
      <div className="mb-6 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-teal-400" />
          <span className="text-slate-300 font-medium">TLS Let's Encrypt</span>
          <div className="ml-auto">
            {status === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-slate-600 animate-pulse"></div>
            )}
          </div>
        </div>
        <div className="text-sm text-slate-400">
          Traefik/Caddy • Certificats automatiques • HTTPS forcé
        </div>
      </div>
      {/* API Routes */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          Routes API
        </h3>
        {routes?.map((route, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
              <code className="text-blue-300 font-mono text-sm">{route?.path}</code>
              <span className="text-slate-400 text-sm">{route?.description}</span>
            </div>
            <div className="flex items-center gap-2">
              {route?.status === 'active' ? (
                <>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-emerald-400 text-xs">Active</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-amber-400 text-xs">Config</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Proxy Status */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="text-center p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
          <Container className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <div className="text-slate-300 font-medium">Docker</div>
          <div className={status === 'success' ? 'text-emerald-400' : 'text-amber-400'}>
            {status === 'success' ? 'Running' : 'Building'}
          </div>
        </div>
        <div className="text-center p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
          <Shield className="w-5 h-5 text-teal-400 mx-auto mb-2" />
          <div className="text-slate-300 font-medium">Reverse Proxy</div>
          <div className={status === 'success' ? 'text-emerald-400' : 'text-amber-400'}>
            {status === 'success' ? 'Active' : 'Config'}
          </div>
        </div>
      </div>
    </div>
  );
}