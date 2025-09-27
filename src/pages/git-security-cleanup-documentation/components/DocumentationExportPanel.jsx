import React, { useState } from 'react';
import { Download, FileText, CheckSquare, Settings } from 'lucide-react';

const DocumentationExportPanel = () => {
  const [selectedReports, setSelectedReports] = useState({
    auditTrail: true,
    cleanupLog: true,
    verificationChecklist: false,
    complianceReport: true
  });

  const [exportFormat, setExportFormat] = useState('pdf');

  const toggleReport = (key) => {
    setSelectedReports(prev => ({
      ...prev,
      [key]: !prev?.[key]
    }));
  };

  const reportTypes = [
    {
      id: 'auditTrail',
      title: 'Security Audit Trail',
      description: 'Complete log of all security cleanup actions',
      size: '2.3 MB',
      pages: '12 pages'
    },
    {
      id: 'cleanupLog',
      title: 'Cleanup Execution Log',
      description: 'Detailed command execution and results',
      size: '1.1 MB',
      pages: '8 pages'
    },
    {
      id: 'verificationChecklist',
      title: 'Verification Checklist',
      description: 'Post-cleanup validation procedures',
      size: '0.5 MB',
      pages: '4 pages'
    },
    {
      id: 'complianceReport',
      title: 'Compliance Report',
      description: 'Regulatory compliance documentation',
      size: '3.2 MB',
      pages: '15 pages'
    }
  ];

  const handleExport = () => {
    const selectedCount = Object.values(selectedReports)?.filter(Boolean)?.length;
    if (selectedCount > 0) {
      // Simulate export process
      console.log('Exporting', selectedCount, 'reports in', exportFormat, 'format');
    }
  };

  const generateCustomScript = () => {
    return `#!/bin/bash
# Custom Git Security Cleanup Script
# Generated on ${new Date()?.toISOString()}

echo "🚨 Starting Git Security Cleanup..."

# Stage 1: Prerequisites Check
pip install git-filter-repo
git --version

# Stage 2: Repository Backup
git clone --mirror . backup-$(date +%Y%m%d-%H%M%S).git

# Stage 3: Filter Repository
git filter-repo --path lib/core/config/app_config.dart --invert-paths

# Stage 4: Key Rotation & Force Push
echo "⚠️ Manual step required: Rotate Supabase keys" read -p"Press enter after key rotation..."

git push --force --all
git push --force --tags

echo "✅ Cleanup completed successfully"`;
  };

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-xl">
      <div className="flex items-center mb-6">
        <Download className="w-6 h-6 text-orange-400 mr-3" />
        <h3 className="text-xl font-bold text-white">📄 Documentation Export</h3>
      </div>
      
      {/* Report Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-white mb-3">Select Reports to Export</h4>
        <div className="space-y-3">
          {reportTypes?.map(({ id, title, description, size, pages }) => (
            <div
              key={id}
              className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-gray-600/30 hover:border-orange-500/30 transition-colors"
            >
              <div className="flex items-center">
                <button
                  onClick={() => toggleReport(id)}
                  className="mr-3 text-white hover:text-orange-400 transition-colors"
                >
                  <CheckSquare 
                    className={`w-4 h-4 ${selectedReports?.[id] ? 'text-orange-400' : 'text-gray-400'}`} 
                  />
                </button>
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="text-xs text-red-200/70">{description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-orange-300">{pages}</p>
                <p className="text-xs text-red-200/70">{size}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Format */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-white mb-3">Export Format</h4>
        <div className="flex gap-2">
          {['pdf', 'docx', 'html']?.map((format) => (
            <button
              key={format}
              onClick={() => setExportFormat(format)}
              className={`px-3 py-2 text-xs rounded transition-colors ${
                exportFormat === format
                  ? 'bg-orange-500 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {format?.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Script Generator */}
      <div className="mb-6 p-4 bg-black/20 rounded-lg border border-gray-600/30">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white">Custom Cleanup Script</h4>
          <button
            onClick={() => navigator.clipboard?.writeText(generateCustomScript())}
            className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
          >
            Copy Script
          </button>
        </div>
        <div className="bg-black/40 rounded p-2 max-h-32 overflow-y-auto">
          <pre className="text-xs text-green-400 font-mono">
            {generateCustomScript()?.split('\n')?.slice(0, 8)?.join('\n')}
            {generateCustomScript()?.split('\n')?.length > 8 && '\n...'}
          </pre>
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-red-200">
          <span>{Object.values(selectedReports)?.filter(Boolean)?.length} report(s) selected</span>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={Object.values(selectedReports)?.filter(Boolean)?.length === 0}
          >
            <FileText className="w-4 h-4 mr-2" />
            Export {exportFormat?.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentationExportPanel;