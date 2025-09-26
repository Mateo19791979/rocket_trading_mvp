import React, { useState, useEffect } from 'react';
import { Download, BookOpen, Zap, Target, Settings, TrendingUp, FileText, Database, Search, Brain, Shield, Layers, Rocket, Monitor } from 'lucide-react';
import PipelineBooksService from '../../services/pipelineBooksService';

const PipelineBooksRegistryOrchestrator = () => {
  const [pipelineStats, setPipelineStats] = useState(null);
  const [registryData, setRegistryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPipelineData();
  }, []);

  const loadPipelineData = async () => {
    try {
      const [statsResponse, registryResponse] = await Promise.all([
        PipelineBooksService?.getProcessingStats(),
        PipelineBooksService?.getPipelineRegistryStats()
      ]);

      if (!statsResponse?.error) {
        setPipelineStats(statsResponse?.data);
      }

      if (!registryResponse?.error) {
        setRegistryData(registryResponse?.data);
      }
    } catch (error) {
      console.error('Error loading pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    const reportData = {
      timestamp: new Date()?.toISOString(),
      pipelineStats,
      registryData
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-books-report-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading Pipeline Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-black relative">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px]"></div>
      
      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen">
        {/* Header Section */}
        <div className="pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-8">
            {/* Date Badge */}
            <div className="flex justify-end mb-6">
              <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                <span className="text-white font-medium text-sm">
                  {new Date()?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Title Section */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
                Pipeline Livres → Registry → Orchestrateur
              </h1>
              <p className="text-xl text-white/95 font-medium drop-shadow-md">
                Ingestion doc, extraction de règles, normalisation YAML
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="max-w-7xl mx-auto px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left Column */}
            <div className="space-y-12">
              
              {/* Ingestion & Indexation */}
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl mr-4 shadow-lg">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">📥 Ingestion & Indexation</h2>
                </div>
                
                <div className="space-y-4 text-white/95">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                    <span>PDF → texte (OCR si besoin), chapitres/sections</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Database className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                    <span>Chunking + embeddings → base vectorielle</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Search className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                    <span>Recherche sémantique avec citations (livre/chapitre/page)</span>
                  </div>
                </div>

                {/* Stats Display */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <p className="text-blue-200 text-sm">Livres traités</p>
                    <p className="text-2xl font-bold text-white">{pipelineStats?.books_processed || '20'}</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <p className="text-blue-200 text-sm">Pages indexées</p>
                    <p className="text-2xl font-bold text-white">{pipelineStats?.pages_indexed || '4,250'}</p>
                  </div>
                </div>
              </div>

              {/* Extraction de stratégies */}
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-teal-600 to-green-600 rounded-xl mr-4 shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">🧩 Extraction de stratégies (agents)</h2>
                </div>
                
                <div className="space-y-4 text-white/95">
                  <div className="flex items-start space-x-3">
                    <Target className="w-5 h-5 text-teal-300 mt-0.5 flex-shrink-0" />
                    <span><strong>Knowledge Miner</strong> : BUY/SELL/ALLOC/RISK, paramètres</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Layers className="w-5 h-5 text-teal-300 mt-0.5 flex-shrink-0" />
                    <span><strong>Normalizer</strong> : fiches YAML (schema Registry)</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-teal-300 mt-0.5 flex-shrink-0" />
                    <span><strong>Risk-Auditor</strong> : contraintes (DD, vol, taille)</span>
                  </div>
                </div>

                {/* Agent Status */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="bg-green-500/30 rounded-lg p-3 text-center border border-green-400/20">
                    <p className="text-green-200 text-xs">Knowledge Miner</p>
                    <p className="text-green-100 font-bold">ACTIVE</p>
                  </div>
                  <div className="bg-blue-500/30 rounded-lg p-3 text-center border border-blue-400/20">
                    <p className="text-blue-200 text-xs">Normalizer</p>
                    <p className="text-blue-100 font-bold">ACTIVE</p>
                  </div>
                  <div className="bg-purple-500/30 rounded-lg p-3 text-center border border-purple-400/20">
                    <p className="text-purple-200 text-xs">Risk-Auditor</p>
                    <p className="text-purple-100 font-bold">ACTIVE</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-12">
              
              {/* Passage à l'échelle */}
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl mr-4 shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">🚀 Passage à l'échelle</h2>
                </div>
                
                <div className="space-y-4 text-white/95">
                  <div className="flex items-start space-x-3">
                    <BookOpen className="w-5 h-5 text-purple-300 mt-0.5 flex-shrink-0" />
                    <span>Lot initial : 20 livres → Registry v0.1</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Target className="w-5 h-5 text-purple-300 mt-0.5 flex-shrink-0" />
                    <span>Objectif : 500+ livres • dédoublonnage + score confiance</span>
                  </div>
                </div>

                {/* Progress Visualization */}
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-sm text-purple-200">
                    <span>Registry v0.1</span>
                    <span>20/500 livres</span>
                  </div>
                  <div className="w-full bg-black/30 rounded-full h-3 border border-white/10">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full" style={{width: '4%'}}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                      <p className="text-purple-200 text-sm">Score confiance</p>
                      <p className="text-xl font-bold text-white">94.2%</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                      <p className="text-purple-200 text-sm">Dédoublonnage</p>
                      <p className="text-xl font-bold text-white">96.8%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Intégration produit */}
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl mr-4 shadow-lg">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">🔗 Intégration produit</h2>
                </div>
                
                <div className="space-y-4 text-white/95">
                  <div className="flex items-start space-x-3">
                    <Monitor className="w-5 h-5 text-orange-300 mt-0.5 flex-shrink-0" />
                    <span><strong>Rocket.new</strong> : Poster + Kanban + Bus Monitor (live)</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Settings className="w-5 h-5 text-orange-300 mt-0.5 flex-shrink-0" />
                    <span><strong>Backend</strong> : /registry, /scores, /select, /allocate</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-orange-300 mt-0.5 flex-shrink-0" />
                    <span><strong>Exécution</strong> : backend Express + garde-fous</span>
                  </div>
                </div>

                {/* API Status */}
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center bg-black/20 rounded-lg p-3 border border-white/10">
                    <span className="text-orange-200">/registry</span>
                    <span className="px-2 py-1 bg-green-500/30 text-green-200 rounded text-sm border border-green-400/20">LIVE</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 rounded-lg p-3 border border-white/10">
                    <span className="text-orange-200">/scores</span>
                    <span className="px-2 py-1 bg-green-500/30 text-green-200 rounded text-sm border border-green-400/20">LIVE</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 rounded-lg p-3 border border-white/10">
                    <span className="text-orange-200">/allocate</span>
                    <span className="px-2 py-1 bg-yellow-500/30 text-yellow-200 rounded text-sm border border-yellow-400/20">DEV</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex justify-center mt-16">
            <button
              onClick={handleExportReport}
              className="flex items-center px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-2xl transition-all duration-300 border border-white/40 hover:border-white/60 shadow-lg"
            >
              <Download className="w-5 h-5 mr-3" />
              <span className="font-semibold">Export Pipeline Report</span>
            </button>
          </div>

          {/* Include the provided image */}
          <div className="mt-16 flex justify-center">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-2xl">
              <img 
                src="/assets/images/Planche_Pipeline_Livres-1758899086353.jpg" 
                alt="Pipeline Livres → Registry → Orchestrateur"
                className="max-w-full h-auto rounded-lg shadow-2xl"
              />
              <p className="text-white/80 text-sm text-center mt-4">
                Architecture complète du pipeline de traitement des livres financiers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineBooksRegistryOrchestrator;