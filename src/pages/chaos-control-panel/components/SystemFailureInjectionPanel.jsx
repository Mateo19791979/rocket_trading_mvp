import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

const SystemFailureInjectionPanel = ({ featureFlags, onToggleFlag }) => {
  const [activeScenario, setActiveScenario] = useState(null);

  const chaosScenarios = [
    {
      id: 'websocket_failure',
      name: 'WebSocket Connection Drop',
      description: 'Simulate WebSocket disconnections with client reconnection testing',
      impact: 'Medium',
      icon: 'Wifi',
      color: 'orange'
    },
    {
      id: 'redis_failure', 
      name: 'Redis Pub/Sub Failure',
      description: 'Disrupt message queue with message loss simulation',
      impact: 'High',
      icon: 'Database',
      color: 'red'
    },
    {
      id: 'db_timeout',
      name: 'Database Connection Timeout',
      description: 'Transaction rollback validation and connection recovery',
      impact: 'High',
      icon: 'Server',
      color: 'red'
    },
    {
      id: 'memory_pressure',
      name: 'Memory Pressure Simulation',
      description: 'Garbage collection stress testing and memory cleanup',
      impact: 'Medium',
      icon: 'Cpu',
      color: 'yellow'
    },
    {
      id: 'network_partition',
      name: 'Network Partition',
      description: 'Simulate split-brain scenarios and service isolation',
      impact: 'Critical',
      icon: 'WifiOff',
      color: 'red'
    }
  ];

  const runScenario = async (scenarioId) => {
    setActiveScenario(scenarioId);
    
    // Simulate scenario execution
    setTimeout(() => {
      setActiveScenario(null);
    }, 3000);
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'Critical':
        return 'text-red-400 bg-red-900/30';
      case 'High':
        return 'text-red-400 bg-red-900/20';
      case 'Medium':
        return 'text-orange-400 bg-orange-900/20';
      case 'Low':
        return 'text-yellow-400 bg-yellow-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getFeatureFlagStatus = (key) => {
    const flag = featureFlags?.find(f => f?.key === key);
    return flag?.value === 'true' || false;
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-orange-600/20">
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-orange-400">
          🔥 System Failure Injection
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Comprehensive chaos scenarios for resilience validation
        </p>
      </div>
      <div className="p-6 space-y-6">
        {/* Chaos Scenarios */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Available Chaos Scenarios
          </h3>
          <div className="space-y-3">
            {chaosScenarios?.map((scenario) => (
              <div
                key={scenario?.id}
                className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">
                        {scenario?.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {scenario?.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(scenario?.impact)}`}>
                          {scenario?.impact} Impact
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => runScenario(scenario?.id)}
                    disabled={activeScenario !== null}
                    variant="outline"
                    size="sm"
                    iconName="Play"
                    className={`border-orange-600 text-orange-400 hover:bg-orange-900/20 ${
                      activeScenario === scenario?.id ? 'animate-pulse' : ''
                    }`}
                  >
                    {activeScenario === scenario?.id ? 'Running...' : 'Run'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Flag Controls */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            System Feature Flags
          </h3>
          <div className="space-y-2">
            {featureFlags?.map((flag) => (
              <div
                key={flag?.key}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {flag?.key?.replace(/_/g, ' ')?.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {flag?.description || 'System configuration flag'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Environment: {flag?.environment} | Type: {flag?.type}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    getFeatureFlagStatus(flag?.key)
                      ? 'bg-green-900 text-green-200' :'bg-red-900 text-red-200'
                  }`}>
                    {getFeatureFlagStatus(flag?.key) ? 'ON' : 'OFF'}
                  </span>
                  <Button
                    onClick={() => onToggleFlag?.(flag?.key, !getFeatureFlagStatus(flag?.key))}
                    variant="ghost"
                    size="sm"
                    iconName="ToggleLeft"
                    className="text-gray-400 hover:text-white"
                  >
                    Toggle
                  </Button>
                </div>
              </div>
            ))}
            
            {!featureFlags?.length && (
              <div className="text-center py-4 text-gray-500">
                <p>No feature flags available</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Quick Chaos Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              iconName="Zap"
              className="border-red-600 text-red-400 hover:bg-red-900/20"
            >
              CPU Spike
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="HardDrive"
              className="border-red-600 text-red-400 hover:bg-red-900/20"
            >
              Disk Pressure
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="WifiOff"
              className="border-red-600 text-red-400 hover:bg-red-900/20"
            >
              Network Delay
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="AlertTriangle"
              className="border-red-600 text-red-400 hover:bg-red-900/20"
            >
              Memory Leak
            </Button>
          </div>
        </div>

        {/* Active Scenario Status */}
        {activeScenario && (
          <div className="bg-orange-900/30 border border-orange-600/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <h3 className="text-sm font-medium text-orange-300">
                Chaos Scenario Active
              </h3>
            </div>
            <p className="text-xs text-orange-200 mt-2">
              Running: {chaosScenarios?.find(s => s?.id === activeScenario)?.name}
            </p>
            <p className="text-xs text-orange-200">
              Monitor system behavior and recovery patterns...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemFailureInjectionPanel;