import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Activity, Shield, Brain, AlertTriangle, CheckCircle, Cpu, Database, TrendingUp } from 'lucide-react';

const OrganismHealthMonitor = ({ healthData }) => {
  const [vitalSigns, setVitalSigns] = useState({
    heartRate: 0,
    brainActivity: 0,
    immuneStrength: 0,
    adaptiveCapacity: 0
  });

  const [alerts, setAlerts] = useState([]);
  const [overallHealth, setOverallHealth] = useState(0);

  useEffect(() => {
    // Simulate real-time vital signs
    const updateVitalSigns = () => {
      const baseHeartRate = 72;
      const heartRateVariation = Math.sin(Date.now() / 1000) * 8;
      
      setVitalSigns({
        heartRate: Math.round(baseHeartRate + heartRateVariation),
        brainActivity: Math.round(85 + Math.random() * 15),
        immuneStrength: healthData?.immune?.defenseMetrics?.defenseStrength || 94,
        adaptiveCapacity: healthData?.governance?.autonomyLevel || 96
      });

      // Calculate overall health
      const avgHealth = (85 + (healthData?.immune?.defenseMetrics?.defenseStrength || 94) + (healthData?.governance?.autonomyLevel || 96)) / 3;
      setOverallHealth(Math.round(avgHealth));

      // Generate alerts based on health data
      const newAlerts = [];
      if (healthData?.immune?.threats?.length > 0) {
        newAlerts?.push({
          type: 'warning',
          message: `${healthData?.immune?.threats?.length} menaces détectées`,
          timestamp: new Date()?.toLocaleTimeString()
        });
      }
      
      if ((healthData?.governance?.autonomyLevel || 96) > 95) {
        newAlerts?.push({
          type: 'success',
          message: 'Autonomie optimale maintenue',
          timestamp: new Date()?.toLocaleTimeString()
        });
      }

      setAlerts(newAlerts?.slice(0, 3)); // Keep only latest 3 alerts
    };

    updateVitalSigns();
    const interval = setInterval(updateVitalSigns, 2000);

    return () => clearInterval(interval);
  }, [healthData]);

  const getHealthColor = (value) => {
    if (value >= 90) return 'text-green-400';
    if (value >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBgColor = (value) => {
    if (value >= 90) return 'bg-green-500/20';
    if (value >= 70) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const vitalSignsData = [
    {
      name: 'Rythme Cardiaque',
      value: vitalSigns?.heartRate,
      unit: 'bpm',
      icon: Heart,
      color: 'text-red-400',
      target: 75,
      description: 'Fréquence des cycles d\'exécution'
    },
    {
      name: 'Activité Cérébrale',
      value: vitalSigns?.brainActivity,
      unit: '%',
      icon: Brain,
      color: 'text-blue-400',
      target: 85,
      description: 'Intensité du processing IA'
    },
    {
      name: 'Système Immunitaire',
      value: vitalSigns?.immuneStrength,
      unit: '%',
      icon: Shield,
      color: 'text-green-400',
      target: 90,
      description: 'Force de défense active'
    },
    {
      name: 'Capacité Adaptative',
      value: vitalSigns?.adaptiveCapacity,
      unit: '%',
      icon: Activity,
      color: 'text-purple-400',
      target: 95,
      description: 'Niveau d\'auto-modification'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <div className={`p-4 rounded-lg border ${getHealthBgColor(overallHealth)} ${
        overallHealth >= 90 ? 'border-green-500/30' : 
        overallHealth >= 70 ? 'border-yellow-500/30' : 'border-red-500/30'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${getHealthBgColor(overallHealth)}`}>
              <Heart className={`w-5 h-5 ${getHealthColor(overallHealth)}`} />
            </div>
            <div className="ml-3">
              <h4 className="font-semibold text-white">État de Santé Global</h4>
              <p className="text-sm text-slate-400">Organisme vivant</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${getHealthColor(overallHealth)}`}>
              {overallHealth}%
            </p>
            <p className="text-xs text-slate-400">Optimal</p>
          </div>
        </div>

        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
          <motion.div
            className={`h-2 rounded-full ${
              overallHealth >= 90 ? 'bg-green-400' :
              overallHealth >= 70 ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${overallHealth}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
      {/* Vital Signs Grid */}
      <div className="grid grid-cols-2 gap-4">
        {vitalSignsData?.map((vital, index) => {
          const IconComponent = vital?.icon;
          const isHealthy = vital?.value >= vital?.target;
          
          return (
            <motion.div
              key={vital?.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                isHealthy ? 'bg-slate-800/50 border-slate-600/30' : 'bg-yellow-500/5 border-yellow-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-slate-800/50`}>
                  <IconComponent className={`w-4 h-4 ${vital?.color}`} />
                </div>
                {isHealthy ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-slate-300">{vital?.name}</span>
                  <div className="flex items-baseline">
                    <motion.span
                      key={vital?.value}
                      initial={{ scale: 1.2, color: vital?.color?.replace('text-', '#') }}
                      animate={{ scale: 1 }}
                      className={`text-lg font-bold text-white`}
                    >
                      {vital?.value}
                    </motion.span>
                    <span className="text-xs text-slate-400 ml-1">{vital?.unit}</span>
                  </div>
                </div>
                
                <div className="w-full bg-slate-700 h-1 rounded-full">
                  <motion.div
                    className="h-1 rounded-full"
                    style={{ 
                      background: vital?.color?.includes('red') ? '#f87171' :
                                 vital?.color?.includes('blue') ? '#60a5fa' :
                                 vital?.color?.includes('green') ? '#34d399' :
                                 '#a78bfa'
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (vital?.value / vital?.target) * 100)}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                
                <p className="text-xs text-slate-500">{vital?.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      {/* System Alerts */}
      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-600/30">
        <div className="flex items-center mb-3">
          <Activity className="w-4 h-4 text-orange-400 mr-2" />
          <h4 className="font-semibold text-orange-400">Alertes Système</h4>
        </div>
        
        <div className="space-y-2 max-h-32 overflow-y-auto">
          <AnimatePresence>
            {alerts?.length > 0 ? alerts?.map((alert, index) => (
              <motion.div
                key={`${alert?.timestamp}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center p-2 rounded border-l-2 ${
                  alert?.type === 'success' ? 'bg-green-500/10 border-green-500' :
                  alert?.type === 'warning'? 'bg-yellow-500/10 border-yellow-500' : 'bg-red-500/10 border-red-500'
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm text-white">{alert?.message}</p>
                  <p className="text-xs text-slate-400">{alert?.timestamp}</p>
                </div>
                {alert?.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-400 ml-2" />
                ) : (
                  <AlertTriangle className={`w-4 h-4 ml-2 ${
                    alert?.type === 'warning' ? 'text-yellow-400' : 'text-red-400'
                  }`} />
                )}
              </motion.div>
            )) : (
              <div className="text-center py-4 text-slate-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm">Aucune alerte active</p>
                <p className="text-xs">Tous les systèmes fonctionnent normalement</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-slate-800/30 rounded-lg border border-slate-600/20">
          <Cpu className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-white">2.4ms</p>
          <p className="text-xs text-slate-400">Latence</p>
        </div>
        
        <div className="text-center p-3 bg-slate-800/30 rounded-lg border border-slate-600/20">
          <Database className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-white">99.97%</p>
          <p className="text-xs text-slate-400">Uptime</p>
        </div>
        
        <div className="text-center p-3 bg-slate-800/30 rounded-lg border border-slate-600/20">
          <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-white">847/min</p>
          <p className="text-xs text-slate-400">Transactions</p>
        </div>
      </div>
    </div>
  );
};

export default OrganismHealthMonitor;