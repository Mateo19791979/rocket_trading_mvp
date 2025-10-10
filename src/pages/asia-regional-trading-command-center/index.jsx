import React, { useState } from 'react';
import AppErrorBoundary from '../../components/AppErrorBoundary';

export default function AsiaRegionalTradingCommandCenter() {
  return (
    <main className="bg-slate-900 text-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2 text-orange-400">
            Asia Regional Trading Command Center
          </h1>
          <p className="text-center text-slate-300 text-lg">
            Dedicated monitoring and control for Asian-Pacific trading operations
          </p>
        </header>

        <AppErrorBoundary>
          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            
            {/* Left Column - Asian Market Status Dashboard */}
            <div className="space-y-6">
              <AsianMarketStatusDashboard />
              <AsianReportsPanel />
            </div>

            {/* Center Column - Asian Agent Grid */}
            <div className="space-y-6">
              <AsianAgentGrid />
            </div>

            {/* Right Column - Asian Resilience Control Center */}
            <div className="space-y-6">
              <AsianResilienceControlCenter />
            </div>

          </div>
        </AppErrorBoundary>
      </div>
    </main>
  );
}

// Asian Market Status Dashboard Component
function AsianMarketStatusDashboard() {
  const [marketStatus, setMarketStatus] = React.useState({
    tokyo: 'UP',
    hongkong: 'UP',
    singapore: 'UP', 
    jpy: 'STABLE',
    hkd: 'STABLE',
    sgd: 'STABLE'
  });

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-orange-500/30">
      <h2 className="text-xl font-semibold text-orange-400 mb-4 flex items-center">
        <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
        Asian Market Status Dashboard
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatusBadge label="Tokyo" status={marketStatus?.tokyo} />
          <StatusBadge label="Hong Kong" status={marketStatus?.hongkong} />
          <StatusBadge label="Singapore" status={marketStatus?.singapore} />
          <StatusBadge label="JPY/HKD/SGD" status="STABLE" />
        </div>
        
        <div className="mt-4">
          <div className="text-sm text-slate-300">Active Asian Agents: <span className="text-orange-400 font-semibold">8 agents</span></div>
          <div className="text-sm text-slate-300">Multi-timezone Coverage: <span className="text-orange-400">JST/HKT/SGT</span></div>
          <div className="text-sm text-slate-300">Regional Performance: <span className="text-orange-400">Optimal</span></div>
        </div>

        <div className="mt-4 p-3 bg-slate-700 rounded">
          <div className="text-xs text-slate-400">Regional Compliance</div>
          <div className="flex gap-2 mt-2">
            <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded">JFSA</span>
            <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded">SFC</span>
            <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded">MAS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Asian Reports Panel Component  
function AsianReportsPanel() {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-orange-500/30">
      <h3 className="text-lg font-semibold text-orange-400 mb-4">Asian Reports Panel</h3>
      
      <div className="space-y-3">
        <ReportCard title="JFSA Compliance" status="Current" />
        <ReportCard title="SFC Regulatory" status="Approved" />
        <ReportCard title="MAS Guidelines" status="Compliant" />
        <ReportCard title="Cross-border Trading" status="Active" />
      </div>
      
      <button className="mt-4 w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
        Generate Asian Report
      </button>
    </div>
  );
}

// Asian Agent Grid Component
function AsianAgentGrid() {
  const agents = Array.from({length: 8}, (_, i) => ({
    id: `AS-${i + 1}`,
    name: `Asian Agent #${i + 1}`,
    status: 'Active',
    performance: Math.floor(Math.random() * 100),
    specialization: ['Asian Equity', 'Regional Bonds', 'Commodities']?.[Math.floor(Math.random() * 3)]
  }));

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-orange-500/30">
      <h2 className="text-xl font-semibold text-orange-400 mb-4">Asian Agent Grid</h2>
      
      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
        {agents?.map((agent) => (
          <div key={agent?.id} className="bg-slate-700 rounded p-3 border-l-4 border-orange-500">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-white">{agent?.name}</div>
                <div className="text-sm text-slate-300">{agent?.specialization} Processing</div>
              </div>
              <div className="text-right">
                <div className="text-orange-400 font-semibold">{agent?.performance}%</div>
                <div className="text-xs text-slate-400">{agent?.status}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Regional feeds: Tokyo/Hong Kong/Singapore exchanges
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Asian Resilience Control Center Component
function AsianResilienceControlCenter() {
  const [safeMode, setSafeMode] = React.useState(false);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-orange-500/30">
      <h2 className="text-xl font-semibold text-orange-400 mb-4">Asian Resilience Control Center</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-slate-700 rounded">
          <h4 className="text-orange-400 font-medium mb-2">Asia-Specific SAFE_MODE</h4>
          <button 
            onClick={() => setSafeMode(!safeMode)}
            className={`px-4 py-2 rounded font-medium ${
              safeMode 
                ? 'bg-red-600 hover:bg-red-700 text-white' :'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {safeMode ? 'Disable SAFE_MODE' : 'Activate SAFE_MODE'}
          </button>
        </div>

        <div className="p-4 bg-slate-700 rounded">
          <h4 className="text-orange-400 font-medium mb-2">Asian Market Hours</h4>
          <div className="space-y-1 text-sm text-slate-300">
            <div>Tokyo: 9:00 AM - 3:00 PM JST</div>
            <div>Hong Kong: 9:30 AM - 4:00 PM HKT</div>
            <div>Singapore: 9:00 AM - 5:00 PM SGT</div>
          </div>
        </div>

        <div className="p-4 bg-slate-700 rounded">
          <h4 className="text-orange-400 font-medium mb-2">Regional Emergency Protocols</h4>
          <div className="grid grid-cols-1 gap-2">
            <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
              Multi-Market Halt
            </button>
            <button className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">
              Currency Stability
            </button>
            <button className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">
              Cross-Border Compliance
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
              Typhoon Season Protocol
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-700 rounded">
          <h4 className="text-orange-400 font-medium mb-2">Regulatory Fallbacks</h4>
          <div className="text-xs text-slate-400">
            Comprehensive fallback mechanisms tailored to diverse Asian trading regulations and market structures
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatusBadge({ label, status }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'UP': case 'STABLE': case 'COMPLIANT':
        return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
      case 'DOWN': case'ERROR':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      default:
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
    }
  };

  return (
    <div className={`px-3 py-2 rounded border ${getStatusColor(status)}`}>
      <div className="text-xs font-medium">{label}</div>
      <div className="text-sm">{status}</div>
    </div>
  );
}

function ReportCard({ title, status }) {
  return (
    <div className="p-3 bg-slate-700 rounded">
      <div className="flex justify-between items-center">
        <span className="text-sm text-white">{title}</span>
        <span className="text-xs text-orange-400 bg-orange-400/20 px-2 py-1 rounded">
          {status}
        </span>
      </div>
    </div>
  );
}