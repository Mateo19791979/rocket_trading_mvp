import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Database, 
  Cpu, 
  Clock, 
  TrendingUp, 
  Zap,
  Server,
  BarChart3,
  Eye,
  RefreshCw
} from 'lucide-react';

const TechnicalMetricsPanel = () => {
  const [metrics, setMetrics] = useState({
    pipeline: {
      uptime: 98.7,
      throughput: 1247,
      latency: 87,
      errorRate: 0.3
    },
    registry: {
      strategies: 156,
      documents: 2341,
      processed: 89.2,
      indexed: 156
    },
    scoring: {
      calculations: 45678,
      accuracy: 94.7,
      speed: 23.4,
      models: 12
    },
    orchestrator: {
      selections: 234,
      allocations: 89,
      rebalances: 23,
      performance: 97.3
    }
  });

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time metric updates
      setMetrics(prev => ({
        ...prev,
        pipeline: {
          ...prev?.pipeline,
          throughput: prev?.pipeline?.throughput + Math.floor(Math.random() * 20 - 10),
          latency: Math.max(50, prev?.pipeline?.latency + Math.floor(Math.random() * 10 - 5))
        },
        scoring: {
          ...prev?.scoring,
          calculations: prev?.scoring?.calculations + Math.floor(Math.random() * 100)
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const MetricCard = ({ icon, title, value, unit, status, color, trend }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-900/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${
          color === 'green' ? 'bg-green-500/20 text-green-400' :
          color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' :
          color === 'teal' ? 'bg-teal-500/20 text-teal-400' :
          color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
          color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-300">{title}</h4>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">{value}</span>
            <span className="text-xs text-gray-400">{unit}</span>
            {trend && (
              <div className={`flex items-center gap-1 text-xs ${
                trend > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">Status:</span>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${
            status === 'excellent' ? 'bg-green-400' :
            status === 'good' ? 'bg-blue-400' :
            status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
          }`}></div>
          <span className={`capitalize ${
            status === 'excellent' ? 'text-green-400' :
            status === 'good' ? 'text-blue-400' :
            status === 'warning' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {status}
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Métriques Techniques</h2>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-gray-300 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm text-gray-300">Actualiser</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Pipeline Metrics */}
        <div className="col-span-full lg:col-span-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-cyan-400" />
            Pipeline & Infrastructure
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={<Activity className="h-4 w-4" />}
              title="Uptime"
              value={metrics?.pipeline?.uptime}
              unit="%"
              status="excellent"
              color="green"
              trend={+0.2}
            />
            <MetricCard
              icon={<Zap className="h-4 w-4" />}
              title="Throughput"
              value={metrics?.pipeline?.throughput}
              unit="req/min"
              status="good"
              color="cyan"
              trend={+12.3}
            />
            <MetricCard
              icon={<Clock className="h-4 w-4" />}
              title="Latence Moyenne"
              value={metrics?.pipeline?.latency}
              unit="ms"
              status="excellent"
              color="teal"
              trend={-5.1}
            />
            <MetricCard
              icon={<Eye className="h-4 w-4" />}
              title="Taux d'Erreur"
              value={metrics?.pipeline?.errorRate}
              unit="%"
              status="excellent"
              color="green"
              trend={-0.1}
            />
          </div>
        </div>

        {/* Registry Metrics */}
        <div className="col-span-full lg:col-span-4">
          <h3 className="text-lg font-semibold text-white mb-4 mt-6 flex items-center gap-2">
            <Database className="h-5 w-5 text-orange-400" />
            Registry & Données
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={<Database className="h-4 w-4" />}
              title="Stratégies Indexées"
              value={metrics?.registry?.strategies}
              unit="items"
              status="good"
              color="orange"
              trend={+8.9}
            />
            <MetricCard
              icon={<Database className="h-4 w-4" />}
              title="Documents Traités"
              value={metrics?.registry?.documents}
              unit="docs"
              status="excellent"
              color="teal"
              trend={+15.2}
            />
            <MetricCard
              icon={<Cpu className="h-4 w-4" />}
              title="Taux Traitement"
              value={metrics?.registry?.processed}
              unit="%"
              status="good"
              color="blue"
              trend={+3.4}
            />
            <MetricCard
              icon={<TrendingUp className="h-4 w-4" />}
              title="Score Qualité"
              value="94.7"
              unit="/100"
              status="excellent"
              color="green"
              trend={+1.2}
            />
          </div>
        </div>

        {/* Scoring & Orchestrator */}
        <div className="col-span-full lg:col-span-4">
          <h3 className="text-lg font-semibold text-white mb-4 mt-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Scoring & Orchestrateur
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={<Cpu className="h-4 w-4" />}
              title="Calculs/Jour"
              value="45.6k"
              unit="ops"
              status="excellent"
              color="blue"
              trend={+22.1}
            />
            <MetricCard
              icon={<TrendingUp className="h-4 w-4" />}
              title="Précision Scoring"
              value={metrics?.scoring?.accuracy}
              unit="%"
              status="excellent"
              color="teal"
              trend={+0.8}
            />
            <MetricCard
              icon={<Zap className="h-4 w-4" />}
              title="Sélections Auto"
              value={metrics?.orchestrator?.selections}
              unit="trades"
              status="good"
              color="cyan"
              trend={+18.5}
            />
            <MetricCard
              icon={<Activity className="h-4 w-4" />}
              title="Performance Orch."
              value={metrics?.orchestrator?.performance}
              unit="%"
              status="excellent"
              color="green"
              trend={+2.3}
            />
          </div>
        </div>
      </div>
      {/* Health Summary */}
      <div className="bg-gradient-to-r from-green-900/20 to-cyan-900/20 rounded-lg p-4 border border-green-600/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h4 className="text-green-400 font-medium">Système Global: Opérationnel</h4>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Composants Actifs:</span>
            <span className="text-green-400 font-medium">4/4</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Santé Globale:</span>
            <span className="text-green-400 font-medium">97.8%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Prochaine Maint.:</span>
            <span className="text-gray-400">2h 15min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Alertes Actives:</span>
            <span className="text-green-400 font-medium">0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalMetricsPanel;