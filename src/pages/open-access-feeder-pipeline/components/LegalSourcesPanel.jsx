import React from 'react';
import { BookOpen, ExternalLink, Activity, CheckCircle, AlertCircle } from 'lucide-react';

export default function LegalSourcesPanel({ sources, loading, onRefresh }) {
  const sourceConfigs = [
    {
      key: 'arxiv',
      name: 'arXiv',
      description: 'quantitative finance, ML, économie',
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/20',
      borderColor: 'border-teal-500/30'
    },
    {
      key: 'ssrn',
      name: 'SSRN',
      description: 'working papers, finance',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30'
    },
    {
      key: 'openalex',
      name: 'OpenAlex/Crossref',
      description: 'métadonnées open-access',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30'
    },
    {
      key: 'doaj',
      name: 'DOAJ, Internet Archive, CORE',
      description: 'repositories académiques',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30'
    },
    {
      key: 'gutenberg',
      name: 'Project Gutenberg',
      description: 'classiques finance',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30'
    }
  ];

  const getSourceStatus = (count) => {
    if (count > 50) return { status: 'healthy', icon: CheckCircle, color: 'text-green-400' };
    if (count > 10) return { status: 'warning', icon: Activity, color: 'text-yellow-400' };
    return { status: 'error', icon: AlertCircle, color: 'text-red-400' };
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <BookOpen className="w-6 h-6 text-teal-400" />
        <h2 className="text-xl font-semibold text-white">📚 Sources légales</h2>
      </div>
      <div className="space-y-4">
        {sourceConfigs?.map((config) => {
          const count = sources?.[config?.key] || 0;
          const statusInfo = getSourceStatus(count);
          const StatusIcon = statusInfo?.icon;

          return (
            <div
              key={config?.key}
              className={`${config?.bgColor} ${config?.borderColor} border rounded-lg p-4 transition-all duration-200 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`w-5 h-5 ${statusInfo?.color}`} />
                    <h3 className={`font-semibold ${config?.color}`}>
                      {config?.name}
                    </h3>
                  </div>
                  <p className="text-slate-300 text-sm mt-1 ml-8">
                    {config?.description}
                  </p>
                </div>

                <div className="text-right">
                  <div className={`text-2xl font-bold ${config?.color}`}>
                    {loading ? '...' : count?.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400">documents</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <Activity className="w-4 h-4" />
                  <span>Connexion active</span>
                </div>
                
                <button className="text-slate-400 hover:text-white transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Total Summary */}
        <div className="bg-slate-700/50 border border-slate-600/30 rounded-lg p-4 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Total des sources</h3>
              <p className="text-slate-300 text-sm">Documents disponibles</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-teal-400">
                {loading ? '...' : (sources?.total || 0)?.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">documents indexés</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}