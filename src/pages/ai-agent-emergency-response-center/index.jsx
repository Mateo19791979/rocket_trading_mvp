import React, { useState, useEffect } from 'react';
import { AlertTriangle, Power, Shield, AlertOctagon, Activity, Users, Zap, RefreshCw, FileText, Bell } from 'lucide-react';
import EmergencyControlPanel from './components/EmergencyControlPanel';
import IncidentDetectionPanel from './components/IncidentDetectionPanel';
import CrisisResponseDashboard from './components/CrisisResponseDashboard';
import SystemRecoveryPanel from './components/SystemRecoveryPanel';
import EmergencyCommunicationCenter from './components/EmergencyCommunicationCenter';
import PostIncidentAnalysis from './components/PostIncidentAnalysis';
import { aiAgentsService } from '../../services/aiAgentsService';

export default function AIAgentEmergencyResponseCenter() {
  const [emergencyState, setEmergencyState] = useState({
    killswitchActive: false,
    activeIncidents: [],
    agentStatus: {},
    systemHealth: 'healthy',
    emergencyLevel: 'normal'
  });
  
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [systemOverview, setSystemOverview] = useState(null);

  useEffect(() => {
    loadEmergencyData();
    
    // Set up real-time monitoring
    const agentSubscription = aiAgentsService?.subscribeToAgentUpdates(handleAgentUpdate);
    const eventSubscription = aiAgentsService?.subscribeToEventBus(handleEventUpdate);
    const healthSubscription = aiAgentsService?.subscribeToSystemHealth(handleHealthUpdate);

    return () => {
      aiAgentsService?.removeSubscription(agentSubscription);
      aiAgentsService?.removeSubscription(eventSubscription);
      aiAgentsService?.removeSubscription(healthSubscription);
    };
  }, []);

  const handleAgentUpdate = (payload) => {
    console.log('Agent update:', payload);
    loadEmergencyData(); // Refresh data on agent changes
  };

  const handleEventUpdate = (payload) => {
    console.log('Event update:', payload);
    // Handle real-time event updates
  };

  const handleHealthUpdate = (payload) => {
    console.log('Health update:', payload);
    loadEmergencyData(); // Refresh data on health changes
  };

  const loadEmergencyData = async () => {
    try {
      setLoading(true);
      const [overview, riskStatus] = await Promise.all([
        aiAgentsService?.getSystemOverview(),
        aiAgentsService?.getRiskManagerStatus()
      ]);
      
      setSystemOverview(overview);
      setEmergencyState(prev => ({
        ...prev,
        agentStatus: overview?.agents || {},
        systemHealth: overview?.systemHealth?.overall || 'healthy',
        emergencyLevel: determineEmergencyLevel(overview, riskStatus)
      }));
    } catch (error) {
      console.error('Failed to load emergency data:', error);
    } finally {
      setLoading(false);
    }
  };

  const determineEmergencyLevel = (overview, riskStatus) => {
    const healthyAgents = overview?.agents?.healthy || 0;
    const totalAgents = overview?.agents?.total || 0;
    const healthRatio = totalAgents > 0 ? healthyAgents / totalAgents : 1;
    
    if (healthRatio < 0.5) return 'critical';
    if (healthRatio < 0.7) return 'high';
    if (healthRatio < 0.9) return 'medium';
    return 'normal';
  };

  const getEmergencyLevelColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const handleKillswitchToggle = async (enabled) => {
    try {
      setEmergencyState(prev => ({ ...prev, killswitchActive: enabled }));
      
      if (enabled) {
        await aiAgentsService?.sendLocalNotification(
          '🚨 EMERGENCY KILLSWITCH ACTIVATED',
          'All AI agents have been emergency stopped',
          { tag: 'emergency', requireInteraction: true }
        );
      }
      
      await loadEmergencyData();
    } catch (error) {
      console.error('Killswitch operation failed:', error);
    }
  };

  const handleIncidentResponse = async (incidentId, action) => {
    try {
      console.log(`Responding to incident ${incidentId} with action: ${action}`);
      await loadEmergencyData();
    } catch (error) {
      console.error('Incident response failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading Emergency Response Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Emergency Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-orange-800 border-b border-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI Agent Emergency Response Center</h1>
                <p className="text-red-200 mt-1">Critical incident management and system protection</p>
              </div>
            </div>
            
            {/* Emergency Status Badge */}
            <div className={`px-4 py-2 rounded-lg border font-semibold ${getEmergencyLevelColor(emergencyState?.emergencyLevel)}`}>
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Emergency Level: {emergencyState?.emergencyLevel?.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-red-800/50 border border-red-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-red-300" />
                <span className="text-red-100 text-sm">Total Agents</span>
              </div>
              <div className="text-2xl font-bold mt-1">{systemOverview?.agents?.total || 0}</div>
            </div>
            <div className="bg-red-800/50 border border-red-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-green-400" />
                <span className="text-red-100 text-sm">Active</span>
              </div>
              <div className="text-2xl font-bold mt-1 text-green-400">{systemOverview?.agents?.active || 0}</div>
            </div>
            <div className="bg-red-800/50 border border-red-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertOctagon className="h-5 w-5 text-yellow-400" />
                <span className="text-red-100 text-sm">Incidents</span>
              </div>
              <div className="text-2xl font-bold mt-1 text-yellow-400">{emergencyState?.activeIncidents?.length || 0}</div>
            </div>
            <div className="bg-red-800/50 border border-red-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-400" />
                <span className="text-red-100 text-sm">System Health</span>
              </div>
              <div className="text-2xl font-bold mt-1 text-blue-400">{emergencyState?.systemHealth || 'Unknown'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Emergency Controls */}
          <div className="space-y-6">
            <EmergencyControlPanel
              killswitchActive={emergencyState?.killswitchActive}
              onKillswitchToggle={handleKillswitchToggle}
              systemOverview={systemOverview}
            />
            
            <IncidentDetectionPanel
              incidents={emergencyState?.activeIncidents}
              onIncidentSelect={setSelectedIncident}
            />
          </div>

          {/* Center Column - Crisis Response */}
          <div className="space-y-6">
            <CrisisResponseDashboard
              selectedIncident={selectedIncident}
              onIncidentResponse={handleIncidentResponse}
              systemOverview={systemOverview}
            />
            
            <SystemRecoveryPanel
              systemHealth={emergencyState?.systemHealth}
              onRecoveryAction={loadEmergencyData}
            />
          </div>

          {/* Right Column - Communication & Analysis */}
          <div className="space-y-6">
            <EmergencyCommunicationCenter
              emergencyLevel={emergencyState?.emergencyLevel}
              activeIncidents={emergencyState?.activeIncidents}
            />
            
            <PostIncidentAnalysis
              incidents={emergencyState?.activeIncidents}
              systemOverview={systemOverview}
            />
          </div>
        </div>
      </div>

      {/* Emergency Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-red-800 border-t border-red-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${emergencyState?.killswitchActive ? 'text-red-300' : 'text-green-400'}`}>
              <Power className="h-5 w-5" />
              <span className="font-medium">
                {emergencyState?.killswitchActive ? 'EMERGENCY STOP ACTIVE' : 'Systems Operational'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadEmergencyData}
              className="flex items-center space-x-2 bg-red-700 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Status</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-orange-700 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors">
              <FileText className="h-4 w-4" />
              <span>Generate Report</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-yellow-700 hover:bg-yellow-600 px-4 py-2 rounded-lg transition-colors">
              <Bell className="h-4 w-4" />
              <span>Alert Team</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}