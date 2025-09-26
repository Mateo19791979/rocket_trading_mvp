import React from 'react';
import { Cpu, Zap, ArrowRight, Database, Brain, FileSearch } from 'lucide-react';

const ProcessingPanel = ({ books, processingStats }) => {
  const getProcessingStages = () => {
    const stages = [
      {
        id: 'ocr',
        name: 'OCR + extraction texte',
        icon: FileSearch,
        description: 'Conversion PDF vers texte structuré',
        color: 'text-blue-400'
      },
      {
        id: 'chunking',
        name: 'Découpage en chunks (~1000 tokens)',
        icon: Database,
        description: 'Segmentation intelligente du contenu',
        color: 'text-teal-400'
      },
      {
        id: 'embedding',
        name: 'Vectorisation (embeddings)',
        icon: Brain,
        description: 'Génération de vecteurs sémantiques',
        color: 'text-purple-400'
      },
      {
        id: 'extraction',
        name: 'Extraction règles trading → Registry',
        icon: Zap,
        description: 'Identification automatique des stratégies',
        color: 'text-orange-400'
      }
    ];
    return stages;
  };

  const getActiveProcessingJobs = () => {
    return books?.filter(book => 
      book?.processing_status === 'ingesting' || 
      book?.processing_status === 'extracting'
    ) || [];
  };

  const getProcessingMetrics = () => {
    const totalBooks = processingStats?.totalBooks || 0;
    const processedBooks = processingStats?.processedBooks || 0;
    const pendingBooks = processingStats?.pendingBooks || 0;
    const processingRate = totalBooks > 0 ? (processedBooks / totalBooks) * 100 : 0;

    return {
      totalBooks,
      processedBooks,
      pendingBooks,
      processingRate: Math.round(processingRate),
      strategiesExtracted: processingStats?.strategiesExtracted || 0
    };
  };

  const stages = getProcessingStages();
  const activeJobs = getActiveProcessingJobs();
  const metrics = getProcessingMetrics();

  return (
    <div className="bg-slate-800/30 border border-orange-500/30 rounded-lg backdrop-blur-sm">
      <div className="p-6 border-b border-orange-500/20">
        <h2 className="text-xl font-semibold text-orange-400 flex items-center">
          <Cpu className="mr-2" size={24} />
          Traitement
        </h2>
      </div>
      <div className="p-6 space-y-6">
        {/* Processing Pipeline */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Pipeline de traitement</h3>
          <div className="space-y-4">
            {stages?.map((stage, index) => (
              <div key={stage?.id}>
                <div className="flex items-center space-x-4 p-4 bg-slate-700/20 rounded-lg">
                  <div className={`p-2 bg-slate-600/30 rounded-lg ${stage?.color}`}>
                    <stage.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-300">
                        {index + 1}.
                      </span>
                      <span className="text-white font-medium">
                        {stage?.name}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      {stage?.description}
                    </p>
                  </div>
                </div>
                {index < stages?.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowRight className="text-slate-500" size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Processing Metrics */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Métriques de traitement</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-700/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">
                {metrics?.processingRate}%
              </div>
              <div className="text-sm text-slate-300">Taux de traitement</div>
              <div className="w-full bg-slate-600/30 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics?.processingRate}%` }}
                ></div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-700/20 rounded-lg">
              <div className="text-2xl font-bold text-teal-400">
                {metrics?.strategiesExtracted}
              </div>
              <div className="text-sm text-slate-300">Stratégies extraites</div>
            </div>
          </div>
        </div>

        {/* Active Processing Jobs */}
        {activeJobs?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Zap className="mr-2 text-orange-400" size={18} />
              Traitements en cours
            </h3>
            <div className="space-y-3">
              {activeJobs?.map((job) => (
                <div key={job?.id} className="p-4 bg-slate-700/20 rounded-lg border border-orange-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium truncate">
                      {job?.title || 'Livre sans titre'}
                    </span>
                    <span className="text-orange-400 text-sm font-medium">
                      {job?.processing_status === 'ingesting' ? 'Ingestion' : 'Extraction'}
                    </span>
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="w-full bg-slate-600/30 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full animate-pulse" 
                         style={{ width: '60%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Queue Status */}
        <div className="p-4 bg-slate-700/20 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-white">{metrics?.processedBooks}</div>
              <div className="text-xs text-slate-400">Traités</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-400">{activeJobs?.length}</div>
              <div className="text-xs text-slate-400">En cours</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-400">{metrics?.pendingBooks - activeJobs?.length}</div>
              <div className="text-xs text-slate-400">En attente</div>
            </div>
          </div>
        </div>

        {/* Processing Capacity */}
        <div className="p-4 bg-slate-700/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span className="text-white font-medium">Capacité de traitement: 24/7</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
            <span className="text-white font-medium">Parallélisation automatique</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingPanel;