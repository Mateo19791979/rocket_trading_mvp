import { supabase } from '../lib/supabase';

class DialogueService {
  constructor() {
    this.subscriptions = new Map();
  }

  /**
   * Send a new dialogue message
   */
  async sendMessage({ role, message, metadata = {}, channel = 'tripartite', importance = 1 }) {
    try {
      if (!role || !message) {
        throw new Error('Role and message are required');
      }

      const { data, error } = await supabase?.from('orch_dialogues')?.insert([{
        role,
        message,
        metadata,
        channel,
        importance
      }])?.select()?.single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get recent messages (72 hours)
   */
  async getRecentMessages(limit = 200, channel = null) {
    try {
      let query = supabase?.from('orch_dialogues_recent')?.select('*')?.limit(limit);
      
      if (channel) {
        query = query?.eq('channel', channel);
      }

      const { data, error } = await query?.order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  /**
   * Get messages by channel
   */
  async getMessagesByChannel(channel, limit = 100) {
    try {
      const { data, error } = await supabase?.from('orch_dialogues')
        ?.select('*')
        ?.eq('channel', channel)
        ?.order('created_at', { ascending: false })
        ?.limit(limit);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  /**
   * Get messages by role
   */
  async getMessagesByRole(role, limit = 100) {
    try {
      const { data, error } = await supabase?.from('orch_dialogues')
        ?.select('*')
        ?.eq('role', role)
        ?.order('created_at', { ascending: false })
        ?.limit(limit);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  /**
   * Subscribe to real-time dialogue updates
   */
  subscribeToDialogue(callback, channel = null) {
    const subscriptionKey = channel || 'all';
    
    // Unsubscribe existing if any
    if (this.subscriptions?.has(subscriptionKey)) {
      this.unsubscribeFromDialogue(subscriptionKey);
    }

    try {
      const subscription = supabase?.channel(`dialogue-${subscriptionKey}`)
        ?.on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'orch_dialogues',
            ...(channel && { filter: `channel=eq.${channel}` })
          },
          (payload) => {
            callback?.(payload);
          }
        )
        ?.subscribe();

      this.subscriptions?.set(subscriptionKey, subscription);

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to dialogue updates:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from dialogue updates
   */
  unsubscribeFromDialogue(subscriptionKey = 'all') {
    const subscription = this.subscriptions?.get(subscriptionKey);
    if (subscription) {
      supabase?.removeChannel(subscription);
      this.subscriptions?.delete(subscriptionKey);
    }
  }

  /**
   * Unsubscribe from all dialogue updates
   */
  unsubscribeAll() {
    this.subscriptions?.forEach((subscription, key) => {
      this.unsubscribeFromDialogue(key);
    });
  }

  /**
   * Get dialogue statistics
   */
  async getDialogueStats() {
    try {
      const { data: totalMessages, error: totalError } = await supabase?.from('orch_dialogues')
        ?.select('id', { count: 'exact', head: true });

      if (totalError) throw totalError;

      const { data: recentMessages, error: recentError } = await supabase?.from('orch_dialogues_recent')
        ?.select('id', { count: 'exact', head: true });

      if (recentError) throw recentError;

      const { data: roleStats, error: roleError } = await supabase?.from('orch_dialogues')
        ?.select('role', { count: 'exact' })
        ?.gte('created_at', new Date(Date.now() - 72 * 60 * 60 * 1000)?.toISOString());

      if (roleError) throw roleError;

      return {
        data: {
          totalMessages: totalMessages || 0,
          recentMessages: recentMessages || 0,
          roleDistribution: roleStats || []
        },
        error: null
      };
    } catch (error) {
      return {
        data: {
          totalMessages: 0,
          recentMessages: 0,
          roleDistribution: []
        },
        error
      };
    }
  }

  /**
   * Clear old messages (admin function)
   */
  async clearOldMessages() {
    try {
      const { error } = await supabase?.rpc('cleanup_old_dialogues');
      
      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Get demo messages for development
   */
  getDemoMessages() {
    return [
      {
        id: 'demo-1',
        role: 'human',
        message: 'Bonjour, quel est le statut du système AAS ?',
        channel: 'tripartite',
        importance: 1,
        created_at: new Date(Date.now() - 300000)?.toISOString()
      },
      {
        id: 'demo-2',
        role: 'orchestrator',
        message: 'Système opérationnel. 5 agents actifs, performance globale: +2.3%',
        channel: 'tripartite',
        importance: 1,
        created_at: new Date(Date.now() - 240000)?.toISOString()
      },
      {
        id: 'demo-3',
        role: 'core_ai',
        message: '🧠 Détection d\'opportunité: AAPL momentum bullish. Recommandation d\'allocation.',
        channel: 'tripartite',
        importance: 2,
        created_at: new Date(Date.now() - 180000)?.toISOString()
      },
      {
        id: 'demo-4',
        role: 'agent',
        message: 'Alpha Momentum Pro: Position ouverte AAPL +100 shares @ $175.50',
        channel: 'us',
        importance: 1,
        created_at: new Date(Date.now() - 120000)?.toISOString()
      },
      {
        id: 'demo-5',
        role: 'human',
        message: 'Parfait, surveillez les niveaux de risque.',
        channel: 'tripartite',
        importance: 1,
        created_at: new Date(Date.now() - 60000)?.toISOString()
      }
    ];
  }
}

// Export singleton instance
export const dialogueService = new DialogueService();
export default dialogueService;