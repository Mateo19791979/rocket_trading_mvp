import React, { useEffect, useState } from 'react';
import AppErrorBoundary from '../../components/AppErrorBoundary';

export default function EuropeRegionalCommandCenter(){
  const [agents, setAgents] = useState([]);
  const [marketData, setMarketData] = useState({ status: 'Loading...', connectivity: 'checking' });
  const [reportData, setReportData] = useState({ iqs: '—', dhi: '—', compliance: '—' });
  
  useEffect(() => {
    // Initialize 24 European AI agents
    const europeanAgents = Array.from({ length: 24 }, (_, i) => ({
      id: `EU-${(i + 1)?.toString()?.padStart(2, '0')}`,
      name: `European Agent ${i + 1}`,
      status: Math.random() > 0.1 ? 'Active' : 'Maintenance',
      region: 'EU',
      markets: ['DAX', 'CAC40', 'FTSE', 'SMI'],
      performance: {
        pnl: (Math.random() * 2000 - 1000)?.toFixed(0),
        winRate: (60 + Math.random() * 30)?.toFixed(1),
        lastSignal: `${Math.floor(Math.random() * 30)}m ago`
      }
    }));
    setAgents(europeanAgents);
    
    // Mock market data
    setTimeout(() => {
      setMarketData({
        status: 'Online',
        connectivity: 'Connected',
        exchanges: ['Frankfurt', 'Paris', 'London', 'Zurich'],
        timezone: 'Europe/Berlin',
        tradingHours: '09:00 - 17:30 CET'
      });
    }, 1000);
    
    // Mock report data
    setTimeout(() => {
      setReportData({
        iqs: '8.7/10',
        dhi: '92%',
        compliance: 'MiFID II Compliant'
      });
    }, 1500);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-blue-900/50 border-b border-blue-500/30 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-blue-100">
            🇪🇺 Centre de Commande Trading Régional - Europe
          </h1>
          <p className="text-blue-200/80">
            Surveillance et contrôle des opérations de trading pour la région européenne avec 24 agents IA spécialisés
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <AppErrorBoundary>
          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Market Status */}
            <div className="space-y-6">
              <div className="bg-gray-800 border border-blue-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 text-blue-300">Statut Marché Européen</h2>
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
                    <span>Connectivité:</span>
                    <span className="text-blue-300">{marketData?.connectivity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agents Actifs:</span>
                    <span className="text-blue-300">{agents?.filter(a => a?.status === 'Active')?.length || 0}/24</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 border border-blue-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 text-blue-300">Rapport Quotidien</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>IQS:</span>
                    <span className="text-blue-300">{reportData?.iqs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DHI:</span>
                    <span className="text-blue-300">{reportData?.dhi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compliance:</span>
                    <span className="text-green-300">{reportData?.compliance}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column - Agent Grid */}
            <div className="bg-gray-800 border border-blue-500/30 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-blue-300">Grille Agents Européens</h2>
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {agents?.map(agent => (
                  <div key={agent?.id} className="bg-gray-700/50 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-blue-200">{agent?.id}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        agent?.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'
                      }`}>
                        {agent?.status}
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>PnL: <span className={`${parseFloat(agent?.performance?.pnl) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {agent?.performance?.pnl}€
                      </span></div>
                      <div>WR: <span className="text-blue-300">{agent?.performance?.winRate}%</span></div>
                      <div className="text-gray-400">{agent?.performance?.lastSignal}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Control Center */}
            <div className="space-y-6">
              <div className="bg-gray-800 border border-blue-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 text-blue-300">Centre de Contrôle</h2>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-200 py-2 px-4 rounded-lg transition-colors">
                    Mode SAFE EU
                  </button>
                  <button className="w-full bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 text-orange-200 py-2 px-4 rounded-lg transition-colors">
                    Heures Marché EU
                  </button>
                  <button className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-200 py-2 px-4 rounded-lg transition-colors">
                    Protocoles Urgence
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 border border-blue-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 text-blue-300">Marchés Européens</h2>
                <div className="space-y-2 text-sm">
                  {marketData?.exchanges?.map(exchange => (
                    <div key={exchange} className="flex justify-between">
                      <span>{exchange}:</span>
                      <span className="text-green-300">●</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-blue-500/20">
                  <div className="text-sm text-blue-200">
                    Horaires: {marketData?.tradingHours}
                  </div>
                  <div className="text-sm text-blue-200">
                    Timezone: {marketData?.timezone}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="mt-8 bg-gray-800 border border-blue-500/30 rounded-xl p-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex space-x-6">
                <span className="text-blue-300">Région: Europe</span>
                <span className="text-blue-300">Agents: 24</span>
                <span className="text-blue-300">Marchés: 4</span>
              </div>
              <div className="flex space-x-4">
                <span className="text-green-300">● MiFID II</span>
                <span className="text-green-300">● GDPR</span>
                <span className="text-green-300">● Real-time</span>
              </div>
            </div>
          </div>
        </AppErrorBoundary>
      </div>
    </div>
  );
}