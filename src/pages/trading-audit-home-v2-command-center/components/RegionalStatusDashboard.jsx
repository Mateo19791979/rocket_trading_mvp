import React from 'react';
import { MapPin, Zap, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function RegionalStatusDashboard({ regions, onRegionSwitch }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRegionColorClasses = (color, status) => {
    const baseClasses = "border-l-4 bg-gradient-to-r from-slate-800/50 to-slate-700/30 backdrop-blur-sm";
    
    if (status === 'operational') {
      switch (color) {
        case 'blue':
          return `${baseClasses} border-blue-400 hover:from-blue-900/30`;
        case 'green':
          return `${baseClasses} border-green-400 hover:from-green-900/30`;
        case 'orange':
          return `${baseClasses} border-orange-400 hover:from-orange-900/30`;
        default:
          return `${baseClasses} border-gray-400`;
      }
    } else if (status === 'degraded') {
      return `${baseClasses} border-yellow-400 hover:from-yellow-900/30`;
    } else {
      return `${baseClasses} border-red-400 hover:from-red-900/30`;
    }
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/40 rounded-lg">
      <div className="p-4 border-b border-slate-600/40">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Regional Status</h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {regions?.map((region) => (
          <div
            key={region?.id}
            onClick={() => onRegionSwitch?.(region?.id)}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${getRegionColorClasses(region?.color, region?.status)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(region?.status)}
                <div>
                  <h4 className="font-semibold text-white">{region?.name}</h4>
                  <p className="text-xs text-slate-300 uppercase tracking-wide">{region?.id}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono text-white">{region?.agents} Agents</div>
                <div className="text-xs text-slate-400">Active</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span className="text-slate-300">Latency</span>
                </div>
                <div className="font-mono text-white">{region?.latency}ms</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <Activity className="w-3 h-3 text-green-400" />
                  <span className="text-slate-300">Throughput</span>
                </div>
                <div className="font-mono text-white">{region?.throughput}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <AlertTriangle className="w-3 h-3 text-yellow-400" />
                  <span className="text-slate-300">Error Rate</span>
                </div>
                <div className="font-mono text-white">{(region?.errorRate * 100)?.toFixed(2)}%</div>
              </div>
            </div>

            {/* Health Indicator Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300">Health</span>
                <span className="font-mono text-white">
                  {region?.status === 'operational' ? '98.5%' : region?.status === 'degraded' ? '75.2%' : '12.1%'}
                </span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    region?.status === 'operational' ?'bg-green-400 w-[98.5%]'
                      : region?.status === 'degraded' ?'bg-yellow-400 w-[75.2%]' :'bg-red-400 w-[12.1%]'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Emergency Controls */}
      <div className="p-4 border-t border-slate-600/40">
        <div className="grid grid-cols-2 gap-2">
          <button className="px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/40 rounded text-yellow-300 text-xs font-medium transition-colors">
            Regional Failover
          </button>
          <button className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 rounded text-red-300 text-xs font-medium transition-colors">
            Emergency Stop
          </button>
        </div>
      </div>
    </div>
  );
}