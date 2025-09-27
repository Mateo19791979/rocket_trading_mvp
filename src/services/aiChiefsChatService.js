import { supabase } from '../lib/supabase';

// AI Chiefs Chat Service for managing conversations with specialized AI personas
class AIChiefsChatService {
  constructor() {
    this.chiefRoles = {
      orchestrateur: {
        name: 'Chef Orchestrateur',
        description: 'Choix de stratégie et allocation',
        specialization: 'Stratégie globale et orchestration',
        avatar: '🎯'
      },
      risque: {
        name: 'Chef Risque', 
        description: 'VaR, CVaR, limites',
        specialization: 'Gestion et contrôle des risques',
        avatar: '🛡️'
      },
      recherche: {
        name: 'Chef Recherche',
        description: 'Idées & features',
        specialization: 'Innovation et découverte',
        avatar: '🔬'
      },
      execution: {
        name: 'Chef Exécution',
        description: 'Routes & slippage', 
        specialization: 'Optimisation des trades',
        avatar: '⚡'
      },
      donnees: {
        name: 'Chef Données',
        description: 'Qualité & latence',
        specialization: 'Intégrité et performance des données',
        avatar: '📊'
      }
    };
  }

  // Get all conversations for current user
  async getConversations(userId) {
    if (!userId) return { data: [], error: 'User ID required' };

    try {
      const { data, error } = await supabase?.from('ai_chief_conversations')?.select(`
          id,
          chief_role,
          title,
          status,
          last_message_at,
          created_at,
          updated_at
        `)?.eq('user_id', userId)?.order('last_message_at', { ascending: false });

      if (error) throw error;

      // Enrich with chief information
      const enrichedData = data?.map(conversation => ({
        ...conversation,
        chief_info: this.chiefRoles?.[conversation?.chief_role] || {}
      }));

      return { data: enrichedData, error: null };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  }

  // Get messages for a specific conversation
  async getMessages(conversationId) {
    if (!conversationId) return { data: [], error: 'Conversation ID required' };

    try {
      const { data, error } = await supabase?.from('ai_chief_messages')?.select('*')?.eq('conversation_id', conversationId)?.order('created_at', { ascending: true });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  }

  // Create new conversation with AI Chief
  async createConversation(userId, chiefRole, title = null) {
    if (!userId || !chiefRole) {
      return { data: null, error: 'User ID and chief role required' };
    }

    try {
      const conversationTitle = title || `Nouvelle conversation avec ${this.chiefRoles?.[chiefRole]?.name || chiefRole}`;
      
      const { data, error } = await supabase?.from('ai_chief_conversations')?.insert({
          user_id: userId,
          chief_role: chiefRole,
          title: conversationTitle,
          status: 'active'
        })?.select()?.single();

      if (error) throw error;

      // Enrich with chief information
      const enrichedData = {
        ...data,
        chief_info: this.chiefRoles?.[data?.chief_role] || {}
      };

      return { data: enrichedData, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Send message to AI Chief
  async sendMessage(conversationId, content, senderType = 'user_message') {
    if (!conversationId || !content) {
      return { data: null, error: 'Conversation ID and content required' };
    }

    try {
      const { data, error } = await supabase?.from('ai_chief_messages')?.insert({
          conversation_id: conversationId,
          sender_type: senderType,
          content: content?.trim(),
          metadata: {
            timestamp: new Date()?.toISOString(),
            length: content?.length
          }
        })?.select()?.single();

      if (error) throw error;

      // Simulate AI Chief response (in real implementation, this would call AI service)
      if (senderType === 'user_message') {
        await this.simulateChiefResponse(conversationId, content);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Simulate AI Chief response (placeholder for real AI integration)
  async simulateChiefResponse(conversationId, userMessage) {
    try {
      // Get conversation to determine which chief is responding
      const { data: conversation } = await supabase?.from('ai_chief_conversations')?.select('chief_role')?.eq('id', conversationId)?.single();

      if (!conversation) return;

      const chiefRole = conversation?.chief_role;
      const responses = this.getSimulatedResponses(chiefRole, userMessage);
      const selectedResponse = responses?.[Math.floor(Math.random() * responses?.length)];

      // Add small delay for more realistic experience
      setTimeout(async () => {
        await supabase?.from('ai_chief_messages')?.insert({
            conversation_id: conversationId,
            sender_type: 'chief_response',
            content: selectedResponse,
            metadata: {
              timestamp: new Date()?.toISOString(),
              response_type: 'simulated',
              confidence: Math.random() * 0.4 + 0.6 // 0.6-1.0
            }
          });
      }, 1500 + Math.random() * 2000); // 1.5-3.5s delay

    } catch (error) {
      console.error('Error simulating chief response:', error);
    }
  }

  // Get simulated responses based on chief role and user message
  getSimulatedResponses(chiefRole, userMessage) {
    const baseResponses = {
      orchestrateur: [
        'Analysons votre situation globale. Je vais orchestrer une évaluation complète via /select et /allocate.',
        'Excellent point. Ma stratégie recommandée intègre momentum et mean reversion selon les conditions de marché.',
        'Je coordonne avec les autres chefs pour une approche holistique. Déclenchement de l\'analyse via /status.',
        'Stratégie adaptative activée. Réallocation automatique selon les signaux de régime détectés.'
      ],
      risque: [
        'VaR calculé : exposition acceptable. CVaR sous surveillance. Limites respectées pour l\'instant.',
        'Attention : concentration sectorielle détectée. Recommandation de diversification immédiate.',
        'Analyse de stress en cours. Votre portfolio résiste bien aux scénarios extrêmes actuels.',
        'Corrélations inter-actifs en hausse. Ajustement des limites de risque recommandé.'
      ],
      recherche: [
        'Analyse de 1,247 papers cette semaine. Nouveau pattern alpha identifié dans les cryptos institutionnelles.',
        'Innovation détectée : stratégie cross-asset momentum. Backtests préliminaires prometteurs (+8% alpha).',
        'Veille scientifique : émergence des modèles transformer pour la prédiction intraday.',
        'Nouvelle famille de stratégies en développement. Phase de test en environnement sandbox.'
      ],
      execution: [
        'Routing optimal calculé. Slippage moyen réduit de 12% via algorithmes adaptatifs.',
        'Fragmentation de l\'ordre optimisée. Exécution répartie sur 4 venues pour minimiser l\'impact.',
        'Latence actuelle : 2.3ms. Performance d\'exécution dans le top quartile du marché.',
        'Smart order routing activé. Adaptation en temps réel aux conditions de liquidité.'
      ],
      donnees: [
        'Qualité des données : 99.97%. Latence moyenne : 1.2ms. Tous les flux opérationnels.',
        'Anomalie détectée sur le flux Reuters. Basculement automatique sur Bloomberg effectué.',
        'Synchronisation parfaite sur tous les market data feeds. Intégrité des données confirmée.',
        'Pipeline de données optimisé : +15% de performance, 0 perte de données cette semaine.'
      ]
    };

    return baseResponses?.[chiefRole] || ['Je traite votre demande. Analyse en cours...'];
  }

  // Get available tools for AI Chiefs
  async getAvailableTools() {
    try {
      const { data, error } = await supabase?.from('ai_chief_tools')?.select('*')?.eq('is_enabled', true)?.order('tool_name');

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  }

  // Update conversation status
  async updateConversationStatus(conversationId, status) {
    if (!conversationId || !status) {
      return { data: null, error: 'Conversation ID and status required' };
    }

    try {
      const { data, error } = await supabase?.from('ai_chief_conversations')?.update({ 
          status,
          updated_at: new Date()?.toISOString()
        })?.eq('id', conversationId)?.select()?.single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId) {
    if (!conversationId) return { data: null, error: 'Conversation ID required' };

    try {
      const { data, error } = await supabase?.from('ai_chief_messages')?.update({ is_read: true })?.eq('conversation_id', conversationId)?.eq('is_read', false);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Subscribe to real-time message updates
  subscribeToMessages(conversationId, callback) {
    if (!conversationId || !callback) return null;

    return supabase?.channel(`messages_${conversationId}`)?.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_chief_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        callback
      )?.subscribe();
  }

  // Unsubscribe from real-time updates
  unsubscribeFromMessages(subscription) {
    if (subscription) {
      return supabase?.removeChannel(subscription);
    }
  }

  // Get conversation statistics
  async getConversationStats(conversationId) {
    if (!conversationId) return { data: null, error: 'Conversation ID required' };

    try {
      const { data, error } = await supabase?.from('ai_chief_messages')?.select('sender_type, created_at')?.eq('conversation_id', conversationId);

      if (error) throw error;

      const stats = {
        total_messages: data?.length || 0,
        user_messages: data?.filter(m => m?.sender_type === 'user_message')?.length || 0,
        chief_responses: data?.filter(m => m?.sender_type === 'chief_response')?.length || 0,
        system_notifications: data?.filter(m => m?.sender_type === 'system_notification')?.length || 0
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }
}

export const aiChiefsChatService = new AIChiefsChatService();