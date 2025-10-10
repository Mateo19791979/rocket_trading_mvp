import React, { useState } from 'react';
import AppErrorBoundary from '../../components/AppErrorBoundary';

export default function USRegionalTradingCommandCenter() {
  return (
    <main className="bg-slate-900 text-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2 text-green-400">
            US Regional Trading Command Center
          </h1>
          <p className="text-center text-slate-300 text-lg">
            Comprehensive monitoring and control for American trading operations
          </p>
        </header>

        <AppErrorBoundary>
          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            
            {/* Left Column - US Market Status Dashboard */}
            <div className="space-y-6">
              <USMarketStatusDashboard />
              <USReportsPanel />
            </div>

            {/* Center Column - US Agent Grid */}
            <div className="space-y-6">
              <USAgentGrid />
            </div>

            {/* Right Column - US Resilience Control Center */}
            <div className="space-y-6">
              <USResilienceControlCenter />
            </div>

          </div>
        </AppErrorBoundary>
      </div>
    </main>
  );
}

// US Market Status Dashboard Component
function USMarketStatusDashboard() {
  const [marketStatus, setMarketStatus] = React.useState({
    nyse: 'UP',
    nasdaq: 'UP', 
    usd: 'STABLE',
    sec: 'COMPLIANT'
  });

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-green-500/30">
      <h2 className="text-xl font-semibold text-green-400 mb-4 flex items-center">
        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
        US Market Status Dashboard
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatusBadge label="NYSE" status={marketStatus?.nyse} />
          <StatusBadge label="NASDAQ" status={marketStatus?.nasdaq} />
          <StatusBadge label="USD" status={marketStatus?.usd} />
          <StatusBadge label="SEC" status={marketStatus?.sec} />
        </div>
        
        <div className="mt-4">
          <div className="text-sm text-slate-300">Active US Agents: <span className="text-green-400 font-semibold">8 agents</span></div>
          <div className="text-sm text-slate-300">Market Hours: <span className="text-green-400">9:30 AM - 4:00 PM ET</span></div>
          <div className="text-sm text-slate-300">Regional Performance: <span className="text-green-400">Normal</span></div>
        </div>

        <div className="mt-4 p-3 bg-slate-700 rounded">
          <div className="text-xs text-slate-400">Emergency Controls</div>
          <button className="mt-2 px-4 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
            Circuit Breaker
          </button>
        </div>
      </div>
    </div>
  );
}

// US Reports Panel Component  
function USReportsPanel() {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-green-500/30">
      <h3 className="text-lg font-semibold text-green-400 mb-4">US Reports Panel</h3>
      
      <div className="space-y-3">
        <ReportCard title="SEC Filing Compliance" status="Current" />
        <ReportCard title="US Tax Reporting" status="Integrated" />
        <ReportCard title="Trading Session Performance" status="Optimized" />
      </div>
      
      <button className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
        Generate US Report
      </button>
    </div>
  );
}

// US Agent Grid Component
function USAgentGrid() {
  const agents = Array.from({length: 8}, (_, i) => ({
    id: `US-${i + 1}`,
    name: `US Agent #${i + 1}`,
    status: 'Active',
    performance: Math.floor(Math.random() * 100),
    specialization: ['Equity', 'Options', 'Futures']?.[Math.floor(Math.random() * 3)]
  }));

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-green-500/30">
      <h2 className="text-xl font-semibold text-green-400 mb-4">US Agent Grid</h2>
      
      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
        {agents?.map((agent) => (
          <div key={agent?.id} className="bg-slate-700 rounded p-3 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-white">{agent?.name}</div>
                <div className="text-sm text-slate-300">{agent?.specialization} Processing</div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-semibold">{agent?.performance}%</div>
                <div className="text-xs text-slate-400">{agent?.status}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Real-time market data: NYSE/NASDAQ feeds active
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// US Resilience Control Center Component
function USResilienceControlCenter() {
  const [safeMode, setSafeMode] = React.useState(false);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-green-500/30">
      <h2 className="text-xl font-semibold text-green-400 mb-4">US Resilience Control Center</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-slate-700 rounded">
          <h4 className="text-green-400 font-medium mb-2">SAFE_MODE Controls</h4>
          <button 
            onClick={() => setSafeMode(!safeMode)}
            className={`px-4 py-2 rounded font-medium ${
              safeMode 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' :'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {safeMode ? 'Disable SAFE_MODE' : 'Activate SAFE_MODE'}
          </button>
        </div>

        <div className="p-4 bg-slate-700 rounded">
          <h4 className="text-green-400 font-medium mb-2">Market Hours Enforcement</h4>
          <div className="text-sm text-slate-300">9:30 AM - 4:00 PM ET</div>
          <div className="text-xs text-slate-400 mt-1">After-hours trading protocols active</div>
        </div>

        <div className="p-4 bg-slate-700 rounded">
          <h4 className="text-green-400 font-medium mb-2">Regional Emergency Protocols</h4>
          <div className="grid grid-cols-1 gap-2">
            <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
              Circuit Breaker Rules
            </button>
            <button className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">
              Market Structure Failsafe
            </button>
            <button className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">
              Regulatory Compliance
            </button>
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
        return 'text-green-400 bg-green-400/20 border-green-400/30';
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
        <span className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded">
          {status}
        </span>
      </div>
    </div>
  );
}