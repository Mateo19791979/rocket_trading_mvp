import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Folder, 
  GitBranch, 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Database,
  Layers,
  Terminal
} from 'lucide-react';
import knowledgePipelineService from '../../../services/knowledgePipelineService';

const PipelineArchitecturePanel = ({ pipelineRunning }) => {
  const [architectureData, setArchitectureData] = useState({
    packageConfig: {
      name: "trading-mvp-knowledge-pipeline",
      version: "1.0.0",
      dependencies: {
        "glob": "^11.0.0",
        "js-yaml": "^4.1.0",
        "pdf-parse": "^1.1.1"
      }
    },
    folderStructure: [
      { name: 'books_inbox', type: 'input', status: 'ready', files: 12 },
      { name: 'src/tools', type: 'utility', status: 'active', files: 3 },
      { name: 'src/ingest', type: 'processing', status: 'active', files: 1 },
      { name: 'src/extract', type: 'processing', status: 'active', files: 1 },
      { name: 'src/registry', type: 'processing', status: 'active', files: 1 },
      { name: 'src/orchestrator', type: 'processing', status: 'active', files: 1 },
      { name: 'workdir', type: 'temp', status: 'ready', files: 45 },
      { name: 'registry', type: 'output', status: 'ready', files: 23 },
      { name: 'out', type: 'output', status: 'ready', files: 8 }
    ]
  });

  const [processingStatus, setProcessingStatus] = useState({
    'PDF Ingestion': 'active',
    'Rule Extraction': 'active', 
    'Registry Construction': 'active',
    'Orchestrator Integration': 'active'
  });

  useEffect(() => {
    const loadArchitectureStatus = async () => {
      try {
        const status = await knowledgePipelineService?.getPipelineStatus();
        if (status?.success) {
          // Update processing status based on pipeline health
          const newStatus = { ...processingStatus };
          Object.keys(newStatus)?.forEach(key => {
            newStatus[key] = pipelineRunning ? 'active' : 'paused';
          });
          setProcessingStatus(newStatus);
        }
      } catch (error) {
        console.error('Failed to load architecture status:', error);
      }
    };

    loadArchitectureStatus();

    // Listen for refresh events
    const handleRefresh = () => {
      loadArchitectureStatus();
    };

    window.addEventListener('refresh-pipeline-status', handleRefresh);
    return () => window.removeEventListener('refresh-pipeline-status', handleRefresh);
  }, [pipelineRunning]);

  const getFolderIcon = (type) => {
    switch (type) {
      case 'input': return FileText;
      case 'processing': return GitBranch;
      case 'output': return Database;
      case 'temp': return Layers;
      case 'utility': return Terminal;
      default: return Folder;
    }
  };

  const getFolderColor = (type) => {
    switch (type) {
      case 'input': return 'text-blue-400 bg-blue-400/10';
      case 'processing': return 'text-green-400 bg-green-400/10';
      case 'output': return 'text-orange-400 bg-orange-400/10';
      case 'temp': return 'text-purple-400 bg-purple-400/10';
      case 'utility': return 'text-teal-400 bg-teal-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'paused': return Clock;
      case 'error': return AlertCircle;
      default: return Activity;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-teal-600 p-2">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Pipeline Architecture</h3>
            <p className="text-sm text-gray-400">Complete Node.js system structure and configuration</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Package Configuration */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">Package Configuration</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Project Name</p>
                <p className="text-sm font-mono text-green-400">{architectureData?.packageConfig?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Version</p>
                <p className="text-sm font-mono text-blue-400">{architectureData?.packageConfig?.version}</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">Dependencies</p>
              <div className="space-y-1">
                {Object.entries(architectureData?.packageConfig?.dependencies)?.map(([pkg, version]) => (
                  <div key={pkg} className="flex justify-between items-center text-sm">
                    <span className="font-mono text-gray-300">{pkg}</span>
                    <span className="font-mono text-orange-400">{version}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Folder Structure */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">Folder Structure</h4>
            <div className="space-y-2">
              {architectureData?.folderStructure?.map((folder) => {
                const FolderIcon = getFolderIcon(folder?.type);
                const folderColor = getFolderColor(folder?.type);
                const StatusIcon = getStatusIcon(folder?.status);
                const statusColor = getStatusColor(folder?.status);

                return (
                  <div key={folder?.name} className="flex items-center justify-between p-2 rounded border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`rounded p-1.5 ${folderColor}`}>
                        <FolderIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-mono text-white">{folder?.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{folder?.type} module</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-400">{folder?.files} files</span>
                      <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Processing Status */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">Real-time Processing Status</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(processingStatus)?.map(([stage, status]) => {
                const StatusIcon = getStatusIcon(status);
                const statusColor = getStatusColor(status);

                return (
                  <div key={stage} className="flex items-center justify-between p-2 rounded border border-gray-700/50">
                    <span className="text-sm text-gray-300">{stage}</span>
                    <div className="flex items-center space-x-2">
                      <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                      <span className={`text-xs font-medium ${statusColor} capitalize`}>
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineArchitecturePanel;