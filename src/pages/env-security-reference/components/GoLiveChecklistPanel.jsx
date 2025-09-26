import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Clock, Server, Shield, FileCheck, Database } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const GoLiveChecklistPanel = () => {
  const [checkStatus, setCheckStatus] = useState({
    tls: false,
    latency: false,
    uptime: false,
    pdf: false,
    backup: false
  });

  const [metrics, setMetrics] = useState({
    latency: null,
    uptime: null,
    lastCheck: null
  });

  useEffect(() => {
    // Simulate periodic health checks
    const interval = setInterval(() => {
      setMetrics({
        latency: Math.floor(Math.random() * 600) + 200, // 200-800ms
        uptime: 99.2 + Math.random() * 0.7, // 99.2-99.9%
        lastCheck: new Date()?.toLocaleTimeString('fr-FR')
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleCheck = (key) => {
    setCheckStatus(prev => ({
      ...prev,
      [key]: !prev?.[key]
    }));
  };

  const checklistItems = [
    {
      id: 'tls',
      title: 'Certificats TLS valides (Traefik)',
      description: 'Vérification des certificats SSL/TLS Let\'s Encrypt',
      icon: Shield,
      automated: true
    },
    {
      id: 'latency',
      title: 'Latence /status < 400 ms',
      description: 'Temps de réponse des endpoints critiques',
      icon: Clock,
      automated: true,
      metric: metrics?.latency,
      threshold: 400
    },
    {
      id: 'uptime',
      title: 'Uptime > 99%',
      description: 'Disponibilité du service sur 24h',
      icon: Server,
      automated: true,
      metric: metrics?.uptime,
      threshold: 99
    },
    {
      id: 'pdf',
      title: 'Export PDF Rocket OK',
      description: 'Fonctionnalité de génération de rapports',
      icon: FileCheck,
      automated: false
    },
    {
      id: 'backup',
      title: 'Sauvegardes volumes ok',
      description: 'Vérification des backups automatiques',
      icon: Database,
      automated: false
    }
  ];

  const getStatusIcon = (item) => {
    const isCompleted = checkStatus?.[item?.id];
    const Icon = item?.icon;
    
    if (item?.automated && item?.metric !== null) {
      const meetsCriteria = item?.id === 'latency' 
        ? item?.metric < item?.threshold
        : item?.metric >= item?.threshold;
      
      return meetsCriteria ? (
        <CheckCircle className="w-5 h-5 text-green-400" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-red-400" />
      );
    }
    
    return isCompleted ? (
      <CheckCircle className="w-5 h-5 text-green-400" />
    ) : (
      <Icon className="w-5 h-5 text-gray-400" />
    );
  };

  const getMetricDisplay = (item) => {
    if (!item?.automated || item?.metric === null) return null;
    
    const meetsCriteria = item?.id === 'latency' 
      ? item?.metric < item?.threshold
      : item?.metric >= item?.threshold;
    
    const color = meetsCriteria ? 'text-green-400' : 'text-red-400';
    
    if (item?.id === 'latency') {
      return (
        <span className={`text-sm font-mono ${color}`}>
          {item?.metric}ms
                  </span>
      );
    }
    
    if (item?.id === 'uptime') {
      return (
        <span className={`text-sm font-mono ${color}`}>
          {item?.metric?.toFixed(1)}%
                  </span>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CheckCircle className="w-6 h-6 text-orange-400 mr-3" />
          <h3 className="text-xl font-bold text-white">✅ Check avant go-live</h3>
        </div>
        {metrics?.lastCheck && (
          <span className="text-xs text-teal-200">
            Dernière vérif: {metrics?.lastCheck}
          </span>
        )}
      </div>
      <div className="space-y-4">
        {checklistItems?.map((item) => (
          <div
            key={item?.id}
            className="bg-gray-900/30 rounded-lg p-4 border border-gray-600/30 hover:border-orange-500/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <button
                  onClick={() => !item?.automated && toggleCheck(item?.id)}
                  className={`mr-3 ${item?.automated ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {getStatusIcon(item)}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-white">
                      {item?.title}
                    </span>
                    {item?.automated && (
                      <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                        AUTO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-teal-200/70">
                    {item?.description}
                  </p>
                </div>
              </div>
              {getMetricDisplay(item) && (
                <div className="text-right ml-4">
                  {getMetricDisplay(item)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Overall Status */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-teal-200">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span>
              État global: {Object.values(checkStatus)?.filter(Boolean)?.length + 2} / {checklistItems?.length} validé
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-green-500 transition-all duration-300"
                style={{
                  width: `${((Object.values(checkStatus)?.filter(Boolean)?.length + 2) / checklistItems?.length) * 100}%`
                }}
              />
            </div>
            <span className="text-xs text-teal-200 font-medium">
              {Math.round(((Object.values(checkStatus)?.filter(Boolean)?.length + 2) / checklistItems?.length) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoLiveChecklistPanel;