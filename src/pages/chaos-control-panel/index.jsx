import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Button from '../../components/ui/Button';
import chaosControlService from '../../services/chaosControlService';
import ProviderDisruptionPanel from './components/ProviderDisruptionPanel';
import SystemFailureInjectionPanel from './components/SystemFailureInjectionPanel';
import ResilienceMonitoringPanel from './components/ResilienceMonitoringPanel';
import TestScenarioPanel from './components/TestScenarioPanel';
import ApiKeysStatusPanel from './components/ApiKeysStatusPanel';
import DeploymentReadinessAssessment from './components/DeploymentReadinessAssessment';

const ChaosControlPanel = () => {
  const [providersHealth, setProvidersHealth] = useState([]);
  const [resilienceMetrics, setResilienceMetrics] = useState({});
  const [featureFlags, setFeatureFlags] = useState([]);
  const [testHistory, setTestHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [activeTest, setActiveTest] = useState(null);

  // Chaos test parameters
  const [selectedProvider, setSelectedProvider] = useState('finnhub');
  const [latencyMs, setLatencyMs] = useState(800);
  const [errorRate, setErrorRate] = useState(30);
  const [duration, setDuration] = useState(300);

  const handleProviderChange = (payload) => {
    const updatedProvider = payload?.new;
    if (updatedProvider) {
      setProvidersHealth(prev => {
        const updated = [...prev];
        const existingIndex = updated?.findIndex(p => p?.id === updatedProvider?.id);
        
        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...updated?.[existingIndex],
            enabled: updatedProvider?.enabled,
            status: updatedProvider?.status,
            healthScore: updatedProvider?.health_score,
            circuitBreakerOpen: updatedProvider?.circuit_breaker_open,
            errorCount: updatedProvider?.error_count
          };
        }
        
        return updated;
      });
    }
  };

  const handleHealthUpdate = (payload) => {
    // Refresh metrics when new health check is added
    loadResilienceMetrics();
  };

  useEffect(() => {
    loadInitialData();
    
    // Set up real-time subscriptions
    const providersSubscription = chaosControlService?.subscribeToProviderChanges(
      handleProviderChange
    );
    
    const healthSubscription = chaosControlService?.subscribeToHealthChecks(
      handleHealthUpdate
    );

    return () => {
      providersSubscription?.unsubscribe();
      healthSubscription?.unsubscribe();
    };
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [healthResult, metricsResult, flagsResult, historyResult] = await Promise.all([
        chaosControlService?.getProvidersHealth(),
        chaosControlService?.getResilienceMetrics(),
        chaosControlService?.getChaosFeatureFlags(),
        chaosControlService?.getChaosTestHistory()
      ]);

      if (healthResult?.success) {
        setProvidersHealth(healthResult?.data);
      }

      if (metricsResult?.success) {
        setResilienceMetrics(metricsResult?.data);
      }

      if (flagsResult?.success) {
        setFeatureFlags(flagsResult?.data);
      }

      if (historyResult?.success) {
        setTestHistory(historyResult?.data);
      }
    } catch (error) {
      showNotification('Failed to load chaos control data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadResilienceMetrics = async () => {
    try {
      const result = await chaosControlService?.getResilienceMetrics();
      if (result?.success) {
        setResilienceMetrics(result?.data);
      }
    } catch (error) {
      console.log('Failed to refresh resilience metrics:', error);
    }
  };

  const handleInjectFailure = async () => {
    if (!selectedProvider) {
      showNotification('Please select a provider', 'error');
      return;
    }

    setActiveTest('provider_failure');
    try {
      const result = await chaosControlService?.injectProviderFailure(selectedProvider, {
        latencyMs,
        errorRate,
        duration
      });

      if (result?.success) {
        showNotification(`Chaos injected for ${selectedProvider}`, 'warning');
        // Refresh providers health
        const healthResult = await chaosControlService?.getProvidersHealth();
        if (healthResult?.success) {
          setProvidersHealth(healthResult?.data);
        }
        // Refresh test history
        loadTestHistory();
      } else {
        showNotification(result?.error || 'Failed to inject chaos', 'error');
      }
    } catch (error) {
      showNotification('Failed to inject chaos', 'error');
    } finally {
      setActiveTest(null);
    }
  };

  const handleCutAllProviders = async () => {
    setActiveTest('cut_all');
    try {
      const result = await chaosControlService?.cutAllProviders();

      if (result?.success) {
        showNotification('All providers disabled', 'warning');
        // Refresh providers health
        const healthResult = await chaosControlService?.getProvidersHealth();
        if (healthResult?.success) {
          setProvidersHealth(healthResult?.data);
        }
        loadTestHistory();
      } else {
        showNotification(result?.error || 'Failed to cut all providers', 'error');
      }
    } catch (error) {
      showNotification('Failed to cut all providers', 'error');
    } finally {
      setActiveTest(null);
    }
  };

  const handleResetAllProviders = async () => {
    setActiveTest('reset');
    try {
      const result = await chaosControlService?.resetAllProviders();

      if (result?.success) {
        showNotification('All providers reset', 'success');
        // Refresh providers health
        const healthResult = await chaosControlService?.getProvidersHealth();
        if (healthResult?.success) {
          setProvidersHealth(healthResult?.data);
        }
        loadTestHistory();
      } else {
        showNotification(result?.error || 'Failed to reset providers', 'error');
      }
    } catch (error) {
      showNotification('Failed to reset providers', 'error');
    } finally {
      setActiveTest(null);
    }
  };

  const loadTestHistory = async () => {
    try {
      const result = await chaosControlService?.getChaosTestHistory();
      if (result?.success) {
        setTestHistory(result?.data);
      }
    } catch (error) {
      console.log('Failed to refresh test history:', error);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const getSystemHealthStatus = () => {
    const enabledProviders = providersHealth?.filter(p => p?.enabled)?.length || 0;
    const totalProviders = providersHealth?.length || 0;
    
    if (enabledProviders === 0) {
      return { status: 'DEGRADED', color: 'red', message: 'All providers disabled' };
    }
    if (enabledProviders < totalProviders / 2) {
      return { status: 'PARTIAL', color: 'orange', message: 'Reduced functionality' };
    }
    return { status: 'NORMAL', color: 'green', message: 'All systems operational' };
  };

  const systemStatus = getSystemHealthStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading Chaos Control Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Helmet>
        <title>Chaos Control Panel | Rocket Trading MVP</title>
        <meta name="description" content="System resilience testing and failure injection for validating trading platform robustness under adverse conditions" />
      </Helmet>
      {/* Header */}
      <div className="bg-black border-b border-red-600/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-red-400">
                  🧪 Chaos Control Panel
                </h1>
                <p className="text-sm text-gray-400">
                  System resilience testing and failure injection
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                systemStatus?.color === 'green' ? 'bg-green-900 text-green-200 border border-green-600'
                  : systemStatus?.color === 'orange' ? 'bg-orange-900 text-orange-200 border border-orange-600' : 'bg-red-900 text-red-200 border border-red-600'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  systemStatus?.color === 'green' ? 'bg-green-400' :
                  systemStatus?.color === 'orange' ? 'bg-orange-400' : 'bg-red-400'
                } animate-pulse`}></div>
                {systemStatus?.status}
              </div>
              <Button
                onClick={loadInitialData}
                variant="outline"
                size="sm"
                iconName="RefreshCw"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* System Status Banner */}
      {systemStatus?.status !== 'NORMAL' && (
        <div className={`${
          systemStatus?.color === 'red' ? 'bg-red-900/50 border-red-600' : 'bg-orange-900/50 border-orange-600'
        } border-b`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className={`w-5 h-5 mr-3 ${
                  systemStatus?.color === 'red' ? 'text-red-400' : 'text-orange-400'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className={`font-medium ${
                  systemStatus?.color === 'red' ? 'text-red-200' : 'text-orange-200'
                }`}>
                  System Status: {systemStatus?.status} - {systemStatus?.message}
                </span>
              </div>
              <Button
                onClick={handleResetAllProviders}
                variant="outline"
                size="sm"
                iconName="RotateCcw"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                disabled={activeTest === 'reset'}
              >
                {activeTest === 'reset' ? 'Resetting...' : 'Quick Reset'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          notification?.type === 'success' ? 'bg-green-600 text-white' 
            : notification?.type === 'error' ? 'bg-red-600 text-white'
            : notification?.type === 'warning' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{notification?.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="ml-3 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Deployment Readiness Assessment - TOP PRIORITY */}
        <div className="mb-8">
          <DeploymentReadinessAssessment />
        </div>

        {/* API Keys Status Panel - SECOND PRIORITY */}
        <div className="mb-8">
          <ApiKeysStatusPanel />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Provider Disruption Controls */}
            <ProviderDisruptionPanel
              providersHealth={providersHealth}
              selectedProvider={selectedProvider}
              setSelectedProvider={setSelectedProvider}
              latencyMs={latencyMs}
              setLatencyMs={setLatencyMs}
              errorRate={errorRate}
              setErrorRate={setErrorRate}
              duration={duration}
              setDuration={setDuration}
              onInjectFailure={handleInjectFailure}
              onCutAll={handleCutAllProviders}
              onReset={handleResetAllProviders}
              isActive={activeTest !== null}
              activeTest={activeTest}
            />

            {/* System Failure Injection */}
            <SystemFailureInjectionPanel
              featureFlags={featureFlags}
              onToggleFlag={async (key, enabled) => {
                try {
                  const result = await chaosControlService?.toggleFeatureFlag(key, enabled);
                  if (result?.success) {
                    showNotification(result?.data, 'success');
                    // Refresh feature flags
                    const flagsResult = await chaosControlService?.getChaosFeatureFlags();
                    if (flagsResult?.success) {
                      setFeatureFlags(flagsResult?.data);
                    }
                  } else {
                    showNotification(result?.error || 'Failed to toggle feature flag', 'error');
                  }
                } catch (error) {
                  showNotification('Failed to toggle feature flag', 'error');
                }
              }}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Resilience Monitoring */}
            <ResilienceMonitoringPanel
              resilienceMetrics={resilienceMetrics}
              providersHealth={providersHealth}
              onRefresh={loadResilienceMetrics}
            />

            {/* Test Scenario Management */}
            <TestScenarioPanel
              testHistory={testHistory}
              onRunScenario={(scenario) => {
                showNotification(`Running ${scenario} scenario`, 'info');
                // Implement specific scenario logic here
              }}
              onRefresh={loadTestHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChaosControlPanel;