import { supabase } from '../lib/supabase';

export const tradingAccountService = {
  /**
   * Get user's trading accounts
   */
  async getTradingAccounts() {
    try {
      const { data, error } = await supabase?.from('trading_accounts')?.select(`*,user_profiles!inner(id, email, full_name, username)`)?.eq('is_active', true)?.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trading accounts:', error);
        return { success: false, error: error?.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Trading accounts service error:', error);
      return { success: false, error: error?.message };
    }
  },

  /**
   * Get specific trading account by ID
   */
  async getTradingAccount(accountId) {
    try {
      const { data, error } = await supabase?.from('trading_accounts')?.select(`
          *,
          user_profiles!inner(id, email, full_name, username)
        `)?.eq('id', accountId)?.eq('is_active', true)?.single();

      if (error) {
        console.error('Error fetching trading account:', error);
        return { success: false, error: error?.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Trading account service error:', error);
      return { success: false, error: error?.message };
    }
  },

  /**
   * Get user's primary trading account
   */
  async getPrimaryTradingAccount() {
    try {
      const { data, error } = await supabase?.from('trading_accounts')?.select(`
          *,
          user_profiles!inner(id, email, full_name, username)
        `)?.eq('is_active', true)?.order('created_at', { ascending: true })?.limit(1)?.single();

      if (error) {
        console.error('Error fetching primary trading account:', error);
        return { success: false, error: error?.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Primary trading account service error:', error);
      return { success: false, error: error?.message };
    }
  },

  /**
   * Update trading account balance
   */
  async updateBalance(accountId, amount, transactionType, description = null, referenceId = null) {
    try {
      const { data, error } = await supabase?.rpc('update_trading_balance', {
          account_uuid: accountId,
          transaction_amount: amount,
          trans_type: transactionType,
          trans_description: description,
          ref_id: referenceId
        });

      if (error) {
        console.error('Error updating balance:', error);
        return { success: false, error: error?.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Update balance service error:', error);
      return { success: false, error: error?.message };
    }
  },

  /**
   * Get balance history for an account
   */
  async getBalanceHistory(accountId, limit = 50) {
    try {
      const { data, error } = await supabase?.from('balance_history')?.select('*')?.eq('account_id', accountId)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) {
        console.error('Error fetching balance history:', error);
        return { success: false, error: error?.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Balance history service error:', error);
      return { success: false, error: error?.message };
    }
  },

  /**
   * Get account statistics
   */
  async getAccountStats(accountId) {
    try {
      const [accountResult, historyResult] = await Promise.all([
        this.getTradingAccount(accountId),
        this.getBalanceHistory(accountId, 100)
      ]);

      if (!accountResult?.success || !historyResult?.success) {
        return { 
          success: false, 
          error: accountResult?.error || historyResult?.error 
        };
      }

      const account = accountResult?.data;
      const history = historyResult?.data || [];

      // Calculate statistics
      const totalDeposits = history
        ?.filter(h => h?.transaction_type === 'deposit')
        ?.reduce((sum, h) => sum + parseFloat(h?.amount || 0), 0);

      const totalWithdrawals = history
        ?.filter(h => h?.transaction_type === 'withdrawal')
        ?.reduce((sum, h) => sum + Math.abs(parseFloat(h?.amount || 0)), 0);

      const totalProfits = history
        ?.filter(h => h?.transaction_type === 'trade_profit')
        ?.reduce((sum, h) => sum + parseFloat(h?.amount || 0), 0);

      const totalLosses = history
        ?.filter(h => h?.transaction_type === 'trade_loss')
        ?.reduce((sum, h) => sum + Math.abs(parseFloat(h?.amount || 0)), 0);

      const netPnL = totalProfits - totalLosses;
      const pnlPercentage = totalDeposits > 0 ? (netPnL / totalDeposits) * 100 : 0;

      const stats = {
        currentBalance: parseFloat(account?.balance || 0),
        currency: account?.currency || 'EUR',
        totalDeposits,
        totalWithdrawals,
        netPnL,
        pnlPercentage,
        totalTrades: history?.filter(h => 
          h?.transaction_type === 'trade_profit' || h?.transaction_type === 'trade_loss'
        )?.length || 0,
        accountType: account?.account_type,
        isActive: account?.is_active
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Account stats service error:', error);
      return { success: false, error: error?.message };
    }
  },

  /**
   * Create new trading account
   */
  async createTradingAccount(accountType = 'demo', initialBalance = 10000, currency = 'EUR') {
    try {
      const { data, error } = await supabase?.from('trading_accounts')?.insert({
          account_type: accountType,
          balance: initialBalance,
          currency: currency,
          is_active: true
        })?.select()?.single();

      if (error) {
        console.error('Error creating trading account:', error);
        return { success: false, error: error?.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Create trading account service error:', error);
      return { success: false, error: error?.message };
    }
  }
};

export default tradingAccountService;