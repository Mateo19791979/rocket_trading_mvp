import React, { useState } from 'react';
import { X, Send, Code, AlertCircle } from 'lucide-react';

export default function EnqueueTaskModal({ agents, onEnqueue, onClose }) {
  const [formData, setFormData] = useState({
    agent_name: '',
    task_type: '',
    payload: '{}',
    priority: 0
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commonTaskTypes = [
    'backtest',
    'screen',
    'signal',
    'analyze',
    'optimize',
    'validate',
    'report',
    'custom'
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.agent_name) {
      newErrors.agent_name = 'Agent is required';
    }
    
    if (!formData?.task_type?.trim()) {
      newErrors.task_type = 'Task type is required';
    }
    
    // Validate JSON payload
    try {
      const payload = formData?.payload?.trim();
      if (payload && payload !== '{}') {
        JSON.parse(payload);
      }
    } catch (e) {
      newErrors.payload = 'Invalid JSON format';
    }
    
    // Validate priority
    const priority = parseInt(formData?.priority);
    if (isNaN(priority) || priority < 0 || priority > 100) {
      newErrors.priority = 'Priority must be between 0 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const payload = formData?.payload?.trim();
      const parsedPayload = payload && payload !== '{}' ? JSON.parse(payload) : {};
      
      await onEnqueue({
        agent_name: formData?.agent_name,
        task_type: formData?.task_type?.trim(),
        payload: parsedPayload,
        priority: parseInt(formData?.priority)
      });
      
      // Reset form on success
      setFormData({
        agent_name: '',
        task_type: '',
        payload: '{}',
        priority: 0
      });
      
    } catch (error) {
      setErrors({ submit: error?.message || 'Failed to enqueue task' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPayloadExample = (taskType) => {
    const examples = {
      backtest: { symbol: 'NVDA', strategy: 'momentum', timeframe: '1d' },
      screen: { sector: 'tech', min_volume: 1000000 },
      signal: { symbol: 'MSFT', side: 'long', size: 0.1 },
      analyze: { market: 'crypto', analysis_type: 'sentiment' },
      optimize: { strategy_id: 'strategy_123', parameter: 'stop_loss' },
      validate: { model_id: 'model_456', dataset: 'test_data' },
      report: { type: 'daily', format: 'pdf' }
    };
    
    return JSON.stringify(examples?.[taskType] || {}, null, 2);
  };

  const handleTaskTypeChange = (taskType) => {
    handleChange('task_type', taskType);
    
    // Auto-populate payload example if empty or default
    if (formData?.payload === '{}' || !formData?.payload?.trim()) {
      const example = formatPayloadExample(taskType);
      handleChange('payload', example);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Send className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Enqueue New Task</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Agent Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Agent *
            </label>
            <select
              value={formData?.agent_name}
              onChange={(e) => handleChange('agent_name', e?.target?.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors?.agent_name ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select an agent...</option>
              {agents?.map(agent => (
                <option 
                  key={agent?.id} 
                  value={agent?.name}
                  disabled={agent?.status === 'offline' || agent?.status === 'error'}
                >
                  {agent?.name} ({agent?.status}) - {agent?.kind}
                </option>
              ))}
            </select>
            {errors?.agent_name && (
              <p className="mt-1 text-sm text-red-600">{errors?.agent_name}</p>
            )}
          </div>
          
          {/* Task Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Type *
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={formData?.task_type}
                onChange={(e) => handleChange('task_type', e?.target?.value)}
                placeholder="Enter custom task type..."
                className={`flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors?.task_type ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            
            {/* Common task type buttons */}
            <div className="flex flex-wrap gap-2">
              {commonTaskTypes?.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTaskTypeChange(type)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {type}
                </button>
              ))}
            </div>
            
            {errors?.task_type && (
              <p className="mt-1 text-sm text-red-600">{errors?.task_type}</p>
            )}
          </div>
          
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData?.priority}
              onChange={(e) => handleChange('priority', e?.target?.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors?.priority ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Higher priority tasks are executed first. Default: 0
            </p>
            {errors?.priority && (
              <p className="mt-1 text-sm text-red-600">{errors?.priority}</p>
            )}
          </div>
          
          {/* Payload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Task Payload (JSON)
              </div>
            </label>
            <textarea
              value={formData?.payload}
              onChange={(e) => handleChange('payload', e?.target?.value)}
              rows={8}
              placeholder='{"key": "value"}'
              className={`w-full border rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors?.payload ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">
              JSON object containing task parameters. Use {} for empty payload.
            </p>
            {errors?.payload && (
              <p className="mt-1 text-sm text-red-600">{errors?.payload}</p>
            )}
          </div>
          
          {/* Submit Error */}
          {errors?.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{errors?.submit}</p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enqueuing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enqueue Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}