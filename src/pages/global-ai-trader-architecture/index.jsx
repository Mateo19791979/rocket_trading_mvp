import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Activity, Zap, Shield, Database, Globe, Download, RefreshCw } from 'lucide-react';
import Header from '../../components/ui/Header';
import ServiceCard from './components/ServiceCard';
import DockerConfigPanel from './components/DockerConfigPanel';
import UIIntegrationPanel from './components/UIIntegrationPanel';
import SystemMetricsPanel from './components/SystemMetricsPanel';
import ServiceTopology from './components/ServiceTopology';

const GlobalAITraderArchitecture = () => {
  const [activeItem, setActiveItem] = useState('global-ai-trader-architecture');
  const [serviceStatuses, setServiceStatuses] = useState({});
  const [systemMetrics, setSystemMetrics] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Mock real-time service status updates
  useEffect(() => {
    const updateServiceStatuses = () => {
      setServiceStatuses({
        data_phoenix: { 
          status: Math.random() > 0.1 ? 'healthy' : 'warning',
          response_time: Math.floor(Math.random() * 200) + 50,
          uptime: '99.7%'
        },
        quant_oracle: { 
          status: Math.random() > 0.05 ? 'healthy' : 'error',
          response_time: Math.floor(Math.random() * 150) + 30,
          uptime: '99.9%'
        },
        immune_sentinel: { 
          status: Math.random() > 0.08 ? 'healthy' : 'warning',
          response_time: Math.floor(Math.random() * 180) + 40,
          uptime: '99.5%'
        },
        strategy_weaver: { 
          status: Math.random() > 0.06 ? 'healthy' : 'warning',
          response_time: Math.floor(Math.random() * 220) + 60,
          uptime: '99.8%'
        },
        deployer: { 
          status: Math.random() > 0.04 ? 'healthy' : 'error',
          response_time: Math.floor(Math.random() * 160) + 35,
          uptime: '99.9%'
        }
      });
    };

    updateServiceStatuses();
    const interval = setInterval(updateServiceStatuses, 3000);
    return () => clearInterval(interval);
  }, []);

  // Services configuration
  const services = [
    {
      id: 'data_phoenix',
      name: 'Data Phoenix',
      description: 'Ingestion marché temps réel',
      port: '18000→8000',
      path: './services/data_phoenix',
      tech: 'FastAPI',
      endpoints: [
        { path: '/health', method: 'GET', description: 'Service health status' },
        { path: '/prices', method: 'GET', description: 'Real-time market prices' },
        { path: '/prices?symbol=AAPL', method: 'GET', description: 'Symbol-specific prices' }
      ],
      icon: Database,
      color: 'blue'
    },
    {
      id: 'quant_oracle',
      name: 'Quant Oracle', 
      description: 'Signaux algorithmiques MA',
      port: '18001→8000',
      path: './services/quant_oracle',
      tech: 'FastAPI',
      endpoints: [
        { path: '/health', method: 'GET', description: 'Service health check' },
        { path: '/signals?fast=10&slow=30', method: 'GET', description: 'Moving average signals' },
        { path: '/signals', method: 'POST', description: 'Custom signal parameters' }
      ],
      icon: Activity,
      color: 'teal'
    },
    {
      id: 'immune_sentinel',
      name: 'Immune Sentinel',
      description: 'Détection volatilité & régime',
      port: '18002→8002',
      path: './services/immune_sentinel',
      tech: 'Node.js',
      endpoints: [
        { path: '/health', method: 'GET', description: 'Sentinel status' },
        { path: '/risk?window=20', method: 'GET', description: 'Risk metrics with time window' },
        { path: '/volatility', method: 'GET', description: 'Current volatility analysis' }
      ],
      icon: Shield,
      color: 'orange'
    },
    {
      id: 'strategy_weaver',
      name: 'Strategy Weaver',
      description: 'Génération stratégies options',
      port: '18003→8001',
      path: './services/strategy_weaver',
      tech: 'FastAPI',
      endpoints: [
        { path: '/health', method: 'GET', description: 'Weaver health status' },
        { path: '/proposal', method: 'POST', description: 'Strategy proposals (long_call, protective_put)' },
        { path: '/backtest', method: 'POST', description: 'Strategy backtesting' }
      ],
      icon: Zap,
      color: 'purple'
    },
    {
      id: 'deployer',
      name: 'Deployer',
      description: 'Orchestration exécution',
      port: '18004→8003',
      path: './services/deployer',
      tech: 'Node.js',
      endpoints: [
        { path: '/health', method: 'GET', description: 'Deployment status' },
        { path: '/plan', method: 'GET', description: 'Execution plans (WAIT, OPEN_LONG_CALL, REDUCE)' },
        { path: '/execute', method: 'POST', description: 'Execute trading plan' }
      ],
      icon: Server,
      color: 'green'
    }
  ];

  const handleRefreshAll = async () => {
    setRefreshing(true);
    // Simulate API calls to refresh all services
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const handleExportConfig = () => {
    const config = {
      services: services,
      docker_compose: {
        version: '3.8',
        services: services?.reduce((acc, service) => {
          acc[service.id] = {
            build: service?.path,
            ports: [service?.port],
            environment: ['NODE_ENV=production'],
            depends_on: service?.id === 'data_phoenix' ? [] : ['data_phoenix']
          };
          return acc;
        }, {}),
        dashboard: {
          build: './dashboard',
          ports: ['18005:8004'],
          depends_on: services?.map(s => s?.id)
        }
      }
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'globalai-trader-architecture.json';
    a?.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Header activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                GlobalAI Trader — Architecture IA (MVP)
              </h1>
              <p className="text-xl text-gray-400 mb-1">
                Services, endpoints & déploiement
              </p>
              <p className="text-sm text-gray-500">
                {new Date()?.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefreshAll}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </button>
              
              <button
                onClick={handleExportConfig}
                className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter Config
              </button>
            </div>
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Left Column - Services & Dashboard */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Services Section */}
            <div className="bg-gray-900/50 rounded-2xl p-6 shadow-xl border border-gray-800">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-600 rounded-lg mr-3">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">🧩 Services (FastAPI/Node)</h2>
                  <p className="text-gray-400 text-sm">Architecture microservices IA</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {services?.map((service) => (
                  <ServiceCard 
                    key={service?.id}
                    service={service}
                    status={serviceStatuses?.[service?.id]}
                  />
                ))}
              </div>
            </div>

            {/* Aggregated Dashboard */}
            <div className="bg-gray-900/50 rounded-2xl p-6 shadow-xl border border-gray-800">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-teal-600 rounded-lg mr-3">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">🔌 Dashboard Agrégé</h2>
                  <p className="text-gray-400 text-sm">Bus Monitor & intégration UI</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <h3 className="text-white font-semibold mb-2">Bus Monitor</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">→ /status</span>
                    <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">
                      Fusionne les 5 services pour l'UI
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <h3 className="text-white font-semibold mb-2">Rocket.new Integration</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Consomme /status</span>
                    <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">
                      via iframe/fetch
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Docker & UI Integration */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Docker Compose Configuration */}
            <DockerConfigPanel services={services} />

            {/* UI Integration Panel */}
            <UIIntegrationPanel />

            {/* System Metrics */}
            <SystemMetricsPanel services={services} serviceStatuses={serviceStatuses} />
          </motion.div>
        </div>

        {/* Service Topology Diagram - Full Width */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <ServiceTopology services={services} serviceStatuses={serviceStatuses} />
        </motion.div>
      </div>
    </div>
  );
};

export default GlobalAITraderArchitecture;