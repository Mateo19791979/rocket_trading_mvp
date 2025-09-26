import React from 'react';
import { Monitor, Eye, Kanban, Activity, Wifi, Globe } from 'lucide-react';

export default function DashboardRocketPanel({ data }) {
  if (!data) {
    return (
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-xl p-6 border border-slate-600">
        <div className="flex items-center gap-3 mb-4">
          <Monitor className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-blue-300">📊 Dashboard Rocket.new</h2>
        </div>
        <div className="text-gray-400">Chargement du dashboard...</div>
      </div>
    );
  }

  const { dashboard } = data;

  const getStatusIndicator = (status) => {
    const colors = {
      live: 'bg-green-400',
      active: 'bg-green-400', 
      warning: 'bg-yellow-400',
      error: 'bg-red-400'
    };
    return colors?.[status] || 'bg-gray-400';
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-xl p-6 border border-slate-600">
      <div className="flex items-center gap-3 mb-6">
        <Monitor className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold text-blue-300">📊 Dashboard Rocket.new</h2>
      </div>
      {/* Poster Vision & Registry */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-5 h-5 text-orange-400" />
          <h3 className="font-semibold text-orange-300">Poster Vision & Registry</h3>
        </div>
        <div className="ml-7 space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">• Vision poster active:</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusIndicator('active')}`}></div>
              <span className="text-green-300">Active</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">• Registry status:</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusIndicator(dashboard?.registry_status)}`}></div>
              <span className="text-green-300 capitalize">{dashboard?.registry_status}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Kanban Deployment */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Kanban className="w-5 h-5 text-teal-400" />
          <h3 className="font-semibold text-teal-300">Kanban Déploiement</h3>
        </div>
        <div className="ml-7">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-yellow-900/30 rounded p-2 border border-yellow-700">
              <div className="text-yellow-300 font-medium">En attente</div>
              <div className="text-yellow-100 text-lg font-bold">{dashboard?.kanban_deployment?.pending || 0}</div>
            </div>
            <div className="bg-blue-900/30 rounded p-2 border border-blue-700">
              <div className="text-blue-300 font-medium">Traitement</div>
              <div className="text-blue-100 text-lg font-bold">{dashboard?.kanban_deployment?.processing || 0}</div>
            </div>
            <div className="bg-green-900/30 rounded p-2 border border-green-700">
              <div className="text-green-300 font-medium">Terminé</div>
              <div className="text-green-100 text-lg font-bold">{dashboard?.kanban_deployment?.completed || 0}</div>
            </div>
            <div className="bg-red-900/30 rounded p-2 border border-red-700">
              <div className="text-red-300 font-medium">Échoué</div>
              <div className="text-red-100 text-lg font-bold">{dashboard?.kanban_deployment?.failed || 0}</div>
            </div>
          </div>
        </div>
      </div>
      {/* Bus Monitor Live */}
      <div className="bg-gradient-to-r from-blue-900/30 to-teal-900/30 rounded-lg p-4 border border-blue-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
          <span className="text-blue-300 font-medium">Bus Monitor Live</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="text-xs text-gray-400 mb-2">API Endpoints Activity:</div>
          
          {/* API Endpoints */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-green-400" />
                <span className="text-gray-300">/registry</span>
              </div>
              <span className="text-green-300 font-mono text-xs">{dashboard?.bus_monitor_live?.registry_endpoint || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-yellow-400" />
                <span className="text-gray-300">/scores</span>
              </div>
              <span className="text-yellow-300 font-mono text-xs">{dashboard?.bus_monitor_live?.scores_endpoint || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-purple-400" />
                <span className="text-gray-300">/select</span>
              </div>
              <span className="text-purple-300 font-mono text-xs">{dashboard?.bus_monitor_live?.select_endpoint || 0}</span>
            </div>
          </div>

          {/* Recent Activity */}
          {dashboard?.bus_monitor_live?.recent_activity?.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-600">
              <div className="text-xs text-gray-400 mb-1">Activité récente:</div>
              <div className="space-y-1 max-h-16 overflow-y-auto">
                {dashboard?.bus_monitor_live?.recent_activity?.slice(0, 3)?.map((activity, index) => (
                  <div key={index} className="text-xs text-gray-300 flex items-center gap-2">
                    <Wifi className="w-2 h-2 text-blue-400" />
                    <span className="truncate">{activity?.event_type || 'Event'}</span>
                    <span className="text-gray-500 ml-auto">
                      {activity?.created_at ? new Date(activity.created_at)?.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}