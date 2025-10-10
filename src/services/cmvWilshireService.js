import { supabase } from '../lib/supabase';

class CMVWilshireService {
  constructor() {
    this.baseUrl = import.meta.env?.VITE_MVP_API_BASE || 'http://localhost:3001';
  }

  // Get external sources state from database
  async getExternalSourcesState() {
    try {
      const { data, error } = await supabase?.from('external_sources_state')?.select('*')?.order('updated_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching external sources state:', error);
      return { data: null, error: error?.message };
    }
  }

  // Get latest CMV data
  async getCMVData() {
    try {
      const { data, error } = await supabase?.from('external_sources_state')?.select('*')?.like('source', 'cmv.%')?.order('updated_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching CMV data:', error);
      return { data: null, error: error?.message };
    }
  }

  // Get latest Wilshire data
  async getWilshireData() {
    try {
      const { data, error } = await supabase?.from('external_sources_state')?.select('*')?.like('source', 'wilshire.%')?.order('updated_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching Wilshire data:', error);
      return { data: null, error: error?.message };
    }
  }

  // Manually trigger CMV scan
  async triggerCMVScan() {
    try {
      const response = await fetch(`${this.baseUrl}/sources/cmv/scan`);
      if (!response?.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response?.json();
      return { data: result, error: null };
    } catch (error) {
      console.error('Error triggering CMV scan:', error);
      return { data: null, error: error?.message };
    }
  }

  // Manually trigger Wilshire scan
  async triggerWilshireScan() {
    try {
      const response = await fetch(`${this.baseUrl}/sources/wilshire/scan`);
      if (!response?.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response?.json();
      return { data: result, error: null };
    } catch (error) {
      console.error('Error triggering Wilshire scan:', error);
      return { data: null, error: error?.message };
    }
  }

  // Subscribe to real-time changes
  subscribeToExternalSources(callback) {
    const channel = supabase?.channel('external_sources_state')?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'external_sources_state' },
        (payload) => {
          callback(payload);
        }
      )?.subscribe();

    return channel;
  }

  // Unsubscribe from real-time updates
  unsubscribeFromExternalSources(channel) {
    if (channel) {
      supabase?.removeChannel(channel);
    }
  }

  // Get service health status
  async getServiceHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      
      // Check if response is ok first
      if (!response?.ok) {
        // For non-200 responses, don't try to parse as JSON
        const text = await response?.text();
        throw new Error(`Service unavailable: ${response.status} ${response.statusText}`);
      }

      // Check content type before parsing as JSON
      const contentType = response?.headers?.get('content-type');
      if (!contentType || !contentType?.includes('application/json')) {
        const text = await response?.text();
        throw new Error(`Expected JSON response, received: ${contentType || 'unknown'}`);
      }

      const result = await response?.json();
      return { data: result, error: null };
    } catch (error) {
      console.error('Error checking service health:', error);
      
      // Return a more user-friendly error for connection issues
      let errorMessage = error?.message;
      if (error?.message?.includes('fetch')) {
        errorMessage = 'Service endpoint not available (connection refused)';
      } else if (error?.message?.includes('<!doctype') || error?.message?.includes('Unexpected token')) {
        errorMessage = 'Service returned HTML instead of JSON (endpoint may not exist)';
      }
      
      return { 
        data: { 
          status: 'down', 
          error: errorMessage,
          endpoint: `${this.baseUrl}/health`
        }, 
        error: errorMessage 
      };
    }
  }
}

export const cmvWilshireService = new CMVWilshireService();