import React, { useEffect, useState } from 'react';
import AppErrorBoundary from '../../components/AppErrorBoundary';

export default function AsiaRegionalCommandCenter(){
  const [agents, setAgents] = useState([]);
  const [marketData, setMarketData] = useState({ status: 'Loading...', connectivity: 'checking' });
  const [reportData, setReportData] = useState({ iqs: '—', dhi: '—', compliance: '—' });
  
  useEffect(() => {
    // Initialize 24 Asian AI agents
    const asianAgents = Array.from({ length: 24 }, (_, i) => ({
      id: `AS-${(i + 1)?.toString()?.padStart(2, '0')}`,
      name: `Asian Agent ${i + 1}`,
      status: Math.random() > 0.15 ? 'Active' : 'Maintenance',
      region: 'AS',
      markets: ['TSE', 'HSE', 'SGX', 'SSE'],
      performance: {
        pnl: (Math.random() * 2500 - 1200)?.toFixed(0),
        winRate: (62 + Math.random() * 28)?.toFixed(1),
        lastSignal: `${Math.floor(Math.random() * 35)}m ago`
      }
    }));
    setAgents(asianAgents);
    
    // Mock market data
    setTimeout(() => {
      setMarketData({
        status: 'Online',
        connectivity: 'Connected',
        exchanges: ['Tokyo', 'Hong Kong', 'Singapore', 'Shanghai'],
        timezone: 'Asia/Tokyo',
        tradingHours: '09:00 - 15:00 JST'
      });
    }, 900);
    
    // Mock report data
    setTimeout(() => {
      setReportData({
        iqs: '8.9/10',
        dhi: '91%',
        compliance: 'JFSA/SFC/MAS Compliant'
      });
    }, 1600);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-orange-900/50 border-b border-orange-500/30 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-orange-100">
            🏮 Asia Regional Trading Command Center - Enhanced
          </h1>
          <p className="text-orange-200/80">
            Dedicated monitoring and control for Asian-Pacific trading operations with 24 specialized AI agents
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <AppErrorBoundary>
          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Asian Market Status */}
            <div className="space-y-6">
              <div className="bg-gray-800 border border-orange-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 text-orange-300">Asian Market Status Dashboard</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      marketData?.status === 'Online' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {marketData?.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connectivity:</span>
                    <span className="text-orange-300">{marketData?.connectivity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Agents:</span>
                    <span className="text-orange-300">{agents?.filter(a => a?.status === 'Active')?.length || 0}/24</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cross-Border:</span>
                    <span className="text-orange-300">Multi-TZ Active</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 border border-orange-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 text-orange-300">Asian Reports Panel</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>IQS:</span>
                    <span className="text-orange-300">{reportData?.iqs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DHI:</span>
                    <span className="text-orange-300">{reportData?.dhi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compliance:</span>
                    <span className="text-orange-300">{reportData?.compliance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Currency:</span>
                    <span className="text-orange-300">JPY/HKD/SGD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column - Asian Agent Grid */}
            <div className="bg-gray-800 border border-orange-500/30 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-orange-300">Asian Agent Grid</h2>
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {agents?.map(agent => (
                  <div key={agent?.id} className="bg-gray-700/50 border border-orange-500/20 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-orange-200">{agent?.id}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        agent?.status === 'Active' ? 'bg-orange-500/20 text-orange-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {agent?.status}
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>PnL: <span className={`${parseFloat(agent?.performance?.pnl) >= 0 ? 'text-orange-300' : 'text-red-300'}`}>
                        ¥{agent?.performance?.pnl}
                      </span></div>
                      <div>WR: <span className="text-orange-300">{agent?.performance?.winRate}%</span></div>
                      <div className="text-gray-400">{agent?.performance?.lastSignal}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Asian Resilience Control */}
            <div className="space-y-6">
              <div className="bg-gray-800 border border-orange-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 text-orange-300">Asian Resilience Control Center</h2>
                <div className="space-y-3">
                  <button className="w-full bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 text-orange-200 py-2 px-4 rounded-lg transition-colors">
                    Asia SAFE_MODE
                  </button>
                  <button className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-200 py-2 px-4 rounded-lg transition-colors">
                    Multi-TZ Hours Control
                  </button>
                  <button className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-200 py-2 px-4 rounded-lg transition-colors">
                    Regional Emergency
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 border border-orange-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 text-orange-300">Asian Markets</h2>
                <div className="space-y-2 text-sm">
                  {marketData?.exchanges?.map(exchange => (
                    <div key={exchange} className="flex justify-between">
                      <span>{exchange}:</span>
                      <span className="text-orange-300">●</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-orange-500/20">
                  <div className="text-sm text-orange-200">
                    Trading: {marketData?.tradingHours}
                  </div>
                  <div className="text-sm text-orange-200">
                    Primary TZ: {marketData?.timezone}
                  </div>
                  <div className="text-sm text-orange-200">
                    Regulatory: JFSA, SFC, MAS
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="mt-8 bg-gray-800 border border-orange-500/30 rounded-xl p-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex space-x-6">
                <span className="text-orange-300">Region: Asia-Pacific</span>
                <span className="text-orange-300">Agents: 24</span>
                <span className="text-orange-300">Markets: 4</span>
                <span className="text-orange-300">Timezones: 3</span>
              </div>
              <div className="flex space-x-4">
                <span className="text-orange-300">● JFSA</span>
                <span className="text-orange-300">● SFC</span>
                <span className="text-orange-300">● MAS</span>
              </div>
            </div>
          </div>
        </AppErrorBoundary>
      </div>
    </div>
  );
}