import React from 'react';
import { 
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Activity,
  Clock,
  Database,
  TrendingUp,
  Zap
} from 'lucide-react';

export default function TgeDataSourcesPanel({ sourcesStatus, onRefresh, refreshing }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'stale':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default:
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'stale':
        return 'text-orange-400';
      default:
        return 'text-red-400';
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const formatSourceName = (source) => {
    switch (source) {
      case 'icoanalytics':
        return 'IcoAnalytics.org';
      case 'coinlaunch':
        return 'CoinLaunch.space';
      case 'cryptorank':
        return 'CryptoRank.io';
      default:
        return source;
    }
  };

  return (
    <div className="space-y-6">
      {/* TGE Data Sources Panel */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">TGE Data Sources</h2>
            </div>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {sourcesStatus?.map((source, index) => (
            <div key={index} className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(source?.status)}
                  <div>
                    <h3 className="font-medium text-white">{formatSourceName(source?.name)}</h3>
                    <p className={`text-sm ${getStatusColor(source?.status)}`}>
                      {source?.status?.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className={`text-right ${getHealthScoreColor(source?.healthScore)}`}>
                  <div className="text-lg font-bold">{source?.healthScore}%</div>
                  <div className="text-xs text-gray-400">Health</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-600/30 rounded-lg p-2">
                  <div className="flex items-center space-x-2 text-gray-400 mb-1">
                    <Clock className="w-3 h-3" />
                    <span>Last Update</span>
                  </div>
                  <div className="text-white text-xs">
                    {source?.lastUpdate 
                      ? new Date(source.lastUpdate)?.toLocaleString()
                      : 'Never'
                    }
                  </div>
                </div>

                <div className="bg-gray-600/30 rounded-lg p-2">
                  <div className="flex items-center space-x-2 text-gray-400 mb-1">
                    <Database className="w-3 h-3" />
                    <span>Events</span>
                  </div>
                  <div className="text-white font-medium">{source?.eventCount || 0}</div>
                </div>
              </div>

              {/* Connection Health Indicator */}
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">Connection Quality</span>
                  <span className="text-xs text-gray-400">{source?.healthScore}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full transition-all duration-500 ${
                      source?.healthScore >= 80 ? 'bg-green-400' :
                      source?.healthScore >= 60 ? 'bg-yellow-400' :
                      source?.healthScore >= 40 ? 'bg-orange-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${source?.healthScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}

          {(!sourcesStatus || sourcesStatus?.length === 0) && (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No data sources available</p>
              <p className="text-gray-500 text-sm">Click refresh to load sources</p>
            </div>
          )}
        </div>
      </div>
      {/* Aggregation Pipeline Panel */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-teal-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Aggregation Pipeline</h2>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-sm text-white">Web Scraping (got/cheerio)</span>
              </div>
              <span className="text-xs text-green-400">Active</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-sm text-white">Date Normalization (dayjs)</span>
              </div>
              <span className="text-xs text-green-400">Active</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-sm text-white">Supabase Upsert</span>
              </div>
              <span className="text-xs text-green-400">Active</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-sm text-white">Hash Deduplication</span>
              </div>
              <span className="text-xs text-green-400">Active</span>
            </div>
          </div>

          <div className="bg-gray-700/20 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Processing Stats</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Success Rate:</span>
                <span className="text-green-400 ml-2">98.5%</span>
              </div>
              <div>
                <span className="text-gray-400">Avg Latency:</span>
                <span className="text-blue-400 ml-2">2.1s</span>
              </div>
              <div>
                <span className="text-gray-400">Daily Processed:</span>
                <span className="text-white ml-2">450 events</span>
              </div>
              <div>
                <span className="text-gray-400">Error Rate:</span>
                <span className="text-red-400 ml-2">1.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Scheduler Management Panel */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Scheduler Management</h2>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-sm text-white font-medium">Automated Refresh</div>
                <div className="text-xs text-gray-400">Every 6 hours (4x daily)</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Active</span>
              </div>
            </div>

            <div className="bg-gray-700/20 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-2">Next Scheduled Run</div>
              <div className="text-sm text-white">
                {new Date(Date.now() + 6 * 60 * 60 * 1000)?.toLocaleString()}
              </div>
            </div>

            <div className="bg-gray-700/20 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-2">Execution Logs</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-green-400">✓ Success</span>
                  <span className="text-gray-400">2 hours ago</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-green-400">✓ Success</span>
                  <span className="text-gray-400">8 hours ago</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-green-400">✓ Success</span>
                  <span className="text-gray-400">14 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}