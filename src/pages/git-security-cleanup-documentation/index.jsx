import React, { useState, useEffect } from 'react';
import { Shield, GitBranch, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import Header from '../../components/ui/Header';
import EmergencyCleanupPanel from './components/EmergencyCleanupPanel';
import PostCleanupVerificationPanel from './components/PostCleanupVerificationPanel';
import CriticalWarningsPanel from './components/CriticalWarningsPanel';
import DocumentationExportPanel from './components/DocumentationExportPanel';
import Icon from '../../components/AppIcon';


const GitSecurityCleanupDocumentation = () => {
  const [activeItem, setActiveItem] = useState('git-security-cleanup-documentation');
  const [cleanupStatus, setCleanupStatus] = useState({
    installation: false,
    historyClean: false,
    securityRotation: false,
    verification: false
  });

  useEffect(() => {
    // Simulate cleanup progress status
    const timer = setTimeout(() => {
      setCleanupStatus({
        installation: true,
        historyClean: false,
        securityRotation: false,
        verification: false
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getCurrentDate = () => {
    return new Date()?.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-orange-900">
      <Header activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Git Security Cleanup Documentation
          </h1>
          <p className="text-xl text-red-100 mb-4">
            Comprehensive guidance for removing sensitive credentials from Git repository history
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-red-100">
            <Shield className="w-5 h-5 mr-2" />
            {getCurrentDate()}
          </div>
        </div>

        {/* Security Status Overview */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: 'installation', label: 'Installation', icon: GitBranch },
            { key: 'historyClean', label: 'History Cleaning', icon: Shield },
            { key: 'securityRotation', label: 'Security Rotation', icon: AlertTriangle },
            { key: 'verification', label: 'Verification', icon: CheckCircle }
          ]?.map(({ key, label, icon: Icon }) => (
            <div key={key} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className="w-5 h-5 text-white mr-2" />
                  <span className="text-sm font-medium text-white">{label}</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  cleanupStatus?.[key] ? 'bg-orange-400' : 'bg-red-400'
                } animate-pulse`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <EmergencyCleanupPanel />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <PostCleanupVerificationPanel />
            <CriticalWarningsPanel />
            <DocumentationExportPanel />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button className="flex items-center px-6 py-3 bg-white text-red-700 font-semibold rounded-lg hover:bg-red-50 transition-colors">
            <GitBranch className="w-5 h-5 mr-2" />
            Execute Cleanup Procedure
          </button>
          <button className="flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
            <Download className="w-5 h-5 mr-2" />
            Export Security Documentation
          </button>
        </div>
      </div>
    </div>
  );
};

export default GitSecurityCleanupDocumentation;