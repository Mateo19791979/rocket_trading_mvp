import React, { useState } from 'react';
import { ArrowUpDown, Zap, AlertCircle, CheckCircle, Code, Download } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const MigrationConsiderationsPanel = () => {
  const [activeStrategy, setActiveStrategy] = useState('cross-platform');

  const migrationStrategies = {
    'cross-platform': {
      title: 'Cross-Platform Synchronization',
      icon: ArrowUpDown,
      description: 'Unified security policies across Flutter mobile and React web',
      challenges: [
        'Environment variable naming conventions',
        'Secure storage implementation differences',
        'Configuration validation synchronization',
        'Development workflow integration'
      ],
      solutions: [
        'Standardized configuration schema',
        'Platform-specific security adapters',
        'Unified validation rules',
        'Shared development tools'
      ]
    },
    'deployment': {
      title: 'Deployment Strategy',
      icon: Zap,
      description: 'Production-ready deployment with security best practices',
      challenges: [
        'Environment-specific configuration management',
        'Secret rotation and updates',
        'CI/CD integration complexity',
        'Production security validation'
      ],
      solutions: [
        'Environment-based configuration files',
        'Automated secret management',
        'Security validation pipelines',
        'Runtime configuration monitoring'
      ]
    },
    'maintenance': {
      title: 'Ongoing Maintenance',
      icon: CheckCircle,
      description: 'Long-term security and configuration management',
      challenges: [
        'Configuration drift detection',
        'Security update propagation',
        'Multi-platform consistency',
        'Audit trail maintenance'
      ],
      solutions: [
        'Automated configuration monitoring',
        'Centralized security policy management',
        'Platform-agnostic security validation',
        'Comprehensive audit logging'
      ]
    }
  };

  const implementationSteps = [
    {
      phase: 'Assessment',
      description: 'Analyze current configuration security',
      actions: ['Security audit', 'Risk assessment', 'Gap analysis'],
      timeline: '1-2 weeks'
    },
    {
      phase: 'Planning',
      description: 'Design unified security architecture',
      actions: ['Schema design', 'Security policies', 'Tool selection'],
      timeline: '2-3 weeks'
    },
    {
      phase: 'Implementation',
      description: 'Deploy secure configuration management',
      actions: ['Code implementation', 'Security validation', 'Testing'],
      timeline: '3-4 weeks'
    },
    {
      phase: 'Validation',
      description: 'Verify security compliance',
      actions: ['Security testing', 'Performance validation', 'Documentation'],
      timeline: '1-2 weeks'
    }
  ];

  const getPhaseColor = (phase) => {
    const colors = {
      'Assessment': 'bg-red-500/20 text-red-200 border-red-400/30',
      'Planning': 'bg-orange-500/20 text-orange-200 border-orange-400/30',
      'Implementation': 'bg-blue-500/20 text-blue-200 border-blue-400/30',
      'Validation': 'bg-green-500/20 text-green-200 border-green-400/30'
    };
    return colors?.[phase] || 'bg-gray-500/20 text-gray-200 border-gray-400/30';
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ArrowUpDown className="w-6 h-6 text-white mr-3" />
            <h3 className="text-xl font-semibold text-white">Migration Considerations</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-200 text-sm rounded-full">
              Strategy Guide
            </span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="mb-6">
          <p className="text-blue-100 mb-4">
            Strategic approach to implementing Flutter-style configuration security in React applications 
            while maintaining cross-platform consistency and security standards.
          </p>
        </div>

        {/* Strategy Selection */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(migrationStrategies)?.map(([key, { title, icon: Icon }]) => (
            <button
              key={key}
              onClick={() => setActiveStrategy(key)}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                activeStrategy === key
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-400/30' : 'bg-white/5 text-white/70 hover:bg-white/10 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {title}
            </button>
          ))}
        </div>

        {/* Active Strategy Details */}
        <div className="bg-slate-900/50 rounded-lg border border-white/10 p-6 mb-6">
          <div className="flex items-center mb-4">
            {React.createElement(migrationStrategies?.[activeStrategy]?.icon, { className: "w-6 h-6 text-purple-400 mr-3" })}
            <h4 className="text-white font-semibold text-lg">{migrationStrategies?.[activeStrategy]?.title}</h4>
          </div>
          
          <p className="text-blue-200 mb-6">{migrationStrategies?.[activeStrategy]?.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-white font-medium mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 text-orange-400 mr-2" />
                Challenges
              </h5>
              <ul className="space-y-2">
                {migrationStrategies?.[activeStrategy]?.challenges?.map((challenge, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-orange-200 text-sm">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-white font-medium mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                Solutions
              </h5>
              <ul className="space-y-2">
                {migrationStrategies?.[activeStrategy]?.solutions?.map((solution, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-green-200 text-sm">{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Implementation Timeline */}
        <div className="bg-white/5 rounded-lg p-6">
          <h4 className="text-white font-semibold mb-4 flex items-center">
            <Code className="w-5 h-5 mr-2" />
            Implementation Timeline
          </h4>
          
          <div className="space-y-4">
            {implementationSteps?.map((step, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPhaseColor(step?.phase)}`}>
                    {step?.phase}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-white font-medium">{step?.description}</h5>
                    <span className="text-xs text-blue-300">{step?.timeline}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {step?.actions?.map((action, actionIndex) => (
                      <span 
                        key={actionIndex}
                        className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Total Timeline: 7-11 weeks</p>
                <p className="text-blue-200 text-sm">Depends on application complexity and security requirements</p>
              </div>
              <button className="flex items-center px-4 py-2 bg-purple-500/20 text-purple-200 rounded-lg hover:bg-purple-500/30 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationConsiderationsPanel;