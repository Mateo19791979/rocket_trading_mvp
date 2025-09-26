import React, { useState, useEffect } from 'react';
import { Network, Settings, Package, Shield, CheckCircle, XCircle, AlertCircle, Activity, Monitor } from 'lucide-react';
import SimpleArchitecturePanel from './components/SimpleArchitecturePanel';
import EssentialLabelsPanel from './components/EssentialLabelsPanel';
import TargetServicesPanel from './components/TargetServicesPanel';
import IntegratedSecurityPanel from './components/IntegratedSecurityPanel';
import Icon from '../../components/AppIcon';


export default function APIDeploymentWithTraefik() {
  const [currentDate] = useState(new Date()?.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  const [deploymentStatus, setDeploymentStatus] = useState({
    architecture: 'pending',
    labels: 'pending',
    services: 'pending',
    security: 'pending'
  });

  const [serviceHealth, setServiceHealth] = useState({
    backend: Math.random() > 0.3 ? 'healthy' : 'degraded',
    data_phoenix: Math.random() > 0.2 ? 'healthy' : 'error',
    quant_oracle: Math.random() > 0.4 ? 'healthy' : 'warning',
    strategy_weaver: Math.random() > 0.3 ? 'healthy' : 'healthy',
    immune_sentinel: Math.random() > 0.1 ? 'healthy' : 'warning',
    deployer: Math.random() > 0.2 ? 'healthy' : 'healthy'
  });

  useEffect(() => {
    // Simulate real-time status updates
    const interval = setInterval(() => {
      const statuses = ['pending', 'warning', 'success', 'error'];
      const randomStatus = statuses?.[Math.floor(Math.random() * statuses?.length)];
      const components = ['architecture', 'labels', 'services', 'security'];
      const randomComponent = components?.[Math.floor(Math.random() * components?.length)];
      
      setDeploymentStatus(prev => ({
        ...prev,
        [randomComponent]: randomStatus
      }));

      // Update service health
      const services = ['backend', 'data_phoenix', 'quant_oracle', 'strategy_weaver', 'immune_sentinel', 'deployer'];
      const healthStatuses = ['healthy', 'warning', 'degraded', 'error'];
      const randomService = services?.[Math.floor(Math.random() * services?.length)];
      const randomHealth = healthStatuses?.[Math.floor(Math.random() * healthStatuses?.length)];
      
      setServiceHealth(prev => ({
        ...prev,
        [randomService]: randomHealth
      }));
    }, 4000);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-900">
      {/* Header Section */}
      <div className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">
                  Déploiement API avec Traefik
                </h1>
              </div>
              <p className="text-slate-300 text-lg">
                api.trading-mvp.com • TLS auto • Reverse-proxy sécurisé
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-300 text-sm">Date</p>
              <p className="text-blue-400 font-semibold">{currentDate}</p>
            </div>
          </div>

          {/* Status Overview */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            {[
              { key: 'architecture', label: 'Architecture', icon: Network },
              { key: 'labels', label: 'Labels', icon: Settings },
              { key: 'services', label: 'Services', icon: Package },
              { key: 'security', label: 'Sécurité', icon: Shield }
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche */}
          <div className="space-y-6">
            {/* 🧭 Architecture simple */}
            <SimpleArchitecturePanel status={deploymentStatus?.architecture} />

            {/* ⚙️ Labels essentiels */}
            <EssentialLabelsPanel status={deploymentStatus?.labels} />
          </div>

          {/* Colonne droite */}
          <div className="space-y-6">
            {/* 📦 Services cibles */}
            <TargetServicesPanel 
              status={deploymentStatus?.services} 
              serviceHealth={serviceHealth} 
            />

            {/* 🔒 Sécurité intégrée */}
            <IntegratedSecurityPanel status={deploymentStatus?.security} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Monitor className="w-5 h-5 text-teal-400" />
              <span className="text-slate-300 font-medium">Traefik Deployment Status</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400 mb-1">80/443</div>
                <div className="text-slate-400">Ports actifs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">Let's Encrypt</div>
                <div className="text-slate-400">TLS automatique</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">6</div>
                <div className="text-slate-400">Services actifs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}