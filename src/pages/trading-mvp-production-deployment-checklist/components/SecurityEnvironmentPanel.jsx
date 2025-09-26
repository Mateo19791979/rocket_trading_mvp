import React from 'react';
import { Shield, Lock, Eye, Settings, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function SecurityEnvironmentPanel({ status }) {
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
      default: return <Shield className="w-5 h-5 text-blue-400" />;
    }
  };

  const envVariables = [
    {
      key: 'CORS_ORIGIN',
      value: 'https://trading-mvp.com',
      type: 'security',
      status: status === 'success' ? 'configured' : 'pending'
    },
    {
      key: 'RATE_LIMIT_ORDERS',
      value: '100/hour',
      type: 'rate-limit',
      status: status === 'success' ? 'configured' : 'pending'
    },
    {
      key: 'LOG_LEVEL',
      value: 'production',
      type: 'logging',
      status: status === 'success' ? 'configured' : 'pending'
    }
  ];

  const securityFeatures = [
    {
      icon: <Lock className="w-4 h-4" />,
      title: 'Supabase RLS activée',
      status: status === 'success' ? 'enabled' : 'configuring'
    },
    {
      icon: <Shield className="w-4 h-4" />,
      title: 'Auth + rate-limit sur /orders',
      status: status === 'success' ? 'enabled' : 'configuring'
    }
  ];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        {getStatusIcon()}
        <h2 className={`text-xl font-semibold ${getStatusColor()}`}>
          4) .env & Sécurité
        </h2>
      </div>
      {/* Environment Variables */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-400" />
          Variables d'environnement
        </h3>
        {envVariables?.map((env, index) => (
          <div key={index} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <code className="text-blue-300 font-mono text-sm">{env.key}</code>
              <div className="flex items-center gap-2">
                {env.status === 'configured' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-600 animate-pulse"></div>
                )}
                <span className={`px-2 py-1 rounded text-xs ${
                  env.type === 'security' ? 'bg-red-500/20 text-red-300' :
                  env.type === 'rate-limit'? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {env.type}
                </span>
              </div>
            </div>
            <code className="text-teal-300 font-mono text-sm">{env.value}</code>
          </div>
        ))}
      </div>
      {/* Security Features */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-400" />
          Fonctionnalités sécurité
        </h3>
        {securityFeatures?.map((feature, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                {feature?.icon}
              </div>
              <span className="text-slate-300">{feature?.title}</span>
            </div>
            <div className="flex items-center gap-2">
              {feature?.status === 'enabled' ? (
                <>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-emerald-400 text-xs">Activé</span>
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
      {/* Security Summary */}
      <div className="mt-6 bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-red-400" />
          <span className="text-red-300 font-medium text-sm">Sécurité critique</span>
        </div>
        <div className="text-xs text-slate-400">
          Authentification obligatoire • Rate limiting activé • RLS policies en place
        </div>
      </div>
    </div>
  );
}