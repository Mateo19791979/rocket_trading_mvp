import { supabase } from '@/lib/supabase';

// Demo data for offline mode
const DEMO_AGENTS = [
  // ORCHESTRATION & GOUVERNANCE
  { id: '1', name: 'Alpha Momentum Pro', status: 'active', category: 'orchestration_governance', group: 'signals', win_rate: 68.5, total_pnl: 12450.75, total_trades: 147, successful_trades: 101, performance_metrics: { sharpe_ratio: 1.45, max_drawdown: 8.2 }, last_active_at: new Date(Date.now() - 5 * 60 * 1000)?.toISOString() },
  { id: '2', name: 'Beta Arbitrage Elite', status: 'active', category: 'orchestration_governance', group: 'execution', win_rate: 72.3, total_pnl: 8920.30, total_trades: 89, successful_trades: 64, performance_metrics: { sharpe_ratio: 1.8, max_drawdown: 5.1 }, last_active_at: new Date(Date.now() - 2 * 60 * 1000)?.toISOString() },
  { id: '3', name: 'Gamma Superviseur', status: 'active', category: 'orchestration_governance', group: 'governance', win_rate: 55.8, total_pnl: 3275.60, total_trades: 156, successful_trades: 87, performance_metrics: { sharpe_ratio: 0.95, max_drawdown: 12.5 }, last_active_at: new Date(Date.now() - 10 * 60 * 1000)?.toISOString() },
  { id: '4', name: 'Delta Orchestrateur', status: 'paused', category: 'orchestration_governance', group: 'orchestration', win_rate: 45.2, total_pnl: -1250.40, total_trades: 76, successful_trades: 34, performance_metrics: { sharpe_ratio: -0.3, max_drawdown: 25.8 }, last_active_at: new Date(Date.now() - 2 * 3600 * 1000)?.toISOString() },
  { id: '5', name: 'Epsilon Risk Manager', status: 'active', category: 'orchestration_governance', group: 'risk', win_rate: 82.1, total_pnl: 15680.90, total_trades: 203, successful_trades: 167, performance_metrics: { sharpe_ratio: 2.1, max_drawdown: 6.3 }, last_active_at: new Date(Date.now() - 1 * 60 * 1000)?.toISOString() },
  { id: '6', name: 'Zeta Compliance', status: 'active', category: 'orchestration_governance', group: 'compliance', win_rate: 91.5, total_pnl: 2850.15, total_trades: 65, successful_trades: 59, performance_metrics: { sharpe_ratio: 1.6, max_drawdown: 3.2 }, last_active_at: new Date(Date.now() - 8 * 60 * 1000)?.toISOString() },
  
  // DONNÉES (acquisition & sens)
  { id: '7', name: 'Data Hunter Pro', status: 'active', category: 'data_acquisition', group: 'data', win_rate: 58.9, total_pnl: 4120.80, total_trades: 198, successful_trades: 117, performance_metrics: { sharpe_ratio: 1.1, max_drawdown: 9.7 }, last_active_at: new Date(Date.now() - 3 * 60 * 1000)?.toISOString() },
  { id: '8', name: 'News Sentiment AI', status: 'active', category: 'data_acquisition', group: 'data', win_rate: 63.7, total_pnl: 6789.25, total_trades: 142, successful_trades: 91, performance_metrics: { sharpe_ratio: 1.35, max_drawdown: 11.4 }, last_active_at: new Date(Date.now() - 7 * 60 * 1000)?.toISOString() },
  { id: '9', name: 'Market Scanner', status: 'active', category: 'data_acquisition', group: 'data', win_rate: 71.2, total_pnl: 9430.50, total_trades: 178, successful_trades: 127, performance_metrics: { sharpe_ratio: 1.65, max_drawdown: 7.8 }, last_active_at: new Date(Date.now() - 4 * 60 * 1000)?.toISOString() },
  { id: '10', name: 'Pattern Detective', status: 'error', category: 'data_acquisition', group: 'data', win_rate: 0, total_pnl: 0, total_trades: 0, successful_trades: 0, performance_metrics: { sharpe_ratio: 0, max_drawdown: 0 }, last_active_at: new Date(Date.now() - 24 * 3600 * 1000)?.toISOString() },
  { id: '11', name: 'Volume Analyzer', status: 'active', category: 'data_acquisition', group: 'data', win_rate: 49.3, total_pnl: 1890.75, total_trades: 87, successful_trades: 43, performance_metrics: { sharpe_ratio: 0.6, max_drawdown: 15.2 }, last_active_at: new Date(Date.now() - 12 * 60 * 1000)?.toISOString() },
  { id: '12', name: 'Correlation Engine', status: 'active', category: 'data_acquisition', group: 'data', win_rate: 76.8, total_pnl: 11250.40, total_trades: 165, successful_trades: 127, performance_metrics: { sharpe_ratio: 1.9, max_drawdown: 6.7 }, last_active_at: new Date(Date.now() - 6 * 60 * 1000)?.toISOString() },
  
  // ANALYSE QUANTITATIVE
  { id: '13', name: 'Quant Master', status: 'active', category: 'quantitative_analysis', group: 'quant', win_rate: 79.4, total_pnl: 18750.60, total_trades: 234, successful_trades: 186, performance_metrics: { sharpe_ratio: 2.3, max_drawdown: 5.5 }, last_active_at: new Date(Date.now() - 2 * 60 * 1000)?.toISOString() },
  { id: '14', name: 'Statistical Arbitrage', status: 'active', category: 'quantitative_analysis', group: 'quant', win_rate: 65.3, total_pnl: 7890.25, total_trades: 153, successful_trades: 100, performance_metrics: { sharpe_ratio: 1.4, max_drawdown: 10.1 }, last_active_at: new Date(Date.now() - 9 * 60 * 1000)?.toISOString() },
  { id: '15', name: 'Mean Reversion Pro', status: 'paused', category: 'quantitative_analysis', group: 'quant', win_rate: 42.8, total_pnl: -2150.90, total_trades: 98, successful_trades: 42, performance_metrics: { sharpe_ratio: -0.5, max_drawdown: 22.3 }, last_active_at: new Date(Date.now() - 3 * 3600 * 1000)?.toISOString() },
  { id: '16', name: 'Pairs Trading AI', status: 'active', category: 'quantitative_analysis', group: 'quant', win_rate: 83.1, total_pnl: 16420.35, total_trades: 187, successful_trades: 155, performance_metrics: { sharpe_ratio: 2.05, max_drawdown: 4.8 }, last_active_at: new Date(Date.now() - 1 * 60 * 1000)?.toISOString() },
  { id: '17', name: 'Options Strategist', status: 'active', category: 'quantitative_analysis', group: 'derivatives', win_rate: 59.7, total_pnl: 5230.80, total_trades: 112, successful_trades: 67, performance_metrics: { sharpe_ratio: 1.2, max_drawdown: 13.6 }, last_active_at: new Date(Date.now() - 15 * 60 * 1000)?.toISOString() },
  { id: '18', name: 'Volatility Surfer', status: 'active', category: 'quantitative_analysis', group: 'derivatives', win_rate: 74.6, total_pnl: 10890.75, total_trades: 201, successful_trades: 150, performance_metrics: { sharpe_ratio: 1.75, max_drawdown: 8.9 }, last_active_at: new Date(Date.now() - 5 * 60 * 1000)?.toISOString() },
  
  // EXÉCUTION & SÉCURITÉ
  { id: '19', name: 'Execution Master', status: 'active', category: 'execution_security', group: 'execution', win_rate: 88.2, total_pnl: 22150.45, total_trades: 312, successful_trades: 275, performance_metrics: { sharpe_ratio: 2.8, max_drawdown: 3.1 }, last_active_at: new Date(Date.now() - 0.5 * 60 * 1000)?.toISOString() },
  { id: '20', name: 'Security Guardian', status: 'active', category: 'execution_security', group: 'security', win_rate: 95.3, total_pnl: 1250.90, total_trades: 34, successful_trades: 32, performance_metrics: { sharpe_ratio: 3.2, max_drawdown: 1.8 }, last_active_at: new Date(Date.now() - 2 * 60 * 1000)?.toISOString() },
  { id: '21', name: 'Slippage Optimizer', status: 'active', category: 'execution_security', group: 'execution', win_rate: 67.8, total_pnl: 8750.20, total_trades: 167, successful_trades: 113, performance_metrics: { sharpe_ratio: 1.5, max_drawdown: 9.3 }, last_active_at: new Date(Date.now() - 4 * 60 * 1000)?.toISOString() },
  { id: '22', name: 'Liquidity Seeker', status: 'maintenance', category: 'execution_security', group: 'execution', win_rate: 72.1, total_pnl: 9650.75, total_trades: 189, successful_trades: 136, performance_metrics: { sharpe_ratio: 1.6, max_drawdown: 7.4 }, last_active_at: new Date(Date.now() - 30 * 60 * 1000)?.toISOString() },
  { id: '23', name: 'Risk Sentinel', status: 'active', category: 'execution_security', group: 'risk', win_rate: 89.7, total_pnl: 3420.60, total_trades: 78, successful_trades: 70, performance_metrics: { sharpe_ratio: 2.4, max_drawdown: 4.2 }, last_active_at: new Date(Date.now() - 1 * 60 * 1000)?.toISOString() },
  { id: '24', name: 'Emergency Breaker', status: 'active', category: 'execution_security', group: 'emergency', win_rate: 100.0, total_pnl: 450.25, total_trades: 12, successful_trades: 12, performance_metrics: { sharpe_ratio: 4.5, max_drawdown: 0.5 }, last_active_at: new Date(Date.now() - 6 * 60 * 1000)?.toISOString() }
];

const DEMO_SYSTEM_HEALTH = {
  overall_status: 'healthy',
  total_agents: 24,
  active_agents: 20,
  error_agents: 1,
  paused_agents: 2,
  maintenance_agents: 1,
  total_pnl: DEMO_AGENTS?.reduce((sum, agent) => sum + agent?.total_pnl, 0),
  avg_win_rate: DEMO_AGENTS?.reduce((sum, agent) => sum + agent?.win_rate, 0) / DEMO_AGENTS?.length,
  last_updated: new Date()?.toISOString()
};

class RealTimeAgentPerformanceService {
  constructor() {
    this.subscribers = [];
    this.isOnline = true;
    this.retryAttempts = 0;
    this.maxRetries = 3;
    this.checkOnlineStatus();
    setInterval(() => this.checkOnlineStatus(), 30000);
  }

  checkOnlineStatus() {
    this.isOnline = navigator?.onLine !== false;
  }

  async getAgentPerformanceData() {
    try {
      // Reset retry attempts on successful connection attempt
      this.retryAttempts = 0;

      if (!this.isOnline) {
        console.log('🔴 Agent Performance: Mode hors ligne - utilisation des données de démonstration');
        return { agents: DEMO_AGENTS, system_health: DEMO_SYSTEM_HEALTH };
      }

      const { data: agents, error: agentsError } = await supabase?.from('ai_agents')?.select(`
          id,
          name,
          description,
          strategy,
          agent_status,
          agent_category,
          agent_group,
          win_rate,
          total_pnl,
          total_trades,
          successful_trades,
          performance_metrics,
          configuration,
          is_autonomous,
          communication_enabled,
          last_active_at,
          last_trade_at,
          created_at,
          updated_at
        `)?.order('total_pnl', { ascending: false });

      if (agentsError) {
        console.log('🟡 Erreur de récupération des agents, utilisation du mode démonstration:', agentsError?.message);
        
        // Check if it's a connection error vs schema error
        if (agentsError?.message?.includes('relation "ai_agents" does not exist')) {
          console.log('⚠️  Table ai_agents manquante. Veuillez exécuter les migrations Supabase.');
        } else if (agentsError?.code === 'PGRST116') {
          console.log('⚠️  Problème RLS ou permissions. Vérifiez les politiques de sécurité.');
        }
        
        return { agents: DEMO_AGENTS, system_health: DEMO_SYSTEM_HEALTH };
      }

      const agentsData = agents || [];
      
      // If we got data but it's empty, log helpful message
      if (agentsData?.length === 0) {
        console.log('🟡 Aucun agent trouvé dans la base de données. Utilisation des données de démonstration.');
        console.log('💡 Conseil: Vérifiez que les migrations ont bien créé les 24 agents IA.');
        return { agents: DEMO_AGENTS, system_health: DEMO_SYSTEM_HEALTH };
      }

      console.log(`✅ ${agentsData?.length} agents chargés avec succès depuis Supabase`);
      const systemHealth = this.calculateSystemHealth(agentsData);

      return {
        agents: agentsData,
        system_health: systemHealth
      };
    } catch (error) {
      this.retryAttempts++;
      console.log(`🔴 Agent Performance: Erreur de connexion (tentative ${this.retryAttempts}/${this.maxRetries}) - mode démo activé`);
      
      if (error?.message?.includes('Failed to retrieve Supabase project details')) {
        console.log('🚨 Erreur serveur Supabase détectée. Le serveur Supabase semble inaccessible.');
      } else if (error?.message?.includes('NetworkError')) {
        console.log('🌐 Erreur réseau détectée. Vérifiez votre connexion internet.');
      }
      
      // If we've exceeded max retries, provide more detailed error info
      if (this.retryAttempts >= this.maxRetries) {
        console.log('❌ Nombre maximum de tentatives atteint. Basculement permanent vers le mode démonstration.');
        console.log('🔧 Actions suggérées:');
        console.log('   1. Vérifiez les migrations Supabase');
        console.log('   2. Contrôlez les variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
        console.log('   3. Testez la connectivité Supabase');
      }
      
      return { agents: DEMO_AGENTS, system_health: DEMO_SYSTEM_HEALTH };
    }
  }

  calculateSystemHealth(agents) {
    if (!agents || agents?.length === 0) {
      return DEMO_SYSTEM_HEALTH;
    }

    const statusCounts = agents?.reduce((acc, agent) => {
      const status = agent?.agent_status || 'inactive';
      acc[status] = (acc?.[status] || 0) + 1;
      return acc;
    }, {});

    const totalPnl = agents?.reduce((sum, agent) => sum + (parseFloat(agent?.total_pnl) || 0), 0);
    const avgWinRate = agents?.reduce((sum, agent) => sum + (parseFloat(agent?.win_rate) || 0), 0) / agents?.length;

    return {
      overall_status: statusCounts?.error > 0 ? 'degraded' : 'healthy',
      total_agents: agents?.length,
      active_agents: statusCounts?.active || 0,
      error_agents: statusCounts?.error || 0,
      paused_agents: statusCounts?.paused || 0,
      maintenance_agents: statusCounts?.maintenance || 0,
      inactive_agents: statusCounts?.inactive || 0,
      total_pnl: totalPnl,
      avg_win_rate: avgWinRate,
      last_updated: new Date()?.toISOString()
    };
  }

  async getAgentsByCategory() {
    try {
      const { agents } = await this.getAgentPerformanceData();
      
      const categories = {
        orchestration_governance: agents?.filter(agent => (agent?.agent_category || agent?.category) === 'orchestration_governance'),
        data_acquisition: agents?.filter(agent => (agent?.agent_category || agent?.category) === 'data_acquisition'),
        quantitative_analysis: agents?.filter(agent => (agent?.agent_category || agent?.category) === 'quantitative_analysis'),
        execution_security: agents?.filter(agent => (agent?.agent_category || agent?.category) === 'execution_security')
      };

      return categories;
    } catch (error) {
      console.log('🟡 Erreur lors de la récupération par catégorie:', error?.message);
      
      const demoCategories = {
        orchestration_governance: DEMO_AGENTS?.filter(agent => agent?.category === 'orchestration_governance'),
        data_acquisition: DEMO_AGENTS?.filter(agent => agent?.category === 'data_acquisition'),
        quantitative_analysis: DEMO_AGENTS?.filter(agent => agent?.category === 'quantitative_analysis'),
        execution_security: DEMO_AGENTS?.filter(agent => agent?.category === 'execution_security')
      };
      
      return demoCategories;
    }
  }

  async getTopPerformingAgents(limit = 10) {
    try {
      const { agents } = await this.getAgentPerformanceData();
      
      return agents?.filter(agent => (agent?.agent_status || agent?.status) === 'active')?.sort((a, b) => (parseFloat(b?.total_pnl) || 0) - (parseFloat(a?.total_pnl) || 0))?.slice(0, limit);
    } catch (error) {
      console.log('Erreur lors de la récupération du top des agents:', error?.message);
      return DEMO_AGENTS?.filter(agent => agent?.status === 'active')?.sort((a, b) => b?.total_pnl - a?.total_pnl)?.slice(0, limit);
    }
  }

  async getRecentActivity(limit = 50) {
    try {
      if (!this.isOnline) {
        return this.getDemoRecentActivity(limit);
      }

      const { data: trades, error } = await supabase?.from('ai_agent_trades')?.select(`
          id,
          confidence_level,
          signal_strength,
          execution_time_ms,
          reasoning,
          created_at,
          ai_agents!inner (
            name,
            agent_category
          ),
          trades!inner (
            trade_side,
            quantity,
            price,
            realized_pnl,
            executed_at,
            assets!inner (
              symbol,
              name
            )
          )
        `)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) {
        return this.getDemoRecentActivity(limit);
      }

      return (trades || [])?.map(trade => ({
        id: trade?.id,
        agent_name: trade?.ai_agents?.name,
        agent_category: trade?.ai_agents?.agent_category,
        symbol: trade?.trades?.assets?.symbol,
        asset_name: trade?.trades?.assets?.name,
        side: trade?.trades?.trade_side,
        quantity: trade?.trades?.quantity,
        price: trade?.trades?.price,
        pnl: trade?.trades?.realized_pnl,
        confidence: trade?.confidence_level,
        signal_strength: trade?.signal_strength,
        execution_time_ms: trade?.execution_time_ms,
        reasoning: trade?.reasoning,
        executed_at: trade?.trades?.executed_at || trade?.created_at
      }));
    } catch (error) {
      return this.getDemoRecentActivity(limit);
    }
  }

  getDemoRecentActivity(limit = 50) {
    const activities = [
      {
        id: '1',
        agent_name: 'Alpha Momentum Pro',
        agent_category: 'orchestration_governance',
        symbol: 'AAPL',
        asset_name: 'Apple Inc.',
        side: 'BUY',
        quantity: 100,
        price: 175.50,
        pnl: 250.00,
        confidence: 85.5,
        signal_strength: 92.3,
        execution_time_ms: 145,
        reasoning: 'Signal momentum haussier détecté avec conditions RSI survente et confirmation volume',
        executed_at: new Date(Date.now() - 30 * 60 * 1000)?.toISOString()
      },
      {
        id: '2',
        agent_name: 'Beta Arbitrage Elite',
        agent_category: 'orchestration_governance',
        symbol: 'TSLA',
        asset_name: 'Tesla Inc.',
        side: 'SELL',
        quantity: 50,
        price: 242.30,
        pnl: 180.00,
        confidence: 92.1,
        signal_strength: 88.7,
        execution_time_ms: 87,
        reasoning: 'Divergence de prix détectée entre NYSE et NASDAQ, opportunité d\'écart 0.3%',
        executed_at: new Date(Date.now() - 60 * 60 * 1000)?.toISOString()
      }
    ];
    
    return activities?.slice(0, limit);
  }

  subscribe(callback) {
    this.subscribers?.push(callback);
  }

  unsubscribe(callback) {
    this.subscribers = this.subscribers?.filter(sub => sub !== callback);
  }

  notifySubscribers(data) {
    this.subscribers?.forEach(callback => callback(data));
  }

  async startRealTimeUpdates() {
    // Simulate real-time updates every 10 seconds
    setInterval(async () => {
      try {
        const data = await this.getAgentPerformanceData();
        this.notifySubscribers(data);
      } catch (error) {
        console.log('🟡 Erreur lors de la mise à jour temps réel:', error?.message);
      }
    }, 10000);
  }

  async diagnosticInfo() {
    const info = {
      isOnline: this.isOnline,
      retryAttempts: this.retryAttempts,
      maxRetries: this.maxRetries,
      supabaseUrl: import.meta.env?.VITE_SUPABASE_URL ? 'Configuré' : 'Manquant',
      supabaseKey: import.meta.env?.VITE_SUPABASE_ANON_KEY ? 'Configuré' : 'Manquant',
      demoAgentsCount: DEMO_AGENTS?.length,
      timestamp: new Date()?.toISOString()
    };
    
    console.log('🔍 Informations de diagnostic:', info);
    return info;
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(amount);
  }

  formatPercentage(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })?.format(value / 100);
  }

  getStatusColor(status) {
    const colors = {
      active: 'text-green-600',
      paused: 'text-yellow-600',
      error: 'text-red-600',
      inactive: 'text-gray-600',
      maintenance: 'text-blue-600'
    };
    return colors?.[status] || 'text-gray-600';
  }

  getCategoryDisplayName(category) {
    const names = {
      orchestration_governance: 'Orchestration & Gouvernance',
      data_acquisition: 'Acquisition de Données',
      quantitative_analysis: 'Analyse Quantitative',
      execution_security: 'Exécution & Sécurité'
    };
    return names?.[category] || category;
  }
}

export const realTimeAgentPerformanceService = new RealTimeAgentPerformanceService();
export default realTimeAgentPerformanceService;