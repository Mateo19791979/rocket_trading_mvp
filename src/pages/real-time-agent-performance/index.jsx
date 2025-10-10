import { useState, useEffect, useMemo } from 'react';
import { Activity, TrendingUp, Zap, AlertCircle, Settings, Users } from 'lucide-react';
import realTimeAgentPerformanceService from '../../services/realTimeAgentPerformanceService';
import GovernancePanel from '../../components/GovernancePanel';

import AgentLeaderboard from './components/AgentLeaderboard';
import PerformanceComparison from './components/PerformanceComparison';
import RealTimeActivity from './components/RealTimeActivity';
import AgentFilters from './components/AgentFilters';
import CapitalRequirementsCalculator from './components/CapitalRequirementsCalculator';
import DailyIntelligenceReportCard from './components/DailyIntelligenceReportCard';

export default function RealTimeAgentPerformance() {
  const [agents, setAgents] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('total_pnl');
  const [sortOrder, setSortOrder] = useState('desc');

  // Governance Panel visibility
  const params = new URLSearchParams(window.location.search);
  const opsFromUrl = params?.get("ops") === "1";
  const governanceEnabled = typeof window !== 'undefined' ? 
    window.localStorage?.getItem("gov:enabled") === "true" : false;
  const canShowGov = useMemo(() => opsFromUrl || governanceEnabled, [opsFromUrl, governanceEnabled]);

  const handleRealTimeUpdate = (data) => {
    setAgents(data?.agents || []);
    setSystemHealth(data?.system_health || null);
  };

  useEffect(() => {
    loadInitialData();
    
    // Subscribe to real-time updates
    const unsubscribe = realTimeAgentPerformanceService?.subscribe(handleRealTimeUpdate);
    realTimeAgentPerformanceService?.startRealTimeUpdates();

    return () => {
      unsubscribe();
    };
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [performanceData, activityData] = await Promise.all([
        realTimeAgentPerformanceService?.getAgentPerformanceData(),
        realTimeAgentPerformanceService?.getRecentActivity(25)
      ]);

      setAgents(performanceData?.agents || []);
      setSystemHealth(performanceData?.system_health || null);
      setRecentActivity(activityData || []);
    } catch (err) {
      setError('Impossible de charger les données des agents. Mode démonstration activé.');
      console.log('Erreur de chargement initial:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter agents by selected category and status
  const filteredAgents = useMemo(() => {
    let filtered = agents;

    if (selectedCategory !== 'all') {
      filtered = filtered?.filter(agent => 
        (agent?.agent_category || agent?.category) === selectedCategory
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered?.filter(agent => 
        (agent?.agent_status && agent?.agent_status !== 'undefined' ? agent?.agent_status : agent?.status) === selectedStatus
      );
    }

    // Sorting
    filtered?.sort((a, b) => {
      let aValue = a?.[sortBy];
      let bValue = b?.[sortBy];

      if (typeof aValue === 'string' && !isNaN(parseFloat(aValue))) {
        aValue = parseFloat(aValue);
      }
      if (typeof bValue === 'string' && !isNaN(parseFloat(bValue))) {
        bValue = parseFloat(bValue);
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [agents, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const getStatusStats = () => {
    if (!systemHealth) return { active: 0, total: 0, errors: 0 };
    
    return {
      active: systemHealth?.active_agents || 0,
      total: systemHealth?.total_agents || 0,
      errors: systemHealth?.error_agents || 0,
      paused: systemHealth?.paused_agents || 0,
      maintenance: systemHealth?.maintenance_agents || 0
    };
  };

  const statusStats = getStatusStats();

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)]?.map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="text-blue-600" size={32} />
            Performance Agents IA - Temps Réel
          </h1>
          <p className="text-gray-600 mt-2">
            Surveillance et analyse des performances des 24 agents de trading automatisé
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Dernière mise à jour: {systemHealth?.last_updated ? 
              new Date(systemHealth.last_updated)?.toLocaleTimeString('fr-FR') : 
              new Date()?.toLocaleTimeString('fr-FR')
            }
          </div>
          {canShowGov && (
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              Mode Admin
            </div>
          )}
        </div>
      </div>
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Agents Actifs</p>
              <p className="text-2xl font-bold text-green-600">{statusStats?.active}</p>
            </div>
            <Zap className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">sur {statusStats?.total} agents</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">PnL Total</p>
              <p className="text-2xl font-bold text-blue-600">
                {realTimeAgentPerformanceService?.formatCurrency(systemHealth?.total_pnl || 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de Réussite Moyen</p>
              <p className="text-2xl font-bold text-purple-600">
                {realTimeAgentPerformanceService?.formatPercentage(systemHealth?.avg_win_rate || 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Erreurs</p>
              <p className="text-2xl font-bold text-red-600">{statusStats?.errors}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="flex gap-2 mt-2 text-xs">
            <span className="text-yellow-600">Pause: {statusStats?.paused}</span>
            <span className="text-blue-600">Maintenance: {statusStats?.maintenance}</span>
          </div>
        </div>
      </div>
      {/* Filters */}
      <AgentFilters
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        filters={{}}
        onFilterChange={() => {}}
      />
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AgentLeaderboard agents={filteredAgents} />
          <CapitalRequirementsCalculator agents={filteredAgents} />
        </div>
        <div className="space-y-6">
          <RealTimeActivity activities={recentActivity} activity={recentActivity} />
          <DailyIntelligenceReportCard systemHealth={systemHealth} />
        </div>
      </div>
      {/* Performance Comparison */}
      <PerformanceComparison agents={filteredAgents} data={filteredAgents} />
      {/* Governance Panel - Only visible when enabled */}
      {canShowGov && (
        <section className="rounded-xl border p-4 bg-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-6 w-6 text-orange-600" />
            <h3 className="text-lg font-semibold">Opérations (Gouvernance)</h3>
            <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Admin Mode</div>
          </div>
          <GovernancePanel />
        </section>
      )}
      {/* Helper text for governance activation */}
      {!canShowGov && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Mode gouvernance masqué.</span>
          </div>
          <div className="mt-1">
            Ajouter <code className="bg-gray-200 px-1 py-0.5 rounded">?ops=1</code> à l'URL
            ou exécuter dans la console :{" "}
            <code className="bg-gray-200 px-1 py-0.5 rounded">
              localStorage.setItem("gov:enabled","true"); location.reload()
            </code>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}