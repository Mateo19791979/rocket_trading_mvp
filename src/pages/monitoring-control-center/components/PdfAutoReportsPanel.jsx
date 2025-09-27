import React from 'react';
import { FileText, Calendar, Clock, Download, CheckCircle, RefreshCw, Zap, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PdfAutoReportsPanel = ({ data }) => {
  const schedules = data?.schedules || [];
  const recentJobs = data?.recentJobs || [];
  const documents = data?.documents || [];
  const stats = data?.stats || { 
    activeSchedules: 0, 
    recentGenerations: 0, 
    totalDocuments: 0,
    avgProcessingTime: 0
  };

  const getJobStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/20';
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'failed': return 'text-red-400 bg-red-900/20';
      case 'processing': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-700/20';
    }
  };

  const getFrequencyIcon = (frequency) => {
    switch (frequency) {
      case 'daily': return <Clock className="w-4 h-4" />;
      case 'weekly': return <Calendar className="w-4 h-4" />;
      case 'monthly': return <BarChart3 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes?.[i];
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">PDF auto → rapports hebdo / mensuels</h3>
      </div>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{stats?.activeSchedules}</div>
              <div className="text-sm text-gray-400">Planifications</div>
            </div>
            <Calendar className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{stats?.recentGenerations}</div>
              <div className="text-sm text-gray-400">Générés récemment</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>
      {/* Processing Performance */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-300 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Performance de Génération
          </h4>
          <span className="text-sm text-blue-400">
            Temps moyen: {stats?.avgProcessingTime}s
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-white">{stats?.totalDocuments}</div>
            <div className="text-xs text-gray-400">Documents Total</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">
              {recentJobs?.filter(j => j?.job_status === 'completed')?.length}
            </div>
            <div className="text-xs text-gray-400">Succès</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-400">
              {recentJobs?.filter(j => j?.job_status === 'failed')?.length}
            </div>
            <div className="text-xs text-gray-400">Échecs</div>
          </div>
        </div>
      </div>
      {/* Active Schedules */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-semibold text-gray-300 flex items-center">
          <RefreshCw className="w-4 h-4 mr-2" />
          Planifications Actives
        </h4>
        
        {schedules?.length === 0 ? (
          <div className="text-center py-3 text-gray-400">
            <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune planification configurée</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {schedules?.slice(0, 3)?.map((schedule, idx) => (
              <div key={schedule?.id || idx} className="bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="text-blue-400">
                      {getFrequencyIcon(schedule?.frequency)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {schedule?.schedule_name || 'Rapport automatique'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {schedule?.frequency === 'weekly' ? 'Hebdomadaire' :
                         schedule?.frequency === 'monthly' ? 'Mensuel' :
                         schedule?.frequency === 'daily' ? 'Quotidien' : schedule?.frequency}
                        {schedule?.template?.template_name && (
                          <span> • {schedule?.template?.template_name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      schedule?.schedule_status === 'active' ? 'bg-green-400' :
                      schedule?.schedule_status === 'paused' ? 'bg-yellow-400' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-xs text-gray-400">
                      {schedule?.next_generation_at ? 
                        format(new Date(schedule.next_generation_at), 'dd/MM HH:mm', { locale: fr }) : 
                        'Non planifié'
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Recent Documents */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-300 flex items-center">
          <Download className="w-4 h-4 mr-2" />
          Documents Récents
        </h4>
        
        {documents?.length === 0 ? (
          <div className="text-center py-3 text-gray-400">
            <Download className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun document généré</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {documents?.slice(0, 4)?.map((doc, idx) => (
              <div key={doc?.id || idx} className="bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {doc?.title || 'Document sans titre'}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center space-x-2">
                      <span>
                        {doc?.document_type === 'portfolio_summary' ? 'Résumé Portfolio' :
                         doc?.document_type === 'trade_report' ? 'Rapport Trading' :
                         doc?.document_type === 'risk_assessment' ? 'Évaluation Risques' : 
                         doc?.document_type || 'Document'}
                      </span>
                      {doc?.file_size && (
                        <span>• {formatFileSize(doc?.file_size)}</span>
                      )}
                      {doc?.generated_at && (
                        <span>• {format(new Date(doc.generated_at), 'dd/MM/yyyy', { locale: fr })}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {doc?.downloaded_count > 0 && (
                      <span className="text-xs text-blue-400">
                        {doc?.downloaded_count} téléch.
                      </span>
                    )}
                    <Download className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Templates Configuration */}
      <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <BarChart3 className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-semibold text-gray-300">Templates Disponibles</span>
        </div>
        <div className="text-xs text-gray-400 space-y-1">
          <div>• Résumé Exécutif: Performance et risques</div>
          <div>• Analyse Détaillée: Métriques complètes</div>
          <div>• Rapport Conformité: Audit trail</div>
        </div>
      </div>
    </div>
  );
};

export default PdfAutoReportsPanel;