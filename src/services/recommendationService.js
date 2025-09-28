import { supabase } from '../lib/supabase';

class RecommendationService {
  // Récupérer les préférences de l'utilisateur
  async getUserPreferences(userId) {
    try {
      const { data, error } = await supabase?.from('user_recommendation_preferences')?.select('*')?.eq('user_id', userId)?.single();

      if (error && error?.code !== 'PGRST116') {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Mettre à jour les préférences de l'utilisateur
  async updateUserPreferences(userId, preferences) {
    try {
      const { data, error } = await supabase?.from('user_recommendation_preferences')?.upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date()?.toISOString()
        })?.select()?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Récupérer les recommandations pour l'utilisateur
  async getRecommendations(userId, options = {}) {
    try {
      let query = supabase?.from('recommendations')?.select(`
          *,
          asset:assets(id, symbol, name, sector, logo_url),
          recommendation_actions(action_type, created_at)
        `)?.eq('user_id', userId)?.order('created_at', { ascending: false });

      // Filtres optionnels
      if (options?.isActive !== undefined) {
        query = query?.eq('is_active', options?.isActive);
      }

      if (options?.priority) {
        query = query?.eq('priority', options?.priority);
      }

      if (options?.recommendationType) {
        query = query?.eq('recommendation_type', options?.recommendationType);
      }

      if (options?.limit) {
        query = query?.limit(options?.limit);
      }

      const { data, error } = await query;

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // Récupérer une recommandation spécifique
  async getRecommendation(recommendationId) {
    try {
      const { data, error } = await supabase?.from('recommendations')?.select(`
          *,
          asset:assets(id, symbol, name, sector, logo_url, currency),
          recommendation_performance(
            actual_return_percent,
            outcome,
            user_rating,
            user_feedback
          )
        `)?.eq('id', recommendationId)?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Marquer une recommandation comme lue
  async markAsRead(recommendationId) {
    try {
      const { data, error } = await supabase?.from('recommendations')?.update({ is_read: true, updated_at: new Date()?.toISOString() })?.eq('id', recommendationId)?.select()?.single();

      // Enregistrer l'action
      if (!error) {
        await this.recordAction(recommendationId, 'viewed');
      }

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Rejeter une recommandation
  async dismissRecommendation(recommendationId, reason = null) {
    try {
      const { data, error } = await supabase?.from('recommendations')?.update({ 
          is_dismissed: true, 
          is_active: false,
          updated_at: new Date()?.toISOString() 
        })?.eq('id', recommendationId)?.select()?.single();

      // Enregistrer l'action
      if (!error) {
        await this.recordAction(recommendationId, 'dismissed', { reason });
      }

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Exécuter une recommandation
  async executeRecommendation(recommendationId, executionData = {}) {
    try {
      const { data, error } = await supabase?.from('recommendations')?.update({ 
          executed_at: new Date()?.toISOString(),
          updated_at: new Date()?.toISOString() 
        })?.eq('id', recommendationId)?.select()?.single();

      // Enregistrer l'action
      if (!error) {
        await this.recordAction(recommendationId, 'executed', executionData);
      }

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Enregistrer une action sur une recommandation
  async recordAction(recommendationId, actionType, actionData = null) {
    try {
      const { data: recommendation } = await supabase?.from('recommendations')?.select('user_id')?.eq('id', recommendationId)?.single();

      if (!recommendation) {
        throw new Error('Recommandation non trouvée');
      }

      const { data, error } = await supabase?.from('recommendation_actions')?.insert({
          recommendation_id: recommendationId,
          user_id: recommendation?.user_id,
          action_type: actionType,
          action_data: actionData
        })?.select()?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Obtenir les statistiques des recommandations pour l'utilisateur
  async getUserStats(userId) {
    try {
      const { data, error } = await supabase?.rpc('get_user_recommendation_stats', { user_uuid: userId });

      return { data: data?.[0] || {}, error };
    } catch (error) {
      return { 
        data: {
          total_recommendations: 0,
          active_recommendations: 0,
          executed_recommendations: 0,
          avg_confidence_score: 0,
          avg_success_rate: 0
        }, 
        error 
      };
    }
  }

  // Créer une recommandation personnalisée (pour tests ou admin)
  async createRecommendation(userId, recommendationData) {
    try {
      const { data, error } = await supabase?.from('recommendations')?.insert({
          user_id: userId,
          ...recommendationData
        })?.select(`
          *,
          asset:assets(id, symbol, name, sector, logo_url)
        `)?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Générer une recommandation IA
  async generateAIRecommendation(userId, assetId, type, title, description) {
    try {
      const { data, error } = await supabase?.rpc('generate_ai_recommendation', {
          target_user_id: userId,
          target_asset_id: assetId,
          rec_type: type,
          rec_title: title,
          rec_description: description
        });

      if (error) {
        throw error;
      }

      // Récupérer la recommandation créée
      return await this.getRecommendation(data);
    } catch (error) {
      return { data: null, error };
    }
  }

  // Évaluer la performance d'une recommandation
  async evaluateRecommendationPerformance(recommendationId, performanceData) {
    try {
      const { data, error } = await supabase?.from('recommendation_performance')?.upsert({
          recommendation_id: recommendationId,
          ...performanceData,
          updated_at: new Date()?.toISOString()
        })?.select()?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Obtenir les recommandations par secteur
  async getRecommendationsBySector(userId) {
    try {
      const { data, error } = await supabase?.from('recommendations')?.select(`
          recommendation_type,
          priority,
          confidence_score,
          asset:assets(sector)
        `)?.eq('user_id', userId)?.eq('is_active', true);

      if (error) {
        throw error;
      }

      // Grouper par secteur
      const bySector = data?.reduce((acc, rec) => {
        const sector = rec?.asset?.sector || 'Unknown';
        if (!acc?.[sector]) {
          acc[sector] = [];
        }
        acc?.[sector]?.push(rec);
        return acc;
      }, {});

      return { data: bySector || {}, error: null };
    } catch (error) {
      return { data: {}, error };
    }
  }

  // S'abonner aux changements de recommandations en temps réel
  subscribeToRecommendations(userId, callback) {
    return supabase?.channel('recommendations')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recommendations',
          filter: `user_id=eq.${userId}`
        },
        callback
      )?.subscribe();
  }
}

export default new RecommendationService();