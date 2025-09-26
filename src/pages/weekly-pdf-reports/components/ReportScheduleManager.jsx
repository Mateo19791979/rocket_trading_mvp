import React, { useState } from 'react';
import { Clock, Play, Pause, Trash2, Plus, Calendar, Mail, Settings, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { weeklyReportsService } from '../../../services/weeklyReportsService';
import Icon from '../../../components/AppIcon';


export default function ReportScheduleManager({ 
  schedules, 
  templates, 
  selectedSchedule, 
  onScheduleSelect, 
  onScheduleCreate,
  onScheduleChange,
  onGenerateReport,
  isGenerating,
  userId 
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schedule_name: '',
    template_id: '',
    frequency: 'weekly',
    schedule_status: 'active',
    delivery_time: '09:00',
    delivery_day: 1,
    email_recipients: [''],
    portfolio_filters: { includeAllPortfolios: true, portfolioIds: [] },
    performance_periods: ['1w', '1m', '3m', '1y']
  });

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  const weekDays = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' }
  ];

  const performancePeriods = [
    { value: '1d', label: '1 Day' },
    { value: '1w', label: '1 Week' },
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' }
  ];

  const handleCreateSchedule = () => {
    setIsCreating(true);
    setFormData({
      schedule_name: '',
      template_id: templates?.[0]?.id || '',
      frequency: 'weekly',
      schedule_status: 'active',
      delivery_time: '09:00',
      delivery_day: 1,
      email_recipients: [''],
      portfolio_filters: { includeAllPortfolios: true, portfolioIds: [] },
      performance_periods: ['1w', '1m', '3m', '1y']
    });
  };

  const handleSaveSchedule = async () => {
    setLoading(true);

    try {
      const scheduleData = {
        ...formData,
        email_recipients: formData?.email_recipients?.filter(email => email?.trim()),
        portfolio_filters: JSON.stringify(formData?.portfolio_filters),
        performance_periods: JSON.stringify(formData?.performance_periods)
      };

      await onScheduleCreate(scheduleData);
      setIsCreating(false);

    } catch (error) {
      alert(`Failed to create schedule: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateScheduleStatus = async (scheduleId, status) => {
    setLoading(true);

    try {
      const { data, error } = await weeklyReportsService?.updateReportSchedule(scheduleId, {
        schedule_status: status
      });

      if (error) throw new Error(error);

      const updatedSchedules = schedules?.map(s => 
        s?.id === scheduleId ? { ...s, schedule_status: status } : s
      );
      onScheduleChange(updatedSchedules);

    } catch (error) {
      alert(`Failed to update schedule: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    setLoading(true);

    try {
      const { error } = await weeklyReportsService?.deleteReportSchedule(scheduleId);
      
      if (error) throw new Error(error);

      const updatedSchedules = schedules?.filter(s => s?.id !== scheduleId);
      onScheduleChange(updatedSchedules);

    } catch (error) {
      alert(`Failed to delete schedule: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmailRecipient = () => {
    setFormData(prev => ({
      ...prev,
      email_recipients: [...prev?.email_recipients, '']
    }));
  };

  const handleRemoveEmailRecipient = (index) => {
    setFormData(prev => ({
      ...prev,
      email_recipients: prev?.email_recipients?.filter((_, i) => i !== index)
    }));
  };

  const handleEmailChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      email_recipients: prev?.email_recipients?.map((email, i) => i === index ? value : email)
    }));
  };

  const handlePerformancePeriodToggle = (period) => {
    setFormData(prev => ({
      ...prev,
      performance_periods: prev?.performance_periods?.includes(period)
        ? prev?.performance_periods?.filter(p => p !== period)
        : [...prev?.performance_periods, period]
    }));
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': { color: 'bg-green-900 text-green-300', icon: CheckCircle },
      'paused': { color: 'bg-yellow-900 text-yellow-300', icon: Pause },
      'disabled': { color: 'bg-gray-900 text-gray-300', icon: AlertCircle }
    };
    
    const badge = badges?.[status] || badges?.disabled;
    const Icon = badge?.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${badge?.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  if (isCreating) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-2">Create New Schedule</h2>
          <p className="text-gray-400">Set up automated report generation and delivery</p>
        </div>
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Schedule Name</label>
              <input
                type="text"
                value={formData?.schedule_name}
                onChange={(e) => setFormData(prev => ({ ...prev, schedule_name: e?.target?.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Weekly Executive Summary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Report Template</label>
              <select
                value={formData?.template_id}
                onChange={(e) => setFormData(prev => ({ ...prev, template_id: e?.target?.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a template</option>
                {templates?.map(template => (
                  <option key={template?.id} value={template?.id}>
                    {template?.template_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Schedule Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
              <select
                value={formData?.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e?.target?.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {frequencies?.map(freq => (
                  <option key={freq?.value} value={freq?.value}>
                    {freq?.label}
                  </option>
                ))}
              </select>
            </div>

            {formData?.frequency === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Delivery Day</label>
                <select
                  value={formData?.delivery_day}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_day: parseInt(e?.target?.value) }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {weekDays?.map(day => (
                    <option key={day?.value} value={day?.value}>
                      {day?.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Delivery Time</label>
              <input
                type="time"
                value={formData?.delivery_time}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_time: e?.target?.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Recipients</label>
            <div className="space-y-2">
              {formData?.email_recipients?.map((email, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e?.target?.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                  />
                  <button
                    onClick={() => handleRemoveEmailRecipient(index)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddEmailRecipient}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                + Add Email Recipient
              </button>
            </div>
          </div>

          {/* Performance Periods */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Performance Periods</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {performancePeriods?.map(period => (
                <label key={period?.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData?.performance_periods?.includes(period?.value)}
                    onChange={() => handlePerformancePeriodToggle(period?.value)}
                    className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                  />
                  <span className="text-sm text-gray-300">{period?.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-700 flex justify-end space-x-3">
          <button
            onClick={() => setIsCreating(false)}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSchedule}
            disabled={loading || !formData?.schedule_name || !formData?.template_id}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Schedule'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Report Schedules</h2>
          <p className="text-gray-400">Manage automated report generation and delivery schedules</p>
        </div>
        <button
          onClick={handleCreateSchedule}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          New Schedule
        </button>
      </div>
      {/* Schedules List */}
      <div className="space-y-4">
        {schedules?.map(schedule => (
          <div
            key={schedule?.id}
            className={`bg-gray-800 border rounded-lg p-6 transition-all ${
              selectedSchedule?.id === schedule?.id 
                ? 'border-blue-500 ring-2 ring-blue-500/20' :'border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between">
              {/* Schedule Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-white">{schedule?.schedule_name}</h3>
                  {getStatusBadge(schedule?.schedule_status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>{schedule?.template?.template_name || 'No Template'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {weeklyReportsService?.getFrequencyLabel(schedule?.frequency)}
                      {schedule?.frequency === 'weekly' && 
                        ` - ${weeklyReportsService?.getDeliveryDayName(schedule?.delivery_day)}`
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{weeklyReportsService?.formatDeliveryTime(schedule?.delivery_time)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{schedule?.email_recipients?.length || 0} recipients</span>
                  </div>
                </div>

                {schedule?.next_generation_at && (
                  <div className="mt-3 text-sm text-gray-500">
                    Next generation: {new Date(schedule.next_generation_at)?.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onGenerateReport(schedule?.id)}
                  disabled={isGenerating}
                  className="p-2 text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                  title="Generate Report Now"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => handleUpdateScheduleStatus(
                    schedule?.id, 
                    schedule?.schedule_status === 'active' ? 'paused' : 'active'
                  )}
                  className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                  title={schedule?.schedule_status === 'active' ? 'Pause Schedule' : 'Resume Schedule'}
                >
                  {schedule?.schedule_status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => handleDeleteSchedule(schedule?.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  title="Delete Schedule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {!schedules?.length && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="w-12 h-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No Schedules Yet</h3>
            <p className="text-gray-500 mb-4">Create your first automated report schedule</p>
            <button
              onClick={handleCreateSchedule}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
}