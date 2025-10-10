import { supabase } from '../lib/supabase';

class ShadowPriceAnomalyService {
  // Shadow Price Operations
  async getShadowPrices(filters = {}) {
    try {
      let query = supabase?.from('shadow_prices')?.select(`
          *,
          asset:assets(id, symbol, name),
          shadow_price_sources(
            source_provider,
            weight,
            last_tick_time,
            tick_count
          )
        `)?.order('updated_at', { ascending: false });

      if (filters?.asset_id) {
        query = query?.eq('asset_id', filters?.asset_id);
      }

      if (filters?.is_stale !== undefined) {
        query = query?.eq('is_stale', filters?.is_stale);
      }

      if (filters?.min_confidence) {
        query = query?.gte('confidence_score', filters?.min_confidence);
      }

      if (filters?.limit) {
        query = query?.limit(filters?.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  }

  async getShadowPriceByAsset(assetId) {
    try {
      const { data, error } = await supabase?.from('shadow_prices')?.select(`
          *,
          asset:assets(id, symbol, name),
          shadow_price_sources(
            source_provider,
            weight,
            last_tick_time,
            tick_count
          )
        `)?.eq('asset_id', assetId)?.order('updated_at', { ascending: false })?.limit(1)?.single();

      if (error) {
        throw error;
      }

      return { data: data || null, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async updateShadowPrice(id, updates) {
    try {
      const { data, error } = await supabase?.from('shadow_prices')?.update(updates)?.eq('id', id)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Anomaly Detection Operations
  async getAnomalies(filters = {}) {
    try {
      let query = supabase?.from('anomaly_detections')?.select(`
          *,
          asset:assets(id, symbol, name)
        `)?.order('detected_at', { ascending: false });

      if (filters?.asset_id) {
        query = query?.eq('asset_id', filters?.asset_id);
      }

      if (filters?.detection_type) {
        query = query?.eq('detection_type', filters?.detection_type);
      }

      if (filters?.provider_name) {
        query = query?.eq('provider_name', filters?.provider_name);
      }

      if (filters?.is_resolved !== undefined) {
        query = query?.eq('is_resolved', filters?.is_resolved);
      }

      if (filters?.min_confidence) {
        query = query?.gte('confidence_score', filters?.min_confidence);
      }

      if (filters?.min_z_score) {
        query = query?.gte('z_score', filters?.min_z_score);
      }

      if (filters?.limit) {
        query = query?.limit(filters?.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  }

  async getAnomalyById(id) {
    try {
      const { data, error } = await supabase?.from('anomaly_detections')?.select(`
          *,
          asset:assets(id, symbol, name, sector, exchange)
        `)?.eq('id', id)?.single();

      if (error) {
        throw error;
      }

      return { data: data || null, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async resolveAnomaly(id, resolutionNote = null) {
    try {
      const updates = {
        is_resolved: true,
        resolved_at: new Date()?.toISOString()
      };

      if (resolutionNote) {
        updates.details = {
          ...updates?.details,
          resolution_note: resolutionNote
        };
      }

      const { data, error } = await supabase?.from('anomaly_detections')?.update(updates)?.eq('id', id)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async getAnomalyThresholds(detectionType = null) {
    try {
      let query = supabase?.from('anomaly_thresholds')?.select(`
          *,
          asset:assets(id, symbol, name)
        `)?.order('detection_type');

      if (detectionType) {
        query = query?.eq('detection_type', detectionType);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  }

  async updateAnomalyThreshold(id, updates) {
    try {
      const { data, error } = await supabase?.from('anomaly_thresholds')?.update(updates)?.eq('id', id)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Real-time Subscriptions
  subscribeToShadowPrices(callback) {
    const channel = supabase?.channel('shadow_prices_changes')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shadow_prices'
        },
        (payload) => {
          callback?.(payload);
        }
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  }

  subscribeToAnomalies(callback) {
    const channel = supabase?.channel('anomaly_detections_changes')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'anomaly_detections'
        },
        (payload) => {
          callback?.(payload);
        }
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  }

  // Analytics and Statistics
  async getAnomalyStats(filters = {}) {
    try {
      let query = supabase?.from('anomaly_detections')?.select('detection_type, provider_name, is_resolved, detected_at, z_score, confidence_score');

      if (filters?.days) {
        const dateFilter = new Date();
        dateFilter?.setDate(dateFilter?.getDate() - filters?.days);
        query = query?.gte('detected_at', dateFilter?.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Calculate statistics
      const stats = {
        total: data?.length || 0,
        by_type: {},
        by_provider: {},
        resolved_count: 0,
        unresolved_count: 0,
        avg_confidence: 0,
        avg_z_score: 0
      };

      data?.forEach(anomaly => {
        // By type
        stats.by_type[anomaly.detection_type] = (stats?.by_type?.[anomaly?.detection_type] || 0) + 1;
        
        // By provider
        if (anomaly?.provider_name) {
          stats.by_provider[anomaly.provider_name] = (stats?.by_provider?.[anomaly?.provider_name] || 0) + 1;
        }
        
        // Resolution status
        if (anomaly?.is_resolved) {
          stats.resolved_count++;
        } else {
          stats.unresolved_count++;
        }
        
        // Averages
        stats.avg_confidence += anomaly?.confidence_score || 0;
        stats.avg_z_score += Math.abs(anomaly?.z_score || 0);
      });

      if (stats?.total > 0) {
        stats.avg_confidence = stats?.avg_confidence / stats?.total;
        stats.avg_z_score = stats?.avg_z_score / stats?.total;
      }

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async getShadowPriceStats(filters = {}) {
    try {
      let query = supabase?.from('shadow_prices')?.select('asset_id, confidence_score, is_stale, updated_at, shadow_price, vwap_60s, last_trade');

      if (filters?.days) {
        const dateFilter = new Date();
        dateFilter?.setDate(dateFilter?.getDate() - filters?.days);
        query = query?.gte('updated_at', dateFilter?.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        stale_count: 0,
        fresh_count: 0,
        avg_confidence: 0,
        unique_assets: new Set(),
        price_accuracy: 0
      };

      data?.forEach(price => {
        if (price?.is_stale) {
          stats.stale_count++;
        } else {
          stats.fresh_count++;
        }
        
        stats.avg_confidence += price?.confidence_score || 0;
        stats?.unique_assets?.add(price?.asset_id);
        
        // Calculate price accuracy (difference between shadow and last trade)
        if (price?.shadow_price && price?.last_trade) {
          const accuracy = 1 - Math.abs(price?.shadow_price - price?.last_trade) / price?.last_trade;
          stats.price_accuracy += Math.max(0, accuracy);
        }
      });

      if (stats?.total > 0) {
        stats.avg_confidence = stats?.avg_confidence / stats?.total;
        stats.price_accuracy = stats?.price_accuracy / stats?.total;
      }

      stats.unique_assets = stats?.unique_assets?.size;

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }
}

export default new ShadowPriceAnomalyService();