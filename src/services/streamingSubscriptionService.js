import { supabase } from '../lib/supabase';

class StreamingSubscriptionService {
  constructor() {
    this.activeSubscriptions = new Map();
    this.websocketUrl = import.meta.env?.VITE_WS_URL || 'wss://localhost:8088';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Get active streaming subscriptions
  async getActiveSubscriptions() {
    try {
      const { data, error } = await supabase?.from('streaming_subscriptions')?.select(`
          *,
          asset:assets!inner(symbol, name, exchange)
        `)?.eq('is_active', true)?.order('subscription_start', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data?.map(sub => ({
          id: sub?.id,
          symbol: sub?.asset?.symbol,
          name: sub?.asset?.name,
          exchange: sub?.asset?.exchange,
          subscriptionType: sub?.subscription_type,
          timeframe: sub?.timeframe,
          clientId: sub?.client_id,
          isActive: sub?.is_active,
          lastDataReceived: sub?.last_data_received,
          dataPointsReceived: sub?.data_points_received || 0,
          errorCount: sub?.error_count || 0,
          subscriptionStart: sub?.subscription_start
        })) || []
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch active subscriptions'
      };
    }
  }

  // Create streaming subscription
  async createSubscription(symbol, subscriptionType, options = {}) {
    try {
      // Get asset ID
      const { data: asset, error: assetError } = await supabase?.from('assets')?.select('id')?.eq('symbol', symbol)?.single();

      if (assetError || !asset) {
        throw new Error(`Asset ${symbol} not found`);
      }

      const { timeframe, clientId } = options;

      const { data, error } = await supabase?.from('streaming_subscriptions')?.insert({
          asset_id: asset?.id,
          subscription_type: subscriptionType,
          timeframe: timeframe || null,
          client_id: clientId || `client_${Date.now()}`,
          is_active: true,
          websocket_channel: `${subscriptionType}_${symbol}_${timeframe || 'realtime'}`
        })?.select()?.single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: {
          subscriptionId: data?.id,
          symbol,
          subscriptionType,
          timeframe,
          channel: data?.websocket_channel,
          message: `Subscription created for ${symbol} ${subscriptionType}`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to create subscription'
      };
    }
  }

  // Cancel streaming subscription
  async cancelSubscription(subscriptionId) {
    try {
      const { data, error } = await supabase?.from('streaming_subscriptions')?.update({
          is_active: false,
          subscription_end: new Date()?.toISOString()
        })?.eq('id', subscriptionId)?.select()?.single();

      if (error) {
        throw error;
      }

      // Remove from active subscriptions map
      this.activeSubscriptions?.delete(subscriptionId);

      return {
        success: true,
        data: `Subscription ${subscriptionId} cancelled successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to cancel subscription'
      };
    }
  }

  // Connect to WebSocket stream
  async connectToWebSocket(symbols, subscriptionType = 'quotes', timeframe = '1m') {
    try {
      const symbolString = Array.isArray(symbols) ? symbols?.join(',') : symbols;
      const wsUrl = `${this.websocketUrl}/quotes?symbols=${symbolString}&tf=${timeframe}`;

      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log(`🔗 WebSocket connected for ${symbolString}`);
        this.reconnectAttempts = 0;
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event?.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      websocket.onclose = () => {
        console.log('🔌 WebSocket connection closed');
        this.handleWebSocketReconnect(symbols, subscriptionType, timeframe);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return {
        success: true,
        websocket,
        data: `WebSocket connection initiated for ${symbolString}`
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'WebSocket connection failed'
      };
    }
  }

  // Handle WebSocket messages
  handleWebSocketMessage(data) {
    const { symbol, price, timestamp, provider_used, volume } = data;

    // Update subscription stats
    this.updateSubscriptionStats(symbol);

    // Emit custom event for UI components
    window.dispatchEvent(new CustomEvent('websocket-quote', {
      detail: {
        symbol,
        price: parseFloat(price),
        timestamp,
        provider: provider_used,
        volume: parseInt(volume || 0)
      }
    }));
  }

  // Update subscription statistics
  async updateSubscriptionStats(symbol) {
    try {
      const { error } = await supabase?.from('streaming_subscriptions')?.update({
          last_data_received: new Date()?.toISOString(),
          data_points_received: supabase?.raw('data_points_received + 1')
        })?.eq('asset.symbol', symbol)?.eq('is_active', true);

      if (error) {
        console.error('Failed to update subscription stats:', error);
      }
    } catch (error) {
      console.error('Subscription stats update error:', error);
    }
  }

  // Handle WebSocket reconnection
  handleWebSocketReconnect(symbols, subscriptionType, timeframe) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`🔄 Attempting WebSocket reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connectToWebSocket(symbols, subscriptionType, timeframe);
      }, delay);
    } else {
      console.error('❌ Max WebSocket reconnection attempts reached');
    }
  }

  // Get subscription statistics
  async getSubscriptionStats() {
    try {
      const { data, error } = await supabase?.from('streaming_subscriptions')?.select(`
          subscription_type,
          COUNT(*) as total_subscriptions,
          COUNT(*) FILTER (WHERE is_active = true) as active_subscriptions,
          AVG(data_points_received) as avg_data_points,
          SUM(error_count) as total_errors
        `);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: {
          totalSubscriptions: data?.reduce((sum, item) => sum + parseInt(item?.total_subscriptions), 0) || 0,
          activeSubscriptions: data?.reduce((sum, item) => sum + parseInt(item?.active_subscriptions), 0) || 0,
          avgDataPoints: data?.[0]?.avg_data_points || 0,
          totalErrors: data?.reduce((sum, item) => sum + parseInt(item?.total_errors || 0), 0),
          byType: data?.map(item => ({
            type: item?.subscription_type,
            total: parseInt(item?.total_subscriptions),
            active: parseInt(item?.active_subscriptions)
          })) || []
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to get subscription stats'
      };
    }
  }

  // Test streaming connection
  async testStreamingConnection(symbol = 'AAPL') {
    try {
      const testResult = await this.connectToWebSocket([symbol], 'quotes', '1m');
      
      if (!testResult?.success) {
        return testResult;
      }

      // Test for 5 seconds
      return new Promise((resolve) => {
        let messagesReceived = 0;
        const startTime = Date.now();

        const messageHandler = (event) => {
          messagesReceived++;
        };

        window.addEventListener('websocket-quote', messageHandler);

        setTimeout(() => {
          window.removeEventListener('websocket-quote', messageHandler);
          testResult?.websocket?.close();
          
          resolve({
            success: true,
            data: {
              testDuration: '5 seconds',
              messagesReceived,
              averageLatency: messagesReceived > 0 ? Math.round((Date.now() - startTime) / messagesReceived) : 0,
              connectionStatus: messagesReceived > 0 ? 'working' : 'no_data'
            }
          });
        }, 5000);
      });
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Streaming connection test failed'
      };
    }
  }

  // Subscribe to subscription updates
  subscribeToSubscriptionUpdates(callback) {
    const subscription = supabase?.channel('subscription_updates')?.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'streaming_subscriptions'
      }, callback)?.subscribe();

    return subscription;
  }

  // Get supported subscription types
  getSupportedSubscriptionTypes() {
    return [
      { value: 'quotes', label: 'Real-time Quotes', description: 'Live price updates' },
      { value: 'trades', label: 'Trade Data', description: 'Individual trade executions' },
      { value: 'orderbook', label: 'Order Book', description: 'Bid/ask levels' },
      { value: 'ohlc', label: 'OHLC Bars', description: 'Time-based price bars' }
    ];
  }

  // Cleanup all subscriptions
  async cleanupSubscriptions() {
    this.activeSubscriptions?.clear();
    this.reconnectAttempts = 0;
    
    return {
      success: true,
      data: 'All subscriptions cleaned up'
    };
  }
}

export const streamingSubscriptionService = new StreamingSubscriptionService();
export default streamingSubscriptionService;