import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, Users } from 'lucide-react';

const PostCleanupVerificationPanel = () => {
  const [verificationStatus, setVerificationStatus] = useState({
    integrity: false,
    credentials: true,
    team: false,
    audit: true
  });

  const toggleVerification = (key) => {
    setVerificationStatus(prev => ({
      ...prev,
      [key]: !prev?.[key]
    }));
  };

  const verificationItems = [
    {
      id: 'integrity',
      title: 'Repository Integrity Checks',
      description: 'Verify repository structure and commit history',
      details: [
        'Check branch consistency',
        'Validate commit signatures',
        'Verify file system integrity',
        'Test clone operations'
      ],
      priority: 'high'
    },
    {
      id: 'credentials',
      title: 'Credential Validation Testing',
      description: 'Ensure no sensitive data remains in history',
      details: [
        'Scan for API keys patterns',
        'Check environment variables',
        'Validate configuration files',
        'Test secret detection tools'
      ],
      priority: 'critical'
    },
    {
      id: 'team',
      title: 'Team Notification Protocols',
      description: 'Communicate changes to development team',
      details: [
        'Notify all team members',
        'Share new repository URLs',
        'Update CI/CD configurations',
        'Document breaking changes'
      ],
      priority: 'medium'
    },
    {
      id: 'audit',
      title: 'Security Audit Trail',
      description: 'Generate comprehensive cleanup documentation',
      details: [
        'Log all executed commands',
        'Document removed files',
        'Track key rotations',
        'Generate compliance report'
      ],
      priority: 'high'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-teal-400';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
    }
  };

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-xl">
      <div className="flex items-center mb-6">
        <Shield className="w-6 h-6 text-orange-400 mr-3" />
        <h3 className="text-xl font-bold text-white">✅ Post-Cleanup Verification</h3>
      </div>
      
      <div className="space-y-4">
        {verificationItems?.map(({ id, title, description, details, priority }) => (
          <div
            key={id}
            className="bg-gray-900/30 rounded-lg p-4 border border-gray-600/30 hover:border-orange-500/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start flex-1">
                <button
                  onClick={() => toggleVerification(id)}
                  className="mr-3 mt-0.5 text-white hover:text-orange-400 transition-colors"
                >
                  {verificationStatus?.[id] ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm font-medium ${verificationStatus?.[id] ? 'text-white line-through' : 'text-white'}`}>
                      {title}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityBadge(priority)} font-medium`}>
                      {priority?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-red-200/70 mb-3">
                    {description}
                  </p>
                  
                  {/* Verification Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {details?.map((detail, index) => (
                      <div
                        key={index}
                        className="flex items-center text-xs text-red-100/60"
                      >
                        <div className="w-1 h-1 bg-orange-400 rounded-full mr-2"></div>
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Verification Progress */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-red-200">
            <Users className="w-4 h-4 mr-2" />
            <span>
              Verified: {Object.values(verificationStatus)?.filter(Boolean)?.length} / {verificationItems?.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
                style={{
                  width: `${(Object.values(verificationStatus)?.filter(Boolean)?.length / verificationItems?.length) * 100}%`
                }}
              />
            </div>
            <span className="text-xs text-red-200 font-medium">
              {Math.round((Object.values(verificationStatus)?.filter(Boolean)?.length / verificationItems?.length) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCleanupVerificationPanel;