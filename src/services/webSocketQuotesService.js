import { supabase } from '../lib/supabase';
import { 
  startQuotesFeed, 
  stopQuotesFeed, 
  getConnectionState, 
  isConnectionHealthy, 
  getLastHeartbeat 
} from '../lib/quotesSocket';

class WebSocketQuotesService {
  constructor() {
    this.wsConnection = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.subscribers = new Set();
    this.healthCheckInterval = null;
  }

  // 🎯 PERF++ IMPROVEMENT: Enhanced real-time feed with health monitoring
  startRealTimeFeed(onTickCallback) {
    try {
      startQuotesFeed((tickData) => {
        // Process IBKR tick data and store in Supabase
        this.processTickData(tickData);
        
        // Notify subscribers
        this.subscribers?.forEach(callback => {
          try {
            callback(tickData);
          } catch (error) {
            console.warn('[WebSocketQuotes] Subscriber callback error:', error);
          }
        });
        
        // Call user callback
        if (onTickCallback) {
          onTickCallback(tickData);
        }
      });
      
      this.isConnected = true;
      this.startHealthMonitoring();
      console.log('[WebSocketQuotes] Real-time IBKR feed started with health monitoring');
    } catch (error) {
      console.warn('[WebSocketQuotes] Failed to start real-time feed:', error);
    }
  }

  // 🎯 PERF++ IMPROVEMENT: Health monitoring integration
  startHealthMonitoring() {
    // Check connection health every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.checkConnectionHealth();
    }, 30000);
  }

  async checkConnectionHealth() {
    try {
      const isHealthy = isConnectionHealthy();
      const connectionState = getConnectionState();
      const lastHeartbeat = getLastHeartbeat();
      
      // Update WebSocket health in database
      await this.updateConnectionHealth(isHealthy, connectionState, lastHeartbeat);
      
      if (!isHealthy) {
        console.warn('[WebSocketQuotes] Connection unhealthy, health metrics updated');
      }
    } catch (error) {
      console.warn('[WebSocketQuotes] Health check failed:', error);
    }
  }

  async updateConnectionHealth(isHealthy, connectionState, lastHeartbeat) {
    try {
      // Find active WebSocket connections and update their status
      const { data: connections } = await supabase
        ?.from('websocket_connections')
        ?.select('id')
        ?.eq('is_active', true)
        ?.limit(1);

      if (connections?.length > 0) {
        await supabase?.from('websocket_connections')?.update({
          is_active: isHealthy,
          last_ping: new Date(lastHeartbeat)?.toISOString()
        })?.eq('id', connections?.[0]?.id);
      }
    } catch (error) {
      console.warn('[WebSocketQuotes] Connection health update failed:', error);
    }
  }

  // Process and store tick data with enhanced error handling
  async processTickData(tickData) {
    try {
      // Only process price ticks for market data storage
      if (tickData?.t === 'tickPrice' && tickData?.price) {
        await this.updateMarketData(tickData);
      }
    } catch (error) {
      console.warn('[WebSocketQuotes] Error processing tick data:', error);
    }
  }

  // Update market data in Supabase with improved error handling
  async updateMarketData(tickData) {
    try {
      // Map tickerId to symbol (this would need a lookup table in production)
      const symbol = this.getSymbolFromTickerId(tickData?.tickerId);
      if (!symbol) return;

      // Get asset ID from symbol
      const { data: asset } = await supabase
        ?.from('assets')
        ?.select('id')
        ?.eq('symbol', symbol)
        ?.single();

      if (!asset) return;

      // Insert real-time market data
      await supabase?.from('market_data')?.insert({
        asset_id: asset?.id,
        timestamp: new Date(tickData.ts)?.toISOString(),
        close_price: tickData?.price,
        api_provider: 'ibkr',
        is_real_time: true,
        data_source: 'websocket'
      });

    } catch (error) {
      // Don't log as error - this is expected behavior for data updates
    }
  }

  // Enhanced symbol mapping
  getSymbolFromTickerId(tickerId) {
    const symbolMap = {
      1000: 'AAPL',
      1001: 'MSFT', 
      1002: 'SPY',
      1003: 'EUR',
      1004: 'ESZ5'
    };
    return symbolMap?.[tickerId];
  }

  // Subscribe to tick updates
  subscribe(callback) {
    this.subscribers?.add(callback);
    return () => this.subscribers?.delete(callback);
  }

  // Stop real-time feed with cleanup
  stopRealTimeFeed() {
    try {
      stopQuotesFeed();
      
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }
      
      this.isConnected = false;
      this.subscribers?.clear();
      console.log('[WebSocketQuotes] Real-time feed stopped');
    } catch (error) {
      console.warn('[WebSocketQuotes] Error stopping feed:', error);
    }
  }

  // 🎯 PERF++ IMPROVEMENT: Enhanced WebSocket health with DHI integration
  async getWebSocketHealth() {
    try {
      const { data, error } = await supabase?.from('system_health')?.select(`
          *,
          agent:ai_agents(name, agent_type)
        `)?.eq('health_status', 'healthy')?.order('last_heartbeat', { ascending: false });

      if (error) {
        throw error;
      }

      // Include connection health metrics
      const connectionHealth = {
        isHealthy: isConnectionHealthy(),
        lastHeartbeat: getLastHeartbeat(),
        connectionState: getConnectionState(),
        subscriberCount: this.subscribers?.size || 0
      };

      return {
        success: true,
        connectionHealth,
        systemHealth: data?.map(health => ({
          id: health?.id,
          agentName: health?.agent?.name || 'WebSocket Server',
          status: health?.health_status,
          cpuUsage: health?.cpu_usage,
          memoryUsage: health?.memory_usage,
          uptime: health?.uptime_seconds,
          lastHeartbeat: health?.last_heartbeat,
          errorCount: health?.error_count,
          warningCount: health?.warning_count
        })) || []
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch WebSocket health'
      };
    }
  }

  // Get active market data streams with enhanced filtering
  async getActiveStreams() {
    try {
      const { data, error } = await supabase?.from('market_data')?.select(`
          *,
          asset:assets(symbol, name, is_active, sync_enabled)
        `)?.eq('is_real_time', true)?.order('timestamp', { ascending: false })?.limit(100);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data?.map(marketData => ({
          id: marketData?.id,
          symbol: marketData?.asset?.symbol,
          name: marketData?.asset?.name,
          price: marketData?.close_price,
          volume: marketData?.volume,
          timestamp: marketData?.timestamp,
          provider: marketData?.api_provider,
          isActive: marketData?.asset?.sync_enabled,
          spread: marketData?.spread,
          changePercent: marketData?.change_percent
        })) || []
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch active streams'
      };
    }
  }

  // Get enhanced connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isHealthy: isConnectionHealthy(),
      wsState: getConnectionState(),
      lastHeartbeat: getLastHeartbeat(),
      subscriberCount: this.subscribers?.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Real-time subscriptions with enhanced monitoring
  subscribeToMarketData(callback) {
    const subscription = supabase?.channel('market_data_channel')?.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'market_data'
      }, callback)?.subscribe();

    return subscription;
  }

  subscribeToSystemHealth(callback) {
    const subscription = supabase?.channel('system_health_channel')?.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'system_health'
      }, callback)?.subscribe();

    return subscription;
  }

  // 🎯 PERF++ IMPROVEMENT: Data Health Index integration
  async getDataHealthIndex() {
    try {
      const { data, error } = await supabase?.from('data_health_index')?.select('*')?.order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data?.map(dhi => ({
          stream: dhi?.stream,
          dhi: dhi?.dhi,
          timeliness: dhi?.timeliness,
          consistency: dhi?.consistency,
          completeness: dhi?.completeness,
          coverage: dhi?.coverage,
          updatedAt: dhi?.updated_at
        })) || []
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch Data Health Index'
      };
    }
  }
}

export const webSocketQuotesService = new WebSocketQuotesService();
export default webSocketQuotesService;