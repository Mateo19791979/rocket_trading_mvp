import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Check, 
  X, 
  AlertCircle,
  Loader,
  Plus
} from 'lucide-react';
import ragKnowledgeBaseService from '../../../services/ragKnowledgeBaseService';
import pdfProcessingService from '../../../services/pdfProcessingService';

export default function DocumentUploadPanel({ onUploadComplete }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e?.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e?.dataTransfer?.files)?.filter(
      file => file?.type === 'application/pdf'
    );
    
    addFilesToQueue(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e?.target?.files);
    addFilesToQueue(files);
    e.target.value = ''; // Reset input
  };

  const addFilesToQueue = (files) => {
    const newFiles = files?.map(file => ({
      id: Date.now() + Math.random(),
      file,
      status: 'pending',
      progress: 0,
      error: null,
      metadata: {
        name: file?.name?.replace('.pdf', ''),
        size: pdfProcessingService?.formatFileSize(file?.size),
        lastModified: new Date(file.lastModified)?.toLocaleDateString()
      }
    }));

    setUploadQueue(prev => [...prev, ...newFiles]);
  };

  const removeFromQueue = (id) => {
    setUploadQueue(prev => prev?.filter(item => item?.id !== id));
  };

  const updateQueueItem = (id, updates) => {
    setUploadQueue(prev => prev?.map(item => 
      item?.id === id ? { ...item, ...updates } : item
    ));
  };

  const processBatch = async () => {
    if (uploadQueue?.length === 0) return;

    setProcessing(true);

    for (const queueItem of uploadQueue) {
      if (queueItem?.status !== 'pending') continue;

      updateQueueItem(queueItem?.id, { status: 'processing', progress: 0 });

      try {
        // Validate file
        const validation = pdfProcessingService?.validatePDFFile(queueItem?.file);
        if (!validation?.isValid) {
          updateQueueItem(queueItem?.id, {
            status: 'error',
            error: validation?.errors?.join(', ')
          });
          continue;
        }

        // Convert to buffer
        const fileBuffer = await queueItem?.file?.arrayBuffer();

        // Process with progress tracking
        await ragKnowledgeBaseService?.ingestPDF({
          fileBuffer,
          title: queueItem?.metadata?.name,
          author: 'Auto-detected', // Would be extracted from PDF metadata
          year: new Date()?.getFullYear(),
          tags: ['AUTO_INGESTED'],
          domains: ['QuantOracle', 'StrategyWeaver', 'DataPhoenix'],
          onProgress: (progress) => {
            updateQueueItem(queueItem?.id, {
              progress: progress?.progress || 0,
              status: progress?.stage === 'complete' ? 'completed' : 'processing'
            });
          }
        });

        updateQueueItem(queueItem?.id, {
          status: 'completed',
          progress: 100
        });

      } catch (error) {
        updateQueueItem(queueItem?.id, {
          status: 'error',
          error: error?.message
        });
      }
    }

    setProcessing(false);
    onUploadComplete?.();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FileText className="h-4 w-4 text-gray-400" />;
      case 'processing':
        return <Loader className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'completed':
        return <Check className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-gray-400';
      case 'processing': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const completedCount = uploadQueue?.filter(item => item?.status === 'completed')?.length;
  const errorCount = uploadQueue?.filter(item => item?.status === 'error')?.length;
  const pendingCount = uploadQueue?.filter(item => item?.status === 'pending')?.length;

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Upload className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-semibold">Document Upload Interface</h3>
        </div>
        {uploadQueue?.length > 0 && (
          <div className="text-sm text-gray-400">
            {completedCount} completed, {errorCount} errors, {pendingCount} pending
          </div>
        )}
      </div>
      {/* Drag & Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-6 ${
          dragOver 
            ? 'border-green-400 bg-green-400/10' :'border-gray-600 hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e?.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h4 className="text-lg font-medium text-white mb-2">Drop PDF files here</h4>
        <p className="text-gray-400 mb-4">
          or click to browse and select multiple technical documents
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-2">
          <button
            onClick={() => fileInputRef?.current?.click()}
            disabled={processing}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Select PDF Files
          </button>
          
          <div className="text-sm text-gray-500">
            Supports: PDF documents up to 25MB each
          </div>
        </div>
      </div>
      {/* Upload Queue */}
      {uploadQueue?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Upload Queue ({uploadQueue?.length})</h4>
            <div className="space-x-2">
              <button
                onClick={processBatch}
                disabled={processing || pendingCount === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
              >
                {processing ? 'Processing...' : `Process ${pendingCount} Files`}
              </button>
              <button
                onClick={() => setUploadQueue([])}
                disabled={processing}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white rounded text-sm transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {uploadQueue?.map((item) => (
              <div key={item?.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(item?.status)}
                    <div>
                      <h5 className="font-medium text-white truncate max-w-xs">
                        {item?.metadata?.name}
                      </h5>
                      <p className="text-sm text-gray-400">
                        {item?.metadata?.size} • {item?.metadata?.lastModified}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${getStatusColor(item?.status)} capitalize`}>
                      {item?.status}
                    </span>
                    {item?.status === 'pending' && (
                      <button
                        onClick={() => removeFromQueue(item?.id)}
                        className="p-1 hover:bg-gray-600 rounded text-gray-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {(item?.status === 'processing' || item?.status === 'completed') && (
                  <div className="mb-2">
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          item?.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${item?.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {item?.error && (
                  <div className="text-sm text-red-400 bg-red-400/10 rounded p-2">
                    {item?.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Processing Info */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-300 mb-2">Supported Features:</h5>
            <ul className="text-gray-400 space-y-1">
              <li>• Batch PDF processing</li>
              <li>• Automatic metadata extraction</li>
              <li>• File validation & filtering</li>
              <li>• Real-time progress tracking</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-300 mb-2">Processing Pipeline:</h5>
            <ul className="text-gray-400 space-y-1">
              <li>• PDF text extraction</li>
              <li>• Content-aware chunking</li>
              <li>• Vector embedding generation</li>
              <li>• pgvector storage with deduplication</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}