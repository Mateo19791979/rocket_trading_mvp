import React, { useState, useEffect } from 'react';
import { Shield, Code2, Database, Check, Download, AlertTriangle } from 'lucide-react';
import Header from '../../components/ui/Header';
import FlutterImplementationPanel from './components/FlutterImplementationPanel';
import SecurityBestPracticesPanel from './components/SecurityBestPracticesPanel';
import ReactIntegrationPanel from './components/ReactIntegrationPanel';
import MigrationConsiderationsPanel from './components/MigrationConsiderationsPanel';
import Icon from '../../components/AppIcon';


const FlutterConfigurationSecurityGuide = () => {
  const [activeItem, setActiveItem] = useState('flutter-configuration-security-guide');
  const [securityMetrics, setSecurityMetrics] = useState({
    flutterConfig: false,
    encryptionStatus: false,
    validationPatterns: false,
    crossPlatform: false
  });

  useEffect(() => {
    // Simulate loading security metrics
    const timer = setTimeout(() => {
      setSecurityMetrics({
        flutterConfig: true,
        encryptionStatus: true,
        validationPatterns: false,
        crossPlatform: false
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const getCurrentTimestamp = () => {
    return new Date()?.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const securityOverview = [
    { 
      key: 'flutterConfig', 
      label: 'Flutter AppConfig', 
      icon: Code2,
      status: securityMetrics?.flutterConfig ? 'Secure' : 'Needs Review'
    },
    { 
      key: 'encryptionStatus', 
      label: 'File Encryption', 
      icon: Shield,
      status: securityMetrics?.encryptionStatus ? 'Encrypted' : 'Vulnerable'
    },
    { 
      key: 'validationPatterns', 
      label: 'Validation Patterns', 
      icon: Check,
      status: securityMetrics?.validationPatterns ? 'Validated' : 'Missing'
    },
    { 
      key: 'crossPlatform', 
      label: 'Cross-Platform Security', 
      icon: Database,
      status: securityMetrics?.crossPlatform ? 'Synchronized' : 'Pending'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
      <Header activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">
            Flutter Configuration Security Guide
          </h1>
          <p className="text-xl text-blue-100 mb-4">
            Comprehensive documentation for secure configuration management in Flutter & React applications
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-blue-100">
            <Shield className="w-5 h-5 mr-2" />
            Security Analysis — {getCurrentTimestamp()}
          </div>
        </div>

        {/* Security Status Overview */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityOverview?.map(({ key, label, icon: Icon, status }) => (
            <div key={key} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:border-orange-400/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Icon className="w-5 h-5 text-white mr-2" />
                  <span className="text-sm font-medium text-white">{label}</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  securityMetrics?.[key] ? 'bg-orange-400' : 'bg-red-400'
                } animate-pulse`}></div>
              </div>
              <p className={`text-xs ${
                securityMetrics?.[key] ? 'text-orange-200' : 'text-red-200'
              }`}>
                {status}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <FlutterImplementationPanel />
            <SecurityBestPracticesPanel />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <ReactIntegrationPanel />
            <MigrationConsiderationsPanel />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button className="flex items-center px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
            <Download className="w-5 h-5 mr-2" />
            Download Security Template
          </button>
          <button className="flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
            <Shield className="w-5 h-5 mr-2" />
            Generate Config Files
          </button>
          <button className="flex items-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors">
            <Check className="w-5 h-5 mr-2" />
            Validate Implementation
          </button>
        </div>

        {/* Warning Notice */}
        <div className="mt-8 bg-orange-500/10 border border-orange-400/30 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-orange-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Security Notice</h3>
              <p className="text-orange-100 leading-relaxed">
                Never commit sensitive configuration files to version control. Always use environment-specific 
                encryption and validate configurations at runtime. Consider implementing Flutter Secure Storage 
                for production deployments and ensure React environment variables follow VITE_ prefix requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlutterConfigurationSecurityGuide;