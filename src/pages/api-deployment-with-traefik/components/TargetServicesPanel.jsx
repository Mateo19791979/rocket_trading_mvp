import React, { useState } from 'react';
import { Server, Database, Brain, Shield, Wrench, ExternalLink, CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react';

export default function TargetServicesPanel({ status, serviceHealth }) {
  const [selectedService, setSelectedService] = useState(null);

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

  const getHealthStatusColor = (health) => {
    switch (health) {
      case 'healthy':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'warning':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'degraded':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'error':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      default:
        return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  const getHealthIcon = (health) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="w-3 h-3" />;
      case 'warning':
        return <AlertCircle className="w-3 h-3" />;
      case 'degraded':
        return <Activity className="w-3 h-3" />;
      case 'error':
        return <XCircle className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  const targetServices = [
    {
      name: 'backend',
      technology: 'Express',
      endpoints: ['/health', '/status', '/orders'],
      icon: Server,
      description: 'API principale avec gestion des ordres et statuts',
      port: '8080',
      health: serviceHealth?.backend || 'healthy'
    },
    {
      name: 'data_phoenix',
      technology: 'FastAPI',
      endpoints: ['/prices'],
      icon: Database,
      description: 'Service de données de marché et prix en temps réel',
      port: '8081',
      health: serviceHealth?.data_phoenix || 'healthy'
    },
    {
      name: 'quant_oracle',
      technology: 'FastAPI',
      endpoints: ['/signals'],
      icon: Brain,
      description: 'Générateur de signaux quantitatifs et prédictions',
      port: '8082',
      health: serviceHealth?.quant_oracle || 'healthy'
    },
    {
      name: 'strategy_weaver',
      technology: 'FastAPI',
      endpoints: ['/proposal'],
      icon: Brain,
      description: 'Orchestrateur de stratégies de trading',
      port: '8083',
      health: serviceHealth?.strategy_weaver || 'healthy'
    },
    {
      name: 'immune_sentinel',
      technology: 'FastAPI',
      endpoints: ['/risk'],
      icon: Shield,
      description: 'Contrôleur de risques et surveillance',
      port: '8084',
      health: serviceHealth?.immune_sentinel || 'healthy'
    },
    {
      name: 'deployer',
      technology: 'FastAPI',
      endpoints: ['/plan'],
      icon: Wrench,
      description: 'Service de déploiement et configuration',
      port: '8085',
      health: serviceHealth?.deployer || 'healthy'
    }
  ];

  const testEndpoint = (serviceName, endpoint) => {
    console.log(`Testing ${serviceName}${endpoint}`);
    // Simulation du test d'endpoint
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📦</span>
          <h3 className="text-xl font-semibold text-teal-400">Services cibles</h3>
        </div>
        {getStatusIcon(status)}
      </div>
      <div className="grid grid-cols-1 gap-4">
        {targetServices?.map((service, index) => {
          const IconComponent = service?.icon;
          const isSelected = selectedService === service?.name;
          
          return (
            <div 
              key={index}
              className={`bg-slate-900/50 border rounded-lg p-4 transition-all cursor-pointer ${
                isSelected 
                  ? 'border-teal-500/50 bg-teal-500/5' :'border-slate-600/50 hover:border-slate-500/50'
              }`}
              onClick={() => setSelectedService(isSelected ? null : service?.name)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-slate-700/50 rounded-lg">
                    <IconComponent className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-medium">{service?.name}</h4>
                      <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                        {service?.technology}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${getHealthStatusColor(service?.health)}`}>
                        {getHealthIcon(service?.health)}
                        {service?.health}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{service?.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {service?.endpoints?.map((endpoint, endpointIndex) => (
                        <button
                          key={endpointIndex}
                          onClick={(e) => {
                            e?.stopPropagation();
                            testEndpoint(service?.name, endpoint);
                          }}
                          className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/30 hover:bg-blue-500/20 transition-colors flex items-center gap-1"
                        >
                          {endpoint}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Port {service?.port}</span>
                </div>
              </div>
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-slate-600/50">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">URL interne:</span>
                      <div className="text-blue-400 font-mono bg-slate-800/50 p-2 rounded mt-1">
                        http://{service?.name}:{service?.port}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">URL externe:</span>
                      <div className="text-teal-400 font-mono bg-slate-800/50 p-2 rounded mt-1">
                        https://api.trading-mvp.com
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Service Health Summary */}
      <div className="mt-6 p-4 bg-slate-900/30 rounded-lg border border-slate-600/30">
        <div className="text-center text-slate-300 text-sm mb-3">État des services</div>
        <div className="grid grid-cols-6 gap-2 text-xs">
          {targetServices?.map((service, index) => (
            <div key={index} className="text-center">
              <div className={`w-full h-3 rounded-full mb-1 ${
                service?.health === 'healthy' ? 'bg-emerald-400/20' :
                service?.health === 'warning' ? 'bg-amber-400/20' :
                service?.health === 'degraded' ? 'bg-orange-400/20' : 'bg-red-400/20'
              }`}>
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    service?.health === 'healthy' ? 'bg-emerald-400 w-full' :
                    service?.health === 'warning' ? 'bg-amber-400 w-3/4' :
                    service?.health === 'degraded' ? 'bg-orange-400 w-1/2' : 'bg-red-400 w-1/4'
                  }`}
                />
              </div>
              <div className="text-slate-400 truncate">{service?.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}