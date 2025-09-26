import React, { useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Filter, Search } from 'lucide-react';

export default function ProcessingLogsPanel({ logs, loading }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'failed':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' };
      case 'pending':
        return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      default:
        return { icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-500/20' };
    }
  };

  const getStageLabel = (stage) => {
    const stageMap = {
      'ocr': 'Extraction OCR',
      'chunking': 'Chunking',
      'embedding': 'Embeddings',
      'extraction': 'Extraction IA',
      'normalization': 'Normalisation',
      'validation': 'Validation'
    };
    return stageMap?.[stage] || stage;
  };

  const filteredLogs = logs?.filter(log => {
    const matchesStatus = statusFilter === 'all' || log?.status === statusFilter;
    const matchesSearch = !searchTerm || 
      log?.book_library?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      log?.book_library?.author?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      log?.processing_stage?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    return matchesStatus && matchesSearch;
  }) || [];

  return (
    <div className="bg-slate-800/40 backdrop-blur rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-slate-400" />
          <h2 className="text-xl font-semibold text-white">Journal de traitement</h2>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e?.target?.value)}
              className="bg-slate-700/50 border border-slate-600/30 text-white rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">Tous</option>
              <option value="completed">Complété</option>
              <option value="pending">En cours</option>
              <option value="failed">Échec</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="bg-slate-700/50 border border-slate-600/30 text-white rounded-lg pl-9 pr-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-48"
            />
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3 text-slate-400">
            <Clock className="w-5 h-5 animate-spin" />
            <span>Chargement des logs...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs?.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun log de traitement trouvé</p>
            </div>
          ) : (
            <>
              {filteredLogs?.map((log) => {
                const statusInfo = getStatusIcon(log?.status);
                const StatusIcon = statusInfo?.icon;

                return (
                  <div
                    key={log?.id}
                    className={`${statusInfo?.bg} border border-slate-600/30 rounded-lg p-4 transition-all duration-200 hover:shadow-lg`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`w-5 h-5 ${statusInfo?.color}`} />
                        
                        <div>
                          <h3 className="text-white font-medium text-sm">
                            {log?.book_library?.title || 'Document sans titre'}
                          </h3>
                          <p className="text-slate-300 text-xs mt-1">
                            {log?.book_library?.author && `par ${log?.book_library?.author} • `}
                            {getStageLabel(log?.processing_stage)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-sm font-medium ${statusInfo?.color} capitalize`}>
                          {log?.status}
                        </div>
                        {log?.progress_percentage > 0 && (
                          <div className="text-xs text-slate-400 mt-1">
                            {Math.round(log?.progress_percentage)}%
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Progress Bar */}
                    {log?.progress_percentage > 0 && (
                      <div className="mt-3">
                        <div className="bg-slate-700/50 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full ${statusInfo?.bg?.replace('/20', '/60')} transition-all duration-500`}
                            style={{ width: `${Math.min(log?.progress_percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {/* Error Message */}
                    {log?.error_message && (
                      <div className="mt-3 bg-red-900/20 border border-red-500/30 rounded-lg p-2">
                        <p className="text-red-400 text-xs">{log?.error_message}</p>
                      </div>
                    )}
                    {/* Timestamps */}
                    <div className="mt-3 flex items-center space-x-4 text-xs text-slate-400">
                      {log?.started_at && (
                        <span>
                          Démarré: {new Date(log.started_at)?.toLocaleString('fr-FR')}
                        </span>
                      )}
                      {log?.completed_at && (
                        <span>
                          Terminé: {new Date(log.completed_at)?.toLocaleString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Load More Button */}
              {filteredLogs?.length >= 20 && (
                <div className="text-center pt-4">
                  <button className="bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/30 text-slate-300 px-4 py-2 rounded-lg transition-colors text-sm">
                    Charger plus de logs
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}