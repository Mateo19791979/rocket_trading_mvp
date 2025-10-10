import React, { useState, useEffect } from 'react';
import { Clock, Activity, Shield, Zap, AlertTriangle, Gauge } from 'lucide-react';
import { goLiveService } from '../../services/goLiveService';
import { captainsLogService } from '../../services/captainsLogService';
import CanaryLaunchPanel from './components/CanaryLaunchPanel';
import ExtensionPanel from './components/ExtensionPanel';
import TimelineDashboard from './components/TimelineDashboard';
import GoLiveProgressionController from './components/GoLiveProgressionController';
import AutonomousGovernanceCenter from './components/AutonomousGovernanceCenter';
import Icon from '@/components/AppIcon';


const UltraFastGoLiveCommandCenter = () => {
  const [deployments, setDeployments] = useState([]);
  const [systemHealth, setSystemHealth] = useState([]);
  const [killSwitches, setKillSwitches] = useState([]);
  const [readinessScore, setReadinessScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [subscriptions, setSubscriptions] = useState([]);

  const handleRealTimeUpdate = (payload) => {
    loadData(); // Refresh data on real-time updates
  };

  useEffect(() => {
    loadData();
    
    const subs = goLiveService?.subscribeToUpdates(handleRealTimeUpdate);
    setSubscriptions(subs);

    return () => {
      goLiveService?.unsubscribeFromUpdates(subs);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deploymentsData, healthData, killSwitchesData] = await Promise.all([
        goLiveService?.getDeploymentPipelines(),
        goLiveService?.getSystemHealth(),
        goLiveService?.getKillSwitches()
      ]);

      setDeployments(deploymentsData);
      setSystemHealth(healthData);
      setKillSwitches(killSwitchesData);

      // Calculate readiness score for the most recent deployment
      if (deploymentsData?.length > 0) {
        const score = await goLiveService?.calculateReadinessScore(deploymentsData?.[0]?.id);
        setReadinessScore(score);
      }
    } catch (error) {
      console.error('Error loading GO-LIVE data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCanaryLaunch = async (config) => {
    try {
      const deployment = await goLiveService?.createCanaryDeployment(
        'Ultra-Fast GO-LIVE',
        config,
        'current-user-id' // Replace with actual user ID from auth
      );

      // Log in Captain's Log
      await captainsLogService?.addEntry(
        `Déploiement canary activé à ${config?.canary_percentage}% de notional. Surveillance ${config?.monitoring_duration_hours}h commencée.`,
        'Matthieu',
        ['canary', 'deployment', 'go_live'],
        'current-user-id'
      );

      loadData();
    } catch (error) {
      console.error('Error launching canary:', error);
    }
  };

  const handleKillSwitchActivation = async (module, reason) => {
    try {
      await goLiveService?.activateKillSwitch(module, reason, 'current-user-id');
      
      // Log in Captain's Log
      await captainsLogService?.addAIEntry(
        `Activation du Kill Switch ${module}. Raison: ${reason}`,
        'AAS_Sentinel',
        ['kill_switch', 'emergency', 'automated'],
        'current-user-id'
      );

      loadData();
    } catch (error) {
      console.error('Error activating kill switch:', error);
    }
  };

  const getHealthStatus = () => {
    if (!systemHealth?.length) return { status: 'unknown', color: 'gray' };
    
    const healthyAgents = systemHealth?.filter(h => h?.health_status === 'healthy')?.length || 0;
    const totalAgents = systemHealth?.length;
    const ratio = healthyAgents / totalAgents;

    if (ratio >= 0.9) return { status: 'excellent', color: 'green' };
    if (ratio >= 0.7) return { status: 'good', color: 'yellow' };
    return { status: 'degraded', color: 'red' };
  };

  const health = getHealthStatus();
  const activeKillSwitchCount = killSwitches?.filter(ks => ks?.is_active)?.length || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white">
          <Activity className="w-6 h-6 animate-spin" />
          <span>Loading GO-LIVE Command Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-red-400 mb-2">
              🚀 Ultra-Fast GO-LIVE Command Center
            </h1>
            <p className="text-gray-300">
              Orchestration autonome gouvernée • Plan 48h • Canary progressif
            </p>
          </div>
          
          {/* Mission Status */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {readinessScore?.score || 0}%
              </div>
              <div className="text-sm text-gray-400">Readiness</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold text-${health?.color}-400`}>
                {systemHealth?.length || 0}
              </div>
              <div className="text-sm text-gray-400">Agents</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${activeKillSwitchCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {activeKillSwitchCount}
              </div>
              <div className="text-sm text-gray-400">Kill Switches</div>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'timeline', label: 'Mission Timeline', icon: Clock },
          { id: 'canary', label: 'T-0 Canary Launch', icon: Zap },
          { id: 'extension', label: 'T-24h Extension', icon: Activity },
          { id: 'progression', label: 'GO-LIVE Progression', icon: Gauge },
          { id: 'governance', label: 'Autonomous Governance', icon: Shield }
        ]?.map(tab => {
          const Icon = tab?.icon;
          return (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab?.id 
                  ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab?.label}</span>
            </button>
          );
        })}
      </div>
      {/* Main Content */}
      <div className="space-y-6">
        {activeTab === 'timeline' && (
          <TimelineDashboard 
            deployments={deployments}
            systemHealth={systemHealth}
            readinessScore={readinessScore}
          />
        )}
        
        {activeTab === 'canary' && (
          <CanaryLaunchPanel 
            onLaunch={handleCanaryLaunch}
            systemHealth={systemHealth}
            killSwitches={killSwitches}
          />
        )}
        
        {activeTab === 'extension' && (
          <ExtensionPanel 
            deployments={deployments}
            onExtend={loadData}
          />
        )}
        
        {activeTab === 'progression' && (
          <GoLiveProgressionController 
            deployments={deployments}
            systemHealth={systemHealth}
            readinessScore={readinessScore}
          />
        )}
        
        {activeTab === 'governance' && (
          <AutonomousGovernanceCenter 
            killSwitches={killSwitches}
            systemHealth={systemHealth}
            onKillSwitchActivation={handleKillSwitchActivation}
          />
        )}
      </div>
      {/* Emergency Footer */}
      {(activeKillSwitchCount > 0 || (readinessScore?.score || 100) < 60) && (
        <div className="fixed bottom-4 right-4 bg-red-600 p-4 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold">Mission Alert</span>
          </div>
          <div className="text-sm">
            {activeKillSwitchCount > 0 && <p>{activeKillSwitchCount} kill switch(es) actifs</p>}
            {(readinessScore?.score || 100) < 60 && <p>Readiness score critique: {readinessScore?.score}%</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default UltraFastGoLiveCommandCenter;