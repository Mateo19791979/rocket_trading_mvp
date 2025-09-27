import React, { useState } from 'react';
import { Shield, Lock, AlertTriangle, Key } from 'lucide-react';



const SecurityBestPracticesPanel = () => {
  const [activeTab, setActiveTab] = useState('encryption');

  const securityPractices = {
    encryption: {
      title: 'Configuration File Encryption',
      icon: Lock,
      practices: [
        {
          category: 'At Rest Encryption',
          description: 'Encrypt configuration files before deployment',
          implementation: 'Use flutter_secure_storage for sensitive keys',
          riskLevel: 'Critical'
        },
        {
          category: 'Key Management',
          description: 'Secure handling of encryption keys',
          implementation: 'Platform-specific secure storage (Keychain/KeyStore)',
          riskLevel: 'High'
        },
        {
          category: 'Asset Protection',
          description: 'Protect JSON assets from reverse engineering',
          implementation: 'Obfuscation + runtime decryption',
          riskLevel: 'Medium'
        }
      ]
    },
    validation: {
      title: 'Runtime Validation',
      icon: Shield,
      practices: [
        {
          category: 'Configuration Integrity',
          description: 'Validate configuration structure and values',
          implementation: 'Schema validation + checksums',
          riskLevel: 'Critical'
        },
        {
          category: 'Environment Detection',
          description: 'Ensure correct environment configuration',
          implementation: 'Runtime environment validation',
          riskLevel: 'High'
        },
        {
          category: 'Fallback Mechanisms',
          description: 'Handle configuration loading failures gracefully',
          implementation: 'Default secure configurations',
          riskLevel: 'Medium'
        }
      ]
    },
    storage: {
      title: 'Secure Storage Patterns',
      icon: Key,
      practices: [
        {
          category: 'Flutter Secure Storage',
          description: 'Store sensitive configuration securely',
          implementation: 'AES encryption with platform keystore',
          riskLevel: 'Critical'
        },
        {
          category: 'Memory Protection',
          description: 'Protect configuration in memory',
          implementation: 'Clear sensitive data after use',
          riskLevel: 'High'
        },
        {
          category: 'Session Management',
          description: 'Secure configuration lifecycle',
          implementation: 'Time-based configuration refresh',
          riskLevel: 'Medium'
        }
      ]
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Critical': return 'text-red-300 bg-red-500/20 border-red-400/30';
      case 'High': return 'text-orange-300 bg-orange-500/20 border-orange-400/30';
      case 'Medium': return 'text-yellow-300 bg-yellow-500/20 border-yellow-400/30';
      default: return 'text-blue-300 bg-blue-500/20 border-blue-400/30';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-white mr-3" />
            <h3 className="text-xl font-semibold text-white">Security Best Practices</h3>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <span className="text-orange-200 text-sm">Critical Security Measures</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(securityPractices)?.map(([key, { title, icon: TabIcon }]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === key
                  ? 'bg-orange-500/20 text-orange-200 border border-orange-400/30' :'bg-white/5 text-white/70 hover:bg-white/10 border border-transparent'
              }`}
            >
              <TabIcon className="w-4 h-4 mr-2" />
              {title}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        <div className="space-y-4">
          {securityPractices?.[activeTab]?.practices?.map((practice, index) => (
            <div key={index} className="bg-slate-900/50 rounded-lg border border-white/10 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-lg">{practice?.category}</h4>
                  <p className="text-blue-200 text-sm mt-1">{practice?.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(practice?.riskLevel)}`}>
                  {practice?.riskLevel}
                </span>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3 border-l-4 border-orange-400">
                <p className="text-sm text-white">
                  <span className="font-medium text-orange-200">Implementation:</span> {practice?.implementation}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Security Checklist */}
        <div className="mt-8 bg-red-500/10 border border-red-400/30 rounded-lg p-6">
          <h4 className="text-white font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
            Security Validation Checklist
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Configuration files encrypted at rest',
              'Sensitive keys stored in secure storage',
              'Runtime validation implemented',
              'Environment-specific configurations',
              'Fallback mechanisms in place',
              'Memory protection for sensitive data',
              'Regular security audits performed',
              'Version control excludes sensitive files'
            ]?.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-4 h-4 rounded border border-red-400/50 mr-3 flex items-center justify-center">
                  <div className="w-2 h-2 rounded bg-red-400"></div>
                </div>
                <span className="text-red-200 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityBestPracticesPanel;