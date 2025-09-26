import React, { useState } from 'react';

import { 
  Container, 
  Copy, 
  CheckCircle, 
  Play, 
  Pause, 
  Square, 
  Terminal,
  Download
} from 'lucide-react';

const DockerConfigPanel = ({ services }) => {
  const [copiedSection, setCopiedSection] = useState(null);
  const [containerStatuses, setContainerStatuses] = useState(
    services?.reduce((acc, service) => {
      acc[service.id] = Math.random() > 0.2 ? 'running' : 'stopped';
      return acc;
    }, { dashboard: 'running' })
  );

  const dockerComposeConfig = `version: '3.8'

services:
${services?.map(service => `  ${service?.id}:
    build: ${service?.path}
    ports:
      - "${service?.port}"
    environment:
      - NODE_ENV=production
    depends_on:
      - data_phoenix
    restart: unless-stopped`)?.join('\n\n')}

  dashboard:
    build: ./dashboard
    ports:
      - "18005:8004"
    depends_on:
${services?.map(s => `      - ${s?.id}`)?.join('\n')}
    restart: unless-stopped

networks:
  default:
    driver: bridge`;

  const copyToClipboard = (content, section) => {
    navigator.clipboard?.writeText(content);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'text-green-400';
      case 'stopped':
        return 'text-red-400';
      case 'starting':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Play className="w-3 h-3" />;
      case 'stopped':
        return <Square className="w-3 h-3" />;
      case 'starting':
        return <Pause className="w-3 h-3" />;
      default:
        return <Square className="w-3 h-3" />;
    }
  };

  const exportDockerCompose = () => {
    const blob = new Blob([dockerComposeConfig], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'docker-compose.yml';
    a?.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 shadow-xl border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-orange-600 rounded-lg mr-3">
            <Container className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">🚢 docker-compose (extrait)</h2>
            <p className="text-gray-400 text-sm">Configuration conteneurs</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportDockerCompose}
            className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export YML
          </button>
          
          <button
            onClick={() => copyToClipboard(dockerComposeConfig, 'full')}
            className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            {copiedSection === 'full' ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {services?.map((service) => (
          <div
            key={service?.id}
            className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold text-sm">{service?.id}</h3>
              <div className={`flex items-center space-x-1 ${getStatusColor(containerStatuses?.[service?.id])}`}>
                {getStatusIcon(containerStatuses?.[service?.id])}
                <span className="text-xs font-medium">
                  {containerStatuses?.[service?.id]}
                </span>
              </div>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Port:</span>
                <span className="text-blue-300">{service?.port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Path:</span>
                <span className="text-orange-300">{service?.path}</span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Dashboard Service */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold text-sm">dashboard</h3>
            <div className={`flex items-center space-x-1 ${getStatusColor(containerStatuses?.dashboard)}`}>
              {getStatusIcon(containerStatuses?.dashboard)}
              <span className="text-xs font-medium">
                {containerStatuses?.dashboard}
              </span>
            </div>
          </div>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Port:</span>
              <span className="text-blue-300">18005:8004</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Path:</span>
              <span className="text-orange-300">./dashboard</span>
            </div>
          </div>
        </div>
      </div>
      {/* Docker Compose Code Block */}
      <div className="bg-gray-950/50 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 text-sm font-mono">docker-compose.yml</span>
          </div>
          
          <button
            onClick={() => copyToClipboard(dockerComposeConfig, 'code')}
            className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
          >
            {copiedSection === 'code' ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="text-xs">Copier</span>
          </button>
        </div>
        
        <div className="p-4 max-h-64 overflow-y-auto">
          <pre className="text-xs text-gray-300 font-mono">
            <code>{dockerComposeConfig}</code>
          </pre>
        </div>
      </div>
      {/* Quick Commands */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        <button className="flex items-center justify-center px-3 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-xs">
          <Play className="w-3 h-3 mr-1" />
          Start All
        </button>
        
        <button className="flex items-center justify-center px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-xs">
          <Square className="w-3 h-3 mr-1" />
          Stop All
        </button>
        
        <button className="flex items-center justify-center px-3 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-colors text-xs">
          <Pause className="w-3 h-3 mr-1" />
          Restart
        </button>
        
        <button className="flex items-center justify-center px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-xs">
          <Terminal className="w-3 h-3 mr-1" />
          Logs
        </button>
      </div>
    </div>
  );
};

export default DockerConfigPanel;