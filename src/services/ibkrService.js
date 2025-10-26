import { supabase } from '../lib/supabase';

export const ibkrService = {
  // Enhanced connection retrieval with error handling
  async getConnection(userId) {
    if (!userId) {
      console.warn('No user ID provided for IBKR connection');
      return null;
    }
    
    try {
      // First check if supabase is available
      if (!supabase) {
        console.warn('Supabase not available, returning mock IBKR connection');
        return {
          id: 'mock-ibkr-connection',
          user_id: userId,
          trading_mode: 'paper',
          host: '127.0.0.1',
          port: 7497,
          client_id: 42,
          is_active: true,
          connection_status: 'mock',
          is_mock: true
        };
      }

      const { data, error } = await supabase
        ?.from('ibkr_connections')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.eq('is_active', true)
        ?.single();

      if (error && error?.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('IBKR connection query error:', error);
        
        // Return safe mock data instead of throwing
        return {
          id: 'error-fallback-connection',
          user_id: userId,
          trading_mode: 'paper',
          host: '127.0.0.1',
          port: 7497,
          client_id: 42,
          is_active: false,
          connection_status: 'error',
          error_message: error?.message,
          is_error_fallback: true
        };
      }

      return data || null;
    } catch (error) {
      console.error('IBKR connection service error:', error);
      
      // Always return safe fallback to prevent app crashes
      return {
        id: 'exception-fallback-connection',
        user_id: userId,
        trading_mode: 'paper',
        host: '127.0.0.1',
        port: 7497,
        client_id: 42,
        is_active: false,
        connection_status: 'exception',
        error_message: error?.message,
        is_exception_fallback: true
      };
    }
  },

  // Create or update IBKR connection
  async saveConnection(userId, connectionData) {
    if (!userId) throw new Error('User ID est requis');
    
    try {
      const existingConnection = await this.getConnection(userId);
      
      const connectionPayload = {
        user_id: userId,
        trading_mode: connectionData?.tradingMode || 'paper',host: connectionData?.host || '127.0.0.1',
        port: connectionData?.tradingMode === 'live' ? 7496 : 7497,
        client_id: connectionData?.clientId || 42,
        connection_settings: {
          auto_connect: connectionData?.autoConnect || false,
          timeout_seconds: connectionData?.timeoutSeconds || 10,
          retry_attempts: connectionData?.retryAttempts || 3,
          ...connectionData?.settings
        },
        is_active: true
      };

      let result;
      if (existingConnection) {
        const { data, error } = await supabase?.from('ibkr_connections')?.update({
            ...connectionPayload,
            updated_at: new Date()?.toISOString()
          })?.eq('id', existingConnection?.id)?.select()?.single();

        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase?.from('ibkr_connections')?.insert(connectionPayload)?.select()?.single();

        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      throw new Error(`Erreur sauvegarde connexion IBKR: ${error?.message}`);
    }
  },

  // Enhanced status update with error handling
  async updateConnectionStatus(connectionId, status, errorMessage = null, latency = null) {
    try {
      if (!supabase) {
        console.warn('Supabase not available, cannot update IBKR connection status');
        return { success: false, reason: 'supabase_unavailable' };
      }

      const { error } = await supabase?.rpc('update_ibkr_connection_status', {
        connection_uuid: connectionId,
        new_status: status,
        error_message: errorMessage,
        latency_value: latency
      });

      if (error) {
        console.error('IBKR status update error:', error);
        return { success: false, error: error?.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('IBKR status update exception:', error);
      return { success: false, error: error?.message };
    }
  },

  // Test IBKR connection
  async testConnection(connectionData) {
    const startTime = Date.now();
    
    try {
      // Simulate connection test to IBKR Gateway
      // In a real implementation, this would connect to IB Gateway
      const host = connectionData?.host || '127.0.0.1';
      const port = connectionData?.tradingMode === 'live' ? 7496 : 7497;
      
      // Mock connection test with timeout
      const testPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random success/failure for demonstration
          const isSuccess = Math.random() > 0.3; // 70% success rate
          
          if (isSuccess) {
            resolve({
              status: 'connected',
              latency: Date.now() - startTime,
              serverTime: new Date().toISOString(),
              tradingMode: connectionData?.tradingMode || 'paper'
            });
          } else {
            reject(new Error('Impossible de se connecter à IB Gateway. Vérifiez que TWS/Gateway est démarré.'));
          }
        }, 1000 + Math.random() * 2000); // Random delay 1-3s
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout de connexion - IB Gateway ne répond pas'));
        }, (connectionData?.timeoutSeconds || 10) * 1000);
      });

      return await Promise.race([testPromise, timeoutPromise]);
      
    } catch (error) {
      throw new Error(`Test de connexion échoué: ${error?.message}`);
    }
  },

  // Enhanced market data with error handling
  async getMarketData(symbols = []) {
    try {
      // Mock market data that would come from IBKR
      const mockData = symbols?.map(symbol => ({
        symbol,
        bid: (100 + Math.random() * 100)?.toFixed(2),
        ask: (100.05 + Math.random() * 100)?.toFixed(2),
        last: (100.02 + Math.random() * 100)?.toFixed(2),
        volume: Math.floor(Math.random() * 1000000),
        timestamp: new Date()?.toISOString(),
        source: 'IBKR'
      }));

      return {
        success: true,
        data: mockData,
        timestamp: new Date()?.toISOString()
      };
    } catch (error) {
      console.error('IBKR market data error:', error);
      
      // Return empty data instead of throwing
      return {
        success: false,
        data: [],
        error: error?.message,
        timestamp: new Date()?.toISOString()
      };
    }
  },

  // Place order via IBKR (mock implementation)
  async placeOrder(userId, orderData) {
    if (!userId) throw new Error('User ID est requis');
    
    try {
      // Get user's IBKR connection
      const connection = await this.getConnection(userId);
      if (!connection || connection?.connection_status !== 'connected') {
        throw new Error('Connexion IBKR requise pour passer des ordres');
      }

      // Mock order placement
      const order = {
        symbol: orderData?.symbol,
        action: orderData?.side, // BUY/SELL
        orderType: orderData?.orderType || 'MKT',
        quantity: orderData?.quantity,
        price: orderData?.price,
        tif: 'DAY', // Time in Force
        account: connection?.trading_mode === 'live' ? 'LIVE' : 'PAPER',
        orderId: Math.floor(Math.random() * 1000000),
        status: 'Submitted'
      };

      // Store in existing orders table with IBKR broker info
      const { data: savedOrder, error } = await supabase?.from('orders')?.insert({
          user_id: userId,
          asset_id: null, // Would need to map symbol to asset_id
          order_type: orderData?.orderType?.toLowerCase() || 'market',
          order_side: orderData?.side?.toLowerCase(),
          quantity: orderData?.quantity,
          price: orderData?.price,
          broker_info: {
            broker: 'IBKR',
            connection_id: connection?.id,
            ibkr_order_id: order?.orderId,
            trading_mode: connection?.trading_mode,
            order_details: order
          },
          external_order_id: order?.orderId?.toString()
        })?.select()?.single();

      if (error) throw error;

      return {
        success: true,
        order: {
          ...order,
          internalOrderId: savedOrder?.id
        }
      };
    } catch (error) {
      throw new Error(`Erreur passage d'ordre IBKR: ${error?.message}`);
    }
  },

  // Get account info (mock implementation)
  async getAccountInfo(userId) {
    try {
      const connection = await this.getConnection(userId);
      if (!connection) {
        throw new Error('Aucune connexion IBKR configurée');
      }

      // Mock account info
      return {
        accountId: connection?.trading_mode === 'live' ? 'U123456' : 'DU123456',
        tradingMode: connection?.trading_mode,
        netLiquidation: connection?.trading_mode === 'live' ? 25000.00 : 1000000.00,
        availableFunds: connection?.trading_mode === 'live' ? 22500.00 : 950000.00,
        buyingPower: connection?.trading_mode === 'live' ? 90000.00 : 3800000.00,
        currency: 'USD',
        timestamp: new Date()?.toISOString()
      };
    } catch (error) {
      throw new Error(`Erreur info compte IBKR: ${error?.message}`);
    }
  },

  // Get IBKR system status
  async getIBKRStatus() {
    try {
      if (!supabase) {
        return {
          gateway_paper: {
            status: 'mock',
            endpoint: '127.0.0.1:7497'
          },
          gateway_live: {
            status: 'mock',
            endpoint: '127.0.0.1:7496'
          },
          lastUpdated: new Date()?.toISOString(),
          is_mock: true
        };
      }

      // Check IBKR API configs
      const { data: configs, error } = await supabase?.from('external_api_configs')?.select('*')?.like('api_name', 'ibkr_%');

      if (error) {
        console.error('IBKR status query error:', error);
        return {
          gateway_paper: {
            status: 'error',
            endpoint: '127.0.0.1:7497',
            error: error?.message
          },
          gateway_live: {
            status: 'error',
            endpoint: '127.0.0.1:7496',
            error: error?.message
          },
          lastUpdated: new Date()?.toISOString(),
          is_error_fallback: true
        };
      }

      return {
        gateway_paper: {
          status: configs?.find(c => c?.api_name === 'ibkr_gateway_paper')?.is_active ? 'available' : 'inactive',
          endpoint: '127.0.0.1:7497'
        },
        gateway_live: {
          status: configs?.find(c => c?.api_name === 'ibkr_gateway_live')?.is_active ? 'available' : 'inactive',
          endpoint: '127.0.0.1:7496'
        },
        lastUpdated: new Date()?.toISOString()
      };
    } catch (error) {
      console.error('IBKR status service error:', error);
      
      return {
        gateway_paper: {
          status: 'exception',
          endpoint: '127.0.0.1:7497',
          error: error?.message
        },
        gateway_live: {
          status: 'exception',
          endpoint: '127.0.0.1:7496',
          error: error?.message
        },
        lastUpdated: new Date()?.toISOString(),
        is_exception_fallback: true
      };
    }
  }
};
export function ibkrConnect(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: ibkrConnect is not implemented yet.', args);
  return null;
}

export function ibkrDisconnect(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: ibkrDisconnect is not implemented yet.', args);
  return null;
}

export function ibkrSubscribe(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: ibkrSubscribe is not implemented yet.', args);
  return null;
}
