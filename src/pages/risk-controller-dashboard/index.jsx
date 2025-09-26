import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import NotificationToast from '../../components/ui/NotificationToast';
import EmergencyKillswitch from './components/EmergencyKillswitch';
import RiskMetricsPanel from './components/RiskMetricsPanel';
import RiskEventsLog from './components/RiskEventsLog';
import RiskConfigurationPanel from './components/RiskConfigurationPanel';
import { riskControllerService } from '../../services/riskControllerService';

const RiskControllerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [riskController, setRiskController] = useState(null);
  const [riskEvents, setRiskEvents] = useState([]);
  const [portfolioRisk, setPortfolioRisk] = useState(null);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Add these handler functions before they are used in useEffect
  const handleRiskControllerUpdate = (payload) => {
    if (payload?.new) {
      setRiskController(payload?.new);
    }
  };

  const handleRiskEventUpdate = (payload) => {
    if (payload?.new) {
      setRiskEvents(prev => [payload?.new, ...prev]?.slice(0, 10));
    }
  };

  // Load initial data
  useEffect(() => {
    if (user && !authLoading) {
      loadDashboardData();
    }
  }, [user, authLoading]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!riskController?.id) return;

    const controllerSubscription = riskControllerService?.subscribeToRiskController(
      riskController?.id,
      handleRiskControllerUpdate
    );

    const eventsSubscription = riskControllerService?.subscribeToRiskEvents(
      riskController?.id,
      handleRiskEventUpdate
    );

    return () => {
      if (controllerSubscription) {
        controllerSubscription?.unsubscribe();
      }
      if (eventsSubscription) {
        eventsSubscription?.unsubscribe();
      }
    };
  }, [riskController?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load risk controller
      const { data: controller, error: controllerError } = await riskControllerService?.getRiskController();
      if (controllerError) throw controllerError;
      setRiskController(controller);

      // Load parallel data
      const [eventsResult, portfolioResult, metricsResult] = await Promise.all([
        riskControllerService?.getRiskEvents(controller?.id),
        riskControllerService?.getPortfolioRisk(),
        riskControllerService?.getRiskMetrics()
      ]);

      setRiskEvents(eventsResult?.data || []);
      setPortfolioRisk(portfolioResult?.data);
      setRiskMetrics(metricsResult?.data);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load risk dashboard data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivateKillswitch = async (controllerId, reason) => {
    try {
      const { error } = await riskControllerService?.activateKillswitch(controllerId, reason);
      if (error) throw error;

      setNotification({
        type: 'success',
        message: 'Emergency killswitch activated successfully'
      });

      // Refresh data
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to activate killswitch:', error);
      setNotification({
        type: 'error',
        message: 'Failed to activate killswitch'
      });
    }
  };

  const handleDeactivateKillswitch = async (controllerId, reason) => {
    try {
      const { error } = await riskControllerService?.deactivateKillswitch(controllerId, reason);
      if (error) throw error;

      setNotification({
        type: 'success',
        message: 'System recovery completed successfully'
      });

      // Refresh data
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to deactivate killswitch:', error);
      setNotification({
        type: 'error',
        message: 'Failed to complete system recovery'
      });
    }
  };

  const handleUpdateConfiguration = async (controllerId, updates) => {
    try {
      const { error } = await riskControllerService?.updateRiskController(controllerId, updates);
      if (error) throw error;

      setNotification({
        type: 'success',
        message: 'Risk configuration updated successfully'
      });

      // Refresh risk controller data
      const { data: updatedController } = await riskControllerService?.getRiskController();
      setRiskController(updatedController);
    } catch (error) {
      console.error('Failed to update configuration:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update risk configuration'
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)]?.map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please sign in to access the Risk Controller Dashboard.</p>
          </div>
        </main>
      </div>
    );
  }

  const isKillswitchActive = riskController?.killswitch_enabled || false;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${
              isKillswitchActive 
                ? 'bg-red-100 text-red-600' :'bg-green-100 text-green-600'
            }`}>
              {isKillswitchActive ? (
                <AlertTriangle className="h-8 w-8" />
              ) : (
                <Shield className="h-8 w-8" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Risk Controller Dashboard</h1>
              <p className="text-gray-600">
                Emergency controls and risk monitoring for multi-agent trading system
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              isKillswitchActive 
                ? 'bg-red-100 text-red-800 border border-red-200' :'bg-green-100 text-green-800 border border-green-200'
            }`}>
              <Activity className="h-4 w-4 inline mr-2" />
              {isKillswitchActive ? 'EMERGENCY MODE' : 'NORMAL OPERATIONS'}
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        {isKillswitchActive && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <h3 className="font-medium text-red-800">Emergency Killswitch Active</h3>
                <p className="text-sm text-red-700">
                  All trading activities are halted. AI agents have been paused.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Emergency Killswitch - Full Width on Mobile, Left Column on Desktop */}
          <div className="xl:col-span-8">
            <EmergencyKillswitch
              riskController={riskController}
              onActivateKillswitch={handleActivateKillswitch}
              onDeactivateKillswitch={handleDeactivateKillswitch}
              isLoading={loading}
            />
          </div>

          {/* Risk Events Log - Right Column */}
          <div className="xl:col-span-4">
            <RiskEventsLog 
              events={riskEvents}
              isLoading={loading}
            />
          </div>

          {/* Risk Metrics - Full Width */}
          <div className="xl:col-span-12">
            <RiskMetricsPanel
              portfolioRisk={portfolioRisk}
              riskMetrics={riskMetrics}
              isLoading={loading}
            />
          </div>

          {/* Risk Configuration - Full Width */}
          <div className="xl:col-span-12">
            <RiskConfigurationPanel
              riskController={riskController}
              onUpdateConfiguration={handleUpdateConfiguration}
              isLoading={loading}
            />
          </div>
        </div>

        {/* System Status Footer */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Last health check: {riskController?.last_health_check 
                ? new Date(riskController.last_health_check)?.toLocaleString()
                : 'Never'
              }
            </div>
            <div className="flex items-center space-x-4">
              <span>Market Hours Enforcement: {
                riskController?.configuration?.market_hours_only ? 'Enabled' : 'Disabled'
              }</span>
              <span>Order Validation: {
                riskController?.configuration?.validate_orders ? 'Enabled' : 'Disabled'
              }</span>
            </div>
          </div>
        </div>
      </main>
      {/* Notifications */}
      {notification && (
        <NotificationToast
          type={notification?.type}
          message={notification?.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default RiskControllerDashboard;