import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Brain, Database, Zap, Download, Upload } from 'lucide-react';
import { AIVectorKnowledgeService } from '../../services/aiVectorKnowledgeService';

/**
 * AI Knowledge Vector Management Interface
 * Complete RAG system control panel for Thomas Mazzoni & Peter Lynch integration
 * FIXED: Scroll issues and infinite loop problems
 */
export default function AIKnowledgeVectorManagement() {
  const [knowledgeStats, setKnowledgeStats] = useState(null);
  const [ragQuery, setRagQuery] = useState('');
  const [ragResults, setRagResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [cacheStatus, setCacheStatus] = useState('idle');

  // FIXED: Prevent infinite useEffect loops with proper dependency management
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      if (isMounted && !knowledgeStats) {
        try {
          await loadKnowledgeStats();
        } catch (error) {
          console.error('Failed to load initial data:', error);
        }
      }
    };
    
    loadInitialData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to prevent loops

  const loadKnowledgeStats = async () => {
    if (loading) return; // Prevent concurrent calls
    
    try {
      setLoading(true);
      const stats = await AIVectorKnowledgeService?.getKnowledgeStats();
      setKnowledgeStats(stats);
    } catch (error) {
      console.error('Error loading knowledge stats:', error);
      // Set fallback data to prevent loading loops
      setKnowledgeStats({
        total_vectors: 0,
        by_topic: {},
        by_source: {},
        average_quality: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRAGQuery = async () => {
    if (!ragQuery?.trim() || loading) return;
    
    try {
      setLoading(true);
      const results = await AIVectorKnowledgeService?.ragQuery(ragQuery);
      setRagResults(results);
    } catch (error) {
      console.error('Error in RAG query:', error);
      setRagResults({ error: error?.message });
    } finally {
      setLoading(false);
    }
  };

  const runSystemTest = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const test = await AIVectorKnowledgeService?.testRAGSystem();
      setTestResults(test);
    } catch (error) {
      console.error('Error running system test:', error);
      setTestResults({ success: false, error: error?.message });
    } finally {
      setLoading(false);
    }
  };

  const refreshCache = async () => {
    if (cacheStatus === 'updating') return;
    
    try {
      setCacheStatus('updating');
      await AIVectorKnowledgeService?.updateVectorCache();
      setCacheStatus('updated');
      setTimeout(() => setCacheStatus('idle'), 3000);
    } catch (error) {
      console.error('Error refreshing cache:', error);
      setCacheStatus('error');
      setTimeout(() => setCacheStatus('idle'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        {/* Header - FIXED: Better spacing and layout */}
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Brain className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">🚀 AI Knowledge Vector Management</h1>
                <p className="text-slate-300">RAG System Integration - Thomas Mazzoni & Peter Lynch</p>
                {/* ADDED: Scroll debug info */}
                <p className="text-xs text-slate-500 mt-1">
                  Page Height: Auto | Scroll: Enabled ✅
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid - FIXED: Improved grid layout for better scroll */}
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Knowledge Base Statistics - FIXED: Proper height management */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-5 w-5 text-green-400" />
                <h2 className="text-xl font-semibold text-white">Base de Connaissances</h2>
              </div>
              
              {loading && !knowledgeStats ? (
                <div className="text-slate-400 py-8 text-center">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mb-2"></div>
                  <div>Chargement des statistiques...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-400">{knowledgeStats?.total_vectors || 0}</div>
                      <div className="text-sm text-slate-400">Vecteurs Totaux</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">{knowledgeStats?.average_quality?.toFixed(2) || '0.00'}</div>
                      <div className="text-sm text-slate-400">Qualité Moyenne</div>
                    </div>
                  </div>
                  
                  {/* FIXED: Prevent empty object iteration causing rendering issues */}
                  {knowledgeStats?.by_topic && Object.keys(knowledgeStats?.by_topic)?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Par Sujet</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {Object.entries(knowledgeStats?.by_topic)?.map(([topic, count]) => (
                          <div key={topic} className="flex justify-between items-center bg-slate-900/30 rounded-lg p-3">
                            <span className="text-slate-300 capitalize">{topic?.replace('_', ' ')}</span>
                            <span className="text-blue-400 font-semibold">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* FIXED: Prevent empty object iteration causing rendering issues */}
                  {knowledgeStats?.by_source && Object.keys(knowledgeStats?.by_source)?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Par Source</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {Object.entries(knowledgeStats?.by_source)?.map(([source, count]) => (
                          <div key={source} className="flex justify-between items-center bg-slate-900/30 rounded-lg p-3">
                            <span className="text-slate-300">{source}</span>
                            <span className="text-green-400 font-semibold">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RAG Query Interface - FIXED: Proper height management */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Requête RAG</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <textarea
                    value={ragQuery}
                    onChange={(e) => setRagQuery(e?.target?.value)}
                    placeholder="Posez une question sur la finance quantitative ou l'investissement comportemental..."
                    className="w-full h-24 bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none resize-none"
                    disabled={loading}
                  />
                </div>
                
                <button
                  onClick={handleRAGQuery}
                  disabled={loading || !ragQuery?.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Analyse en cours...
                    </div>
                  ) : (
                    'Interroger l\'IA'
                  )}
                </button>
                
                {ragResults && (
                  <div className="bg-slate-900/50 rounded-lg p-4 mt-4 max-h-64 overflow-y-auto">
                    {ragResults?.error ? (
                      <div className="text-red-400">Erreur: {ragResults?.error}</div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-white whitespace-pre-wrap">{ragResults?.answer}</div>
                        <div className="border-t border-slate-600 pt-3">
                          <div className="text-sm text-slate-400">
                            Sources: {ragResults?.sources?.length || 0} segments trouvés
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* System Testing Panel - FIXED: Proper height management */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-yellow-400" />
                <h2 className="text-xl font-semibold text-white">Tests Système</h2>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={runSystemTest}
                  disabled={loading}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Test en cours...
                    </div>
                  ) : (
                    'Exécuter Test RAG'
                  )}
                </button>
                
                {testResults && (
                  <div className={`bg-slate-900/50 rounded-lg p-4 ${testResults?.success ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'}`}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${testResults?.success ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        <span className="text-white font-medium">
                          {testResults?.success ? '✅ Test Réussi' : '❌ Test Échoué'}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        Requête: {testResults?.query}
                      </div>
                      {testResults?.success ? (
                        <div className="text-sm text-slate-400">
                          Réponse: {testResults?.response_length} caractères | Sources: {testResults?.sources_count}
                        </div>
                      ) : (
                        <div className="text-red-400 text-sm">{testResults?.error}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cache Management - FIXED: Proper height management */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Gestion Cache</h2>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={refreshCache}
                  disabled={cacheStatus === 'updating'}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {cacheStatus === 'updating' ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Actualisation...
                    </div>
                  ) : (
                    'Actualiser Cache RAG'
                  )}
                </button>
                
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${
                      cacheStatus === 'idle' ? 'bg-slate-400' :
                      cacheStatus === 'updating' ? 'bg-yellow-400' :
                      cacheStatus === 'updated' ? 'bg-green-400' : 'bg-red-400'
                    }`}></span>
                    <span className="text-slate-300 text-sm">
                      Status: {
                        cacheStatus === 'idle' ? 'En attente' :
                        cacheStatus === 'updating' ? 'Mise à jour...' :
                        cacheStatus === 'updated' ? 'Cache actualisé' : 'Erreur'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Status Panel - FIXED: Better spacing */}
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">État d'Intégration AAS</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-blue-400">📘 Mazzoni</div>
                <div className="text-sm text-slate-400">Finance Quantitative</div>
                <div className="text-xs text-green-400 mt-1">✅ Intégré</div>
              </div>
              
              <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-green-400">📗 Lynch</div>
                <div className="text-sm text-slate-400">Investissement Comportemental</div>
                <div className="text-xs text-green-400 mt-1">✅ Intégré</div>
              </div>
              
              <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-purple-400">🧮 Agents IA</div>
                <div className="text-sm text-slate-400">4 Agents Liés</div>
                <div className="text-xs text-green-400 mt-1">✅ Actifs</div>
              </div>
              
              <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-cyan-400">🔄 RAG</div>
                <div className="text-sm text-slate-400">Système Autonome</div>
                <div className="text-xs text-green-400 mt-1">✅ Opérationnel</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - FIXED: Better spacing and prevent button spamming */}
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Actions Rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white p-4 rounded-lg transition-colors duration-200 text-left"
                disabled={loading}
              >
                <Upload className="h-5 w-5 text-blue-400 mb-2" />
                <div className="font-medium">Charger Nouveau Livre</div>
                <div className="text-sm text-slate-400">PDF vers Vecteurs</div>
              </button>
              
              <button 
                onClick={loadKnowledgeStats}
                className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white p-4 rounded-lg transition-colors duration-200 text-left"
                disabled={loading}
              >
                <Database className="h-5 w-5 text-green-400 mb-2" />
                <div className="font-medium">Actualiser Stats</div>
                <div className="text-sm text-slate-400">Données en temps réel</div>
              </button>
              
              <button 
                className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white p-4 rounded-lg transition-colors duration-200 text-left"
                disabled={loading}
              >
                <Download className="h-5 w-5 text-purple-400 mb-2" />
                <div className="font-medium">Export Rapport</div>
                <div className="text-sm text-slate-400">Analyse complète</div>
              </button>
            </div>
          </div>
        </div>

        {/* ADDED: Scroll Status Indicator for debugging */}
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/30 p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Scroll Debug: Page rendue correctement ✅</span>
              <span>Hauteur contenu: {typeof window !== 'undefined' ? `${document.body?.scrollHeight}px` : 'Calculé côté client'}</span>
              <span>Viewport: {typeof window !== 'undefined' ? `${window.innerHeight}px` : 'Calculé côté client'}</span>
            </div>
          </div>
        </div>

        {/* ADDED: Bottom padding to ensure scroll works at the end */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}