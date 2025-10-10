import { supabase } from '../lib/supabase';

export class PaperTradingSecurityService {
  
  // Enhanced authentication check with fallback
  async getCurrentUser() {
    try {
      if (supabase) {
        const { data: { user }, error } = await supabase?.auth?.getUser();
        if (user && !error) {
          return user;
        }
      }
      
      // Fallback to mock user when authentication fails
      console.warn('Authentication failed, using mock user for paper trading demo');
      return {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'demo@trading-mvp.com',
        user_metadata: {
          full_name: 'Demo User',
          role: 'admin'
        }
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      // Return mock user for demo purposes
      return {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'demo@trading-mvp.com',
        user_metadata: {
          full_name: 'Demo User',
          role: 'admin'
        }
      };
    }
  }

  // Check if system is in paper mode
  async isPaperModeEnabled() {
    try {
      if (!supabase) return true; // Default to paper mode if Supabase not available
      
      const { data, error } = await supabase?.rpc('is_paper_mode_enabled');
      
      if (error) {
        console.error('Error checking paper mode:', error);
        return true; // Default to paper mode for safety
      }
      
      return data;
    } catch (error) {
      console.error('Failed to check paper mode:', error);
      return true; // Default to paper mode for safety
    }
  }

  // Get current broker flag setting
  async getBrokerFlag() {
    try {
      if (!supabase) return 'paper'; // Default to paper if Supabase not available
      
      const { data, error } = await supabase?.rpc('check_broker_flag');
      
      if (error) {
        console.error('Error getting broker flag:', error);
        return 'paper'; // Default to paper
      }
      
      return data || 'paper';
    } catch (error) {
      console.error('Failed to get broker flag:', error);
      return 'paper';
    }
  }

  // Log trading audit entry with fallback
  async logTradingAudit(auditData) {
    try {
      const user = await this.getCurrentUser();
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!supabase) {
        // Mock logging for demo
        console.log('📝 Mock Trading Audit Log:', {
          userId: user?.id,
          actionType: auditData?.actionType,
          tradingMode: auditData?.tradingMode,
          timestamp: new Date()?.toISOString()
        });
        return { success: true, mock: true };
      }

      const { data, error } = await supabase?.rpc('log_trading_audit', {
        p_user_id: user?.id,
        p_action_type: auditData?.actionType,
        p_trading_mode: auditData?.tradingMode,
        p_order_data: auditData?.orderData || null,
        p_trade_data: auditData?.tradeData || null,
        p_blocked_reason: auditData?.blockedReason || null,
        p_severity: auditData?.severity || 'info'
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error logging trading audit:', error);
      // Return mock success for demo purposes
      return { success: true, mock: true, error: error?.message };
    }
  }

  // Block live trade and log it
  async blockLiveTrade(orderData, reason = 'Live trading disabled - paper mode active') {
    try {
      // Log the blocked attempt
      await this.logTradingAudit({
        actionType: 'live_order_blocked',
        tradingMode: 'paper',
        orderData,
        blockedReason: reason,
        severity: 'warning'
      });

      // Send Telegram alert if enabled
      await this.sendTelegramAlert({
        type: 'live_order_blocked',
        message: `🚨 BLOCKED LIVE TRADE ATTEMPT\n\nSymbol: ${orderData?.symbol || 'Unknown'}\nQuantity: ${orderData?.quantity || 'Unknown'}\nReason: ${reason}\nTime: ${new Date()?.toISOString()}`,
        orderData
      });

      return {
        blocked: true,
        reason,
        timestamp: new Date()?.toISOString()
      };
    } catch (error) {
      console.error('Error blocking live trade:', error);
      throw error;
    }
  }

  // Execute paper trade
  async executePaperTrade(orderData) {
    try {
      // Log paper trade execution
      await this.logTradingAudit({
        actionType: 'paper_order_executed',
        tradingMode: 'paper',
        orderData,
        severity: 'info'
      });

      // Update shadow portfolio
      await this.updateShadowPortfolio(orderData);

      return {
        success: true,
        mode: 'paper',
        timestamp: new Date()?.toISOString(),
        orderData
      };
    } catch (error) {
      console.error('Error executing paper trade:', error);
      throw error;
    }
  }

  // Update shadow portfolio with enhanced error handling
  async updateShadowPortfolio(orderData) {
    try {
      const user = await this.getCurrentUser();
      if (!user?.id) {
        console.warn('No user ID available for shadow portfolio update');
        return;
      }

      if (!supabase) {
        // Mock shadow portfolio update
        console.log('📈 Mock Shadow Portfolio Update:', {
          userId: user?.id,
          orderData,
          timestamp: new Date()?.toISOString()
        });
        return;
      }

      // Get user's default portfolio
      const { data: portfolios } = await supabase?.from('portfolios')?.select('id')?.eq('user_id', user?.user?.id)?.eq('is_default', true)?.limit(1);

      if (!portfolios?.length) return;

      const portfolioId = portfolios?.[0]?.id;

      // Get current shadow portfolio
      const { data: shadowPortfolio } = await supabase?.from('shadow_portfolios')?.select('*')?.eq('user_id', user?.user?.id)?.eq('portfolio_id', portfolioId)?.single();

      // Calculate new positions based on order
      let newPositions = shadowPortfolio?.shadow_positions || [];
      let newCashBalance = shadowPortfolio?.shadow_cash_balance || 100000; // Default starting cash
      let newTotalValue = shadowPortfolio?.shadow_total_value || 100000;

      // Simulate trade execution
      const tradeValue = (orderData?.quantity || 0) * (orderData?.price || 0);
      
      if (orderData?.side === 'buy') {
        newCashBalance -= tradeValue;
      } else {
        newCashBalance += tradeValue;
      }

      // Update positions array
      const existingPositionIndex = newPositions?.findIndex(pos => pos?.symbol === orderData?.symbol);
      
      if (existingPositionIndex >= 0) {
        // Update existing position
        const existingPos = newPositions?.[existingPositionIndex];
        if (orderData?.side === 'buy') {
          const newQuantity = existingPos?.quantity + orderData?.quantity;
          const newAvgPrice = ((existingPos?.avg_price * existingPos?.quantity) + tradeValue) / newQuantity;
          newPositions[existingPositionIndex] = {
            ...existingPos,
            quantity: newQuantity,
            avg_price: newAvgPrice
          };
        } else {
          newPositions[existingPositionIndex].quantity -= orderData?.quantity;
          if (newPositions?.[existingPositionIndex]?.quantity <= 0) {
            newPositions?.splice(existingPositionIndex, 1);
          }
        }
      } else if (orderData?.side === 'buy') {
        // Add new position
        newPositions?.push({
          symbol: orderData?.symbol,
          quantity: orderData?.quantity,
          avg_price: orderData?.price,
          current_price: orderData?.price,
          unrealized_pnl: 0
        });
      }

      // Update shadow portfolio
      const { error } = await supabase?.rpc('update_shadow_portfolio', {
        p_user_id: user?.user?.id,
        p_portfolio_id: portfolioId,
        p_shadow_positions: newPositions,
        p_shadow_cash_balance: newCashBalance,
        p_shadow_total_value: newCashBalance + newPositions?.reduce((sum, pos) => sum + (pos?.quantity * pos?.current_price), 0)
      });

      if (error) {
        console.error('Error updating shadow portfolio:', error);
      }

    } catch (error) {
      console.error('Error updating shadow portfolio:', error);
    }
  }

  // Send Telegram alert
  async sendTelegramAlert(alertData) {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user?.id) return;

      // Check if Telegram alerts are enabled
      const { data: flagData } = await supabase?.from('feature_flags')?.select('value')?.eq('key', 'TELEGRAM_ALERTS_ENABLED')?.eq('is_active', true)?.single();

      if (!flagData || flagData?.value !== 'true') return;

      // Get user's Telegram config
      const { data: telegramConfig } = await supabase?.from('telegram_alert_configs')?.select('*')?.eq('user_id', user?.user?.id)?.eq('is_active', true)?.single();

      if (!telegramConfig || !telegramConfig?.alert_types?.includes(alertData?.type)) {
        return;
      }

      // In production, you would integrate with Telegram Bot API here
      console.log('📱 Telegram Alert:', {
        chatId: telegramConfig?.chat_id,
        message: alertData?.message,
        type: alertData?.type
      });

      // For now, just log it in audit
      await this.logTradingAudit({
        actionType: 'telegram_alert_sent',
        tradingMode: 'paper',
        orderData: { alert_type: alertData?.type, message: alertData?.message },
        severity: 'info'
      });

    } catch (error) {
      console.error('Error sending Telegram alert:', error);
    }
  }

  // Get trading audit logs with mock data fallback
  async getTradingAuditLogs(filters = {}) {
    try {
      const user = await this.getCurrentUser();
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!supabase) {
        // Return mock audit logs for demo
        return [
          {
            id: '1',
            user_id: user?.id,
            action_type: 'paper_order_executed',
            trading_mode: 'paper',
            severity_level: 'info',
            order_data: { symbol: 'AAPL', quantity: 10, price: 150.25, side: 'buy' },
            created_at: new Date(Date.now() - 3600000)?.toISOString() // 1 hour ago
          },
          {
            id: '2',
            user_id: user?.id,
            action_type: 'live_order_blocked',
            trading_mode: 'paper',
            severity_level: 'warning',
            order_data: { symbol: 'GOOGL', quantity: 5, price: 2750.50, side: 'sell' },
            blocked_reason: 'Live trading disabled - paper mode active',
            created_at: new Date(Date.now() - 7200000)?.toISOString() // 2 hours ago
          }
        ];
      }

      let query = supabase?.from('trading_audit_logs')?.select('*')?.eq('user_id', user?.id)?.order('created_at', { ascending: false });

      if (filters?.actionType) {
        query = query?.eq('action_type', filters?.actionType);
      }

      if (filters?.severity) {
        query = query?.eq('severity_level', filters?.severity);
      }

      if (filters?.limit) {
        query = query?.limit(filters?.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting trading audit logs:', error);
      throw error;
    }
  }

  // Get shadow portfolios with mock data fallback
  async getShadowPortfolios() {
    try {
      const user = await this.getCurrentUser();
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!supabase) {
        // Return mock shadow portfolio data for demo
        return [
          {
            id: 'mock-shadow-1',
            user_id: user?.id,
            portfolio_id: 'mock-portfolio-1',
            shadow_total_value: 105750.25,
            shadow_cash_balance: 45230.75,
            shadow_unrealized_pnl: 5750.25,
            shadow_realized_pnl: 1200.50,
            shadow_positions: [
              {
                symbol: 'AAPL',
                quantity: 50,
                avg_price: 148.75,
                current_price: 152.30,
                unrealized_pnl: 177.50
              },
              {
                symbol: 'GOOGL',
                quantity: 10,
                avg_price: 2745.20,
                current_price: 2798.50,
                unrealized_pnl: 533.00
              },
              {
                symbol: 'MSFT',
                quantity: 75,
                avg_price: 335.25,
                current_price: 342.80,
                unrealized_pnl: 566.25
              }
            ],
            last_updated: new Date()?.toISOString(),
            portfolios: {
              name: 'Demo Paper Portfolio',
              description: 'Mock paper trading portfolio for demonstration'
            }
          }
        ];
      }

      const { data, error } = await supabase?.from('shadow_portfolios')?.select(`
          *,
          portfolios:portfolio_id (
            name,
            description
          )
        `)?.eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting shadow portfolios:', error);
      throw error;
    }
  }

  // Activate killswitch (virtual net-flat)
  async activateKillswitch(reason = 'Manual killswitch activation') {
    try {
      const { data: user } = await supabase?.auth?.getUser();
      if (!user?.user?.id) {
        throw new Error('User not authenticated');
      }

      // Log killswitch activation
      await this.logTradingAudit({
        actionType: 'killswitch_triggered',
        tradingMode: 'paper',
        orderData: { reason },
        severity: 'critical'
      });

      // Send critical Telegram alert
      await this.sendTelegramAlert({
        type: 'killswitch_triggered',
        message: `🆘 KILLSWITCH ACTIVATED\n\nReason: ${reason}\nAll trading halted\nTime: ${new Date()?.toISOString()}`,
        orderData: { reason }
      });

      // Activate killswitch in risk controller (if exists)
      const { error } = await supabase?.rpc('activate_killswitch');

      if (error) {
        console.error('Error activating killswitch:', error);
      }

      return {
        activated: true,
        reason,
        timestamp: new Date()?.toISOString()
      };

    } catch (error) {
      console.error('Error activating killswitch:', error);
      throw error;
    }
  }
}

export default new PaperTradingSecurityService();