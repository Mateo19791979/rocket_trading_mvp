import React, { useState, useEffect } from 'react';
import { Bot, Activity, AlertTriangle, CheckCircle, Settings, Play, Pause, RotateCcw } from 'lucide-react';
import { aiAgentsService } from '../../services/aiAgentsService';

// Mapping of the 24 AI agents to existing agent groups
const AGENT_DEFINITIONS = {
  orchestration: [
    { id: 'chief-ai-orchestrator', name: 'Chief AI Orchestrator', description: 'Objectifs, arbitrage, cohérence, OKR' },
    { id: 'datagov', name: 'DataGov', description: 'Catalogue, qualité, lineage, SLA data' },
    { id: 'compliance-guard', name: 'Compliance Guard', description: 'Conformité (MiFID/GDPR), logs/audit' },
    { id: 'finops', name: 'FinOps', description: 'Coût cloud, sizing, budgets' }
  ],
  ingestion: [
    { id: 'data-phoenix', name: 'Data Phoenix', description: 'Ingestion, normalisation, feature store' },
    { id: 'altdata-interpreter', name: 'AltData Interpreter', description: 'NLP/vision sur données non structurées' },
    { id: 'thermal-scout', name: 'Thermal Scout', description: 'Télédétection chaleur (usines, data centers)' },
    { id: 'autolot-counter', name: 'AutoLot Counter', description: 'Vision parkings (comptage véhicules)' },
    { id: 'supplychain-tracker', name: 'SupplyChain Tracker', description: 'AIS/port, fret, délais, conteneurs' },
    { id: 'onchain-analyst', name: 'On Chain Analyst', description: 'Flux blockchain (exchanges, stablecoins, DeFi)' },
    { id: 'newsminer', name: 'NewsMiner', description: 'Parsing news/filings, entités, évènements' },
    { id: 'community-pulse', name: 'Community Pulse', description: 'Sentiment réseaux (forums, X/Reddit/Telegram)' }
  ],
  signals: [
    { id: 'quant-oracle', name: 'Quant Oracle', description: 'Validation OOS, MC, walk forward, risque' },
    { id: 'correlation-hunter', name: 'Correlation Hunter', description: 'Causalité (Granger/TE/CCM), lead lag robustes' },
    { id: 'regime-detector', name: 'Regime Detector', description: 'HMM/HSMM/filters, clustering de régimes' },
    { id: 'macro-analyst', name: 'Macro Analyst', description: 'Cycles macro, FX/rates, nowcasting' },
    { id: 'strategy-weaver', name: 'Strategy Weaver', description: 'Générateur de stratégies (bricks entry/exit/risk)' },
    { id: 'portfolio-optimizer', name: 'Portfolio Optimizer', description: 'Allocation (risk parity/BL/robust), budgets risques' }
  ],
  execution: [
    { id: 'execution-guru', name: 'Execution Guru', description: 'SOR, TWAP/VWAP/POV, impact/latence' },
    { id: 'killswitch', name: 'KillSwitch (Risk Controller)', description: 'Limites, hedging d\'urgence, net flat' },
    { id: 'immune-sentinel', name: 'Immune Sentinel', description: 'Dérive/anomalies, quarantaine/kill' },
    { id: 'deployer', name: 'Deployer (DevOps/SRE)', description: 'K8s, CI/CD, secrets, autoscaling, DR' }
  ]
};

const STATUS_CONFIG = {
  active: { color: 'text-green-500', bgColor: 'bg-green-500/10', icon: CheckCircle, label: 'Active' },
  inactive: { color: 'text-gray-500', bgColor: 'bg-gray-500/10', icon: AlertTriangle, label: 'Inactive' },
  paused: { color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', icon: Pause, label: 'Paused' },
  error: { color: 'text-red-500', bgColor: 'bg-red-500/10', icon: AlertTriangle, label: 'Error' }
};

const GROUP_CONFIG = {
  orchestration: { color: 'text-purple-500', bgColor: 'bg-purple-500/10', label: 'Orchestration & Gouvernance' },
  ingestion: { color: 'text-blue-500', bgColor: 'bg-blue-500/10', label: 'Données (acquisition & sens)' },
  signals: { color: 'text-teal-500', bgColor: 'bg-teal-500/10', label: 'Analyse quantitative' },
  execution: { color: 'text-orange-500', bgColor: 'bg-orange-500/10', label: 'Exécution & sécurité' }
};

export default function AgentRosterPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const agentData = await aiAgentsService?.getAllAgents();
      
      // Create agents map from existing data
      const existingAgentsMap = {};
      agentData?.forEach(agent => {
        const key = agent?.name?.toLowerCase()?.replace(/[\s\-()]/g, '-');
        existingAgentsMap[key] = agent;
      });

      // Build complete roster with 24 agents
      const completeRoster = [];
      Object.entries(AGENT_DEFINITIONS)?.forEach(([groupType, groupAgents]) => {
        groupAgents?.forEach(agentDef => {
          const existingAgent = existingAgentsMap?.[agentDef?.id] || 
                              existingAgentsMap?.[agentDef?.name?.toLowerCase()?.replace(/[\s\-()]/g, '-')];
          
          completeRoster?.push({
            ...agentDef,
            group: groupType,
            status: existingAgent?.agent_status || 'inactive',
            performance_metrics: existingAgent?.performance_metrics || {},
            total_pnl: existingAgent?.total_pnl || 0,
            win_rate: existingAgent?.win_rate || 0,
            total_trades: existingAgent?.total_trades || 0,
            last_active_at: existingAgent?.last_active_at,
            risk_parameters: existingAgent?.risk_parameters || {},
            agent_id: existingAgent?.id
          });
        });
      });

      setAgents(completeRoster);
    } catch (err) {
      setError('Erreur lors du chargement des agents');
    } finally {
      setLoading(false);
    }
  };

  const handleAgentAction = async (agentId, action) => {
    try {
      setActionLoading({ ...actionLoading, [agentId]: true });
      
      // Simulate agent action - in real implementation, this would call the appropriate service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update agent status locally
      setAgents(prevAgents => 
        prevAgents?.map(agent => 
          agent?.id === agentId 
            ? { ...agent, status: action === 'start' ? 'active' : action === 'pause' ? 'paused' : 'inactive' }
            : agent
        )
      );
    } catch (err) {
      setError(`Erreur lors de l'action sur l'agent`);
    } finally {
      setActionLoading({ ...actionLoading, [agentId]: false });
    }
  };

  const filteredAgents = selectedGroup === 'all' 
    ? agents 
    : agents?.filter(agent => agent?.group === selectedGroup);

  const getGroupStats = (groupType) => {
    const groupAgents = agents?.filter(agent => agent?.group === groupType);
    const activeCount = groupAgents?.filter(agent => agent?.status === 'active')?.length;
    return { total: groupAgents?.length, active: activeCount };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {[...Array(4)]?.map((_, i) => (
                <div key={i} className="h-32 bg-white/10 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Roster — Agents & missions (24 IA)
            </h1>
            <p className="text-slate-300">
              Orchestration & Gouvernance · Données · Analyse quantitative · Exécution & sécurité
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-slate-300">
              {agents?.filter(a => a?.status === 'active')?.length} actifs / {agents?.length} total
            </div>
            <button
              onClick={loadAgents}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Group Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedGroup === 'all' ?'bg-white/20 text-white' :'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Tous ({agents?.length})
          </button>
          {Object.entries(GROUP_CONFIG)?.map(([key, config]) => {
            const stats = getGroupStats(key);
            return (
              <button
                key={key}
                onClick={() => setSelectedGroup(key)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedGroup === key
                    ? `${config?.bgColor} ${config?.color}`
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {config?.label}({stats?.active}/{stats?.total})
                              </button>
            );
          })}
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgents?.map((agent) => {
            const statusConfig = STATUS_CONFIG?.[agent?.status] || STATUS_CONFIG?.inactive;
            const groupConfig = GROUP_CONFIG?.[agent?.group];
            const StatusIcon = statusConfig?.icon;
            
            return (
              <div key={agent?.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${groupConfig?.bgColor} rounded-lg`}>
                      <Bot className={`w-5 h-5 ${groupConfig?.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{agent?.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${groupConfig?.bgColor} ${groupConfig?.color}`}>
                          {groupConfig?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <StatusIcon className={`w-4 h-4 ${statusConfig?.color}`} />
                    <span className={`text-xs ${statusConfig?.color}`}>
                      {statusConfig?.label}
                    </span>
                  </div>
                </div>
                {/* Description */}
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                  {agent?.description}
                </p>
                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-white">{agent?.total_trades}</div>
                    <div className="text-xs text-slate-400">Trades</div>
                  </div>
                  <div>
                    <div className={`text-lg font-semibold ${agent?.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {agent?.total_pnl >= 0 ? '+' : ''}{Number(agent?.total_pnl)?.toFixed(1)}
                    </div>
                    <div className="text-xs text-slate-400">P&L</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-400">
                      {(agent?.win_rate * 100)?.toFixed(0)}%
                    </div>
                    <div className="text-xs text-slate-400">Win Rate</div>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {agent?.status === 'inactive' && (
                      <button
                        onClick={() => handleAgentAction(agent?.id, 'start')}
                        disabled={actionLoading?.[agent?.id]}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                      >
                        <Play className="w-3 h-3" />
                        Start
                      </button>
                    )}
                    
                    {agent?.status === 'active' && (
                      <button
                        onClick={() => handleAgentAction(agent?.id, 'pause')}
                        disabled={actionLoading?.[agent?.id]}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                      >
                        <Pause className="w-3 h-3" />
                        Pause
                      </button>
                    )}
                  </div>

                  <button
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-xs rounded transition-colors"
                  >
                    <Settings className="w-3 h-3" />
                    Config
                  </button>
                </div>
                {/* Last Active */}
                {agent?.last_active_at && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Activity className="w-3 h-3" />
                      Dernière activité: {new Date(agent.last_active_at)?.toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAgents?.length === 0 && !loading && (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Aucun agent trouvé</h3>
            <p className="text-slate-400">
              {selectedGroup === 'all' ?'Aucun agent disponible pour le moment.'
                : `Aucun agent dans la catégorie ${GROUP_CONFIG?.[selectedGroup]?.label}.`
              }
            </p>
          </div>
        )}

        {/* Footer Stats */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(GROUP_CONFIG)?.map(([key, config]) => {
              const stats = getGroupStats(key);
              return (
                <div key={key} className="text-center">
                  <div className={`text-2xl font-bold ${config?.color}`}>
                    {stats?.active}/{stats?.total}
                  </div>
                  <div className="text-sm text-slate-300">{config?.label}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {stats?.total > 0 ? Math.round((stats?.active / stats?.total) * 100) : 0}% actifs
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}