import React from 'react';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  Database,
  Zap,
  Download
} from 'lucide-react';

export default function GoLiveHealthCheckPanel({ status }) {
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
      default: return <Activity className="w-5 h-5 text-blue-400" />;
    }
  };

  const healthChecks = [
    {
      icon: <Activity className="w-4 h-4" />,
      title: '/health OK sur tous les services',
      description: 'Vérification endpoints santé',
      status: status === 'success' ? 'pass' : 'running',
      latency: status === 'success' ? '156ms' : 'testing...'
    },
    {
      icon: <Clock className="w-4 h-4" />,
      title: 'Latence /status < 400 ms',
      description: 'Performance API critique',
      status: status === 'success' ? 'pass' : 'running',
      latency: status === 'success' ? '287ms' : 'testing...'
    },
    {
      icon: <FileText className="w-4 h-4" />,
      title: 'Export PDF Rocket OK',
      description: 'Génération rapports',
      status: status === 'success' ? 'pass' : 'running',
      latency: status === 'success' ? '1.2s' : 'testing...'
    },
    {
      icon: <Database className="w-4 h-4" />,
      title: 'Sauvegardes: volumes data & config',
      description: 'Backup automatique',
      status: status === 'success' ? 'pass' : 'configuring',
      latency: status === 'success' ? 'Daily' : 'setup...'
    }
  ];

  const kpis = [
    {
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      label: 'Uptime',
      value: status === 'success' ? '99.9%' : '- -',
      target: '> 99%'
    },
    {
      icon: <Clock className="w-5 h-5 text-blue-400" />,
      label: 'Latence',
      value: status === 'success' ? '287ms' : '- -',
      target: '< 400ms'
    },
    {
      icon: <Download className="w-5 h-5 text-teal-400" />,
      label: 'PDF Export',
      value: status === 'success' ? 'OK' : '- -',
      target: 'Functional'
    }
  ];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        {getStatusIcon()}
        <h2 className={`text-xl font-semibold ${getStatusColor()}`}>
          5) Santé & Go-live
        </h2>
      </div>
      {/* Health Checks */}
      <div className="space-y-3 mb-6">
        {healthChecks?.map((check, index) => (
          <div key={index} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="text-slate-400">
                  {check?.icon}
                </div>
                <div>
                  <div className="text-slate-300 font-medium text-sm">{check?.title}</div>
                  <div className="text-slate-500 text-xs">{check?.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <code className="text-blue-300 font-mono text-xs">{check?.latency}</code>
                <div className="flex items-center gap-1">
                  {check?.status === 'pass' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : check?.status === 'running' ? (
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* KPIs Dashboard */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis?.map((kpi, index) => (
          <div key={index} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-center">
            <div className="flex justify-center mb-2">
              {kpi?.icon}
            </div>
            <div className="text-slate-300 font-medium text-sm mb-1">{kpi?.label}</div>
            <div className="text-lg font-bold text-white mb-1">{kpi?.value}</div>
            <div className="text-xs text-slate-500">Target: {kpi?.target}</div>
          </div>
        ))}
      </div>
      {/* Go-Live Status */}
      <div className={`p-4 rounded-lg border ${
        status === 'success' ?'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20' :'bg-gradient-to-r from-amber-500/10 to-blue-500/10 border-amber-500/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status === 'success' ? (
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            ) : (
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            )}
            <div>
              <div className={`font-semibold ${
                status === 'success' ? 'text-emerald-300' : 'text-amber-300'
              }`}>
                {status === 'success' ? 'Production Ready ✓' : 'Validation en cours...'}
              </div>
              <div className="text-xs text-slate-400">
                {status === 'success' ?'Tous les systèmes opérationnels' :'Vérification des composants système'
                }
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              status === 'success' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {status === 'success' ? '100%' : '78%'}
            </div>
            <div className="text-xs text-slate-400">Readiness</div>
          </div>
        </div>
      </div>
    </div>
  );
}