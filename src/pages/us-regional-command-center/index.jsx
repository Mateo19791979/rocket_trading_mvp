import React, { useEffect, useState } from 'react';
import AppErrorBoundary from '../../components/AppErrorBoundary';

export default function USRegionalCommandCenter(){
  const [agents, setAgents] = useState([]);
  const [marketData, setMarketData] = useState({ status: 'Loading...', connectivity: 'checking' });
  const [reportData, setReportData] = useState({ iqs: '—', dhi: '—', compliance: '—' });
  
  useEffect(() => {
    // Initialize 24 US AI agents
    const usAgents = Array.from({ length: 24 }, (_, i) => ({
      id: `US-${(i + 1)?.toString()?.padStart(2, '0')}`,
      name: `US Agent ${i + 1}`,
      status: Math.random() > 0.1 ? 'Active' : 'Maintenance',
      region: 'US',
      markets: ['NYSE', 'NASDAQ', 'AMEX', 'CBOE'],
      performance: {
        pnl: (Math.random() * 3000 - 1500)?.toFixed(0),
        winRate: (65 + Math.random() * 25)?.toFixed(1),
        lastSignal: `${Math.floor(Math.random() * 45)}m ago`
      }
    }));
    setAgents(usAgents);
    
    // Mock market data
    setTimeout(() => {
      setMarketData({
        status: 'Online',
        connectivity: 'Connected',
        exchanges: ['NYSE', 'NASDAQ', 'CBOE', 'AMEX'],
        timezone: 'America/New_York',
        tradingHours: '09:30 - 16:00 EST'
      });
    }, 1200);
    
    // Mock report data
    setTimeout(() => {
      setReportData({
        iqs: '9.1/10',
        dhi: '94%',
        compliance: 'SEC Compliant'
      });
    }, 1800);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-green-900/50 border-b border-green-500/30 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-green-100">
            🇺🇸 US Regional Trading Command Center
          </h1>
          <p className="text-green-200/80">
            Real-time monitoring and control for United States trading operations with 24 specialized AI agents
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <AppErrorBoundary>
          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Market Status */}
            <div className="space-y-6">
              <div className="bg-gray-800 border border-green-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 text-green-300">US Market Status Dashboard</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      marketData?.status === 'Online' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {marketData?.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connectivity:</span>
                    <span className="text-green-300">{marketData?.connectivity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Agents:</span>
                    <span className="text-green-300">{agents?.filter(a => a?.status === 'Active')?.length || 0}/24</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Market Hours:</span>
                    <span className="text-green-300">EST Active</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 border border-green-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 text-green-300">Daily Intelligence Report</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>IQS:</span>
                    <span className="text-green-300">{reportData?.iqs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DHI:</span>
                    <span className="text-green-300">{reportData?.dhi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compliance:</span>
                    <span className="text-green-300">{reportData?.compliance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vol Processing:</span>
                    <span className="text-green-300">2.4M trades</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column - Agent Grid */}
            <div className="bg-gray-800 border border-green-500/30 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-green-300">US Agent Grid</h2>
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {agents?.map(agent => (
                  <div key={agent?.id} className="bg-gray-700/50 border border-green-500/20 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-green-200">{agent?.id}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        agent?.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'
                      }`}>
                        {agent?.status}
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>PnL: <span className={`${parseFloat(agent?.performance?.pnl) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        ${agent?.performance?.pnl}
                      </span></div>
                      <div>WR: <span className="text-green-300">{agent?.performance?.winRate}%</span></div>
                      <div className="text-gray-400">{agent?.performance?.lastSignal}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - US Resilience Control */}
            <div className="space-y-6">
              <div className="bg-gray-800 border border-green-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 text-green-300">US Resilience Control</h2>
                <div className="space-y-3">
                  <button className="w-full bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-200 py-2 px-4 rounded-lg transition-colors">
                    US SAFE_MODE
                  </button>
                  <button className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-200 py-2 px-4 rounded-lg transition-colors">
                    NYSE Hours Control
                  </button>
                  <button className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-200 py-2 px-4 rounded-lg transition-colors">
                    Emergency Protocols
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 border border-green-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 text-green-300">US Exchanges</h2>
                <div className="space-y-2 text-sm">
                  {marketData?.exchanges?.map(exchange => (
                    <div key={exchange} className="flex justify-between">
                      <span>{exchange}:</span>
                      <span className="text-green-300">●</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-green-500/20">
                  <div className="text-sm text-green-200">
                    Trading: {marketData?.tradingHours}
                  </div>
                  <div className="text-sm text-green-200">
                    Timezone: {marketData?.timezone}
                  </div>
                  <div className="text-sm text-green-200">
                    Regulation: SEC, FINRA
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="mt-8 bg-gray-800 border border-green-500/30 rounded-xl p-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex space-x-6">
                <span className="text-green-300">Region: United States</span>
                <span className="text-green-300">Agents: 24</span>
                <span className="text-green-300">Exchanges: 4</span>
              </div>
              <div className="flex space-x-4">
                <span className="text-green-300">● SEC Compliant</span>
                <span className="text-green-300">● FINRA</span>
                <span className="text-green-300">● Real-time</span>
              </div>
            </div>
          </div>
        </AppErrorBoundary>
      </div>
    </div>
  );
}