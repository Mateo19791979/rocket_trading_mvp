import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Cpu } from 'lucide-react';

const SystemKPIs = ({ stats }) => {
  const kpiCards = [
    {
      title: 'Total Agents',
      value: stats?.totalAgents || 0,
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: 'Active Agents',
      value: stats?.statusCounts?.active || 0,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      title: 'Healthy Systems',
      value: stats?.healthyCounts?.healthy || 0,
      icon: CheckCircle,
      color: 'text-green-400', 
      bgColor: 'bg-green-500/20'
    },
    {
      title: 'System Load',
      value: `${stats?.systemLoad || 0}%`,
      icon: Cpu,
      color: stats?.systemLoad > 80 ? 'text-red-400' : stats?.systemLoad > 60 ? 'text-yellow-400' : 'text-green-400',
      bgColor: stats?.systemLoad > 80 ? 'bg-red-500/20' : stats?.systemLoad > 60 ? 'bg-yellow-500/20' : 'bg-green-500/20'
    },
    {
      title: 'Total Errors',
      value: stats?.totalErrors || 0,
      icon: AlertTriangle,
      color: stats?.totalErrors > 0 ? 'text-red-400' : 'text-gray-400',
      bgColor: stats?.totalErrors > 0 ? 'bg-red-500/20' : 'bg-gray-500/20'
    },
    {
      title: 'Warnings',
      value: stats?.totalWarnings || 0,
      icon: AlertTriangle,
      color: stats?.totalWarnings > 0 ? 'text-yellow-400' : 'text-gray-400',
      bgColor: stats?.totalWarnings > 0 ? 'bg-yellow-500/20' : 'bg-gray-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-6 gap-4">
      {kpiCards?.map((kpi, index) => {
        const IconComponent = kpi?.icon;
        
        return (
          <div
            key={index}
            className={`${kpi?.bgColor} rounded-lg border border-gray-700 p-4`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gray-800 ${kpi?.color}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              
              <div className="flex-1">
                <p className="text-gray-400 text-sm">{kpi?.title}</p>
                <p className={`text-xl font-bold ${kpi?.color}`}>
                  {kpi?.value}
                </p>
              </div>
            </div>
            {/* Additional context for some KPIs */}
            {kpi?.title === 'Active Agents' && stats?.statusCounts && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Paused: {stats?.statusCounts?.paused || 0}</span>
                  <span>Error: {stats?.statusCounts?.error || 0}</span>
                </div>
              </div>
            )}
            {kpi?.title === 'System Load' && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${
                      stats?.systemLoad > 80 ? 'bg-red-500' :
                      stats?.systemLoad > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(stats?.systemLoad || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
            {kpi?.title === 'Healthy Systems' && stats?.healthyCounts && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Degraded: {stats?.healthyCounts?.degraded || 0}</span>
                  <span>Unhealthy: {stats?.healthyCounts?.unhealthy || 0}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SystemKPIs;