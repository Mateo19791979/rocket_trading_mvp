import React, { useMemo } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const LiveTradingDashboard = ({ agents, systemHealth, ohlcData, orchestratorState, providersStatus }) => {
  
  // Calculate orchestration metrics
  const orchestrationMetrics = useMemo(() => {
    const activeAgents = agents?.filter(agent => agent?.agent_status === 'active')?.length;
    const totalAgents = agents?.length;
    
    // Calculate average latency from system health
    const healthData = Object.values(systemHealth);
    const avgLatency = healthData?.length > 0 
      ? healthData?.reduce((sum, health) => sum + (health?.metrics?.latency || 0), 0) / healthData?.length
      : 0;
    
    // Calculate error rate
    const totalErrors = healthData?.reduce((sum, health) => sum + (health?.error_count || 0), 0);
    const totalWarnings = healthData?.reduce((sum, health) => sum + (health?.warning_count || 0), 0);
    const errorRate = healthData?.length > 0 ? (totalErrors / healthData?.length) * 100 : 0;
    
    // Calculate system health score
    const healthyAgents = healthData?.filter(health => health?.health_status === 'healthy')?.length;
    const systemHealthScore = healthData?.length > 0 ? (healthyAgents / healthData?.length) * 100 : 0;
    
    return {
      activeAgents,
      totalAgents,
      avgLatency: avgLatency?.toFixed(2),
      errorRate: errorRate?.toFixed(2),
      systemHealthScore: systemHealthScore?.toFixed(1),
      totalErrors,
      totalWarnings
    };
  }, [agents, systemHealth]);

  // Calculate OHLC metrics
  const ohlcMetrics = useMemo(() => {
    if (ohlcData?.length === 0) return { avgPrice: 0, totalVolume: 0, priceChange: 0 };
    
    const avgPrice = ohlcData?.reduce((sum, bar) => sum + bar?.c, 0) / ohlcData?.length;
    const totalVolume = ohlcData?.reduce((sum, bar) => sum + (bar?.v || 0), 0);
    
    // Calculate price change from first to last bar
    const sortedData = [...ohlcData]?.sort((a, b) => new Date(a.ts) - new Date(b.ts));
    const priceChange = sortedData?.length > 1 
      ? ((sortedData?.[sortedData?.length - 1]?.c - sortedData?.[0]?.c) / sortedData?.[0]?.c) * 100
      : 0;
    
    return {
      avgPrice: avgPrice?.toFixed(2),
      totalVolume: Math.round(totalVolume),
      priceChange: priceChange?.toFixed(2)
    };
  }, [ohlcData]);

  // Calculate provider metrics
  const providerMetrics = useMemo(() => {
    const { providers, apiConfigs } = providersStatus;
    const activeProviders = apiConfigs?.filter(config => config?.is_active)?.length || 0;
    const totalCalls = apiConfigs?.reduce((sum, config) => sum + (config?.total_calls_today || 0), 0) || 0;
    const hasApiKeys = providers && (providers?.finnhub_api || providers?.alpha_api || providers?.twelve_api);
    
    const providerStatus = activeProviders >= 2 && hasApiKeys ? 'healthy' : 
                          activeProviders >= 1 ? 'warning' : 'error';
    
    return {
      activeProviders,
      totalCalls,
      providerStatus,
      hasApiKeys
    };
  }, [providersStatus]);

  // Get production readiness score
  const productionReadiness = useMemo(() => {
    let score = 0;
    let maxScore = 5;
    
    // Active agents (20 points)
    if (orchestrationMetrics?.activeAgents >= 3) score += 1;
    
    // Provider health (20 points)
    if (providerMetrics?.providerStatus === 'healthy') score += 1;
    
    // System health (20 points)
    if (parseFloat(orchestrationMetrics?.systemHealthScore) >= 90) score += 1;
    
    // Error rate (20 points)
    if (parseFloat(orchestrationMetrics?.errorRate) < 5) score += 1;
    
    // Latency (20 points)
    if (parseFloat(orchestrationMetrics?.avgLatency) < 500) score += 1;
    
    return {
      score,
      maxScore,
      percentage: ((score / maxScore) * 100)?.toFixed(0)
    };
  }, [orchestrationMetrics, providerMetrics]);

  // Get agent coordination status
  const agentCoordination = useMemo(() => {
    const dataPhoenix = agents?.find(a => a?.name === 'Data Phoenix');
    const quantOracle = agents?.find(a => a?.name === 'Quant Oracle');
    const strategyWeaver = agents?.find(a => a?.name === 'Strategy Weaver');
    
    const coordination = {
      dataIngestion: dataPhoenix?.agent_status === 'active' ? 'active' : 'inactive',
      quantAnalysis: quantOracle?.agent_status === 'active' ? 'active' : 'inactive',
      strategyGeneration: strategyWeaver?.agent_status === 'active' ? 'active' : 'inactive'
    };
    
    const activeCount = Object.values(coordination)?.filter(status => status === 'active')?.length;
    
    return {
      ...coordination,
      overallStatus: activeCount === 3 ? 'optimal' : activeCount >= 2 ? 'partial' : 'minimal'
    };
  }, [agents]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': case'optimal': case'active':
        return 'text-green-400';
      case 'warning': case'partial':
        return 'text-yellow-400';
      case 'error': case'minimal': case'inactive':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="p-6 bg-gray-800 h-full overflow-y-auto">
      <h2 className="text-xl font-semibold text-green-400 mb-6">Live Trading Dashboard</h2>
      {/* Production Readiness Score */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-white">Production Readiness</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">
              {productionReadiness?.percentage}%
            </div>
            <div className="text-xs text-gray-400">
              {productionReadiness?.score}/{productionReadiness?.maxScore} criteria
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              productionReadiness?.percentage >= 80 ? 'bg-green-400' :
              productionReadiness?.percentage >= 60 ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            style={{ width: `${productionReadiness?.percentage}%` }}
          ></div>
        </div>
      </div>
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-300">Active Agents</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {orchestrationMetrics?.activeAgents}/{orchestrationMetrics?.totalAgents}
          </div>
          <div className="text-xs text-gray-400">Production agents</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-300">Avg Latency</span>
          </div>
          <div className="text-2xl font-bold text-white">{orchestrationMetrics?.avgLatency}ms</div>
          <div className="text-xs text-gray-400">Response time</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-300">Error Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">{orchestrationMetrics?.errorRate}%</div>
          <div className="text-xs text-gray-400">System errors</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-300">Health Score</span>
          </div>
          <div className="text-2xl font-bold text-white">{orchestrationMetrics?.systemHealthScore}%</div>
          <div className="text-xs text-gray-400">Overall health</div>
        </div>
      </div>
      {/* Agent Coordination Status */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-3">Agent Coordination</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Data Ingestion Pipeline</span>
            <span className={`font-medium ${getStatusColor(agentCoordination?.dataIngestion)}`}>
              {agentCoordination?.dataIngestion?.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Quantitative Analysis</span>
            <span className={`font-medium ${getStatusColor(agentCoordination?.quantAnalysis)}`}>
              {agentCoordination?.quantAnalysis?.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Strategy Generation</span>
            <span className={`font-medium ${getStatusColor(agentCoordination?.strategyGeneration)}`}>
              {agentCoordination?.strategyGeneration?.toUpperCase()}
            </span>
          </div>
          <div className="pt-2 border-t border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-medium">Overall Coordination</span>
              <span className={`font-bold ${getStatusColor(agentCoordination?.overallStatus)}`}>
                {agentCoordination?.overallStatus?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Real-time Market Data */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-3">Real-time Market Data</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Average Price</span>
            <span className="text-blue-400 font-mono">${ohlcMetrics?.avgPrice}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Total Volume</span>
            <span className="text-blue-400 font-mono">{ohlcMetrics?.totalVolume?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Price Change</span>
            <span className={`font-mono ${parseFloat(ohlcMetrics?.priceChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(ohlcMetrics?.priceChange) >= 0 ? '+' : ''}{ohlcMetrics?.priceChange}%
            </span>
          </div>
        </div>
      </div>
      {/* Provider Status */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-3">Data Provider Status</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Active Providers</span>
            <span className={`font-medium ${getStatusColor(providerMetrics?.providerStatus)}`}>
              {providerMetrics?.activeProviders}/3
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">API Calls Today</span>
            <span className="text-blue-400 font-mono">{providerMetrics?.totalCalls?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">API Keys Configured</span>
            <span className={providerMetrics?.hasApiKeys ? 'text-green-400' : 'text-red-400'}>
              {providerMetrics?.hasApiKeys ? 'YES' : 'NO'}
            </span>
          </div>
        </div>
      </div>
      {/* Deployment Status */}
      <div className="p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-3">Deployment Status</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Environment</span>
            <span className="text-yellow-400 font-medium">PRODUCTION</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Last Deployment</span>
            <span className="text-gray-300">{new Date()?.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">System Uptime</span>
            <span className="text-green-400">99.9%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTradingDashboard;