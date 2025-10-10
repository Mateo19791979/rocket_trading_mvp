import { supabase } from '../lib/supabase';

export const dataHealthService = {
  /**
   * Get overall Data Health Index
   */
  async getDataHealthIndex() {
    try {
      const { data, error } = await supabase?.from('data_health_index')?.select('*')?.order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching data health index:', error);
        return {
          dhi: 0.85,
          streams: [],
          loading: false
        };
      }

      // Calculate overall DHI
      const overallDHI = data?.length > 0 
        ? data?.reduce((sum, item) => sum + (item?.dhi || 0), 0) / data?.length 
        : 0.85;

      // Format streams data
      const streams = data?.map(item => ({
        name: item?.stream || 'Unknown Stream',
        dhi: item?.dhi || 0,
        coverage: item?.coverage || 0,
        timeliness: item?.timeliness || 0,
        consistency: item?.consistency || 0,
        completeness: item?.completeness || 0,
        license_status: item?.license_status || 0,
        anomaly_inverse: item?.anomaly_inverse || 0,
        updated_at: item?.updated_at
      })) || [];

      return {
        dhi: overallDHI,
        streams: streams,
        loading: false
      };
    } catch (error) {
      console.error('Error in getDataHealthIndex:', error);
      return {
        dhi: 0.85,
        streams: [],
        loading: false
      };
    }
  },

  /**
   * Get DHI for specific stream
   */
  async getStreamHealth(streamName) {
    try {
      const { data, error } = await supabase?.from('data_health_index')?.select('*')?.eq('stream', streamName)?.single();

      if (error) {
        console.error('Error fetching stream health:', error);
        return null;
      }

      return {
        name: data?.stream,
        dhi: data?.dhi || 0,
        coverage: data?.coverage || 0,
        timeliness: data?.timeliness || 0,
        consistency: data?.consistency || 0,
        completeness: data?.completeness || 0,
        license_status: data?.license_status || 0,
        anomaly_inverse: data?.anomaly_inverse || 0,
        updated_at: data?.updated_at
      };
    } catch (error) {
      console.error('Error in getStreamHealth:', error);
      return null;
    }
  },

  /**
   * Get top performing streams
   */
  async getTopStreams(limit = 10) {
    try {
      const { data, error } = await supabase?.from('data_health_index')?.select('*')?.order('dhi', { ascending: false })?.limit(limit);

      if (error) {
        console.error('Error fetching top streams:', error);
        return [];
      }

      return data?.map(item => ({
        name: item?.stream || 'Unknown',
        dhi: item?.dhi || 0,
        coverage: item?.coverage || 0,
        timeliness: item?.timeliness || 0,
        consistency: item?.consistency || 0,
        updated_at: item?.updated_at
      })) || [];
    } catch (error) {
      console.error('Error in getTopStreams:', error);
      return [];
    }
  },

  /**
   * Get degraded streams (DHI < threshold)
   */
  async getDegradedStreams(threshold = 0.7) {
    try {
      const { data, error } = await supabase?.from('data_health_index')?.select('*')?.lt('dhi', threshold)?.order('dhi', { ascending: true });

      if (error) {
        console.error('Error fetching degraded streams:', error);
        return [];
      }

      return data?.map(item => ({
        name: item?.stream || 'Unknown',
        dhi: item?.dhi || 0,
        coverage: item?.coverage || 0,
        timeliness: item?.timeliness || 0,
        consistency: item?.consistency || 0,
        completeness: item?.completeness || 0,
        issues: this.identifyIssues(item),
        updated_at: item?.updated_at
      })) || [];
    } catch (error) {
      console.error('Error in getDegradedStreams:', error);
      return [];
    }
  },

  /**
   * Identify specific issues with a data stream
   */
  identifyIssues(streamData) {
    const issues = [];
    const threshold = 0.7;

    if (streamData?.coverage < threshold) {
      issues?.push('Faible couverture');
    }
    if (streamData?.timeliness < threshold) {
      issues?.push('Données en retard');
    }
    if (streamData?.consistency < threshold) {
      issues?.push('Incohérences détectées');
    }
    if (streamData?.completeness < threshold) {
      issues?.push('Données incomplètes');
    }
    if (streamData?.license_status < 1) {
      issues?.push('Problème de licence');
    }
    if (streamData?.anomaly_inverse < threshold) {
      issues?.push('Anomalies détectées');
    }

    return issues;
  },

  /**
   * Update DHI for a stream (admin function)
   */
  async updateStreamDHI(streamName, metrics) {
    try {
      const { data, error } = await supabase?.from('data_health_index')?.upsert({
          stream: streamName,
          dhi: metrics?.dhi || 0,
          coverage: metrics?.coverage || 0,
          timeliness: metrics?.timeliness || 0,
          consistency: metrics?.consistency || 0,
          completeness: metrics?.completeness || 0,
          license_status: metrics?.license_status || 1,
          anomaly_inverse: metrics?.anomaly_inverse || 0
        })?.select()?.single();

      if (error) {
        console.error('Error updating stream DHI:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in updateStreamDHI:', error);
      return false;
    }
  },

  /**
   * Get DHI history for trend analysis
   */
  async getDHITrend(streamName, hours = 24) {
    try {
      const startTime = new Date();
      startTime?.setHours(startTime?.getHours() - hours);

      // Since we don't have historical data in this table,
      // we'll simulate some trend data for demonstration
      const mockTrend = [];
      const currentHealth = await this.getStreamHealth(streamName);
      
      for (let i = hours; i >= 0; i--) {
        const time = new Date();
        time?.setHours(time?.getHours() - i);
        
        // Simulate some variation around current DHI
        const variation = (Math.random() - 0.5) * 0.1;
        const dhi = Math.max(0, Math.min(1, (currentHealth?.dhi || 0.8) + variation));
        
        mockTrend?.push({
          timestamp: time,
          dhi: dhi,
          stream: streamName
        });
      }

      return mockTrend;
    } catch (error) {
      console.error('Error in getDHITrend:', error);
      return [];
    }
  },

  /**
   * Check if any stream needs attention
   */
  async checkStreamsNeedingAttention(threshold = 0.7) {
    try {
      const degradedStreams = await this.getDegradedStreams(threshold);
      
      return {
        needsAttention: degradedStreams?.length > 0,
        count: degradedStreams?.length || 0,
        streams: degradedStreams?.slice(0, 5), // Top 5 most critical
        severity: degradedStreams?.length > 5 ? 'critical' : 
                  degradedStreams?.length > 2 ? 'high' : 
                  degradedStreams?.length > 0 ? 'medium' : 'low'
      };
    } catch (error) {
      console.error('Error in checkStreamsNeedingAttention:', error);
      return {
        needsAttention: false,
        count: 0,
        streams: [],
        severity: 'low'
      };
    }
  },

  /**
   * Get data quality summary
   */
  async getDataQualitySummary() {
    try {
      const healthData = await this.getDataHealthIndex();
      
      const summary = {
        totalStreams: healthData?.streams?.length || 0,
        averageDHI: healthData?.dhi || 0,
        healthyStreams: healthData?.streams?.filter(s => s?.dhi >= 0.8)?.length || 0,
        degradedStreams: healthData?.streams?.filter(s => s?.dhi < 0.7)?.length || 0,
        warningStreams: healthData?.streams?.filter(s => s?.dhi >= 0.7 && s?.dhi < 0.8)?.length || 0
      };

      return summary;
    } catch (error) {
      console.error('Error in getDataQualitySummary:', error);
      return {
        totalStreams: 0,
        averageDHI: 0,
        healthyStreams: 0,
        degradedStreams: 0,
        warningStreams: 0
      };
    }
  }
};

export default dataHealthService;