import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, File, Plus, Shield, Info } from 'lucide-react';
import knowledgePipelineService from '../../../services/knowledgePipelineService';
import pdfProcessingService from '../../../services/pdfProcessingService';

const DocumentUploadPanel = ({ onFileUpload, uploadProgress, onSystemHealthChange, isAuthenticated, isMockMode, isProductionMode, user }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [metadata, setMetadata] = useState({
    author: '',
    publicationYear: '',
    isbn: '',
    tags: [],
    language: 'en'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [validationResults, setValidationResults] = useState({});
  const [uploadError, setUploadError] = useState(null);
  const [authCheckPassed, setAuthCheckPassed] = useState(false);
  
  const fileInputRef = useRef(null);

  // Enhanced authentication check
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated && user) {
        setAuthCheckPassed(true);
        setUploadError(null);
        onSystemHealthChange?.('healthy');
      } else if (isMockMode && !isProductionMode) {
        // Allow uploads in mock mode only if not in production
        setAuthCheckPassed(true);
        setUploadError(null);
        onSystemHealthChange?.('healthy');
      } else {
        setAuthCheckPassed(false);
        if (isProductionMode) {
          setUploadError('Authentification requise pour accéder au mode production');
        } else {
          setUploadError('Authentification requise pour télécharger des fichiers');
        }
        onSystemHealthChange?.('warning');
      }
    };

    checkAuth();
  }, [isAuthenticated, user, isMockMode, isProductionMode, onSystemHealthChange]);

  const handleDrag = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (!authCheckPassed) {
      setUploadError('Authentification requise pour télécharger des fichiers');
      return;
    }
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFiles(e?.dataTransfer?.files);
    }
  }, [authCheckPassed]);

  const handleChange = (e) => {
    e?.preventDefault();
    
    if (!authCheckPassed) {
      setUploadError('Authentification requise pour télécharger des fichiers');
      return;
    }
    
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFiles(e?.target?.files);
    }
  };

  const handleFiles = async (fileList) => {
    setUploadError(null);
    
    const newFiles = Array.from(fileList)?.filter(file => 
      file?.type === 'application/pdf' || file?.name?.toLowerCase()?.endsWith('.pdf')
    );

    if (newFiles?.length === 0) {
      setUploadError('Veuillez sélectionner uniquement des fichiers PDF.');
      return;
    }

    // Validate each file
    const validationResults = {};
    for (const file of newFiles) {
      validationResults[file.name] = await validateFile(file);
    }
    
    setValidationResults(validationResults);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const validateFile = async (file) => {
    const results = {
      size: file?.size <= 50 * 1024 * 1024, // 50MB limit
      type: file?.type === 'application/pdf' || file?.name?.toLowerCase()?.endsWith('.pdf'),
      financial: await detectFinancialContent(file),
      readable: true // Simplified validation
    };

    return {
      ...results,
      isValid: Object.values(results)?.every(Boolean),
      issues: Object.entries(results)?.filter(([_, valid]) => !valid)?.map(([key]) => key)
    };
  };

  const detectFinancialContent = async (file) => {
    // Simplified financial content detection
    const fileName = file?.name?.toLowerCase();
    const financialKeywords = [
      'trading', 'finance', 'investment', 'derivatives', 
      'options', 'stocks', 'market', 'portfolio', 'risk',
      'hedge', 'fund', 'analysis', 'strategy'
    ];
    
    return financialKeywords?.some(keyword => fileName?.includes(keyword));
  };

  const handleUpload = async () => {
    if (files?.length === 0) return;
    
    if (!authCheckPassed) {
      setUploadError(isProductionMode 
        ? 'Authentification requise pour accéder au mode production'
        : 'Authentification requise pour télécharger des fichiers'
      );
      onSystemHealthChange?.('error');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    onSystemHealthChange?.('processing');

    try {
      if (isProductionMode) {
        // 🚀 Production Mode: Real file processing
        await performProductionUpload();
      } else if (isMockMode) {
        await simulateMockUpload();
      } else {
        await performRealUpload();
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error?.message || 'Échec du téléchargement du fichier');
      onSystemHealthChange?.('error');
    } finally {
      setIsUploading(false);
    }
  };

  // 🚀 New Production Upload Method
  const performProductionUpload = async () => {
    const enhancedMetadata = {
      ...metadata,
      isProductionMode: true,
      uploadSource: 'production-interface',
      timestamp: new Date()?.toISOString()
    };

    const uploadPromises = files?.map(async (file) => {
      const fileMetadata = {
        ...enhancedMetadata,
        title: enhancedMetadata?.title || file?.name?.replace(/\.pdf$/i, ''),
        tags: [...enhancedMetadata?.tags, 'production', 'auto-uploaded', 'financial'],
        fileSize: file?.size,
        fileName: file?.name
      };

      // Use production PDF processing service
      const result = await pdfProcessingService?.processDocument(file, fileMetadata);
      if (!result?.success) {
        throw new Error(result?.error || 'Production upload failed');
      }
      return result;
    });

    const results = await Promise.all(uploadPromises);
    
    // Trigger pipeline processing for uploaded files
    onFileUpload?.(files, metadata);
    
    // Clear form
    setFiles([]);
    setMetadata({
      author: '',
      publicationYear: '',
      isbn: '',
      tags: [],
      language: 'en'
    });
    
    onSystemHealthChange?.('healthy');
    
    console.log(`✅ Successfully uploaded ${files?.length} files in production mode`);
  };

  const simulateMockUpload = async () => {
    // Simulate API calls for demo mode
    const uploadPromises = files?.map(async (file, index) => {
      await new Promise(resolve => setTimeout(resolve, 1000 * (index + 1)));
      return {
        success: true,
        data: {
          bookId: `mock-book-${Date.now()}-${index}`,
          title: file?.name?.replace(/\.pdf$/i, ''),
          status: 'uploaded'
        }
      };
    });

    const results = await Promise.all(uploadPromises);
    
    // Trigger pipeline processing for uploaded files
    onFileUpload?.(files, metadata);
    
    // Clear form
    setFiles([]);
    setMetadata({
      author: '',
      publicationYear: '',
      isbn: '',
      tags: [],
      language: 'en'
    });
    
    onSystemHealthChange?.('healthy');
  };

  const performRealUpload = async () => {
    // Enhanced metadata with demo mode flag
    const enhancedMetadata = {
      ...metadata,
      isDemoMode: isMockMode,
      isMockMode: isMockMode
    };

    const uploadPromises = files?.map(async (file) => {
      const fileMetadata = {
        ...enhancedMetadata,
        title: enhancedMetadata?.title || file?.name?.replace(/\.pdf$/i, ''),
        tags: [...enhancedMetadata?.tags, 'auto-uploaded', 'financial']
      };

      // Use the knowledge pipeline service for upload
      const result = await knowledgePipelineService?.uploadPdfDocument(file, fileMetadata);
      if (!result?.success) {
        throw new Error(result?.error || 'Upload failed');
      }
      return result;
    });

    const results = await Promise.all(uploadPromises);
    
    // Trigger pipeline processing for uploaded files
    onFileUpload?.(files, metadata);
    
    // Clear form
    setFiles([]);
    setMetadata({
      author: '',
      publicationYear: '',
      isbn: '',
      tags: [],
      language: 'en'
    });
    
    onSystemHealthChange?.('healthy');
    
    // Log success with mode info
    const mode = results?.[0]?.data?.mode || (isMockMode ? 'demo' : 'production');
    console.log(`✅ Successfully uploaded ${files?.length} files in ${mode} mode`);
  };

  const removeFile = (index) => {
    setFiles(prev => prev?.filter((_, i) => i !== index));
    const fileName = files?.[index]?.name;
    if (fileName) {
      setValidationResults(prev => {
        const updated = { ...prev };
        delete updated?.[fileName];
        return updated;
      });
    }
  };

  const addTag = (tag) => {
    if (tag && !metadata?.tags?.includes(tag)) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev?.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev?.tags?.filter(tag => tag !== tagToRemove)
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const canUpload = files?.length > 0 && Object.values(validationResults)?.every(v => v?.isValid) && authCheckPassed;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className={`rounded-lg bg-gradient-to-br p-2 ${
            isProductionMode ? 'from-green-600 to-emerald-700' : 'from-green-500 to-teal-600'
          }`}>
            <Upload className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Document Upload
              {isProductionMode && <span className="ml-2 text-green-400">[PRODUCTION]</span>}
            </h3>
            <p className="text-sm text-gray-400">
              {isProductionMode 
                ? 'Upload de documents PDF avec traitement en temps réel'
                : 'Drag and drop PDF files with batch processing support'
              }
            </p>
          </div>
        </div>

        {/* Enhanced Authentication Status */}
        <div className={`mb-4 p-3 rounded-lg border ${
          authCheckPassed 
            ? (isProductionMode ? 'bg-green-900/50 border-green-600/30' : 'bg-green-900/50 border-green-600/30')
            : 'bg-yellow-900/50 border-yellow-600/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className={`h-5 w-5 ${authCheckPassed ? 'text-green-400' : 'text-yellow-400'}`} />
              <span className={`text-sm font-medium ${authCheckPassed ? 'text-green-400' : 'text-yellow-400'}`}>
                {authCheckPassed 
                  ? (isProductionMode ? 'Authentifié (Mode Production)' : `Authentifié${isMockMode ? ' (Mode Démo)' : ''}`)
                  : (isProductionMode ? 'Production - Authentification requise' : 'Authentification requise')
                }
              </span>
            </div>
            {user && (
              <span className="text-xs text-gray-400">
                {user?.email}
              </span>
            )}
          </div>
          
          {authCheckPassed && isProductionMode && (
            <p className="mt-2 text-xs text-green-300">
              <CheckCircle className="h-3 w-3 inline mr-1" />
              Mode production activé - traitement de documents en temps réel
            </p>
          )}
          
          {authCheckPassed && isMockMode && !isProductionMode && (
            <p className="mt-2 text-xs text-green-300">
              <CheckCircle className="h-3 w-3 inline mr-1" />
              Mode démonstration activé - uploads simulés disponibles
            </p>
          )}
          
          {!authCheckPassed && (
            <p className="mt-2 text-xs text-yellow-300">
              <Info className="h-3 w-3 inline mr-1" />
              {isProductionMode 
                ? 'Veuillez vous connecter pour accéder au mode production.' :'Veuillez vous connecter pour télécharger des documents PDF.'
              }
            </p>
          )}
        </div>

        {/* Error Display */}
        {uploadError && (
          <div className="mb-4 p-3 rounded-lg bg-red-600/20 border border-red-600/30">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-sm text-red-300">{uploadError}</span>
            </div>
          </div>
        )}

        {/* Drag & Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-green-400 bg-green-400/10' 
              : authCheckPassed 
                ? 'border-gray-600 hover:border-gray-500' :'border-gray-700 bg-gray-800/50'
          } ${!authCheckPassed && 'cursor-not-allowed opacity-60'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            onChange={handleChange}
            disabled={!authCheckPassed}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          
          <div className="flex flex-col items-center">
            <Upload className={`h-12 w-12 mb-4 ${authCheckPassed ? 'text-gray-400' : 'text-gray-600'}`} />
            <p className={`text-lg font-medium mb-2 ${authCheckPassed ? 'text-white' : 'text-gray-500'}`}>
              {authCheckPassed 
                ? 'Drop PDF files here, or click to browse' :'Authentification requise pour télécharger'
              }
            </p>
            <p className={`text-sm mb-4 ${authCheckPassed ? 'text-gray-400' : 'text-gray-600'}`}>
              {authCheckPassed 
                ? 'Supports batch processing • Max 50MB per file • PDF only' :'Veuillez vous connecter pour continuer'
              }
            </p>
            
            <button
              onClick={() => fileInputRef?.current?.click()}
              disabled={!authCheckPassed}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                authCheckPassed 
                  ? 'bg-green-600 text-white hover:bg-green-700' :'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Choose Files
            </button>
          </div>
        </div>

        {/* File List */}
        {files?.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-white mb-3">Selected Files ({files?.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files?.map((file, index) => {
                const validation = validationResults?.[file?.name];
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-3 flex-1">
                      <FileText className={`h-5 w-5 ${validation?.isValid ? 'text-green-400' : 'text-red-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{file?.name}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>{formatFileSize(file?.size)}</span>
                          {validation && (
                            <div className="flex items-center space-x-1">
                              {validation?.isValid ? (
                                <>
                                  <CheckCircle className="h-3 w-3 text-green-400" />
                                  <span className="text-green-400">Valid</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3 text-red-400" />
                                  <span className="text-red-400">{validation?.issues?.join(', ')}</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Metadata Form */}
        {authCheckPassed && (
          <div className="mt-6 bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">Document Metadata</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Author</label>
                <input
                  type="text"
                  value={metadata?.author}
                  onChange={(e) => setMetadata(prev => ({ ...prev, author: e?.target?.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Document author"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Publication Year</label>
                <input
                  type="number"
                  value={metadata?.publicationYear}
                  onChange={(e) => setMetadata(prev => ({ ...prev, publicationYear: e?.target?.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="YYYY"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">ISBN (Optional)</label>
                <input
                  type="text"
                  value={metadata?.isbn}
                  onChange={(e) => setMetadata(prev => ({ ...prev, isbn: e?.target?.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="ISBN number"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Language</label>
                <select
                  value={metadata?.language}
                  onChange={(e) => setMetadata(prev => ({ ...prev, language: e?.target?.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-400 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {metadata?.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-blue-600 text-xs text-white rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-gray-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['derivatives', 'options', 'trading', 'analysis', 'strategy', 'risk-management']?.map(tag => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    className="px-2 py-1 text-xs border border-gray-600 text-gray-400 rounded-full hover:border-gray-500 hover:text-gray-300 transition-colors"
                    disabled={metadata?.tags?.includes(tag)}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!canUpload || isUploading}
            className={`inline-flex items-center px-6 py-3 font-medium rounded-md transition-colors ${
              isProductionMode 
                ? 'bg-green-700 text-white hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed' :'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {isProductionMode ? 'Processing...' : 'Uploading...'}
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Upload {files?.length > 0 ? `${files?.length} file${files?.length > 1 ? 's' : ''}` : 'Files'}
                {isProductionMode ? ' (Production)' : isMockMode ? ' (Simulé)' : ''}
              </>
            )}
          </button>
        </div>

        {/* Mode Info */}
        {authCheckPassed && (
          <div className={`mt-4 p-3 rounded-lg border ${
            isProductionMode 
              ? 'bg-green-600/20 border-green-600/30'
              : isMockMode 
                ? 'bg-blue-600/20 border-blue-600/30' :'bg-gray-600/20 border-gray-600/30'
          }`}>
            <div className="flex items-start space-x-2">
              <Info className={`h-4 w-4 mt-0.5 ${
                isProductionMode ? 'text-green-400' : isMockMode ? 'text-blue-400' : 'text-gray-400'
              }`} />
              <div className={`text-sm ${
                isProductionMode ? 'text-green-300' : isMockMode ? 'text-blue-300' : 'text-gray-300'
              }`}>
                {isProductionMode ? (
                  <>
                    <p className="font-medium">Mode Production Activé</p>
                    <p className="text-xs mt-1 text-green-400">
                      Les fichiers sont traités en temps réel par le pipeline de production. 
                      Tous les uploads sont enregistrés et indexés dans la base de données.
                    </p>
                  </>
                ) : isMockMode ? (
                  <>
                    <p className="font-medium">Mode Démonstration</p>
                    <p className="text-xs text-blue-400 mt-1">
                      Les uploads sont simulés pour la démonstration. En mode production, les fichiers seraient traités par le pipeline de traitement documentaire.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">Mode Développement</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Uploads en cours de développement avec traitement réel mais limité.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadPanel;