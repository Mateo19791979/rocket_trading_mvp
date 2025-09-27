import React, { useState } from 'react';
import { Copy, Download, Play, Settings, CheckCircle, Clock, GitBranch } from 'lucide-react';
import PipelineOptimizationPanel from './components/PipelineOptimizationPanel';
import ConfigurationTemplatesPanel from './components/ConfigurationTemplatesPanel';
import DeploymentMonitoringPanel from './components/DeploymentMonitoringPanel';
import RocketIntegrationPanel from './components/RocketIntegrationPanel';

const RocketNewCICDPipelineConfiguration = () => {
  const [activeTab, setActiveTab] = useState('rocket-integration');
  const [copiedSection, setCopiedSection] = useState(null);

  const copyToClipboard = (text, section) => {
    navigator.clipboard?.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const pipelineStatus = {
    lastBuild: 'Success',
    lastDeploy: '23:15:42',
    buildTime: '2m 34s',
    tests: 'Passed',
    coverage: '78%'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Rocket.new CI/CD Pipeline Configuration</h1>
                <p className="text-slate-300">Deployment automation for React Trading Applications</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-500/30">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">{pipelineStatus?.lastBuild}</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-blue-400 text-sm">{pipelineStatus?.buildTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
          {[
            { id: 'rocket-integration', label: 'Rocket.new Integration', icon: GitBranch },
            { id: 'pipeline-optimization', label: 'Pipeline Optimization', icon: Settings },
            { id: 'configuration-templates', label: 'Configuration Templates', icon: Copy },
            { id: 'deployment-monitoring', label: 'Deployment Monitoring', icon: CheckCircle }
          ]?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === tab?.id
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tab?.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {activeTab === 'rocket-integration' && <RocketIntegrationPanel copyToClipboard={copyToClipboard} copiedSection={copiedSection} />}
            {activeTab === 'pipeline-optimization' && <PipelineOptimizationPanel copyToClipboard={copyToClipboard} copiedSection={copiedSection} />}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {activeTab === 'configuration-templates' && <ConfigurationTemplatesPanel copyToClipboard={copyToClipboard} copiedSection={copiedSection} />}
            {activeTab === 'deployment-monitoring' && <DeploymentMonitoringPanel pipelineStatus={pipelineStatus} />}
          </div>
        </div>
      </div>
      {/* Quick Actions Bar */}
      <div className="fixed bottom-6 right-6">
        <div className="flex space-x-2">
          <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            <Download className="h-5 w-5" />
          </button>
          <button className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            <Play className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RocketNewCICDPipelineConfiguration;