import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import ContentPanel from './components/ContentPanel';
import ProcessingPanel from './components/ProcessingPanel';
import IntegrationPanel from './components/IntegrationPanel';
import ObjectivePanel from './components/ObjectivePanel';
import privateCorpusService from '../../services/privateCorpusService';
import { useAuth } from '../../contexts/AuthContext';

const PrivateCorpusManagement = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [processingStats, setProcessingStats] = useState(null);
  const [registryStatus, setRegistryStatus] = useState(null);
  const [strategyExtractions, setStrategyExtractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all data
  const loadData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [booksData, statsData, registryData, extractionsData] = await Promise.all([
        privateCorpusService?.getBookLibrary(user?.id),
        privateCorpusService?.getProcessingStats(user?.id),
        privateCorpusService?.getPipelineRegistry()?.catch(() => null),
        privateCorpusService?.getStrategyExtractions(user?.id)
      ]);

      setBooks(booksData);
      setProcessingStats(statsData);
      setRegistryStatus(registryData);
      setStrategyExtractions(extractionsData);
    } catch (err) {
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Real-time updates for processing jobs
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = privateCorpusService?.subscribeToProcessingUpdates(
      user?.id,
      () => {
        loadData(); // Refresh data when processing updates occur
      }
    );

    return unsubscribe;
  }, [user?.id]);

  // Handle file upload
  const handleFileUpload = async (files) => {
    if (!files?.length || !user?.id) return;
    
    try {
      setError(null);
      const uploadPromises = Array.from(files)?.map(file => 
        privateCorpusService?.uploadPDF(user?.id, file)
      );
      
      await Promise.all(uploadPromises);
      await loadData(); // Refresh data
    } catch (err) {
      setError(`Upload failed: ${err?.message}`);
    }
  };

  // Handle book deletion
  const handleDeleteBook = async (bookId, filePath) => {
    if (!user?.id) return;
    
    try {
      await privateCorpusService?.deleteBook(user?.id, bookId, filePath);
      await loadData(); // Refresh data
    } catch (err) {
      setError(`Delete failed: ${err?.message}`);
    }
  };

  // Handle start processing
  const handleStartProcessing = async (bookId) => {
    if (!user?.id) return;
    
    try {
      await privateCorpusService?.startProcessing(user?.id, bookId);
      await loadData(); // Refresh data
    } catch (err) {
      setError(`Failed to start processing: ${err?.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
            <p className="text-slate-300">Chargement du corpus privé...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-orange-600/20"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Private Corpus</h1>
              <p className="text-xl text-slate-300">Livres PDF fournis par l'utilisateur</p>
            </div>
            <div className="text-right text-slate-300">
              <p className="text-lg">{new Date()?.toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}</p>
            </div>
          </div>

          {/* Reference Image */}
          <div className="mb-8">
            <img 
              src="/assets/images/Planche_Private_Corpus-1758900487067.jpg" 
              alt="Private Corpus Reference" 
              className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl opacity-80 hover:opacity-100 transition-opacity duration-300"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          )}

          {/* Quick Upload Section */}
          <div className="mb-8 p-6 bg-slate-800/30 border border-teal-500/30 rounded-lg backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-teal-400 mb-4 flex items-center">
              <Upload className="mr-2" size={20} />
              Upload rapide
            </h3>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={(e) => handleFileUpload(e?.target?.files)}
                className="flex-1 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700"
              />
              <button
                onClick={() => document.querySelector('input[type="file"]')?.click()}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors duration-200"
              >
                Sélectionner PDFs
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Two-Column Layout */}
      <div className="px-8 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          
          {/* Left Column */}
          <div className="space-y-8">
            <ContentPanel 
              books={books}
              processingStats={processingStats}
              onDeleteBook={handleDeleteBook}
              onStartProcessing={handleStartProcessing}
            />
            <ProcessingPanel 
              books={books}
              processingStats={processingStats}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <IntegrationPanel 
              registryStatus={registryStatus}
              strategyExtractions={strategyExtractions}
            />
            <ObjectivePanel 
              processingStats={processingStats}
              registryStatus={registryStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateCorpusManagement;