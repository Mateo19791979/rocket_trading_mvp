import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Download, Settings, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { weeklyReportsService } from '../../services/weeklyReportsService';
import { useAuth } from '../../contexts/AuthContext';
import ReportTemplateSelector from './components/ReportTemplateSelector';
import ReportScheduleManager from './components/ReportScheduleManager';
import ReportPreview from './components/ReportPreview';
import GeneratedReportsHistory from './components/GeneratedReportsHistory';

export default function WeeklyPDFReports() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('templates');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data states
  const [templates, setTemplates] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [generatedReports, setGeneratedReports] = useState([]);
  const [generationJobs, setGenerationJobs] = useState([]);
  
  // UI states
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadAllData();
    }
  }, [user?.id]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [templatesResult, schedulesResult, reportsResult, jobsResult] = await Promise.all([
        weeklyReportsService?.getReportTemplates(user?.id),
        weeklyReportsService?.getReportSchedules(user?.id),
        weeklyReportsService?.getGeneratedReports(user?.id, 10),
        weeklyReportsService?.getReportGenerationJobs(user?.id, 20)
      ]);

      if (templatesResult?.error) throw new Error(templatesResult.error);
      if (schedulesResult?.error) throw new Error(schedulesResult.error);
      if (reportsResult?.error) throw new Error(reportsResult.error);
      if (jobsResult?.error) throw new Error(jobsResult.error);

      setTemplates(templatesResult?.data || []);
      setSchedules(schedulesResult?.data || []);
      setGeneratedReports(reportsResult?.data || []);
      setGenerationJobs(jobsResult?.data || []);

      // Set default template if none selected
      if (!selectedTemplate && templatesResult?.data?.length > 0) {
        const defaultTemplate = templatesResult?.data?.find(t => t?.is_default) || templatesResult?.data?.[0];
        setSelectedTemplate(defaultTemplate);
      }

    } catch (error) {
      setError(`Failed to load data: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (scheduleId) => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data, error } = await weeklyReportsService?.generateReportManually(scheduleId);
      
      if (error) throw new Error(error);
      
      // Refresh generation jobs to show new job
      const jobsResult = await weeklyReportsService?.getReportGenerationJobs(user?.id, 20);
      if (!jobsResult?.error) {
        setGenerationJobs(jobsResult?.data || []);
      }

      // Show success message
      alert('Report generation started successfully!');
      
    } catch (error) {
      setError(`Failed to generate report: ${error?.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setPreviewMode(true);
  };

  const handleScheduleCreate = async (scheduleData) => {
    try {
      const { data, error } = await weeklyReportsService?.createReportSchedule({
        ...scheduleData,
        user_id: user?.id
      });

      if (error) throw new Error(error);

      setSchedules(prev => [data, ...prev]);
      alert('Report schedule created successfully!');
    } catch (error) {
      setError(`Failed to create schedule: ${error?.message}`);
    }
  };

  const handleDownloadReport = async (documentId) => {
    try {
      const { data, error } = await weeklyReportsService?.downloadReport(documentId);
      
      if (error) throw new Error(error);
      
      // In a real implementation, you would initiate file download
      window.open(data?.downloadUrl, '_blank');
    } catch (error) {
      setError(`Failed to download report: ${error?.message}`);
    }
  };

  const getActiveSchedulesCount = () => {
    return schedules?.filter(s => s?.schedule_status === 'active')?.length || 0;
  };

  const getRecentReportsCount = () => {
    return generatedReports?.length || 0;
  };

  const getRunningJobsCount = () => {
    return generationJobs?.filter(j => j?.job_status === 'pending')?.length || 0;
  };

  if (loading && !templates?.length) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-white">Loading weekly PDF reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Weekly PDF Reports</h1>
              <p className="text-gray-400">Automated generation and management of comprehensive trading performance reports</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gray-800 rounded-lg px-4 py-2 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-white text-sm">{getActiveSchedulesCount()} Active Schedules</span>
              </div>
              <div className="bg-gray-800 rounded-lg px-4 py-2 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-green-500" />
                <span className="text-white text-sm">{getRecentReportsCount()} Recent Reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-900 border border-red-700 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-200">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'templates' ?'bg-blue-600 text-white' :'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'schedules' ?'bg-blue-600 text-white' :'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Schedules
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'preview' ?'bg-blue-600 text-white' :'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'history' ?'bg-blue-600 text-white' :'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Download className="w-4 h-4 inline mr-2" />
            History
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'templates' && (
            <ReportTemplateSelector
              templates={templates}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={handleTemplateSelect}
              onTemplateChange={(updatedTemplates) => setTemplates(updatedTemplates)}
              userId={user?.id}
            />
          )}

          {activeTab === 'schedules' && (
            <ReportScheduleManager
              schedules={schedules}
              templates={templates}
              selectedSchedule={selectedSchedule}
              onScheduleSelect={setSelectedSchedule}
              onScheduleCreate={handleScheduleCreate}
              onScheduleChange={(updatedSchedules) => setSchedules(updatedSchedules)}
              onGenerateReport={handleGenerateReport}
              isGenerating={isGenerating}
              userId={user?.id}
            />
          )}

          {activeTab === 'preview' && (
            <ReportPreview
              selectedTemplate={selectedTemplate}
              templates={templates}
              onTemplateSelect={setSelectedTemplate}
              userId={user?.id}
            />
          )}

          {activeTab === 'history' && (
            <GeneratedReportsHistory
              generatedReports={generatedReports}
              generationJobs={generationJobs}
              onDownloadReport={handleDownloadReport}
              onRefresh={() => loadAllData()}
            />
          )}
        </div>

        {/* Running Jobs Status */}
        {getRunningJobsCount() > 0 && (
          <div className="fixed bottom-6 right-6 bg-blue-900 border border-blue-700 rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <div>
                <h3 className="text-blue-200 font-medium">Generating Reports</h3>
                <p className="text-blue-300 text-sm">{getRunningJobsCount()} report{getRunningJobsCount() > 1 ? 's' : ''} in progress</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}