import React, { useState, useEffect } from 'react';
import { Server, Globe, Shield, Activity, CheckCircle, XCircle, AlertCircle, Monitor, Container } from 'lucide-react';
import ServerPrerequisitesPanel from './components/ServerPrerequisitesPanel';
import DNSConfigurationPanel from './components/DNSConfigurationPanel';
import DockerReverseProxyPanel from './components/DockerReverseProxyPanel';
import SecurityEnvironmentPanel from './components/SecurityEnvironmentPanel';
import GoLiveHealthCheckPanel from './components/GoLiveHealthCheckPanel';

import TechnicalDiagnosticPanel from './components/TechnicalDiagnosticPanel';
import Icon from '../../components/AppIcon';



export default function TradingMVPProductionDeploymentChecklist() {
  const [currentDate] = useState(new Date()?.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  const [deploymentStatus, setDeploymentStatus] = useState({
    server: 'pending',
    dns: 'pending',
    docker: 'pending',
    security: 'pending',
    health: 'pending'
  });

  useEffect(() => {
    // Simulate real-time status updates
    const interval = setInterval(() => {
      const statuses = ['pending', 'warning', 'success', 'error'];
      const randomStatus = statuses?.[Math.floor(Math.random() * statuses?.length)];
      const components = ['server', 'dns', 'docker', 'security', 'health'];
      const randomComponent = components?.[Math.floor(Math.random() * components?.length)];
      
      setDeploymentStatus(prev => ({
        ...prev,
        [randomComponent]: randomStatus
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Section */}
      <div className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  Trading-MVP — Checklist Mise en Production
                </h1>
              </div>
              <p className="text-slate-400 text-lg">
                DNS • Docker • TLS • Sécurité • Monitoring
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-300 text-sm">Date de déploiement</p>
              <p className="text-blue-400 font-semibold">{currentDate}</p>
            </div>
          </div>

          {/* Status Overview */}
          <div className="mt-6 grid grid-cols-5 gap-4">
            {[
              { key: 'server', label: 'Serveur', icon: Server },
              { key: 'dns', label: 'DNS', icon: Globe },
              { key: 'docker', label: 'Docker', icon: Container },
              { key: 'security', label: 'Sécurité', icon: Shield },
              { key: 'health', label: 'Go-Live', icon: Activity }
            ]?.map(({ key, label, icon: Icon }) => (
              <div 
                key={key}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex items-center gap-2"
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300 text-sm">{label}</span>
                <div className="ml-auto">
                  {getStatusIcon(deploymentStatus?.[key])}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action 2 Diagnostic Panel - Added at top */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <TechnicalDiagnosticPanel />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche */}
          <div className="space-y-6">
            {/* 1) Prérequis serveur */}
            <ServerPrerequisitesPanel status={deploymentStatus?.server} />

            {/* 2) DNS */}
            <DNSConfigurationPanel status={deploymentStatus?.dns} />

            {/* 3) Docker & Reverse-proxy */}
            <DockerReverseProxyPanel status={deploymentStatus?.docker} />
          </div>

          {/* Colonne droite */}
          <div className="space-y-6">
            {/* 4) .env & Sécurité */}
            <SecurityEnvironmentPanel status={deploymentStatus?.security} />

            {/* 5) Santé & Go-live */}
            <GoLiveHealthCheckPanel status={deploymentStatus?.health} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Monitor className="w-5 h-5 text-teal-400" />
              <span className="text-slate-300 font-medium">Production Ready Status</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400 mb-1">99.9%</div>
                <div className="text-slate-400">Uptime Target</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">&lt;400ms</div>
                <div className="text-slate-400">Latence /status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400 mb-1">TLS</div>
                <div className="text-slate-400">Let's Encrypt</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}