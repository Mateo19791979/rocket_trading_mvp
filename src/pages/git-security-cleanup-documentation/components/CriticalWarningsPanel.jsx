import React, { useState } from 'react';
import { AlertTriangle, Users, Database, GitBranch } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const CriticalWarningsPanel = () => {
  const [acknowledgedWarnings, setAcknowledgedWarnings] = useState({
    forcePush: false,
    backup: false,
    teamCoordination: false
  });

  const toggleWarning = (key) => {
    setAcknowledgedWarnings(prev => ({
      ...prev,
      [key]: !prev?.[key]
    }));
  };

  const criticalWarnings = [
    {
      id: 'forcePush',
      icon: GitBranch,
      title: 'Force Push Implications',
      description: 'Force pushing rewrites Git history permanently',
      details: [
        'All team members must re-clone repository',
        'Existing local branches will be incompatible',
        'CI/CD pipelines may break temporarily',
        'Pull requests will need to be recreated'
      ],
      severity: 'critical'
    },
    {
      id: 'backup',
      icon: Database,
      title: 'Backup Requirements',
      description: 'Critical data backup before cleanup execution',
      details: [
        'Create full repository backup',
        'Export important branches separately',
        'Document all custom configurations',
        'Backup deployment configurations'
      ],
      severity: 'high'
    },
    {
      id: 'teamCoordination',
      icon: Users,
      title: 'Team Coordination Needs',
      description: 'Coordinate with all development team members',
      details: [
        'Schedule maintenance window',
        'Notify all active developers',
        'Pause all development activities',
        'Coordinate with DevOps team'
      ],
      severity: 'high'
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-900/20 border-red-500/30';
      case 'high': return 'bg-orange-900/20 border-orange-500/30';
      case 'medium': return 'bg-yellow-900/20 border-yellow-500/30';
      default: return 'bg-gray-900/20 border-gray-500/30';
    }
  };

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-xl">
      <div className="flex items-center mb-6">
        <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
        <h3 className="text-xl font-bold text-white">⚠️ Critical Warnings</h3>
      </div>
      
      <div className="space-y-4">
        {criticalWarnings?.map(({ id, icon: Icon, title, description, details, severity }) => (
          <div
            key={id}
            className={`rounded-lg p-4 border transition-colors ${getSeverityBg(severity)}`}
          >
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                <Icon className={`w-5 h-5 ${getSeverityColor(severity)}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white">{title}</h4>
                  <button
                    onClick={() => toggleWarning(id)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      acknowledgedWarnings?.[id] 
                        ? 'bg-green-500 text-white' :'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {acknowledgedWarnings?.[id] ? 'Acknowledged' : 'Acknowledge'}
                  </button>
                </div>
                <p className="text-xs text-red-200/70 mb-3">{description}</p>
                
                {/* Warning Details */}
                <div className="space-y-1">
                  {details?.map((detail, index) => (
                    <div
                      key={index}
                      className="flex items-center text-xs text-red-100/80"
                    >
                      <AlertTriangle className="w-3 h-3 text-red-400 mr-2 flex-shrink-0" />
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Acknowledgment Status */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-red-200">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span>
              Acknowledged: {Object.values(acknowledgedWarnings)?.filter(Boolean)?.length} / {criticalWarnings?.length}
            </span>
          </div>
          <div className="flex items-center">
            {Object.values(acknowledgedWarnings)?.every(Boolean) ? (
              <span className="text-green-400 text-xs font-medium">All warnings acknowledged</span>
            ) : (
              <span className="text-red-400 text-xs font-medium">Acknowledgment required</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriticalWarningsPanel;