import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AgentActivationPanel from './components/AgentActivationPanel';
import NatsRedisMessagingHub from './components/NatsRedisMessagingHub';
import LiveTradingDashboard from './components/LiveTradingDashboard';

const LiveTradingOrchestrationCenter = () => {
  const [agents, setAgents] = useState([]);
  const [agentStates, setAgentStates] = useState({});
  const [systemHealth, setSystemHealth] = useState({});
  const [eventBusData, setEventBusData] = useState([]);
  const [ohlcData, setOhlcData] = useState([]);
  const [providersStatus, setProvidersStatus] = useState({});
  const [orchestratorState, setOrchestratorState] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load AI agents for Data Phoenix, Quant Oracle, Strategy Weaver
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const { data: agentsData, error: agentsError } = await supabase?.from('ai_agents')?.select(`
            id, name, agent_status, agent_group, agent_category, 
            description, configuration, performance_metrics, 
            total_pnl, win_rate, total_trades, successful_trades,
            last_active_at, created_at, updated_at
          `)?.in('name', ['Data Phoenix', 'Quant Oracle', 'Strategy Weaver']);

        if (agentsError) throw agentsError;

        // Create default agents if they don't exist
        const existingAgentNames = agentsData?.map(a => a?.name) || [];
        const requiredAgents = [
          {
            name: 'Data Phoenix',
            agent_group: 'ingestion',
            agent_category: 'market_data',
            description: 'Market data ingestion and processing with real-time feeds from Finnhub/Alpha Vantage/TwelveData',
            configuration: {
              providers: ['finnhub', 'alpha_vantage', 'twelve_data'],
              target_rate: 1000,
              ingestion_symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN'],
              timeframes: ['1m', '5m', '15m']
            }
          },
          {
            name: 'Quant Oracle',
            agent_group: 'signals',
            agent_category: 'backtesting',
            description: 'Backtesting and validation engine with strategy processing and performance scoring',
            configuration: {
              backtest_window: '30d',
              validation_criteria: ['sharpe_ratio', 'max_drawdown', 'win_rate'],
              min_confidence: 0.75,
              processing_queue_size: 100
            }
          },
          {
            name: 'Strategy Weaver',
            agent_group: 'execution',
            agent_category: 'strategy_generation',
            description: 'RSI+ATR strategy generation with real-time rule creation and parameter optimization',
            configuration: {
              strategy_types: ['RSI', 'ATR', 'combined'],
              rsi_period: 14,
              atr_multiplier: 2.0,
              optimization_method: 'genetic_algorithm'
            }
          }
        ];

        const missingAgents = requiredAgents?.filter(
          agent => !existingAgentNames?.includes(agent?.name)
        );

        // Insert missing agents
        if (missingAgents?.length > 0) {
          const { error: insertError } = await supabase?.from('ai_agents')?.insert(missingAgents?.map(agent => ({
              ...agent,
              agent_status: 'inactive',
              strategy: 'momentum'
            })));

          if (insertError) throw insertError;

          // Reload agents after insertion
          const { data: newAgentsData, error: newAgentsError } = await supabase?.from('ai_agents')?.select(`
              id, name, agent_status, agent_group, agent_category, 
              description, configuration, performance_metrics, 
              total_pnl, win_rate, total_trades, successful_trades,
              last_active_at, created_at, updated_at
            `)?.in('name', ['Data Phoenix', 'Quant Oracle', 'Strategy Weaver']);

          if (newAgentsError) throw newAgentsError;
          setAgents(newAgentsData || []);
        } else {
          setAgents(agentsData || []);
        }
      } catch (error) {
        console.error('Error loading agents:', error);
        setAgents([]);
      }
    };

    loadAgents();
  }, []);

  // Load agent states
  useEffect(() => {
    const loadAgentStates = async () => {
      if (agents?.length === 0) return;

      try {
        const agentIds = agents?.map(agent => agent?.id);
        const { data: statesData, error: statesError } = await supabase?.from('ai_agent_state')?.select('*')?.in('agent_id', agentIds);

        if (statesError) throw statesError;

        const statesMap = {};
        statesData?.forEach(state => {
          if (!statesMap?.[state?.agent_id]) {
            statesMap[state.agent_id] = {};
          }
          statesMap[state.agent_id][state.state_key] = state?.state_value;
        });

        setAgentStates(statesMap);
      } catch (error) {
        console.error('Error loading agent states:', error);
        setAgentStates({});
      }
    };

    loadAgentStates();
  }, [agents]);

  // Load system health
  useEffect(() => {
    const loadSystemHealth = async () => {
      if (agents?.length === 0) return;

      try {
        const agentIds = agents?.map(agent => agent?.id);
        const { data: healthData, error: healthError } = await supabase?.from('system_health')?.select('*')?.in('agent_id', agentIds)?.order('created_at', { ascending: false });

        if (healthError) throw healthError;

        const healthMap = {};
        healthData?.forEach(health => {
          if (!healthMap?.[health?.agent_id] || 
              new Date(health.created_at) > new Date(healthMap[health.agent_id].created_at)) {
            healthMap[health.agent_id] = health;
          }
        });

        setSystemHealth(healthMap);
      } catch (error) {
        console.error('Error loading system health:', error);
        setSystemHealth({});
      }
    };

    loadSystemHealth();
  }, [agents]);

  // Load event bus data
  useEffect(() => {
    const loadEventBusData = async () => {
      try {
        const { data: eventsData, error: eventsError } = await supabase?.from('event_bus')?.select('*')?.order('created_at', { ascending: false })?.limit(100);

        if (eventsError) throw eventsError;
        setEventBusData(eventsData || []);
      } catch (error) {
        console.error('Error loading event bus data:', error);
        setEventBusData([]);
      }
    };

    loadEventBusData();
  }, []);

  // Load OHLC data
  useEffect(() => {
    const loadOHLCData = async () => {
      try {
        const { data: ohlcData, error: ohlcError } = await supabase?.from('ohlc')?.select('*')?.in('symbol', ['AAPL', 'MSFT', 'GOOGL'])?.eq('tf', '1m')?.order('ts', { ascending: false })?.limit(50);

        if (ohlcError) throw ohlcError;
        setOhlcData(ohlcData || []);
      } catch (error) {
        console.error('Error loading OHLC data:', error);
        setOhlcData([]);
      }
    };

    loadOHLCData();
  }, []);

  // Load providers status
  useEffect(() => {
    const loadProvidersStatus = async () => {
      try {
        const { data: providersData, error: providersError } = await supabase?.from('providers')?.select('*')?.eq('id', 'default');

        if (providersError) throw providersError;

        const { data: apiConfigsData, error: apiConfigsError } = await supabase?.from('external_api_configs')?.select('*')?.eq('is_active', true);

        if (apiConfigsError) throw apiConfigsError;

        setProvidersStatus({
          providers: providersData?.[0] || {},
          apiConfigs: apiConfigsData || []
        });
      } catch (error) {
        console.error('Error loading providers status:', error);
        setProvidersStatus({});
      }
    };

    loadProvidersStatus();
  }, []);

  // Load orchestrator state
  useEffect(() => {
    const loadOrchestratorState = async () => {
      try {
        const { data: stateData, error: stateError } = await supabase?.from('orchestrator_state')?.select('*');

        if (stateError) throw stateError;

        const stateMap = {};
        stateData?.forEach(state => {
          stateMap[state.key] = state?.value;
        });

        setOrchestratorState(stateMap);
      } catch (error) {
        console.error('Error loading orchestrator state:', error);
        setOrchestratorState({});
      }
    };

    loadOrchestratorState();
  }, []);

  // Set loading to false when all data is loaded
  useEffect(() => {
    if (agents?.length > 0) {
      setIsLoading(false);
    }
  }, [agents, agentStates, systemHealth, eventBusData, ohlcData, providersStatus, orchestratorState]);

  // Real-time subscriptions
  useEffect(() => {
    const subscriptions = [];

    // Subscribe to event bus changes
    const eventBusSubscription = supabase?.channel('event_bus_changes')?.on('postgres_changes', { event: '*', schema: 'public', table: 'event_bus' }, 
        payload => {
          if (payload?.eventType === 'INSERT') {
            setEventBusData(prev => [payload?.new, ...prev?.slice(0, 99)]);
          }
        })?.subscribe();

    subscriptions?.push(eventBusSubscription);

    // Subscribe to agent state changes
    const agentStateSubscription = supabase?.channel('ai_agent_state_changes')?.on('postgres_changes', { event: '*', schema: 'public', table: 'ai_agent_state' }, 
        payload => {
          if (payload?.eventType === 'INSERT' || payload?.eventType === 'UPDATE') {
            setAgentStates(prev => ({
              ...prev,
              [payload?.new?.agent_id]: {
                ...prev?.[payload?.new?.agent_id],
                [payload?.new?.state_key]: payload?.new?.state_value
              }
            }));
          }
        })?.subscribe();

    subscriptions?.push(agentStateSubscription);

    // Subscribe to system health changes
    const systemHealthSubscription = supabase?.channel('system_health_changes')?.on('postgres_changes', { event: '*', schema: 'public', table: 'system_health' }, 
        payload => {
          if (payload?.eventType === 'INSERT' || payload?.eventType === 'UPDATE') {
            setSystemHealth(prev => ({
              ...prev,
              [payload?.new?.agent_id]: payload?.new
            }));
          }
        })?.subscribe();

    subscriptions?.push(systemHealthSubscription);

    // Subscribe to OHLC changes
    const ohlcSubscription = supabase?.channel('ohlc_changes')?.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ohlc' }, 
        payload => {
          if (['AAPL', 'MSFT', 'GOOGL']?.includes(payload?.new?.symbol) && payload?.new?.tf === '1m') {
            setOhlcData(prev => [payload?.new, ...prev?.slice(0, 49)]);
          }
        })?.subscribe();

    subscriptions?.push(ohlcSubscription);

    return () => {
      subscriptions?.forEach(subscription => {
        supabase?.removeChannel(subscription);
      });
    };
  }, []);

  const handleAgentToggle = async (agentId, newStatus) => {
    try {
      const { error } = await supabase?.from('ai_agents')?.update({ 
          agent_status: newStatus,
          last_active_at: newStatus === 'active' ? new Date()?.toISOString() : null
        })?.eq('id', agentId);

      if (error) throw error;

      // Update local state
      setAgents(prev => prev?.map(agent => 
        agent?.id === agentId 
          ? { ...agent, agent_status: newStatus, last_active_at: newStatus === 'active' ? new Date()?.toISOString() : agent?.last_active_at }
          : agent
      ));

      // Create event bus entry for agent status change
      await supabase?.from('event_bus')?.insert({
          event_type: 'system_status',
          event_data: {
            agent_id: agentId,
            status_change: newStatus,
            timestamp: new Date()?.toISOString(),
            source: 'live_trading_orchestration_center'
          },
          source_agent_id: agentId,
          priority: 'high'
        });

    } catch (error) {
      console.error('Error updating agent status:', error);
    }
  };

  const handleEmergencyStop = async () => {
    try {
      // Set all agents to inactive
      const { error: agentsError } = await supabase?.from('ai_agents')?.update({ agent_status: 'inactive' })?.in('name', ['Data Phoenix', 'Quant Oracle', 'Strategy Weaver']);

      if (agentsError) throw agentsError;

      // Update orchestrator state
      const { error: stateError } = await supabase?.from('orchestrator_state')?.upsert({
          key: 'emergency_stop',
          value: {
            triggered: true,
            timestamp: new Date()?.toISOString(),
            reason: 'manual_trigger'
          }
        });

      if (stateError) throw stateError;

      // Create emergency stop event
      await supabase?.from('event_bus')?.insert({
          event_type: 'system_status',
          event_data: {
            action: 'emergency_stop',
            timestamp: new Date()?.toISOString(),
            affected_agents: ['Data Phoenix', 'Quant Oracle', 'Strategy Weaver']
          },
          priority: 'critical'
        });

      // Update local state
      setAgents(prev => prev?.map(agent => ({ ...agent, agent_status: 'inactive' })));

    } catch (error) {
      console.error('Error triggering emergency stop:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading Live Trading Orchestration Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-400">Live Trading Orchestration Center</h1>
            <p className="text-gray-400 mt-1">
              Real-time management and monitoring of production AI agents with NATS/Redis messaging orchestration
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Live Ready</span>
            </div>
            <button
              onClick={handleEmergencyStop}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
            >
              Emergency Stop
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="flex h-screen">
        {/* Left Column - Agent Activation Panel */}
        <div className="w-1/3 border-r border-gray-700 overflow-y-auto">
          <AgentActivationPanel
            agents={agents}
            agentStates={agentStates}
            systemHealth={systemHealth}
            providersStatus={providersStatus}
            onAgentToggle={handleAgentToggle}
          />
        </div>

        {/* Center Column - NATS/Redis Messaging Hub */}
        <div className="w-1/3 border-r border-gray-700 overflow-y-auto">
          <NatsRedisMessagingHub
            eventBusData={eventBusData}
            agents={agents}
            orchestratorState={orchestratorState}
          />
        </div>

        {/* Right Column - Live Trading Dashboard */}
        <div className="w-1/3 overflow-y-auto">
          <LiveTradingDashboard
            agents={agents}
            systemHealth={systemHealth}
            ohlcData={ohlcData}
            orchestratorState={orchestratorState}
            providersStatus={providersStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveTradingOrchestrationCenter;