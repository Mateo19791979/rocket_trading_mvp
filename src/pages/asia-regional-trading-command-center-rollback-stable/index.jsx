import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Users, Globe, AlertTriangle, CheckCircle, Clock, BarChart3 } from 'lucide-react';

// Regional Status Dashboard Component
const RegionalStatusDashboard = () => {
  const [healthMetrics, setHealthMetrics] = useState({
    tokyo: { status: 'online', latency: '12ms', connections: 156 },
    hongkong: { status: 'online', latency: '8ms', connections: 203 },
    singapore: { status: 'online', latency: '15ms', connections: 89 }
  });

  const currencies = [
    { symbol: 'JPY', price: '148.32', change: '+0.45%', status: 'active' },
    { symbol: 'HKD', price: '7.8245', change: '-0.12%', status: 'active' },
    { symbol: 'SGD', price: '1.3456', change: '+0.28%', status: 'active' }
  ];

  return (
    <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5" />
        Asian Market Status Dashboard
      </h3>
      {/* Market Health Indicators */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {Object.entries(healthMetrics)?.map(([market, data]) => (
          <div key={market} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300 capitalize">{market}</span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-xs text-gray-400">
              <div>Latency: {data?.latency}</div>
              <div>Connections: {data?.connections}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Active Asian Agent Count */}
      <div className="bg-gray-800 border border-orange-500/30 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Active Asian Agents</span>
          <span className="text-xl font-bold text-orange-400">8/8</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">All agents operational</div>
      </div>
      {/* Currency Monitoring */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-orange-400">Currency Monitoring</h4>
        {currencies?.map(currency => (
          <div key={currency?.symbol} className="flex items-center justify-between bg-gray-800 rounded p-2">
            <span className="text-sm font-medium text-gray-300">{currency?.symbol}</span>
            <div className="text-right">
              <div className="text-sm text-white">{currency?.price}</div>
              <div className={`text-xs ${currency?.change?.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {currency?.change}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Regulatory Compliance */}
      <div className="mt-4 bg-gray-800 border border-orange-500/30 rounded-lg p-3">
        <h4 className="text-sm font-medium text-orange-400 mb-2">Regulatory Compliance</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-300">JFSA (Japan)</span>
            <CheckCircle className="w-3 h-3 text-green-400" />
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">SFC (Hong Kong)</span>
            <CheckCircle className="w-3 h-3 text-green-400" />
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">MAS (Singapore)</span>
            <CheckCircle className="w-3 h-3 text-green-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Asian Reports Panel Component
const AsianReportsPanel = () => {
  const [reports] = useState([
    { id: 1, title: 'Tokyo Session Summary', status: 'completed', time: '09:00 JST' },
    { id: 2, title: 'Hong Kong Performance', status: 'generating', time: '10:30 HKT' },
    { id: 3, title: 'ASEAN Compliance Report', status: 'scheduled', time: '11:00 SGT' }
  ]);

  return (
    <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Asian Reports Panel
      </h3>
      <div className="space-y-3">
        {reports?.map(report => (
          <div key={report?.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-200">{report?.title}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                report?.status === 'completed' ? 'bg-green-900 text-green-300' :
                report?.status === 'generating'? 'bg-orange-900 text-orange-300' : 'bg-blue-900 text-blue-300'
              }`}>
                {report?.status}
              </span>
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {report?.time}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 bg-gray-800 border border-orange-500/30 rounded-lg p-3">
        <h4 className="text-sm font-medium text-orange-400 mb-2">Regional Compliance</h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div>• JFSA Regulatory Reports</div>
          <div>• SFC Trading Documentation</div>
          <div>• MAS Compliance Tracking</div>
          <div>• Cross-border Trading Records</div>
        </div>
      </div>
    </div>
  );
};

// Asian Agent Grid Component  
const AsianAgentGrid = () => {
  const [agents] = useState([
    { id: 1, name: 'Tokyo Equity Specialist', status: 'active', pnl: '+¥234,567', region: 'JP', performance: 'excellent' },
    { id: 2, name: 'Hong Kong Futures', status: 'active', pnl: '+HK$12,345', region: 'HK', performance: 'good' },
    { id: 3, name: 'Singapore Bonds', status: 'active', pnl: '+S$8,901', region: 'SG', performance: 'excellent' },
    { id: 4, name: 'Asia-Pacific FX', status: 'active', pnl: '+$5,432', region: 'APAC', performance: 'good' },
    { id: 5, name: 'Nikkei Analytics', status: 'active', pnl: '+¥187,234', region: 'JP', performance: 'excellent' },
    { id: 6, name: 'HSI Monitor', status: 'active', pnl: '+HK$9,876', region: 'HK', performance: 'good' },
    { id: 7, name: 'STI Tracker', status: 'active', pnl: '+S$6,543', region: 'SG', performance: 'excellent' },
    { id: 8, name: 'Commodities Asia', status: 'active', pnl: '+$3,210', region: 'APAC', performance: 'good' }
  ]);

  const getStatusColor = (status) => {
    return status === 'active' ? 'text-green-400' : 'text-red-400';
  };

  const getPerformanceColor = (performance) => {
    return performance === 'excellent' ? 'text-green-400' : 'text-orange-400';
  };

  return (
    <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Asian Agent Grid
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {agents?.map(agent => (
          <div key={agent?.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-200 text-sm">{agent?.name}</span>
              <span className={`px-2 py-1 rounded text-xs bg-gray-700 ${getStatusColor(agent?.status)}`}>
                {agent?.status}
              </span>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Region:</span>
                <span className="text-orange-400 font-medium">{agent?.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">PnL:</span>
                <span className="text-green-400 font-medium">{agent?.pnl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Performance:</span>
                <span className={`font-medium ${getPerformanceColor(agent?.performance)}`}>
                  {agent?.performance}
                </span>
              </div>
            </div>

            <div className="mt-2 bg-gray-700 rounded p-2">
              <div className="text-xs text-gray-300">
                <div>• Asian equity processing</div>
                <div>• Regional bond analysis</div>
                <div>• Commodity trading</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 bg-gray-800 border border-orange-500/30 rounded-lg p-3">
        <h4 className="text-sm font-medium text-orange-400 mb-2">Market Data Feeds</h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div>• Tokyo Stock Exchange (TSE)</div>
          <div>• Hong Kong Stock Exchange (HKEX)</div>
          <div>• Singapore Exchange (SGX)</div>
          <div>• Regional commodity exchanges</div>
        </div>
      </div>
    </div>
  );
};

// Asian Resilience Control Center Component
const AsianResilienceControlCenter = () => {
  const [safeMode, setSafeMode] = useState(false);
  const [marketHours, setMarketHours] = useState({
    tokyo: 'open',
    hongkong: 'open', 
    singapore: 'open'
  });

  return (
    <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Asian Resilience Control Center
      </h3>
      {/* SAFE_MODE Controls */}
      <div className="bg-gray-800 border border-orange-500/30 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-orange-400 mb-3">Asia-Specific SAFE_MODE</h4>
        <div className="space-y-3">
          <button
            onClick={() => setSafeMode(!safeMode)}
            className={`w-full py-2 px-4 rounded font-medium transition-colors ${
              safeMode 
                ? 'bg-red-600 hover:bg-red-700 text-white' :'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {safeMode ? 'Deactivate Asian SAFE_MODE' : 'Activate Asian SAFE_MODE'}
          </button>
          
          {safeMode && (
            <div className="bg-red-900/30 border border-red-500/30 rounded p-3">
              <div className="text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Asian markets operating in safe mode
              </div>
              <div className="text-xs text-red-300 mt-2">
                • Tokyo agents: Limited exposure
                • Hong Kong: Conservative strategies only  
                • Singapore: Risk controls active
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Market Hours Enforcement */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-orange-400 mb-3">Asian Market Hours</h4>
        <div className="space-y-2">
          {Object.entries(marketHours)?.map(([market, status]) => (
            <div key={market} className="flex items-center justify-between">
              <span className="text-sm text-gray-300 capitalize">{market}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                status === 'open' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
              }`}>
                {status}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-3 text-xs text-gray-400">
          <div>Tokyo: 09:00-15:00 JST</div>
          <div>Hong Kong: 09:30-16:00 HKT</div>
          <div>Singapore: 09:00-17:00 SGT</div>
        </div>
      </div>
      {/* Regional Emergency Protocols */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-orange-400 mb-3">Regional Emergency Protocols</h4>
        <div className="space-y-2">
          <button className="w-full py-2 px-3 bg-red-700 hover:bg-red-800 text-white rounded text-sm transition-colors">
            Emergency Stop - All Asian Agents
          </button>
          <button className="w-full py-2 px-3 bg-orange-700 hover:bg-orange-800 text-white rounded text-sm transition-colors">
            Typhoon Protocol Activation
          </button>
          <button className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded text-sm transition-colors">
            Cross-Border Risk Assessment
          </button>
        </div>
        
        <div className="mt-3 bg-gray-700 rounded p-3">
          <div className="text-xs text-gray-300">
            <div>• Natural disaster responses</div>
            <div>• Currency crisis protocols</div>
            <div>• Regional market volatility controls</div>
            <div>• Multi-timezone coordination</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Asia Regional Trading Command Center Component
const AsiaRegionalTradingCommandCenterRollbackStable = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-orange-500/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-orange-400 flex items-center gap-3">
              <TrendingUp className="w-7 h-7" />
              Asia Regional Trading Command Center
            </h1>
            <p className="text-gray-400 mt-1">
              Rollback Stable • Orange Theme • Asia-Pacific Operations
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Last Update</div>
            <div className="text-orange-400 font-mono">
              {lastUpdate?.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
      {/* Main Dashboard Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Column - Asian Market Status */}
          <div className="space-y-6">
            <RegionalStatusDashboard />
            <AsianReportsPanel />
          </div>

          {/* Center Column - Asian Agent Grid */}
          <div>
            <AsianAgentGrid />
          </div>

          {/* Right Column - Asian Resilience Control */}
          <div>
            <AsianResilienceControlCenter />
          </div>
        </div>
      </div>
      {/* Footer Status */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-orange-500/30 px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Hash Router: #/region/as</span>
            <span>Non-intrusive Mode: Active</span>
            <span>Reversible: 2 files only</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-green-400">Asian Markets: Online</span>
            <span className="text-orange-400">8/8 Agents Active</span>
            <span className="text-blue-400">Multi-timezone Sync: OK</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsiaRegionalTradingCommandCenterRollbackStable;