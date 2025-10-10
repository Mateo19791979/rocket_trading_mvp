import React, { useState } from 'react';
import { Upload, FileText, Zap, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import ragKnowledgeBaseService from '../../../services/ragKnowledgeBaseService';
import pdfProcessingService from '../../../services/pdfProcessingService';

export default function PDFProcessingPanel({ onProcessComplete }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: '',
    tags: '',
    domains: 'QuantOracle,StrategyWeaver,DataPhoenix,Deployer'
  });

  const handleDrop = (e) => {
    e?.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e?.dataTransfer?.files)?.filter(
      file => file?.type === 'application/pdf'
    );
    
    if (files?.length > 0) {
      handleFileUpload(files?.[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      setProcessingStatus({
        stage: 'validation',
        progress: 0,
        message: 'Validating PDF file...'
      });

      // Validate file
      const validation = pdfProcessingService?.validatePDFFile(file);
      if (!validation?.isValid) {
        setProcessingStatus({
          stage: 'error',
          progress: 0,
          message: validation?.errors?.join(', ')
        });
        return;
      }

      // Pre-fill form with file name
      const fileName = file?.name?.replace('.pdf', '');
      setFormData(prev => ({
        ...prev,
        title: prev?.title || fileName
      }));

      setProcessingStatus({
        stage: 'ready',
        progress: 100,
        message: 'File ready for processing',
        file: file
      });

    } catch (error) {
      setProcessingStatus({
        stage: 'error',
        progress: 0,
        message: error?.message
      });
    } finally {
      setUploading(false);
    }
  };

  const handleProcessPDF = async () => {
    if (!processingStatus?.file) return;

    try {
      setUploading(true);
      const file = processingStatus?.file;
      
      // Convert file to buffer (mock for frontend)
      const fileBuffer = await file?.arrayBuffer();
      
      // Process with progress tracking
      await ragKnowledgeBaseService?.ingestPDF({
        fileBuffer,
        title: formData?.title || file?.name?.replace('.pdf', ''),
        author: formData?.author || 'Unknown Author',
        year: formData?.year ? parseInt(formData?.year) : null,
        tags: formData?.tags ? formData?.tags?.split(',')?.map(t => t?.trim()) : [],
        domains: formData?.domains?.split(',')?.map(d => d?.trim()),
        onProgress: setProcessingStatus
      });

      setProcessingStatus({
        stage: 'complete',
        progress: 100,
        message: 'PDF successfully processed and embedded!'
      });

      // Reset form
      setFormData({
        title: '',
        author: '',
        year: '',
        tags: '',
        domains: 'QuantOracle,StrategyWeaver,DataPhoenix,Deployer'
      });

      // Trigger dashboard refresh
      onProcessComplete?.();

      // Clear status after 3 seconds
      setTimeout(() => {
        setProcessingStatus(null);
      }, 3000);

    } catch (error) {
      setProcessingStatus({
        stage: 'error',
        progress: 0,
        message: error?.message
      });
    } finally {
      setUploading(false);
    }
  };

  const getStageIcon = (stage) => {
    switch (stage) {
      case 'validation': case 'parsing': case 'chunking': case 'embeddings': case 'storing':
        return <Clock className="h-4 w-4 text-yellow-400 animate-spin" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'ready':
        return <FileText className="h-4 w-4 text-blue-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStageMessage = (stage) => {
    const stages = {
      validation: 'Validating PDF file...',
      metadata: 'Processing metadata...',
      parsing: 'Extracting text from PDF...',
      chunking: 'Breaking into semantic chunks...',
      sections: 'Creating document sections...',
      embeddings: 'Generating vector embeddings...',
      storing: 'Storing in pgvector database...',
      complete: 'Successfully processed!',
      ready: 'Ready for processing',
      error: 'Processing failed'
    };
    return stages?.[stage] || 'Processing...';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <Zap className="h-5 w-5 text-teal-400" />
        <h3 className="text-lg font-semibold">PDF Processing Pipeline</h3>
      </div>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-400/10' : 'border-gray-600 hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e?.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-300 mb-2">Drag & drop PDF or click to browse</p>
        <p className="text-sm text-gray-500 mb-4">Maximum file size: 25MB</p>
        
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="pdf-upload"
          disabled={uploading}
        />
        <label
          htmlFor="pdf-upload"
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors"
        >
          Select PDF
        </label>
      </div>
      {/* Processing Status */}
      {processingStatus && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            {getStageIcon(processingStatus?.stage)}
            <span className="font-medium">{getStageMessage(processingStatus?.stage)}</span>
          </div>
          
          {processingStatus?.stage !== 'error' && processingStatus?.stage !== 'ready' && (
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Progress</span>
                <span>{processingStatus?.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="h-2 bg-teal-500 rounded-full transition-all duration-300"
                  style={{ width: `${processingStatus?.progress || 0}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {processingStatus?.message && (
            <p className="text-sm text-gray-400">{processingStatus?.message}</p>
          )}
        </div>
      )}
      {/* Metadata Form */}
      {processingStatus?.stage === 'ready' && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData?.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e?.target?.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="Enter book title"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={formData?.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e?.target?.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Author name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  value={formData?.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: e?.target?.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Publication year"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData?.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e?.target?.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="SRE, DATA, ML, TRADING"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Agent Domains
              </label>
              <input
                type="text"
                value={formData?.domains}
                onChange={(e) => setFormData(prev => ({ ...prev, domains: e?.target?.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="QuantOracle,StrategyWeaver,DataPhoenix"
              />
            </div>
          </div>
          
          <button
            onClick={handleProcessPDF}
            disabled={!formData?.title || uploading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {uploading ? 'Processing...' : 'Process PDF & Generate Embeddings'}
          </button>
        </div>
      )}
      {/* Processing Steps */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Processing Steps:</h4>
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>PDF text extraction using pdf-parse</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
            <span>Intelligent chunking with content-aware splitting</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>OpenAI embedding generation (text-embedding-3-small)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>pgvector storage with duplicate detection</span>
          </div>
        </div>
      </div>
    </div>
  );
}