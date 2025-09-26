import React from 'react';
import { Globe, ArrowRight, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

export default function DNSConfigurationPanel({ status }) {
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
      default: return <Globe className="w-5 h-5 text-blue-400" />;
    }
  };

  const dnsRecords = [
    {
      domain: 'trading-mvp.com',
      target: 'Rocket.new',
      type: 'frontend',
      status: status === 'success' ? 'active' : 'propagating'
    },
    {
      domain: 'api.trading-mvp.com',
      target: 'IP du VPS',
      type: 'backend',
      status: status === 'success' ? 'active' : 'propagating'
    }
  ];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        {getStatusIcon()}
        <h2 className={`text-xl font-semibold ${getStatusColor()}`}>
          2) DNS
        </h2>
      </div>
      <div className="space-y-4">
        {dnsRecords?.map((record, index) => (
          <div key={index} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <code className="text-blue-300 font-mono text-sm">{record?.domain}</code>
              </div>
              <div className="flex items-center gap-2">
                {record?.status === 'active' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                )}
                <span className="text-xs text-slate-400 capitalize">{record?.status}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Pointe vers</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <code className="text-teal-300 font-mono">{record?.target}</code>
              <span className={`px-2 py-1 rounded text-xs ${
                record?.type === 'frontend' ?'bg-blue-500/20 text-blue-300' :'bg-teal-500/20 text-teal-300'
              }`}>
                {record?.type}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* DNS Propagation Status */}
      <div className="mt-6 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-300">Propagation DNS</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-amber-400">En cours</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {['Europe', 'US-East', 'Asia', 'Global']?.map((region, index) => (
            <div key={region} className="text-center p-2 bg-slate-800/50 rounded">
              <div className="text-slate-400">{region}</div>
              <div className={`mt-1 ${index < 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {index < 2 ? '✓ OK' : '⏳ Pending'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}