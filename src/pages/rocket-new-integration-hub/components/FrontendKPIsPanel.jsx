import React, { useState, useEffect } from 'react';
import { BarChart3, Zap, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const FrontendKPIsPanel = () => {
  const [kpiValues, setKpiValues] = useState({
    ttfb: 0,
    cls: 0,
    errorRate: 0,
    uptime: 0
  });

  useEffect(() => {
    // Simulate real-time KPI updates
    const interval = setInterval(() => {
      setKpiValues({
        ttfb: Math.floor(Math.random() * 400) + 150, // 150-550ms
        cls: (Math.random() * 0.3)?.toFixed(3), // 0-0.3
        errorRate: (Math.random() * 2)?.toFixed(2), // 0-2%
        uptime: (98 + Math.random() * 2)?.toFixed(2) // 98-100%
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const kpiMetrics = [
    {
      key: 'ttfb',
      label: 'TTFB',
      target: '< 300 ms',
      value: `${kpiValues?.ttfb} ms`,
      status: kpiValues?.ttfb < 300 ? 'good' : 'warning',
      icon: Zap,
      color: 'teal'
    },
    {
      key: 'cls',
      label: 'CLS',
      target: '~ 0',
      value: kpiValues?.cls,
      status: parseFloat(kpiValues?.cls) < 0.1 ? 'good' : 'warning',
      icon: TrendingUp,
      color: 'orange'
    },
    {
      key: 'errorRate',
      label: 'Erreurs fetch',
      target: '< 1%',
      value: `${kpiValues?.errorRate}%`,
      status: parseFloat(kpiValues?.errorRate) < 1 ? 'good' : 'warning',
      icon: AlertTriangle,
      color: 'teal'
    },
    {
      key: 'uptime',
      label: 'Disponibilité',
      target: '> 99%',
      value: `${kpiValues?.uptime}%`,
      status: parseFloat(kpiValues?.uptime) > 99 ? 'good' : 'warning',
      icon: CheckCircle,
      color: 'orange'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-teal-400 bg-teal-500/20';
      case 'warning': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-red-400 bg-red-500/20';
    }
  };

  const getStatusBorder = (status) => {
    switch (status) {
      case 'good': return 'border-teal-400/30';
      case 'warning': return 'border-orange-400/30';
      default: return 'border-red-400/30';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-lg mr-4">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">📈 KPI front</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kpiMetrics?.map((metric) => {
          const IconComponent = metric?.icon;
          return (
            <div key={metric?.key} className={`p-4 rounded-lg border transition-all ${
              getStatusColor(metric?.status)
            } ${getStatusBorder(metric?.status)} hover:bg-white/10`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <IconComponent className="w-5 h-5 mr-2" />
                  <span className="font-semibold">• {metric?.label}</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  metric?.status === 'good' ? 'bg-teal-400' : 'bg-orange-400'
                } animate-pulse`}></div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {metric?.value}
                </div>
                <div className="text-sm text-gray-300">
                  Cible: {metric?.target}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Real-time Monitoring Dashboard */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <h4 className="font-semibold text-white mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Monitoring en temps réel
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Alertes actives</p>
            <p className="text-sm text-white">
              {kpiMetrics?.filter(m => m?.status === 'warning')?.length} seuil(s) dépassé(s)
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Dernière mise à jour</p>
            <p className="text-sm text-white">
              {new Date()?.toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </div>
      </div>
      {/* Performance Targets */}
      <div className="mt-4 p-4 bg-gradient-to-r from-teal-500/10 to-orange-500/10 rounded-lg border border-white/10">
        <p className="text-sm text-white mb-2">
          🎯 <strong>Objectifs de performance optimale:</strong>
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
          <div>• Latence API &lt; 200ms</div>
          <div>• Zero layout shift</div>
          <div>• 100% uptime visé</div>
          <div>• 0% erreurs réseau</div>
        </div>
      </div>
    </div>
  );
};

export default FrontendKPIsPanel;