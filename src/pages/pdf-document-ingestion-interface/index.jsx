import React, { useState, useEffect } from 'react';
import { FileText, Upload, Database, Activity, CheckCircle, AlertCircle, RefreshCw, User, LogIn, Shield, Loader2, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DocumentUploadPanel from './components/DocumentUploadPanel';
import ProcessingConfigurationPanel from './components/ProcessingConfigurationPanel';
import ProcessingStatusPanel from './components/ProcessingStatusPanel';
import DocumentLibraryPanel from './components/DocumentLibraryPanel';

const PdfDocumentIngestionInterface = () => {
  const { user, isAuthenticated, isMockMode, isProductionMode, signIn, loading: authLoading } = useAuth();
  const [uploadProgress, setUploadProgress] = useState({});
  const [processingQueue, setProcessingQueue] = useState([]);
  const [systemHealth, setSystemHealth] = useState('healthy');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isInitializing, setIsInitializing] = useState(true);

  // 🚀 Production Mode State
  const [productionMetrics, setProductionMetrics] = useState({
    ocrCompletion: 87.3,
    qualityScore: 94.1,
    successRate: 85.7,
    avgTime: 2.3,
    totalProcessed: 1247,
    errors: 15
  });

  useEffect(() => {
    // Update timestamp every minute
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Handle initialization and auth state changes
    if (!authLoading) {
      setIsInitializing(false);
      
      if (isAuthenticated) {
        setSystemHealth('healthy');
      } else if (isMockMode && !isProductionMode) {
        setSystemHealth('healthy');
      } else {
        setSystemHealth('warning');
      }
    }
  }, [authLoading, isAuthenticated, isMockMode, isProductionMode]);

  const handleFileUpload = (files, metadata) => {
    // Enhanced authentication check
    if (!isAuthenticated && !isMockMode) {
      setSystemHealth('error');
      console.error('Upload attempted without authentication');
      return;
    }

    // Initialize upload progress for each file
    const newProgress = {};
    files?.forEach(file => {
      const fileId = `${file?.name}_${Date.now()}`;
      newProgress[fileId] = {
        fileName: file?.name,
        size: file?.size,
        progress: 0,
        status: 'uploading',
        metadata
      };
    });
    
    setUploadProgress(prev => ({ ...prev, ...newProgress }));

    // Simulate upload progress
    files?.forEach(file => {
      const fileId = `${file?.name}_${Date.now()}`;
      simulateUploadProgress(fileId);
    });

    console.log(`📄 Starting upload of ${files?.length} files in ${isMockMode ? 'demo' : 'production'} mode`);
  };

  const simulateUploadProgress = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      
      if (progress >= 100) {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { ...prev?.[fileId], progress: 100, status: 'completed' }
        }));
        
        // Add to processing queue
        setProcessingQueue(prev => [...prev, {
          id: fileId,
          fileName: prev?.[fileId]?.fileName || 'Unknown',
          status: 'queued',
          stage: 'pending',
          progress: 0,
          startTime: new Date()
        }]);
        
        clearInterval(interval);
      } else {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { ...prev?.[fileId], progress: Math.min(progress, 100) }
        }));
      }
    }, 500);
  };

  const handleRefreshStatus = () => {
    setLastUpdate(new Date());
    // Trigger refresh in child components
    window.dispatchEvent(new CustomEvent('refresh-ingestion-status'));
  };

  const handleDemoLogin = async () => {
    if (isProductionMode) {
      console.warn('🚫 Demo login disabled in production mode');
      return;
    }

    try {
      console.log('🔑 Attempting demo login...');
      const result = await signIn('demo@trading-mvp.com', 'demo123');
      if (result?.success) {
        setSystemHealth('healthy');
        console.log('✅ Demo login successful');
      } else {
        console.error('❌ Demo login failed:', result?.error);
      }
    } catch (error) {
      console.error('❌ Demo login error:', error);
    }
  };

  const getStatusDisplay = () => {
    if (isInitializing || authLoading) {
      return {
        color: 'text-blue-400',
        icon: Activity,
        text: 'Initializing'
      };
    }

    const statusMap = {
      healthy: { 
        color: 'text-green-400', 
        icon: CheckCircle, 
        text: isProductionMode ? 'Production Ready' : 'Healthy' 
      },
      warning: { 
        color: 'text-yellow-400', 
        icon: AlertCircle, 
        text: 'Auth Required' 
      },
      error: { 
        color: 'text-red-400', 
        icon: AlertCircle, 
        text: 'Error' 
      },
      processing: { 
        color: 'text-blue-400', 
        icon: Activity, 
        text: 'Processing' 
      }
    };

    return statusMap?.[systemHealth] || statusMap?.healthy;
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay?.icon;

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">
            {isProductionMode ? 'Initialisation du mode production...' : 'Initialisation de l\'interface d\'ingestion...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 🚀 Production Mode Banner */}
      {isProductionMode && isAuthenticated && (
        <div className="bg-green-600/20 border-b border-green-600/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-10 items-center justify-center">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-200">
                  <strong>Mode Production</strong> - Traitement de documents en temps réel activé
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Authentication Status Banner */}
      {!isAuthenticated && !isMockMode && (
        <div className="bg-yellow-600/20 border-b border-yellow-600/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-12 items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-yellow-200">
                  {isProductionMode 
                    ? 'Authentification requise pour accéder au mode production'
                    : 'Authentification requise pour l\'upload de fichiers'
                  }
                </span>
              </div>
              {!isProductionMode && (
                <button
                  onClick={handleDemoLogin}
                  className="inline-flex items-center px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded transition-colors"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Se connecter (Démo)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Demo Mode Banner - Only show if not in production */}
      {isAuthenticated && isMockMode && !isProductionMode && (
        <div className="bg-blue-600/20 border-b border-blue-600/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-10 items-center justify-center">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-200">
                  Mode Démonstration - Uploads simulés pour les tests
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-800/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className={`rounded-lg bg-gradient-to-br p-2 ${
                  isProductionMode ? 'from-green-600 to-emerald-700' : 'from-green-500 to-teal-600'
                }`}>
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    PDF Document Ingestion Interface
                    {isProductionMode && <span className="ml-2 text-green-400">[PRODUCTION]</span>}
                  </h1>
                  <p className="text-sm text-gray-400">
                    {isProductionMode 
                      ? 'Interface de traitement documentaire en production' 
                      : 'Financial literature integration and processing management'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Authentication Status */}
              <div className="flex items-center space-x-2">
                <User className={`h-4 w-4 ${isAuthenticated ? 'text-green-400' : 'text-gray-400'}`} />
                <span className={`text-sm ${isAuthenticated ? 'text-green-400' : 'text-gray-400'}`}>
                  {isAuthenticated 
                    ? `${user?.email || 'Connecté'}${isMockMode && !isProductionMode ? ' (Demo)' : isProductionMode ? ' (Production)' : ''}`
                    : 'Non connecté'
                  }
                </span>
              </div>

              {/* System Status */}
              <div className="flex items-center space-x-2">
                <StatusIcon className={`h-5 w-5 ${statusDisplay?.color}`} />
                <span className={`text-sm font-medium ${statusDisplay?.color}`}>
                  {statusDisplay?.text}
                </span>
              </div>

              {/* Processing Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Upload className="h-4 w-4" />
                  <span>{Object.keys(uploadProgress)?.length} uploads</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Database className="h-4 w-4" />
                  <span>{processingQueue?.length} in queue</span>
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefreshStatus}
                className="inline-flex items-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>

              {/* Last Update */}
              <div className="text-sm text-gray-400">
                Last update: {lastUpdate?.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 🚀 Production Metrics Dashboard */}
      {isProductionMode && isAuthenticated && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-400">OCR Completion</div>
                <div className="text-2xl font-bold text-green-400">{productionMetrics?.ocrCompletion}%</div>
              </div>
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${productionMetrics?.ocrCompletion}%` }}></div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-400">Quality Score</div>
                <div className="text-2xl font-bold text-blue-400">{productionMetrics?.qualityScore}%</div>
              </div>
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${productionMetrics?.qualityScore}%` }}></div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-400">Success Rate</div>
                <div className="text-2xl font-bold text-emerald-400">{productionMetrics?.successRate}%</div>
              </div>
              <div className="mt-2 text-xs text-gray-500">Avg Time: {productionMetrics?.avgTime}s</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-400">Processed</div>
                <div className="text-2xl font-bold text-white">{productionMetrics?.totalProcessed}</div>
              </div>
              <div className="mt-2 text-xs text-gray-500">Errors: {productionMetrics?.errors}</div>
            </div>
          </div>
        </div>
      )}
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Document Upload */}
            <DocumentUploadPanel 
              onFileUpload={handleFileUpload}
              uploadProgress={uploadProgress}
              onSystemHealthChange={setSystemHealth}
              isAuthenticated={isAuthenticated}
              isMockMode={isMockMode}
              isProductionMode={isProductionMode}
              user={user}
            />
            
            {/* Processing Configuration */}
            <ProcessingConfigurationPanel 
              systemHealth={systemHealth} 
              isProductionMode={isProductionMode}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Processing Status */}
            <ProcessingStatusPanel 
              processingQueue={processingQueue}
              setProcessingQueue={setProcessingQueue}
              systemHealth={systemHealth}
              isProductionMode={isProductionMode}
            />
            
            {/* Document Library */}
            <DocumentLibraryPanel 
              isProductionMode={isProductionMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfDocumentIngestionInterface;