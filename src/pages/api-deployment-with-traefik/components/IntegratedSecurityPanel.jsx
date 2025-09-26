import React, { useState, useEffect } from 'react';
import { Shield, Eye, AlertTriangle, Activity, CheckCircle, XCircle, AlertCircle, Lock, Globe } from 'lucide-react';

export default function IntegratedSecurityPanel({ status }) {
  const [securityMetrics, setSecurityMetrics] = useState({
    hstsEnabled: true,
    dashboardProtected: true,
    corsConfigured: true,
    ordersSecured: true,
    rateLimitActive: true,
    auditLogging: true
  });

  const [auditLogs, setAuditLogs] = useState([
    { time: '16:39:12', action: 'ORDER_CREATED', user: 'user_123', ip: '192.168.1.10', status: 'success' },
    { time: '16:38:45', action: 'AUTH_LOGIN', user: 'admin', ip: '10.0.1.5', status: 'success' },
    { time: '16:37:21', action: 'RATE_LIMIT_HIT', user: 'user_456', ip: '172.16.0.2', status: 'blocked' },
    { time: '16:36:58', action: 'ORDER_REJECTED', user: 'user_789', ip: '192.168.1.15', status: 'error' }
  ]);

  useEffect(() => {
    // Simulate real-time security monitoring
    const interval = setInterval(() => {
      // Add new audit log
      const actions = ['ORDER_CREATED', 'AUTH_LOGIN', 'RATE_LIMIT_HIT', 'ORDER_REJECTED', 'DASHBOARD_ACCESS'];
      const statuses = ['success', 'blocked', 'error', 'warning'];
      const now = new Date();
      const timeString = now?.toLocaleTimeString('fr-FR', { hour12: false })?.slice(0, 8);
      
      const newLog = {
        time: timeString,
        action: actions?.[Math.floor(Math.random() * actions?.length)],
        user: `user_${Math.floor(Math.random() * 1000)}`,
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        status: statuses?.[Math.floor(Math.random() * statuses?.length)]
      };

      setAuditLogs(prev => [newLog, ...prev?.slice(0, 6)]);

      // Simulate security metric changes
      const metrics = Object.keys(securityMetrics);
      const randomMetric = metrics?.[Math.floor(Math.random() * metrics?.length)];
      setSecurityMetrics(prev => ({
        ...prev,
        [randomMetric]: Math.random() > 0.1 // 90% chance of being true
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [securityMetrics]);

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

  const getLogStatusColor = (logStatus) => {
    switch (logStatus) {
      case 'success':
        return 'text-emerald-400';
      case 'blocked':
        return 'text-amber-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-orange-400';
      default:
        return 'text-slate-400';
    }
  };

  const securityFeatures = [
    {
      name: 'HSTS Headers',
      description: 'HTTP Strict Transport Security activé',
      enabled: securityMetrics?.hstsEnabled,
      icon: Lock
    },
    {
      name: 'No-Sniff Protection',
      description: 'Protection contre le MIME type sniffing',
      enabled: true,
      icon: Shield
    },
    {
      name: 'Dashboard Protégé',
      description: 'Tableau de bord Traefik sécurisé',
      enabled: securityMetrics?.dashboardProtected,
      icon: Eye
    },
    {
      name: 'CORS Configuration',
      description: 'CORS_ORIGIN=https://trading-mvp.com',
      enabled: securityMetrics?.corsConfigured,
      icon: Globe
    }
  ];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔒</span>
          <h3 className="text-xl font-semibold text-teal-400">Sécurité intégrée</h3>
        </div>
        {getStatusIcon(status)}
      </div>
      {/* Security Features */}
      <div className="space-y-3 mb-6">
        {securityFeatures?.map((feature, index) => {
          const IconComponent = feature?.icon;
          return (
            <div key={index} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-600/50">
              <div className="p-2 bg-slate-700/50 rounded-lg">
                <IconComponent className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{feature?.name}</span>
                  <div className={`w-2 h-2 rounded-full ${feature?.enabled ? 'bg-emerald-400' : 'bg-red-400'}`} />
                </div>
                <p className="text-slate-400 text-xs">{feature?.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      {/* Orders Security Section */}
      <div className="bg-slate-900/30 rounded-lg border border-slate-600/30 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <span className="text-orange-400 text-sm font-medium">/orders: Sécurité renforcée</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${securityMetrics?.ordersSecured ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <div className="text-slate-300">Auth requise</div>
          </div>
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${securityMetrics?.rateLimitActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <div className="text-slate-300">Rate-limit</div>
          </div>
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${securityMetrics?.auditLogging ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <div className="text-slate-300">Audit logs</div>
          </div>
        </div>
      </div>
      {/* Real-time Security Monitoring */}
      <div className="bg-slate-900/30 rounded-lg border border-slate-600/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-teal-400" />
          <span className="text-slate-300 text-sm font-medium">Monitoring temps réel</span>
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {auditLogs?.map((log, index) => (
            <div key={index} className="flex items-center justify-between text-xs bg-slate-800/50 rounded p-2">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-mono">{log?.time}</span>
                <span className="text-blue-400">{log?.action}</span>
                <span className="text-slate-400">{log?.user}</span>
                <span className="text-slate-500">{log?.ip}</span>
              </div>
              <span className={`font-medium ${getLogStatusColor(log?.status)}`}>
                {log?.status?.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}