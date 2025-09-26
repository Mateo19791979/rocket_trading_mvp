import { supabase } from '../lib/supabase.js';

export const weeklyReportsService = {
  // Report Templates Management
  async getReportTemplates(userId) {
    try {
      const { data, error } = await supabase?.from('weekly_report_templates')?.select(`
          id,
          template_name,
          template_type,
          template_config,
          branding_config,
          sections_config,
          chart_types,
          is_default,
          created_at,
          updated_at
        `)?.eq('user_id', userId)?.order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  async createReportTemplate(templateData) {
    try {
      const { data, error } = await supabase?.from('weekly_report_templates')?.insert([templateData])?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  async updateReportTemplate(templateId, updates) {
    try {
      const { data, error } = await supabase?.from('weekly_report_templates')?.update(updates)?.eq('id', templateId)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  async deleteReportTemplate(templateId) {
    try {
      const { error } = await supabase?.from('weekly_report_templates')?.delete()?.eq('id', templateId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error?.message };
    }
  },

  // Report Schedules Management
  async getReportSchedules(userId) {
    try {
      const { data, error } = await supabase?.from('weekly_report_schedules')?.select(`
          id,
          schedule_name,
          frequency,
          schedule_status,
          delivery_time,
          delivery_day,
          email_recipients,
          portfolio_filters,
          performance_periods,
          last_generated_at,
          next_generation_at,
          created_at,
          updated_at,
          template:weekly_report_templates (
            id,
            template_name,
            template_type
          )
        `)?.eq('user_id', userId)?.order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  async createReportSchedule(scheduleData) {
    try {
      const { data, error } = await supabase?.from('weekly_report_schedules')?.insert([scheduleData])?.select(`
          *,
          template:weekly_report_templates (
            id,
            template_name,
            template_type
          )
        `)?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  async updateReportSchedule(scheduleId, updates) {
    try {
      const { data, error } = await supabase?.from('weekly_report_schedules')?.update(updates)?.eq('id', scheduleId)?.select(`
          *,
          template:weekly_report_templates (
            id,
            template_name,
            template_type
          )
        `)?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  async deleteReportSchedule(scheduleId) {
    try {
      const { error } = await supabase?.from('weekly_report_schedules')?.delete()?.eq('id', scheduleId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error?.message };
    }
  },

  // Report Generation
  async generateReportManually(scheduleId) {
    try {
      // Create generation job
      const { data: jobData, error: jobError } = await supabase?.from('report_generation_jobs')?.insert([{
          schedule_id: scheduleId,
          job_status: 'pending',
          generation_params: { manual_trigger: true }
        }])?.select()?.single();

      if (jobError) throw jobError;
      
      // Here you would typically trigger your PDF generation service
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update job status to completed (in real implementation, this would be done by the PDF service)
      const { data: completedJob, error: updateError } = await supabase?.from('report_generation_jobs')?.update({
          job_status: 'completed',
          completed_at: new Date()?.toISOString(),
          processing_time_seconds: 2
        })?.eq('id', jobData?.id)?.select()?.single();

      if (updateError) throw updateError;

      return { data: completedJob, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Generated Documents Management
  async getGeneratedReports(userId, limit = 20) {
    try {
      const { data, error } = await supabase?.from('generated_documents')?.select('*')?.eq('user_id', userId)?.in('document_type', ['portfolio_summary', 'trade_report', 'risk_assessment', 'compliance_report'])?.order('created_at', { ascending: false })?.limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  async getReportGenerationJobs(userId, limit = 50) {
    try {
      const { data, error } = await supabase?.from('report_generation_jobs')?.select(`
          id,
          job_status,
          started_at,
          completed_at,
          error_details,
          processing_time_seconds,
          generation_params,
          schedule:weekly_report_schedules (
            id,
            schedule_name,
            template:weekly_report_templates (
              template_name,
              template_type
            )
          ),
          document:generated_documents (
            id,
            title,
            file_path,
            file_size,
            downloaded_count
          )
        `)?.eq('user_id', userId)?.order('started_at', { ascending: false })?.limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  async downloadReport(documentId) {
    try {
      // First get document details
      const { data: document, error: docError } = await supabase?.from('generated_documents')?.select('file_path, title, downloaded_count')?.eq('id', documentId)?.single();

      if (docError) throw docError;

      if (!document?.file_path) {
        throw new Error('Report file not found');
      }

      // Increment download count
      await supabase?.from('generated_documents')?.update({ downloaded_count: (document?.downloaded_count || 0) + 1 })?.eq('id', documentId);

      // In a real implementation, you would:
      // 1. Generate a signed URL for the file from Supabase Storage
      // 2. Or serve the file through your backend API
      // For now, we'll return a mock download URL
      const downloadUrl = `/api/reports/download/${documentId}`;
      
      return { data: { downloadUrl, filename: document?.title }, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Portfolio Data for Reports
  async getPortfolioPerformanceData(userId, portfolioIds = [], startDate, endDate) {
    try {
      let query = supabase?.from('portfolios')?.select(`
          id,
          name,
          total_value,
          cash_balance,
          total_cost,
          realized_pnl,
          unrealized_pnl,
          performance_1d,
          performance_1w,
          performance_1m,
          performance_3m,
          performance_1y,
          risk_score,
          sharpe_ratio,
          beta,
          volatility,
          max_drawdown,
          positions:positions (
            id,
            quantity,
            market_value,
            unrealized_pnl,
            unrealized_pnl_percent,
            asset:assets (
              symbol,
              name,
              sector
            )
          ),
          trades:trades (
            id,
            price,
            quantity,
            trade_side,
            trade_value,
            pnl,
            executed_at,
            asset:assets (
              symbol,
              name
            )
          )
        `)?.eq('user_id', userId);

      if (portfolioIds?.length > 0) {
        query = query?.in('id', portfolioIds);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Utility functions
  getDeliveryDayName(dayNumber) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days?.[dayNumber] || 'Unknown';
  },

  formatDeliveryTime(timeString) {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`)?.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  },

  getTemplateTypeLabel(templateType) {
    const labels = {
      'executive_summary': 'Executive Summary',
      'detailed_performance': 'Detailed Performance Analysis',
      'risk_assessment': 'Risk Assessment',
      'portfolio_summary': 'Portfolio Summary'
    };
    return labels?.[templateType] || templateType;
  },

  getFrequencyLabel(frequency) {
    const labels = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly'
    };
    return labels?.[frequency] || frequency;
  }
};