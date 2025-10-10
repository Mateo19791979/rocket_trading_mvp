import { supabase } from '../lib/supabase';

class DailyIntelligenceReportService {
  async getDailyReport(date = null) {
    try {
      const reportDate = date || new Date()?.toISOString()?.split('T')?.[0];
      
      const { data, error } = await supabase
        ?.from('ai_daily_reports')
        ?.select('*')
        ?.eq('day', reportDate)
        ?.single();

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError') ||
            error?.name === 'TypeError') {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
        }
        if (error?.code === 'PGRST116') {
          // No report found for date, generate one
          return this.generateTodayReport();
        }
        throw error;
      }

      return this.formatReportData(data);
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError') {
        throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
      }
      throw new Error(`Failed to fetch daily intelligence report: ${error?.message}`);
    }
  }

  async getLatestReport() {
    try {
      const { data, error } = await supabase
        ?.from('ai_daily_reports')
        ?.select('*')
        ?.order('day', { ascending: false })
        ?.limit(1)
        ?.single();

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError') ||
            error?.name === 'TypeError') {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
        }
        if (error?.code === 'PGRST116') {
          // No reports found, generate today's report
          return this.generateTodayReport();
        }
        throw error;
      }

      return this.formatReportData(data);
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError') {
        throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
      }
      throw new Error(`Failed to fetch latest daily intelligence report: ${error?.message}`);
    }
  }

  async generateTodayReport() {
    try {
      // Call the stored function to generate today's report
      const { error: functionError } = await supabase
        ?.rpc('generate_daily_intelligence_report');

      if (functionError) {
        throw functionError;
      }

      // Fetch the newly generated report
      const today = new Date()?.toISOString()?.split('T')?.[0];
      const { data, error } = await supabase
        ?.from('ai_daily_reports')
        ?.select('*')
        ?.eq('day', today)
        ?.single();

      if (error) {
        throw error;
      }

      return this.formatReportData(data);
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError') {
        throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
      }
      throw new Error(`Failed to generate daily intelligence report: ${error?.message}`);
    }
  }

  async getReportHistory(limit = 30) {
    try {
      const { data, error } = await supabase
        ?.from('ai_daily_reports')
        ?.select('day, report->cost_eur, report->calls, report->avg_iqs, report->avg_dhi, report->agents_active, report->tasks_failed, created_at')
        ?.order('day', { ascending: false })
        ?.limit(limit);

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError') ||
            error?.name === 'TypeError') {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
        }
        throw error;
      }

      return data?.map(item => ({
        day: item?.day,
        costEur: parseFloat(item?.cost_eur || 0),
        calls: parseInt(item?.calls || 0),
        avgIqs: parseFloat(item?.avg_iqs || 0),
        avgDhi: parseFloat(item?.avg_dhi || 0),
        agentsActive: parseInt(item?.agents_active || 0),
        tasksFailed: parseInt(item?.tasks_failed || 0),
        createdAt: item?.created_at
      })) || [];
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError') {
        throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
      }
      throw new Error(`Failed to fetch daily intelligence report history: ${error?.message}`);
    }
  }

  async getCurrentMetrics() {
    try {
      // Get real-time view of today's metrics
      const { data, error } = await supabase
        ?.from('daily_ai_report')
        ?.select('*')
        ?.single();

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError') ||
            error?.name === 'TypeError') {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
        }
        throw error;
      }

      return {
        day: data?.day,
        costEur: parseFloat(data?.cost_eur || 0),
        calls: parseInt(data?.calls || 0),
        avgIqs: parseFloat(data?.avg_iqs || 0),
        avgDhi: parseFloat(data?.avg_dhi || 0),
        agentsActive: parseInt(data?.agents_active || 0),
        tasksDone: parseInt(data?.tasks_done || 0),
        tasksFailed: parseInt(data?.tasks_failed || 0),
        agentsFailed: data?.agents_failed || []
      };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError') {
        throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
      }
      throw new Error(`Failed to fetch current metrics: ${error?.message}`);
    }
  }

  formatReportData(rawData) {
    if (!rawData || !rawData?.report) {
      return null;
    }

    const report = rawData?.report;
    
    return {
      day: rawData?.day,
      costEur: parseFloat(report?.cost_eur || 0),
      calls: parseInt(report?.calls || 0),
      avgIqs: parseFloat(report?.avg_iqs || 0),
      avgDhi: parseFloat(report?.avg_dhi || 0),
      agentsActive: parseInt(report?.agents_active || 0),
      tasksDone: parseInt(report?.tasks_done || 0),
      tasksFailed: parseInt(report?.tasks_failed || 0),
      agentsFailed: report?.agents_failed || [],
      markdown: report?.md || '',
      createdAt: rawData?.created_at,
      updatedAt: rawData?.updated_at,
      
      // Computed insights
      performance: report?.avg_iqs > 0.8 ? 'excellente' : 'à surveiller',
      dataQuality: report?.avg_dhi > 0.85 ? 'stable' : 'fragile',
      costLevel: report?.cost_eur > 5 ? 'élevé' : 'normal',
      
      // Recommendations
      recommendations: this.generateRecommendations(report)
    };
  }

  generateRecommendations(report) {
    const recommendations = [];
    
    if (parseFloat(report?.avg_dhi || 0) < 0.8) {
      recommendations?.push({
        type: 'warning',
        icon: '⚠️',
        message: 'Vérifier les sources avec DHI < 0.7',
        priority: 'medium'
      });
    }
    
    if (parseInt(report?.tasks_failed || 0) > 10) {
      recommendations?.push({
        type: 'error',
        icon: '🔍',
        message: 'Analyser les agents ayant échoué',
        priority: 'high'
      });
    }
    
    if (parseFloat(report?.cost_eur || 0) > 5) {
      recommendations?.push({
        type: 'info',
        icon: '💰',
        message: 'Passer en mode cheap pendant les heures creuses',
        priority: 'low'
      });
    }

    if (parseFloat(report?.avg_iqs || 0) < 0.5) {
      recommendations?.push({
        type: 'error',
        icon: '🧠',
        message: 'IQS critique - Réviser les paramètres d\'intelligence',
        priority: 'critical'
      });
    }

    if (parseInt(report?.agents_active || 0) === 0) {
      recommendations?.push({
        type: 'error',
        icon: '🤖',
        message: 'Aucun agent actif détecté - Vérifier le système',
        priority: 'critical'
      });
    }
    
    return recommendations;
  }

  // Real-time subscription for daily report updates
  subscribeToDailyReportUpdates(callback) {
    if (!callback) {
      return null;
    }

    try {
      const subscription = supabase
        ?.channel('daily_report_updates')
        ?.on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'ai_daily_reports'
        }, (payload) => {
          callback(payload);
        })
        ?.subscribe();

      return subscription;
    } catch (error) {
      return null;
    }
  }
}

export default new DailyIntelligenceReportService();