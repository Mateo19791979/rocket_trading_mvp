import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, Gauge } from 'lucide-react';
import SafeModeController from './components/SafeModeController';
import ResilienceGuardEngine from './components/ResilienceGuardEngine';
import EmergencyResponseSection from './components/EmergencyResponseSection';
import SafeLandingDashboard from './components/SafeLandingDashboard';
import FallbackSystemsPanel from './components/FallbackSystemsPanel';
import RecoveryOrchestrationCenter from './components/RecoveryOrchestrationCenter';

const SystemResilienceSafeLandingCenter = () => {
  const [systemAlertLevel, setSystemAlertLevel] = useState('normal');
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [overallSystemHealth, setOverallSystemHealth] = useState(94);

  const alertLevels = {
    normal: { color: 'green', icon: Shield, label: 'Normal Operation' },
    caution: { color: 'yellow', icon: AlertTriangle, label: 'Caution Mode' },
    warning: { color: 'orange', icon: AlertTriangle, label: 'Warning State' },
    critical: { color: 'red', icon: AlertTriangle, label: 'Critical Alert' }
  };

  useEffect(() => {
    // Simulate real-time system health monitoring
    const interval = setInterval(() => {
      setOverallSystemHealth(prev => {
        const newHealth = Math.max(85, Math.min(100, prev + (Math.random() - 0.5) * 6));
        
        // Update alert level based on health
        if (newHealth < 88) {
          setSystemAlertLevel('critical');
        } else if (newHealth < 92) {
          setSystemAlertLevel('warning');
        } else if (newHealth < 96) {
          setSystemAlertLevel('caution');
        } else {
          setSystemAlertLevel('normal');
        }
        
        return newHealth;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentAlert = alertLevels?.[systemAlertLevel];
  const AlertIcon = currentAlert?.icon;

  const getHealthColor = (health) => {
    if (health >= 95) return 'text-green-400';
    if (health >= 90) return 'text-yellow-400';
    if (health >= 85) return 'text-orange-400';
    return 'text-red-400';
  };

  const getAlertBorderColor = (level) => {
    const colors = {
      normal: 'border-green-500',
      caution: 'border-yellow-500',
      warning: 'border-orange-500',
      critical: 'border-red-500'
    };
    return colors?.[level] || colors?.normal;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header with Emergency Theme */}
      <div className={`mb-8 bg-gray-800 rounded-lg border-2 p-6 ${getAlertBorderColor(systemAlertLevel)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative mr-4">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                <AlertIcon className={`h-8 w-8 text-${currentAlert?.color}-400`} />
              </div>
              {systemAlertLevel !== 'normal' && (
                <div className={`absolute -top-1 -right-1 w-6 h-6 bg-${currentAlert?.color}-500 rounded-full flex items-center justify-center`}>
                  <span className="text-xs font-bold text-white">!</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                System Resilience & Safe Landing Center
              </h1>
              <p className="text-gray-300 text-lg">
                Advanced SAFE_MODE controls and graceful degradation management for multi-region trading infrastructure
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center mb-2">
              <Activity className="text-blue-400 h-5 w-5 mr-2" />
              <span className="text-gray-300">System Health</span>
            </div>
            <div className={`text-4xl font-bold ${getHealthColor(overallSystemHealth)}`}>
              {overallSystemHealth?.toFixed(1)}%
            </div>
            <div className={`text-sm px-3 py-1 rounded-full mt-2 bg-${currentAlert?.color}-900/50 text-${currentAlert?.color}-300 border border-${currentAlert?.color}-500`}>
              {currentAlert?.label}
            </div>
          </div>
        </div>

        {/* Emergency Banner */}
        {systemAlertLevel === 'critical' && (
          <div className="mt-4 bg-red-900/50 border border-red-500 rounded-lg p-4 animate-pulse">
            <div className="flex items-center">
              <AlertTriangle className="text-red-400 h-6 w-6 mr-3" />
              <div>
                <span className="text-red-300 font-bold">CRITICAL SYSTEM ALERT</span>
                <p className="text-red-200 text-sm mt-1">
                  System health below critical threshold. Immediate attention required.
                </p>
              </div>
              <button
                onClick={() => setEmergencyMode(true)}
                className="ml-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Emergency Response
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Three-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Control & Emergency Response */}
        <div className="space-y-8">
          <SafeModeController />
          <ResilienceGuardEngine />
          <EmergencyResponseSection />
        </div>

        {/* Center Column - Dashboard & Fallback Systems */}
        <div className="space-y-8">
          <SafeLandingDashboard />
          <FallbackSystemsPanel />
        </div>

        {/* Right Column - Recovery Orchestration */}
        <div className="space-y-8">
          <RecoveryOrchestrationCenter />
          
          {/* Emergency Actions Summary */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Gauge className="text-cyan-400 mr-3 h-6 w-6" />
              Emergency Actions Audit Trail
            </h3>
            
            <div className="space-y-3">
              <div className="bg-gray-700 rounded p-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-green-400">System Health Check Completed</span>
                  <span className="text-gray-400">2 minutes ago</span>
                </div>
              </div>
              <div className="bg-gray-700 rounded p-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-yellow-400">Fallback Mode Activated (WebSocket → HTTP)</span>
                  <span className="text-gray-400">5 minutes ago</span>
                </div>
              </div>
              <div className="bg-gray-700 rounded p-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-400">Predictive Analysis: Database Load Warning</span>
                  <span className="text-gray-400">8 minutes ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Emergency Mode Overlay */}
      {emergencyMode && (
        <div className="fixed inset-0 bg-red-900/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border-2 border-red-500 rounded-lg p-8 max-w-2xl mx-4">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">EMERGENCY MODE ACTIVATED</h2>
              <p className="text-gray-300 mb-6">
                All emergency response protocols are now active. System is operating in crisis management mode.
              </p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => setEmergencyMode(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Continue Monitoring
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Execute Emergency Shutdown
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemResilienceSafeLandingCenter;