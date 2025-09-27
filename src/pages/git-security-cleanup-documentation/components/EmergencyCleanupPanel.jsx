import React, { useState } from 'react';
import { Terminal, Play, CheckCircle, AlertCircle, Copy } from 'lucide-react';

const EmergencyCleanupPanel = () => {
  const [activeStage, setActiveStage] = useState(1);
  const [stageStatus, setStageStatus] = useState({
    1: 'pending',
    2: 'pending',
    3: 'pending'
  });

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  const executeStage = (stage) => {
    setStageStatus(prev => ({
      ...prev,
      [stage]: prev?.[stage] === 'pending' ? 'running' : prev?.[stage] === 'running' ? 'completed' : 'pending'
    }));
    
    if (stage < 3) {
      setTimeout(() => {
        setActiveStage(stage + 1);
      }, 2000);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4 text-orange-400 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const stages = [
    {
      id: 1,
      title: 'Installation',
      description: 'Install git-filter-repo and verify prerequisites',
      command: 'pip install git-filter-repo',
      details: [
        'Verify Python environment',
        'Check git version compatibility',
        'Install git-filter-repo package',
        'Validate installation success'
      ]
    },
    {
      id: 2,
      title: 'History Cleaning',
      description: 'Execute git-filter-repo to remove sensitive files',
      command: 'git filter-repo --path lib/core/config/app_config.dart --invert-paths',
      details: [
        'Backup current repository state',
        'Execute filter-repo command',
        'Monitor progress and logs',
        'Verify file removal success'
      ]
    },
    {
      id: 3,
      title: 'Security Rotation',
      description: 'Rotate keys in Supabase and perform force push',
      command: `# Puis rotation des clés dans Supabase et push forcé si repo public
git push --force --all
git push --force --tags`,
      details: [
        'Create new Supabase project keys',
        'Update environment variables',
        'Perform database migration',
        'Force push cleaned repository'
      ]
    }
  ];

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-xl">
      <div className="flex items-center mb-6">
        <Terminal className="w-6 h-6 text-red-400 mr-3" />
        <h3 className="text-xl font-bold text-white">🚨 Emergency Cleanup Procedure</h3>
      </div>
      <div className="space-y-6">
        {stages?.map(({ id, title, description, command, details }) => (
          <div
            key={id}
            className={`bg-gray-900/30 rounded-lg p-4 border transition-colors ${
              activeStage === id 
                ? 'border-orange-500/50 bg-orange-500/5' :'border-gray-600/30 hover:border-red-500/30'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="mr-3 flex items-center justify-center w-8 h-8 rounded-full bg-gray-700">
                  <span className="text-sm font-bold text-white">{id}</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{title}</h4>
                  <p className="text-sm text-red-200/70">{description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(stageStatus?.[id])}
                <button
                  onClick={() => executeStage(id)}
                  className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Execute
                </button>
              </div>
            </div>

            {/* Command Block */}
            <div className="mb-4">
              <div className="bg-black/40 rounded p-3 font-mono text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400">$</span>
                  <button
                    onClick={() => copyToClipboard(command)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <pre className="text-white whitespace-pre-wrap">{command}</pre>
              </div>
            </div>

            {/* Stage Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {details?.map((detail, index) => (
                <div
                  key={index}
                  className="flex items-center text-xs text-red-100/80"
                >
                  <div className="w-1 h-1 bg-orange-400 rounded-full mr-2"></div>
                  {detail}
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            {stageStatus?.[id] !== 'pending' && (
              <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    stageStatus?.[id] === 'completed' ? 'bg-green-500 w-full' : 'bg-orange-500 w-3/4 animate-pulse'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Rollback Section */}
      <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
        <div className="flex items-center mb-2">
          <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
          <span className="text-sm font-medium text-red-300">Rollback Procedures</span>
        </div>
        <p className="text-xs text-red-200/70">
          If cleanup fails, restore from backup using: <code className="bg-black/20 px-1 rounded">git clone backup-repo.git</code>
        </p>
      </div>
    </div>
  );
};

export default EmergencyCleanupPanel;