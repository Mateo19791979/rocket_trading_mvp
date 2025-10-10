import React, { useState } from 'react';
import { Monitor, AlertTriangle, CheckCircle, Settings, Code, Smartphone, Globe, Bell } from 'lucide-react';

const ResilienceBannerIntegrationPanel = ({ systemMode = {}, providerHealth = [], lastUpdate }) => {
  const [selectedTab, setSelectedTab] = useState('banner');
  
  // Calculate system status for banner
  const getBannerConfig = () => {
    const mode = systemMode?.mode || 'NORMAL';
    const activeProviders = providerHealth?.filter(p => p?.is_active)?.length || 0;
    const totalProviders = providerHealth?.length || 0;
    
    switch (mode) {
      case 'NORMAL':
        return {
          show: false,
          type: 'success',
          message: 'All systems operational',
          icon: 'CheckCircle',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-400'
        };
      case 'PARTIAL':
        return {
          show: true,
          type: 'warning',
          message: `Alternative data sources active (${activeProviders}/${totalProviders} providers online)`,
          icon: 'AlertTriangle',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400'
        };
      case 'DEGRADED':
        return {
          show: true,
          type: 'error',
          message: 'Limited functionality: Shadow/mock data in use - No live trading decisions recommended',
          icon: 'AlertTriangle',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400'
        };
      default:
        return {
          show: false,
          type: 'info',
          message: 'System status unknown',
          icon: 'AlertTriangle',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30',
          textColor: 'text-gray-400'
        };
    }
  };

  const bannerConfig = getBannerConfig();

  const getProviderBadgeConfig = () => {
    const mode = systemMode?.mode || 'NORMAL';
    const activeProviders = providerHealth?.filter(p => p?.is_active)?.length || 0;
    
    let primaryProvider = 'N/A';
    let status = 'unknown';
    let delay = 0;
    
    if (activeProviders > 0) {
      const recentProvider = providerHealth?.find(p => p?.is_active && p?.last_successful_call);
      if (recentProvider) {
        primaryProvider = recentProvider?.api_name;
        const lastCall = new Date(recentProvider.last_successful_call);
        delay = Math.floor((Date.now() - lastCall?.getTime()) / 1000);
        
        if (delay < 60) status = 'primary';
        else if (delay < 300) status = 'fallback';
        else status = 'stale';
      }
    }
    
    if (mode === 'DEGRADED') {
      primaryProvider = 'Shadow/Mock';
      status = 'shadow';
      delay = 0;
    }
    
    return {
      provider: primaryProvider,
      status,
      delay,
      statusColor: 
        status === 'primary' ? 'text-green-400 bg-green-500/20' :
        status === 'fallback' ? 'text-yellow-400 bg-yellow-500/20' :
        status === 'shadow'? 'text-gray-400 bg-gray-500/20' : 'text-red-400 bg-red-500/20'
    };
  };

  const providerBadge = getProviderBadgeConfig();

  // Sample integration code
  const bannerIntegrationCode = `// ResilienceBanner.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

const ResilienceBanner = () => {
  const [systemState, setSystemState] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchSystemState = async () => {
      try {
        const response = await fetch('/api/resilience/state');
        const data = await response.json();
        setSystemState(data);
      } catch (error) {
        console.error('Failed to fetch system state:', error);
      }
    };

    fetchSystemState();
    const interval = setInterval(fetchSystemState, 10000); // Every 10s
    return () => clearInterval(interval);
  }, []);

  if (!systemState?.show || !isVisible) return null;

  return (
    <div className={\`fixed top-0 left-0 right-0 z-50 \${systemState.bgColor} \${systemState.borderColor} border-b\`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className={\`flex items-center space-x-2 \${systemState.textColor}\`}>
            {systemState.type === 'error' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{systemState.message}</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResilienceBanner;`;

  const providerBadgeCode = `// ProviderBadge.jsx
import React, { useState, useEffect } from 'react';
import { Database } from 'lucide-react';

const ProviderBadge = ({ className = "" }) => {
  const [providerStatus, setProviderStatus] = useState(null);

  useEffect(() => {
    const fetchProviderStatus = async () => {
      try {
        const response = await fetch('/api/providers/status');
        const data = await response.json();
        setProviderStatus(data);
      } catch (error) {
        console.error('Failed to fetch provider status:', error);
      }
    };

    fetchProviderStatus();
    const interval = setInterval(fetchProviderStatus, 30000); // Every 30s
    return () => clearInterval(interval);
  }, []);

  if (!providerStatus) return null;

  return (
    <div className={\`flex items-center space-x-2 px-3 py-1.5 rounded-lg \${providerStatus.statusColor} \${className}\`}>
      <Database className="w-4 h-4" />
      <div className="text-sm">
        <span className="font-medium">{providerStatus.provider}</span>
        {providerStatus.delay > 0 && (
          <span className="ml-1 opacity-75">
            ({providerStatus.delay}s delay)
          </span>
        )}
      </div>
    </div>
  );
};

export default ProviderBadge;`;

  const diagnosticConsoleCode = `// DiagnosticConsole.jsx (Hidden at /__diag)
import React, { useState, useEffect } from 'react';

const DiagnosticConsole = () => {
  const [diagnostics, setDiagnostics] = useState({});

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        const response = await fetch('/api/diagnostics');
        const data = await response.json();
        setDiagnostics(data);
      } catch (error) {
        console.error('Failed to fetch diagnostics:', error);
      }
    };

    fetchDiagnostics();
    const interval = setInterval(fetchDiagnostics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">System Diagnostics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Latencies</h3>
          <div className="space-y-2 text-sm">
            {Object.entries(diagnostics.latencies || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span>{value}ms</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Circuit Breaker State</h3>
          <div className="space-y-2 text-sm">
            {Object.entries(diagnostics.circuitBreakers || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span className={\`\${value === 'closed' ? 'text-green-400' : 'text-red-400'}\`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Providers Status</h3>
          <div className="space-y-2 text-sm">
            {Object.entries(diagnostics.providersUp || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span className={\`\${value ? 'text-green-400' : 'text-red-400'}\`}>
                  {value ? 'UP' : 'DOWN'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticConsole;`;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Monitor className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Resilience Banner Integration</h2>
            <p className="text-sm text-gray-400">Frontend notifications and provider badge implementation</p>
          </div>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 mb-6 bg-gray-700/30 rounded-lg p-1">
        <button
          onClick={() => setSelectedTab('banner')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            selectedTab === 'banner' ?'bg-cyan-600 text-white' :'text-gray-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4 inline mr-2" />
          Resilience Banner
        </button>
        <button
          onClick={() => setSelectedTab('badge')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            selectedTab === 'badge' ?'bg-cyan-600 text-white' :'text-gray-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Provider Badge
        </button>
        <button
          onClick={() => setSelectedTab('diagnostic')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            selectedTab === 'diagnostic' ?'bg-cyan-600 text-white' :'text-gray-400 hover:text-white'
          }`}
        >
          <Code className="w-4 h-4 inline mr-2" />
          Diagnostic Console
        </button>
      </div>
      {/* Banner Tab */}
      {selectedTab === 'banner' && (
        <div className="space-y-6">
          {/* Banner Preview */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-400" />
              <span>Banner Preview</span>
            </h3>
            
            {bannerConfig?.show ? (
              <div className={`border rounded-lg p-4 ${bannerConfig?.bgColor} ${bannerConfig?.borderColor}`}>
                <div className={`flex items-center justify-between ${bannerConfig?.textColor}`}>
                  <div className="flex items-center space-x-2">
                    {bannerConfig?.icon === 'CheckCircle' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                    <span className="font-medium">{bannerConfig?.message}</span>
                  </div>
                  {lastUpdate && (
                    <span className="text-xs opacity-75">
                      Updated: {lastUpdate?.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-gray-600/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>Banner hidden - System operating normally</span>
                </div>
              </div>
            )}
          </div>

          {/* Banner Integration Code */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Implementation Code</h3>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <pre className="text-sm text-green-400 overflow-x-auto">
                <code>{bannerIntegrationCode}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
      {/* Badge Tab */}
      {selectedTab === 'badge' && (
        <div className="space-y-6">
          {/* Badge Preview */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-green-400" />
              <span>Provider Badge Preview</span>
            </h3>
            
            <div className="space-y-4">
              <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg ${providerBadge?.statusColor}`}>
                <Settings className="w-4 h-4" />
                <div className="text-sm">
                  <span className="font-medium">{providerBadge?.provider}</span>
                  {providerBadge?.delay > 0 && (
                    <span className="ml-1 opacity-75">
                      ({providerBadge?.delay}s delay)
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-gray-400">
                Status: <span className="capitalize">{providerBadge?.status}</span>
                {providerBadge?.status === 'primary' && ' - Real-time data'}
                {providerBadge?.status === 'fallback' && ' - Backup provider active'}
                {providerBadge?.status === 'shadow' && ' - Composite/mock data'}
              </div>
            </div>
          </div>

          {/* Badge Integration Code */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Implementation Code</h3>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <pre className="text-sm text-blue-400 overflow-x-auto">
                <code>{providerBadgeCode}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
      {/* Diagnostic Console Tab */}
      {selectedTab === 'diagnostic' && (
        <div className="space-y-6">
          {/* Diagnostic Console Preview */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
              <Code className="w-5 h-5 text-purple-400" />
              <span>Hidden Diagnostic Console (/__diag)</span>
            </h3>
            
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold mb-4 text-white">System Diagnostics Preview</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-800 rounded-lg p-3">
                  <h5 className="font-medium text-gray-300 mb-2">Latencies</h5>
                  <div className="space-y-1 text-gray-400">
                    <div className="flex justify-between">
                      <span>API Response:</span>
                      <span className="text-green-400">45ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DB Query:</span>
                      <span className="text-green-400">12ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Provider Call:</span>
                      <span className="text-yellow-400">156ms</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-3">
                  <h5 className="font-medium text-gray-300 mb-2">Circuit Breakers</h5>
                  <div className="space-y-1 text-gray-400">
                    <div className="flex justify-between">
                      <span>Finnhub:</span>
                      <span className="text-green-400">CLOSED</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Alpha Vantage:</span>
                      <span className="text-green-400">CLOSED</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-3">
                  <h5 className="font-medium text-gray-300 mb-2">Providers Status</h5>
                  <div className="space-y-1 text-gray-400">
                    {providerHealth?.map((provider) => (
                      <div key={provider?.id} className="flex justify-between">
                        <span>{provider?.api_name}:</span>
                        <span className={provider?.is_active ? 'text-green-400' : 'text-red-400'}>
                          {provider?.is_active ? 'UP' : 'DOWN'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Console Implementation */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Implementation Code</h3>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <pre className="text-sm text-purple-400 overflow-x-auto">
                <code>{diagnosticConsoleCode}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
      {/* Usage Instructions */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-400 mb-2">Integration Instructions</h3>
        <div className="text-sm text-blue-400/80 space-y-2">
          <p>• <strong>Resilience Banner:</strong> Add to your main layout component, polls /api/resilience/state every 10s</p>
          <p>• <strong>Provider Badge:</strong> Include in headers or data display areas, updates every 30s</p>
          <p>• <strong>Diagnostic Console:</strong> Create hidden route at /__diag for internal monitoring</p>
          <p>• <strong>Real-time Updates:</strong> All components auto-update based on system mode changes</p>
        </div>
      </div>
    </div>
  );
};

export default ResilienceBannerIntegrationPanel;