import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

const TestScenarioPanel = ({ testHistory, onRunScenario, onRefresh }) => {
  const [selectedScenario, setSelectedScenario] = useState(null);

  const predefinedScenarios = [
    {
      id: 'black_friday_stress',
      name: 'Black Friday Stress Test',
      description: 'High volume trading simulation with concurrent user load',
      duration: '30 minutes',
      components: ['All Providers', 'WebSocket', 'Database', 'Cache'],
      severity: 'High',
      color: 'red'
    },
    {
      id: 'provider_cascade_failure',
      name: 'Provider Cascade Failure',
      description: 'Sequential provider failures testing fallback mechanisms',
      duration: '15 minutes', 
      components: ['Finnhub → Alpha Vantage → TwelveData'],
      severity: 'Critical',
      color: 'red'
    },
    {
      id: 'network_partition_simulation',
      name: 'Network Partition Simulation',
      description: 'Split-brain scenario with service isolation testing',
      duration: '20 minutes',
      components: ['Redis', 'Database', 'WebSocket'],
      severity: 'Critical',
      color: 'red'
    },
    {
      id: 'gradual_degradation',
      name: 'Gradual System Degradation',
      description: 'Slow performance decrease to test early warning systems',
      duration: '45 minutes',
      components: ['API Latency', 'Memory', 'CPU'],
      severity: 'Medium',
      color: 'orange'
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-900/30 text-red-300 border-red-600/50';
      case 'High':
        return 'bg-red-900/20 text-red-400 border-red-600/30';
      case 'Medium':
        return 'bg-orange-900/20 text-orange-400 border-orange-600/30';
      case 'Low':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-600/30';
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-600/30';
    }
  };

  const formatTimestamp = (timestamp) => {
    return timestamp ? new Date(timestamp)?.toLocaleString() : 'N/A';
  };

  const getTestTypeIcon = (type) => {
    switch (type) {
      case 'provider_failure':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'all_providers_cut':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m-4 0V2m4 2v2" />
          </svg>
        );
      case 'reset_all_providers':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-purple-600/20">
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-purple-400">
            🧪 Test Scenario Management
          </h2>
          <Button
            onClick={onRefresh}
            variant="ghost"
            size="sm"
            iconName="RefreshCw"
            className="text-gray-400 hover:text-white"
          >
            Refresh
          </Button>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Predefined chaos scenarios with one-click execution
        </p>
      </div>
      <div className="p-6 space-y-6">
        {/* Predefined Scenarios */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Predefined Chaos Scenarios
          </h3>
          <div className="space-y-3">
            {predefinedScenarios?.map((scenario) => (
              <div
                key={scenario?.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedScenario === scenario?.id
                    ? 'border-purple-500 bg-purple-900/20' :'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
                onClick={() => setSelectedScenario(scenario?.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-medium text-white">
                        {scenario?.name}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(scenario?.severity)}`}>
                        {scenario?.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {scenario?.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Duration: {scenario?.duration}</span>
                      <span>Components: {scenario?.components?.join(', ')}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={(e) => {
                      e?.stopPropagation();
                      onRunScenario?.(scenario?.id);
                    }}
                    disabled={!selectedScenario}
                    variant="outline"
                    size="sm"
                    iconName="Play"
                    className="border-purple-600 text-purple-400 hover:bg-purple-900/20"
                  >
                    Run
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scenario Details */}
        {selectedScenario && (
          <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-300 mb-2">
              Selected Scenario Details
            </h3>
            {(() => {
              const scenario = predefinedScenarios?.find(s => s?.id === selectedScenario);
              return (
                <div className="text-xs text-purple-200 space-y-1">
                  <p>• Name: {scenario?.name}</p>
                  <p>• Expected Duration: {scenario?.duration}</p>
                  <p>• Impact Level: {scenario?.severity}</p>
                  <p>• Affected Components: {scenario?.components?.join(', ')}</p>
                  <p>• Recovery Validation: Automatic</p>
                </div>
              );
            })()}
          </div>
        )}

        {/* Test History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-300">
              Chaos Test History ({testHistory?.length || 0})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              iconName="Download"
              className="text-gray-400 hover:text-white"
            >
              Export
            </Button>
          </div>
          
          {!testHistory?.length ? (
            <div className="text-center py-6 text-gray-500">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.477-.98-6.02-2.54-.875-.885-1.405-2.098-1.405-3.46 0-1.362.53-2.575 1.405-3.46A7.963 7.963 0 0112 3c2.34 0 4.477.98 6.02 2.54.875.885 1.405 2.098 1.405 3.46 0 1.362-.53 2.575-1.405 3.46z" />
                </svg>
              </div>
              <p className="text-sm">No chaos tests executed yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {testHistory?.slice(0, 10)?.map((test, index) => (
                <div
                  key={test?.id || index}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-purple-400">
                      {getTestTypeIcon(test?.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {test?.type?.replace(/_/g, ' ')?.toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTimestamp(test?.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      test?.isProcessed
                        ? 'bg-green-900 text-green-200' :'bg-orange-900 text-orange-200'
                    }`}>
                      {test?.isProcessed ? 'Completed' : 'Running'}
                    </div>
                    <p className={`text-xs mt-1 ${
                      test?.priority === 'high' ? 'text-red-400' :
                      test?.priority === 'medium' ? 'text-orange-400' : 'text-green-400'
                    }`}>
                      {test?.priority?.toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
              
              {testHistory?.length > 10 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-500">
                    +{testHistory?.length - 10} more tests
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            System hardening recommendations based on test results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              iconName="FileText"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Settings"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Config
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestScenarioPanel;