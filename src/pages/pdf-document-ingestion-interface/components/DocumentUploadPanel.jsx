import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, File, Plus } from 'lucide-react';
import knowledgePipelineService from '../../../services/knowledgePipelineService';

const DocumentUploadPanel = ({ onFileUpload, uploadProgress, onSystemHealthChange }) => {
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
  
  const fileInputRef = useRef(null);

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
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFiles(e?.dataTransfer?.files);
    }
  }, []);

  const handleChange = (e) => {
    e?.preventDefault();
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFiles(e?.target?.files);
    }
  };

  const handleFiles = async (fileList) => {
    const newFiles = Array.from(fileList)?.filter(file => 
      file?.type === 'application/pdf' || file?.name?.toLowerCase()?.endsWith('.pdf')
    );

    if (newFiles?.length === 0) {
      alert('Please select PDF files only.');
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

    setIsUploading(true);
    onSystemHealthChange('processing');

    try {
      const uploadPromises = files?.map(async (file) => {
        const fileMetadata = {
          ...metadata,
          title: metadata?.title || file?.name?.replace(/\.pdf$/i, ''),
          tags: [...metadata?.tags, 'auto-uploaded', 'financial']
        };

        const result = await knowledgePipelineService?.uploadPdfDocument(file, fileMetadata);
        if (!result?.success) {
          throw new Error(result.error);
        }
        return result;
      });

      const results = await Promise.all(uploadPromises);
      
      // Trigger pipeline processing for uploaded files
      onFileUpload(files, metadata);
      
      // Clear form
      setFiles([]);
      setMetadata({
        author: '',
        publicationYear: '',
        isbn: '',
        tags: [],
        language: 'en'
      });
      
      onSystemHealthChange('healthy');
      
    } catch (error) {
      console.error('Upload failed:', error);
      onSystemHealthChange('error');
    } finally {
      setIsUploading(false);
    }
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

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="rounded-lg bg-gradient-to-br from-green-500 to-teal-600 p-2">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Document Upload</h3>
            <p className="text-sm text-gray-400">Drag and drop PDF files with batch processing support</p>
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-green-400 bg-green-400/10' :'border-gray-600 hover:border-gray-500'
          }`}
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
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-white mb-2">
              Drop PDF files here, or click to browse
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Supports batch processing • Max 50MB per file • PDF only
            </p>
            
            <button
              onClick={() => fileInputRef?.current?.click()}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
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

        {/* Upload Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={files?.length === 0 || isUploading || Object.values(validationResults)?.some(v => !v?.isValid)}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Upload {files?.length > 0 ? `${files?.length} file${files?.length > 1 ? 's' : ''}` : 'Files'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadPanel;