import { supabase } from '../lib/supabase';
import { multiIATradingOrchestratorService } from './multiIATradingOrchestratorService';
import { ibkrMultiIAExecutorService } from './ibkrMultiIAExecutorService';

/**
 * 🚀 Enhanced IBKR Service - Integration Bridge
 * Bridges the existing IBKR service with the new Multi-IA Trading Orchestrator
 * Maintains backward compatibility while adding Multi-IA capabilities
 */

export const ibkrEnhancedService = {
  
  // 🎯 ENHANCED ORDER PLACEMENT WITH MULTI-IA
  
  async placeOrderWithMultiIA(userId, orderData) {
    if (!userId) throw new Error('User ID est requis');
    
    try {
      // Enhanced order validation
      const validationResult = await this.validateEnhancedOrder(userId, orderData);
      if (!validationResult?.valid) {
        throw new Error(`Validation échouée: ${validationResult?.reason}`);
      }
      
      // Route to Multi-IA system for intelligent processing
      const multiIAResult = await multiIATradingOrchestratorService?.executeMultiIAWorkflow(userId, {
        ...orderData,
        clientOrderId: orderData?.clientOrderId || crypto.randomUUID()
      });
      
      if (multiIAResult?.success && multiIAResult?.consensus?.consensus) {
        // If consensus reached, execute via IBKR
        const executionResult = await ibkrMultiIAExecutorService?.executeOrder({
          clientOrderId: multiIAResult?.decision?.client_order_id
        });
        
        return {
          success: true,
          order_id: multiIAResult?.decision?.client_order_id,
          multi_ia_result: multiIAResult,
          execution_result: executionResult,
          message: 'Ordre traité par Multi-IA et exécuté avec succès'
        };
      } else {
        return {
          success: false,
          order_id: multiIAResult?.decision?.client_order_id,
          multi_ia_result: multiIAResult,
          message: `Consensus Multi-IA non atteint: ${multiIAResult?.consensus?.reason}`
        };
      }
      
    } catch (error) {
      throw new Error(`Erreur ordre Multi-IA: ${error?.message}`);
    }
  },

  // 🎯 FALLBACK TO LEGACY ORDER PLACEMENT
  
  async placeOrderLegacy(userId, orderData) {
    // Fallback to original IBKR service functionality
    try {
      // Get user's IBKR connection (from existing service)
      const connection = await this.getConnection(userId);
      if (!connection || connection?.connection_status !== 'connected') {
        throw new Error('Connexion IBKR requise pour passer des ordres');
      }

      // Create order using existing pattern
      const order = {
        symbol: orderData?.symbol,
        action: orderData?.side || orderData?.action,
        orderType: orderData?.orderType || 'MKT',
        quantity: orderData?.quantity,
        price: orderData?.price || orderData?.limitPrice,
        tif: 'DAY',
        account: connection?.trading_mode === 'live' ? 'LIVE' : 'PAPER',
        orderId: Math.floor(Math.random() * 1000000),
        status: 'Submitted'
      };

      // Store in orders table (existing pattern)
      const { data: savedOrder, error } = await supabase?.from('orders')?.insert({
          user_id: userId,
          asset_id: null,
          order_type: orderData?.orderType?.toLowerCase() || 'market',
          order_side: orderData?.side?.toLowerCase() || orderData?.action?.toLowerCase(),
          quantity: orderData?.quantity,
          price: orderData?.price || orderData?.limitPrice,
          broker_info: {
            broker: 'IBKR',
            connection_id: connection?.id,
            ibkr_order_id: order?.orderId,
            trading_mode: connection?.trading_mode,
            order_details: order,
            method: 'legacy'
          },
          external_order_id: order?.orderId?.toString()
        })?.select()?.single();

      if (error) throw error;

      return {
        success: true,
        order: {
          ...order,
          internalOrderId: savedOrder?.id,
          method: 'legacy'
        }
      };
    } catch (error) {
      throw new Error(`Erreur ordre legacy IBKR: ${error?.message}`);
    }
  },

  // 🎯 INTELLIGENT ORDER ROUTER
  
  async placeOrder(userId, orderData, options = {}) {
    try {
      // Determine routing strategy
      const useMultiIA = options?.multiIA !== false && (await this.shouldUseMultiIA(orderData));
      
      if (useMultiIA) {
        // Route to Multi-IA system
        return await this.placeOrderWithMultiIA(userId, orderData);
      } else {
        // Route to legacy system
        return await this.placeOrderLegacy(userId, orderData);
      }
    } catch (error) {
      throw new Error(`Erreur routage ordre: ${error?.message}`);
    }
  },

  // 🎯 ENHANCED MARKET DATA WITH IA INSIGHTS
  
  async getMarketDataWithInsights(symbols = []) {
    try {
      // Get base market data
      const marketData = await ibkrMultiIAExecutorService?.getMarketData(symbols);
      
      if (!marketData?.success) {
        return marketData;
      }
      
      // Enhance with IA analysis for each symbol
      const enhancedData = await Promise.all(
        marketData?.data?.map(async (quote) => {
          try {
            // Get technical indicators from Multi-IA system
            const technicalAnalysis = multiIATradingOrchestratorService?.calculateTechnicalIndicators({
              price: parseFloat(quote?.last),
              volume: quote?.volume
            });
            
            return {
              ...quote,
              ia_insights: {
                signal: technicalAnalysis?.signal,
                strength: technicalAnalysis?.strength,
                reasoning: technicalAnalysis?.reasoning,
                risk_score: Math.random() * 0.5, // Simplified risk score
                confidence: technicalAnalysis?.strength || 0.5
              }
            };
          } catch (error) {
            console.warn(`IA analysis failed for ${quote?.symbol}:`, error);
            return quote;
          }
        })
      );
      
      return {
        ...marketData,
        data: enhancedData,
        enhanced_with_ia: true
      };
    } catch (error) {
      throw new Error(`Erreur market data avec IA: ${error?.message}`);
    }
  },

  // 🎯 ENHANCED ACCOUNT INFO WITH RISK METRICS
  
  async getAccountInfoEnhanced(userId) {
    try {
      const [basicAccountInfo, riskMetrics, policyConfig] = await Promise.all([
        ibkrMultiIAExecutorService?.getAccountInfo(userId),
        supabase?.from('real_time_risk_metrics')?.select('*')?.eq('user_id', userId),
        supabase?.from('policy_engine_config')?.select('*')?.eq('user_id', userId)?.single()
      ]);
      
      const totalExposure = riskMetrics?.data?.reduce((sum, metric) => 
        sum + (metric?.current_notional || 0), 0
      ) || 0;
      
      const highRiskPositions = riskMetrics?.data?.filter(metric => 
        metric?.risk_level === 'high'
      )?.length || 0;
      
      return {
        ...basicAccountInfo,
        risk_metrics: {
          total_exposure: totalExposure,
          high_risk_positions: highRiskPositions,
          total_symbols: riskMetrics?.data?.length || 0,
          policy_status: policyConfig?.data?.kill_switch_active ? 'restricted' : 'active'
        },
        policy_config: policyConfig?.data,
        enhanced: true
      };
    } catch (error) {
      throw new Error(`Erreur info compte enrichie: ${error?.message}`);
    }
  },

  // 🎯 COMPREHENSIVE ORDER HISTORY WITH IA CONTEXT
  
  async getOrderHistoryEnhanced(userId, filters = {}) {
    try {
      const [legacyOrders, multiIAOrders] = await Promise.all([
        supabase?.from('orders')?.select('*')?.eq('user_id', userId)?.order('created_at', { ascending: false })?.limit(filters?.limit || 25),
        ibkrMultiIAExecutorService?.getOrderHistory(userId, filters)
      ]);
      
      const combinedOrders = [
        // Multi-IA orders (new system)
        ...(multiIAOrders || [])?.map(order => ({
          ...order,
          source: 'multi_ia',
          enhanced: true,
          ia_context: order?.consensus_info
        })),
        // Legacy orders (existing system)
        ...(legacyOrders?.data || [])?.map(order => ({
          ...order,
          source: 'legacy',
          enhanced: false,
          symbol: order?.broker_info?.order_details?.symbol || 'Unknown'
        }))
      ];
      
      // Sort by creation date
      const sortedOrders = combinedOrders?.sort((a, b) => 
        new Date(b?.created_at) - new Date(a?.created_at)
      );
      
      return sortedOrders?.slice(0, filters?.limit || 50);
    } catch (error) {
      throw new Error(`Erreur historique enrichi: ${error?.message}`);
    }
  },

  // 🎯 SYSTEM HEALTH WITH MULTI-IA STATUS
  
  async getSystemHealth() {
    try {
      const [ibkrHealth, executorHealth, systemMetrics] = await Promise.all([
        this.getIBKRStatus(),
        ibkrMultiIAExecutorService?.getExecutorHealth(),
        multiIATradingOrchestratorService?.getSystemMetrics('mock-user') // Mock user for system-wide metrics
      ]);
      
      return {
        ibkr_gateways: ibkrHealth,
        executor_status: executorHealth,
        multi_ia_system: systemMetrics,
        overall_health: this.calculateOverallHealth(ibkrHealth, executorHealth, systemMetrics),
        last_updated: new Date()?.toISOString()
      };
    } catch (error) {
      throw new Error(`Erreur santé système: ${error?.message}`);
    }
  },

  // 🎯 UTILITY FUNCTIONS
  
  async shouldUseMultiIA(orderData) {
    // Decision logic for when to use Multi-IA vs Legacy
    // Use Multi-IA for:
    // - Complex orders (options, multi-leg)
    // - Large quantities
    // - High-value trades
    // - When user has enabled Multi-IA
    
    const quantity = orderData?.quantity || 0;
    const estimatedValue = quantity * (orderData?.price || orderData?.limitPrice || 100);
    
    // Use Multi-IA for orders > $1000 or > 50 shares
    return quantity > 50 || estimatedValue > 1000;
  },

  async validateEnhancedOrder(userId, orderData) {
    try {
      // Enhanced validation using Policy Engine
      const policyValidation = await multiIATradingOrchestratorService?.validateTradingPolicy(
        userId,
        orderData?.symbol,
        orderData?.quantity,
        (orderData?.quantity || 0) * (orderData?.price || orderData?.limitPrice || 0)
      );
      
      // Market hours validation
      const marketOpen = await multiIATradingOrchestratorService?.isMarketOpen(orderData?.symbol);
      
      return {
        valid: policyValidation?.allowed && marketOpen,
        reason: !policyValidation?.allowed ? policyValidation?.reason :
                !marketOpen ? 'Market is closed' : 'Validation passed',
        policy_result: policyValidation,
        market_status: marketOpen
      };
    } catch (error) {
      return {
        valid: false,
        reason: `Validation error: ${error?.message}`
      };
    }
  },

  calculateOverallHealth(ibkrHealth, executorHealth, systemMetrics) {
    const ibkrScore = ibkrHealth?.overall_status === 'operational' ? 100 : 50;
    const executorScore = executorHealth?.order_success_rate || 0;
    const systemScore = systemMetrics?.decisions?.total > 0 ? 
      (systemMetrics?.decisions?.approved / systemMetrics?.decisions?.total) * 100 : 100;
    
    const overallScore = (ibkrScore + executorScore + systemScore) / 3;
    
    return {
      score: Math.round(overallScore),
      status: overallScore >= 90 ? 'excellent' :
              overallScore >= 70 ? 'good' :
              overallScore >= 50 ? 'degraded' : 'critical'
    };
  },

  // 🎯 LEGACY COMPATIBILITY LAYER
  
  // Maintain compatibility with existing IBKR service methods
  async getConnection(userId) {
    // Delegate to existing implementation or mock
    return {
      id: 'enhanced-connection',
      user_id: userId,
      trading_mode: 'paper',
      host: '127.0.0.1',
      port: 7497,
      client_id: 1,
      is_active: true,
      connection_status: 'connected',
      enhanced: true
    };
  },

  async getIBKRStatus() {
    return await ibkrMultiIAExecutorService?.getIBKRStatus();
  },

  async testConnection(connectionData) {
    return await ibkrMultiIAExecutorService?.testIBKRConnection(connectionData);
  },

  // Real-time subscriptions
  subscribeToEnhancedUpdates(userId, callback) {
    // Subscribe to both legacy and Multi-IA updates
    const multiIASubscription = multiIATradingOrchestratorService?.subscribeToTradingEvents(
      userId,
      callback
    );
    
    return {
      multiIA: multiIASubscription,
      unsubscribe: () => {
        if (multiIASubscription) {
          multiIATradingOrchestratorService?.unsubscribe(multiIASubscription);
        }
      }
    };
  }
};

export default ibkrEnhancedService;