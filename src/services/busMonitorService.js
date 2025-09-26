import { supabase } from '../lib/supabase';

export const busMonitorService = {
  // Get real-time event stream with filters
  async getEvents(filters = {}) {
    try {
      let query = supabase?.from('event_bus')?.select(`
          *,
          source_agent:ai_agents!source_agent_id(name, agent_group),
          target_agent:ai_agents!target_agent_id(name, agent_group)
        `)?.order('created_at', { ascending: false });

      // Apply filters
      if (filters?.eventType) {
        query = query?.eq('event_type', filters?.eventType);
      }
      
      if (filters?.priority) {
        query = query?.eq('priority', filters?.priority);
      }
      
      if (filters?.processed !== undefined) {
        query = query?.eq('is_processed', filters?.processed);
      }
      
      if (filters?.startDate) {
        query = query?.gte('created_at', filters?.startDate);
      }
      
      if (filters?.endDate) {
        query = query?.lte('created_at', filters?.endDate);
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
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get event statistics for dashboard
  async getEventStats(timeRange = '24h') {
    try {
      const timeFilter = this.getTimeFilter(timeRange);
      
      const { data, error } = await supabase?.from('event_bus')?.select('event_type, priority, is_processed, created_at')?.gte('created_at', timeFilter);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        processed: data?.filter(e => e?.is_processed)?.length || 0,
        byType: {},
        byPriority: {},
        messageFrequency: this.calculateFrequency(data)
      };

      // Count by event type
      data?.forEach(event => {
        stats.byType[event.event_type] = (stats?.byType?.[event?.event_type] || 0) + 1;
        stats.byPriority[event.priority] = (stats?.byPriority?.[event?.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching event stats:', error);
      throw error;
    }
  },

  // Subscribe to real-time events
  subscribeToEvents(callback, filters = {}) {
    try {
      let subscription = supabase?.channel('event_bus_changes')?.on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'event_bus' 
          }, 
          callback
        )?.subscribe();

      return subscription;
    } catch (error) {
      console.error('Error subscribing to events:', error);
      throw error;
    }
  },

  // Mark event as processed
  async markEventProcessed(eventId) {
    try {
      const { data, error } = await supabase?.from('event_bus')?.update({ 
          is_processed: true, 
          processed_at: new Date()?.toISOString() 
        })?.eq('id', eventId)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking event as processed:', error);
      throw error;
    }
  },

  // Export events as CSV
  async exportEventsToCSV(filters = {}) {
    try {
      const events = await this.getEvents({ ...filters, limit: 10000 });
      
      const csvHeaders = [
        'Timestamp',
        'Event Type',
        'Priority',
        'Source Agent',
        'Target Agent', 
        'Processed',
        'Event Data'
      ];

      const csvRows = events?.map(event => [
        new Date(event.created_at)?.toISOString(),
        event?.event_type,
        event?.priority,
        event?.source_agent?.name || 'N/A',
        event?.target_agent?.name || 'N/A',
        event?.is_processed ? 'Yes' : 'No',
        JSON.stringify(event?.event_data)
      ]);

      const csvContent = [csvHeaders, ...csvRows]?.map(row => row?.map(field => `"${field}"`)?.join(','))?.join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting events:', error);
      throw error;
    }
  },

  // Helper methods
  getTimeFilter(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000)?.toISOString();
      case '6h':
        return new Date(now.getTime() - 6 * 60 * 60 * 1000)?.toISOString();
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000)?.toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)?.toISOString();
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000)?.toISOString();
    }
  },

  calculateFrequency(events) {
    if (!events?.length) return [];
    
    const hourlyCount = {};
    events?.forEach(event => {
      const hour = new Date(event.created_at)?.getHours();
      hourlyCount[hour] = (hourlyCount?.[hour] || 0) + 1;
    });

    return Object.entries(hourlyCount)?.map(([hour, count]) => ({
      hour: parseInt(hour),
      count
    }))?.sort((a, b) => a?.hour - b?.hour);
  }
};