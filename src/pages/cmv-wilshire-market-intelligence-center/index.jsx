import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity } from 'lucide-react';
import CMVSurveillancePanel from './components/CMVSurveillancePanel';
import WilshireMonitoringPanel from './components/WilshireMonitoringPanel';
import InfoHunterDashboard from './components/InfoHunterDashboard';
import SchedulerManagement from './components/SchedulerManagement';
import AlertManagement from './components/AlertManagement';
import NATSIntegrationPanel from './components/NATSIntegrationPanel';
import { cmvWilshireService } from '../../services/cmvWilshireService';

export default function CMVWilshireMarketIntelligenceCenter() {
  const [externalSources, setExternalSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadExternalSourcesData();
    
    // Subscribe to real-time updates
    const channel = cmvWilshireService?.subscribeToExternalSources((payload) => {
      console.log('Real-time update received:', payload);
      loadExternalSourcesData();
    });

    return () => {
      cmvWilshireService?.unsubscribeFromExternalSources(channel);
    };
  }, []);

  const loadExternalSourcesData = async () => {
    try {
      setLoading(true);
      const result = await cmvWilshireService?.getExternalSourcesState();
      
      if (result?.error) {
        setError(result?.error);
      } else {
        setExternalSources(result?.data || []);
        setLastUpdate(new Date()?.toLocaleString());
        setError(null);
      }
    } catch (err) {
      console.error('Error loading external sources:', err);
      setError('Failed to load external sources data');
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    loadExternalSourcesData();
  };

  const getCMVData = () => {
    return externalSources?.filter(source => source?.source?.startsWith('cmv.')) || [];
  };

  const getWilshireData = () => {
    return externalSources?.filter(source => source?.source?.startsWith('wilshire.')) || [];
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                CMV & Wilshire Market Intelligence Center
              </h1>
              <p className="text-gray-400">
                Surveillance en temps réel des sources CurrentMarketValuation & Wilshire Indexes avec notifications NATS et alertes Telegram
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleManualRefresh}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center space-x-2"
                disabled={loading}
              >
                <Activity className="w-4 h-4" />
                <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
              </button>
              {lastUpdate && (
                <div className="text-sm text-gray-400">
                  Last update: {lastUpdate}
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - CMV & Wilshire Surveillance */}
          <div className="space-y-6">
            <CMVSurveillancePanel 
              cmvData={getCMVData()} 
              loading={loading}
              onRefresh={handleManualRefresh}
            />
            
            <WilshireMonitoringPanel 
              wilshireData={getWilshireData()} 
              loading={loading}
              onRefresh={handleManualRefresh}
            />
          </div>

          {/* Center Column - Service Dashboard & Scheduler */}
          <div className="space-y-6">
            <InfoHunterDashboard 
              loading={loading}
              onRefresh={handleManualRefresh}
            />
            
            <SchedulerManagement />
          </div>

          {/* Right Column - Alerts & NATS Integration */}
          <div className="space-y-6">
            <AlertManagement />
            
            <NATSIntegrationPanel 
              externalSources={externalSources}
            />
          </div>
        </div>
      </div>
    </div>
  );
}