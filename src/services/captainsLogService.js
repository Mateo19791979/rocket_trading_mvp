import { supabase } from '../lib/supabase';

export const captainsLogService = {
  /**
   * Get all Captain's Log entries (alias for getRecentEntries with higher limit)
   */
  async getAllEntries(limit = 1000) {
    try {
      return await this.getRecentEntries(limit);
    } catch (error) {
      console.error('Error in getAllEntries:', error);
      return [];
    }
  },

  /**
   * Get recent Captain's Log entries
   */
  async getRecentEntries(limit = 20) {
    try {
      if (!supabase) {
        console.error('Supabase client not available');
        return [];
      }

      const { data, error } = await supabase?.from('captains_log')?.select('*')?.order('ts', { ascending: false })?.limit(limit);

      if (error) {
        console.error('Error fetching captain\'s log:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecentEntries:', error);
      return [];
    }
  },

  /**
   * Get decision statistics and analytics
   */
  async getDecisionStats() {
    try {
      if (!supabase) {
        console.error('Supabase client not available');
        return {
          totalEntries: 0,
          humanEntries: 0,
          aiEntries: 0,
          topTags: []
        };
      }

      const { data, error } = await supabase?.from('captains_log')?.select('author, tags');

      if (error) {
        console.error('Error fetching decision stats:', error);
        return {
          totalEntries: 0,
          humanEntries: 0,
          aiEntries: 0,
          topTags: []
        };
      }

      const entries = data || [];
      const humanEntries = entries?.filter(entry => 
        entry?.author === 'Matthieu' || (entry?.author && !entry?.author?.includes('AAS_'))
      )?.length;
      const aiEntries = entries?.filter(entry => 
        entry?.author && entry?.author?.includes('AAS_')
      )?.length;
      
      // Count tag frequencies
      const tagCounts = {};
      entries?.forEach(entry => {
        if (entry?.tags && Array.isArray(entry?.tags)) {
          entry?.tags?.forEach(tag => {
            tagCounts[tag] = (tagCounts?.[tag] || 0) + 1;
          });
        }
      });
      
      const topTags = Object.entries(tagCounts)?.sort(([,a], [,b]) => b - a)?.slice(0, 10)?.map(([tag, count]) => ({ tag, count }));

      return {
        totalEntries: entries?.length,
        humanEntries,
        aiEntries,
        topTags
      };
    } catch (error) {
      console.error('Error in getDecisionStats:', error);
      return {
        totalEntries: 0,
        humanEntries: 0,
        aiEntries: 0,
        topTags: []
      };
    }
  },

  /**
   * Subscribe to real-time changes in captain's log
   */
  subscribeToChanges(callback) {
    try {
      if (!supabase) {
        console.error('Supabase client not available for subscriptions');
        return null;
      }

      if (typeof callback !== 'function') {
        console.error('Callback must be a function');
        return null;
      }

      const subscription = supabase?.channel('captains_log_changes')?.on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'captains_log'
        }, callback)?.subscribe();

      return subscription;
    } catch (error) {
      console.error('Error setting up subscription:', error);
      return null;
    }
  },

  /**
   * Unsubscribe from real-time changes
   */
  unsubscribeFromChanges(subscription) {
    try {
      if (subscription && supabase) {
        return supabase?.removeChannel(subscription);
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  },

  /**
   * Add new entry to Captain's Log
   */
  async addEntry({ author, entry, tags = [], user_id = null }) {
    try {
      // Get current user if no user_id provided
      if (!user_id) {
        const { data: { user } } = await supabase?.auth?.getUser();
        user_id = user?.id;
      }

      const { data, error } = await supabase?.from('captains_log')?.insert({
          author: author || 'Unknown',
          entry,
          tags,
          user_id
        })?.select()?.single();

      if (error) {
        console.error('Error adding captain\'s log entry:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in addEntry:', error);
      return null;
    }
  },

  /**
   * Add entry from AI Sentinel
   */
  async addSentinelEntry(entry, tags = []) {
    return await this.addEntry({
      author: 'AAS_Sentinel',
      entry,
      tags: [...tags, 'auto', 'sentinel']
    });
  },

  /**
   * Add entry from human operator
   */
  async addHumanEntry(author, entry, tags = []) {
    return await this.addEntry({
      author: author || 'Matthieu',
      entry,
      tags: [...tags, 'manual', 'human']
    });
  },

  /**
   * Get entries by author
   */
  async getEntriesByAuthor(author) {
    try {
      const { data, error } = await supabase?.from('captains_log')?.select('*')?.eq('author', author)?.order('ts', { ascending: false });

      if (error) {
        console.error('Error fetching entries by author:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEntriesByAuthor:', error);
      return [];
    }
  },

  /**
   * Get entries by tags
   */
  async getEntriesByTags(tags) {
    try {
      const { data, error } = await supabase?.from('captains_log')?.select('*')?.contains('tags', tags)?.order('ts', { ascending: false });

      if (error) {
        console.error('Error fetching entries by tags:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEntriesByTags:', error);
      return [];
    }
  },

  /**
   * Get entries for specific date range
   */
  async getEntriesInRange(startDate, endDate) {
    try {
      const { data, error } = await supabase?.from('captains_log')?.select('*')?.gte('ts', startDate?.toISOString())?.lte('ts', endDate?.toISOString())?.order('ts', { ascending: false });

      if (error) {
        console.error('Error fetching entries in range:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEntriesInRange:', error);
      return [];
    }
  },

  /**
   * Delete an entry (admin only)
   */
  async deleteEntry(id) {
    try {
      const { error } = await supabase?.from('captains_log')?.delete()?.eq('id', id);

      if (error) {
        console.error('Error deleting captain\'s log entry:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteEntry:', error);
      return false;
    }
  },

  /**
   * Log kill switch activation
   */
  async logKillSwitchActivation(switchName, isActive, reason = '') {
    const action = isActive ? 'Activation' : 'Désactivation';
    const entry = `${action} du Kill Switch ${switchName}${reason ? ` - Raison: ${reason}` : ''}`;
    
    return await this.addSentinelEntry(entry, ['kill_switch', switchName?.toLowerCase(), isActive ? 'activation' : 'deactivation']);
  },

  /**
   * Log mode change
   */
  async logModeChange(oldMode, newMode, reason = '') {
    const entry = `Changement de mode opérationnel: ${oldMode} → ${newMode}${reason ? ` - Raison: ${reason}` : ''}`;
    
    return await this.addSentinelEntry(entry, ['mode_change', oldMode, newMode]);
  },

  /**
   * Log alert detection
   */
  async logAlertDetection(alertType, severity, details = '') {
    const entry = `Détection d'alerte ${alertType} (${severity})${details ? ` - ${details}` : ''}`;
    
    return await this.addSentinelEntry(entry, ['alert', alertType, severity]);
  },

  /**
   * Log data health issue
   */
  async logDataHealthIssue(stream, dhi, threshold = 0.7) {
    if (dhi < threshold) {
      const entry = `DHI dégradé pour le stream ${stream}: ${(dhi * 100)?.toFixed(1)}% (seuil: ${(threshold * 100)}%)`;
      
      return await this.addSentinelEntry(entry, ['data_health', 'dhi', 'degraded', stream]);
    }
  },

  /**
   * Log recovery action
   */
  async logRecoveryAction(component, action, success = true) {
    const status = success ? 'réussie' : 'échouée';
    const entry = `Action de récupération ${status} pour ${component}: ${action}`;
    
    return await this.addSentinelEntry(entry, ['recovery', component, success ? 'success' : 'failure']);
  },

  /**
   * Log manual intervention
   */
  async logManualIntervention(operator, action, details = '') {
    const entry = `Intervention manuelle de ${operator}: ${action}${details ? ` - ${details}` : ''}`;
    
    return await this.addHumanEntry(operator, entry, ['manual', 'intervention']);
  }
};

// Ensure default export
export default captainsLogService;