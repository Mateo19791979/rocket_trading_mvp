import { supabase } from '../lib/supabase';

// TGE Service for managing Token Generation Events data
class TGEService {
  /**
   * Get all TGE events with optional filtering
   */
  async getTgeEvents(options = {}) {
    try {
      const { 
        status = null, 
        search = '', 
        source = null,
        limit = 100, 
        from = null, 
        to = null 
      } = options;

      let query = supabase?.from('tge_events')?.select('*')?.order('tge_datetime', { ascending: true })?.limit(limit);

      // Apply filters
      if (status) {
        query = query?.eq('status', status);
      }

      if (source) {
        query = query?.eq('source', source);
      }

      if (search) {
        query = query?.or(`project_name.ilike.%${search}%,symbol.ilike.%${search}%`);
      }

      if (from) {
        query = query?.gte('tge_datetime', from);
      }

      if (to) {
        query = query?.lte('tge_datetime', to);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || [],
        count: data?.length || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch TGE events',
        data: []
      };
    }
  }

  /**
   * Get upcoming TGE events
   */
  async getUpcomingEvents(limit = 50) {
    return this.getTgeEvents({
      status: 'upcoming',
      limit
    });
  }

  /**
   * Get TGE statistics
   */
  async getTgeStatistics() {
    try {
      const { data, error } = await supabase?.rpc('get_tge_statistics');

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data?.[0] || {
          total_events: 0,
          upcoming_events: 0,
          live_events: 0,
          sources_count: 0,
          last_updated: null
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch TGE statistics',
        data: {
          total_events: 0,
          upcoming_events: 0,
          live_events: 0,
          sources_count: 0,
          last_updated: null
        }
      };
    }
  }

  /**
   * Get TGE events by source
   */
  async getTgeEventsBySource(source) {
    return this.getTgeEvents({ source });
  }

  /**
   * Search TGE events
   */
  async searchTgeEvents(searchTerm, limit = 50) {
    return this.getTgeEvents({
      search: searchTerm,
      limit
    });
  }

  /**
   * Get TGE event by ID
   */
  async getTgeEventById(id) {
    try {
      const { data, error } = await supabase?.from('tge_events')?.select('*')?.eq('id', id)?.single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || null
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch TGE event',
        data: null
      };
    }
  }

  /**
   * Trigger manual TGE data refresh (for authenticated users)
   */
  async refreshTgeData() {
    try {
      const { data, error } = await supabase?.rpc('refresh_tge_data');

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || { message: 'Refresh triggered successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to refresh TGE data'
      };
    }
  }

  /**
   * Get data source health status
   */
  async getDataSourcesStatus() {
    try {
      // Get recent activity from each source
      const { data: sourceStats, error } = await supabase?.from('tge_events')?.select('source, created_at, updated_at')?.order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Process source health data
      const sources = ['icoanalytics', 'coinlaunch', 'cryptorank'];
      const sourceHealth = sources?.map(source => {
        const sourceData = sourceStats?.filter(event => event?.source === source) || [];
        const latestUpdate = sourceData?.[0]?.updated_at;
        const eventCount = sourceData?.length;
        
        return {
          name: source,
          status: this._calculateSourceStatus(latestUpdate, eventCount),
          lastUpdate: latestUpdate,
          eventCount,
          healthScore: this._calculateHealthScore(latestUpdate, eventCount)
        };
      });

      return {
        success: true,
        data: sourceHealth
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch source status',
        data: []
      };
    }
  }

  /**
   * Subscribe to real-time TGE events updates
   */
  subscribeToTgeEvents(callback) {
    const channel = supabase?.channel('tge-events-channel')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tge_events'
        },
        (payload) => {
          callback?.(payload);
        }
      )?.subscribe();

    return channel;
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribeFromTgeEvents(channel) {
    if (channel) {
      supabase?.removeChannel(channel);
    }
  }

  // Private helper methods
  _calculateSourceStatus(lastUpdate, eventCount) {
    if (!lastUpdate) return 'offline';
    
    const hoursSinceUpdate = (Date.now() - new Date(lastUpdate)?.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceUpdate < 6) return 'active';
    if (hoursSinceUpdate < 24) return 'degraded';
    return 'stale';
  }

  _calculateHealthScore(lastUpdate, eventCount) {
    if (!lastUpdate || eventCount === 0) return 0;
    
    const hoursSinceUpdate = (Date.now() - new Date(lastUpdate)?.getTime()) / (1000 * 60 * 60);
    const freshnessScore = Math.max(0, 100 - (hoursSinceUpdate * 4));
    const volumeScore = Math.min(100, eventCount * 10);
    
    return Math.round((freshnessScore + volumeScore) / 2);
  }
}

export const tgeService = new TGEService();
export default tgeService;