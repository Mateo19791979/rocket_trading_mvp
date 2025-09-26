import React from 'react';
import { Cog, CheckCircle, Clock, AlertTriangle, Download, FileText, Database, Brain, GitBranch } from 'lucide-react';

export default function PipelineStagesPanel({ stages, loading }) {
  const stageConfigs = [
    {
      key: 'fetch_openaccess',
      name: 'fetch_openaccess.py',
      description: 'recherche & téléchargement OA',
      icon: Download,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30'
    },
    {
      key: 'ingest_pdf',
      name: 'ingest_pdf.py',
      description: 'extraction texte & chunking',
      icon: FileText,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30'
    },
    {
      key: 'embeddings_index',
      name: 'embeddings_index.py',
      description: 'embeddings + vectorDB (Chroma)',
      icon: Database,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30'
    },
    {
      key: 'miner_agent',
      name: 'miner_agent.py',
      description: 'extraction stratégies (LLM)',
      icon: Brain,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30'
    },
    {
      key: 'normalize_registry',
      name: 'normalize_registry.py',
      description: 'Registry_auto.yaml',
      icon: GitBranch,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/20',
      borderColor: 'border-teal-500/30'
    }
  ];

  const getStageStatus = (count, totalJobs) => {
    const percentage = totalJobs > 0 ? (count / totalJobs) * 100 : 0;
    if (percentage > 80) return { status: 'healthy', icon: CheckCircle, color: 'text-green-400' };
    if (percentage > 40) return { status: 'processing', icon: Clock, color: 'text-yellow-400' };
    return { status: 'waiting', icon: AlertTriangle, color: 'text-slate-400' };
  };

  const totalJobs = stages ? Object.values(stages)?.reduce((sum, count) => sum + count, 0) : 0;

  return (
    <div className="bg-slate-800/40 backdrop-blur rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Cog className="w-6 h-6 text-orange-400" />
        <h2 className="text-xl font-semibold text-white">⚙️ Étapes pipeline</h2>
      </div>
      <div className="space-y-4">
        {stageConfigs?.map((config, index) => {
          const count = stages?.[config?.key] || 0;
          const statusInfo = getStageStatus(count, totalJobs);
          const StageIcon = config?.icon;
          const StatusIcon = statusInfo?.icon;

          return (
            <div
              key={config?.key}
              className={`${config?.bgColor} ${config?.borderColor} border rounded-lg p-4 transition-all duration-200 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-slate-700/50 p-2 rounded-lg">
                    <span className={`text-sm font-bold ${config?.color}`}>{index + 1}</span>
                  </div>
                  <StageIcon className={`w-5 h-5 ${config?.color}`} />
                  <div>
                    <h3 className={`font-semibold ${config?.color} text-sm`}>
                      {config?.name}
                    </h3>
                    <p className="text-slate-300 text-xs">
                      {config?.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <StatusIcon className={`w-5 h-5 ${statusInfo?.color}`} />
                  <div className="text-right">
                    <div className={`text-lg font-bold ${config?.color}`}>
                      {loading ? '...' : count}
                    </div>
                    <div className="text-xs text-slate-400">jobs</div>
                  </div>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="bg-slate-700/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${config?.bgColor?.replace('/20', '/60')} transition-all duration-500`}
                    style={{ 
                      width: totalJobs > 0 ? `${Math.min((count / totalJobs) * 100, 100)}%` : '0%' 
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Pipeline Summary */}
        <div className="bg-slate-700/50 border border-slate-600/30 rounded-lg p-4 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">État du pipeline</h3>
              <div className="flex items-center space-x-4 text-sm text-slate-300 mt-1">
                <span>✅ Complété: {stages?.completed || 0}</span>
                <span>⏳ En cours: {stages?.pending || 0}</span>
                <span>❌ Échec: {stages?.failed || 0}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-400">
                {loading ? '...' : totalJobs}
              </div>
              <div className="text-sm text-slate-400">jobs total</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}