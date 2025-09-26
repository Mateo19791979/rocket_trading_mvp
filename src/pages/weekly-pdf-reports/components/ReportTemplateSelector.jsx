import React, { useState } from 'react';
import { Settings, Plus, Edit3, Trash2, Star, StarOff, Palette, BarChart3, Save, X } from 'lucide-react';
import { weeklyReportsService } from '../../../services/weeklyReportsService';

export default function ReportTemplateSelector({ 
  templates, 
  selectedTemplate, 
  onTemplateSelect, 
  onTemplateChange,
  userId 
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    template_name: '',
    template_type: 'portfolio_summary',
    template_config: {
      includeLogo: true,
      colorScheme: 'professional',
      layout: 'modern'
    },
    branding_config: {
      logoUrl: '',
      primaryColor: '#1e40af',
      secondaryColor: '#f3f4f6'
    },
    sections_config: {
      sections: ['performance_overview', 'key_metrics', 'top_positions']
    },
    chart_types: ['line_chart', 'pie_chart', 'bar_chart'],
    is_default: false
  });

  const templateTypes = [
    { value: 'executive_summary', label: 'Executive Summary', description: 'High-level overview with key metrics' },
    { value: 'detailed_performance', label: 'Detailed Performance Analysis', description: 'Comprehensive analysis with full metrics' },
    { value: 'risk_assessment', label: 'Risk Assessment', description: 'Focus on risk metrics and analysis' },
    { value: 'portfolio_summary', label: 'Portfolio Summary', description: 'Standard portfolio overview' }
  ];

  const colorSchemes = [
    { value: 'professional', label: 'Professional Blue', colors: ['#1e40af', '#f3f4f6'] },
    { value: 'success', label: 'Success Green', colors: ['#059669', '#ecfdf5'] },
    { value: 'warning', label: 'Warning Orange', colors: ['#d97706', '#fef3c7'] },
    { value: 'premium', label: 'Premium Dark', colors: ['#374151', '#f9fafb'] }
  ];

  const availableSections = [
    { value: 'performance_overview', label: 'Performance Overview' },
    { value: 'key_metrics', label: 'Key Metrics' },
    { value: 'top_positions', label: 'Top Positions' },
    { value: 'risk_summary', label: 'Risk Summary' },
    { value: 'trade_history', label: 'Trade History' },
    { value: 'market_comparison', label: 'Market Comparison' },
    { value: 'full_performance', label: 'Full Performance Analysis' },
    { value: 'all_positions', label: 'All Positions' },
    { value: 'risk_analysis', label: 'Detailed Risk Analysis' }
  ];

  const chartTypes = [
    { value: 'line_chart', label: 'Line Chart' },
    { value: 'pie_chart', label: 'Pie Chart' },
    { value: 'bar_chart', label: 'Bar Chart' },
    { value: 'candlestick_chart', label: 'Candlestick Chart' },
    { value: 'heat_map', label: 'Heat Map' },
    { value: 'scatter_plot', label: 'Scatter Plot' }
  ];

  const handleCreateTemplate = () => {
    setIsCreating(true);
    setFormData({
      template_name: '',
      template_type: 'portfolio_summary',
      template_config: {
        includeLogo: true,
        colorScheme: 'professional',
        layout: 'modern'
      },
      branding_config: {
        logoUrl: '',
        primaryColor: '#1e40af',
        secondaryColor: '#f3f4f6'
      },
      sections_config: {
        sections: ['performance_overview', 'key_metrics', 'top_positions']
      },
      chart_types: ['line_chart', 'pie_chart', 'bar_chart'],
      is_default: false
    });
  };

  const handleEditTemplate = (template) => {
    setIsEditing(true);
    setEditingTemplate(template);
    setFormData({
      template_name: template?.template_name,
      template_type: template?.template_type,
      template_config: template?.template_config || {},
      branding_config: template?.branding_config || {},
      sections_config: template?.sections_config || { sections: [] },
      chart_types: template?.chart_types || [],
      is_default: template?.is_default || false
    });
  };

  const handleSaveTemplate = async () => {
    setLoading(true);

    try {
      const templateData = {
        ...formData,
        user_id: userId,
        template_config: JSON.stringify(formData?.template_config),
        branding_config: JSON.stringify(formData?.branding_config),
        sections_config: JSON.stringify(formData?.sections_config),
        chart_types: JSON.stringify(formData?.chart_types)
      };

      let result;
      if (isEditing) {
        result = await weeklyReportsService?.updateReportTemplate(editingTemplate?.id, templateData);
      } else {
        result = await weeklyReportsService?.createReportTemplate(templateData);
      }

      if (result?.error) throw new Error(result.error);

      // Update templates list
      if (isEditing) {
        const updatedTemplates = templates?.map(t => 
          t?.id === editingTemplate?.id ? result?.data : t
        );
        onTemplateChange(updatedTemplates);
      } else {
        onTemplateChange([result?.data, ...templates]);
      }

      // Reset form
      setIsCreating(false);
      setIsEditing(false);
      setEditingTemplate(null);

    } catch (error) {
      alert(`Failed to save template: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    setLoading(true);

    try {
      const { error } = await weeklyReportsService?.deleteReportTemplate(templateId);
      
      if (error) throw new Error(error);

      const updatedTemplates = templates?.filter(t => t?.id !== templateId);
      onTemplateChange(updatedTemplates);

    } catch (error) {
      alert(`Failed to delete template: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (templateId) => {
    setLoading(true);

    try {
      // First, unset all other defaults
      const updatePromises = templates?.map(t => 
        t?.is_default && t?.id !== templateId 
          ? weeklyReportsService?.updateReportTemplate(t?.id, { is_default: false })
          : Promise.resolve()
      );
      
      await Promise.all(updatePromises);

      // Set new default
      const { data, error } = await weeklyReportsService?.updateReportTemplate(templateId, { is_default: true });
      
      if (error) throw new Error(error);

      // Update templates list
      const updatedTemplates = templates?.map(t => ({
        ...t,
        is_default: t?.id === templateId
      }));
      onTemplateChange(updatedTemplates);

    } catch (error) {
      alert(`Failed to set default template: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditingTemplate(null);
  };

  const handleSectionToggle = (sectionValue) => {
    const currentSections = formData?.sections_config?.sections || [];
    const newSections = currentSections?.includes(sectionValue)
      ? currentSections?.filter(s => s !== sectionValue)
      : [...currentSections, sectionValue];
    
    setFormData(prev => ({
      ...prev,
      sections_config: { sections: newSections }
    }));
  };

  const handleChartToggle = (chartValue) => {
    const currentCharts = formData?.chart_types || [];
    const newCharts = currentCharts?.includes(chartValue)
      ? currentCharts?.filter(c => c !== chartValue)
      : [...currentCharts, chartValue];
    
    setFormData(prev => ({
      ...prev,
      chart_types: newCharts
    }));
  };

  if (isCreating || isEditing) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-2">
            {isEditing ? 'Edit Template' : 'Create New Template'}
          </h2>
          <p className="text-gray-400">Configure your report template settings and appearance</p>
        </div>
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Template Name</label>
              <input
                type="text"
                value={formData?.template_name}
                onChange={(e) => setFormData(prev => ({ ...prev, template_name: e?.target?.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Executive Summary Template"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Template Type</label>
              <select
                value={formData?.template_type}
                onChange={(e) => setFormData(prev => ({ ...prev, template_type: e?.target?.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {templateTypes?.map(type => (
                  <option key={type?.value} value={type?.value}>
                    {type?.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color Scheme */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Color Scheme</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {colorSchemes?.map(scheme => (
                <button
                  key={scheme?.value}
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    template_config: { ...prev?.template_config, colorScheme: scheme?.value },
                    branding_config: { 
                      ...prev?.branding_config, 
                      primaryColor: scheme?.colors?.[0], 
                      secondaryColor: scheme?.colors?.[1] 
                    }
                  }))}
                  className={`p-3 border rounded-lg transition-colors ${
                    formData?.template_config?.colorScheme === scheme?.value
                      ? 'border-blue-500 bg-blue-900/20' :'border-gray-600 bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex space-x-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: scheme?.colors?.[0] }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: scheme?.colors?.[1] }}
                    />
                  </div>
                  <span className="text-sm text-gray-300">{scheme?.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Report Sections */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Report Sections</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableSections?.map(section => (
                <label key={section?.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData?.sections_config?.sections?.includes(section?.value)}
                    onChange={() => handleSectionToggle(section?.value)}
                    className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                  />
                  <span className="text-sm text-gray-300">{section?.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Chart Types */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Chart Types</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {chartTypes?.map(chart => (
                <label key={chart?.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData?.chart_types?.includes(chart?.value)}
                    onChange={() => handleChartToggle(chart?.value)}
                    className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                  />
                  <span className="text-sm text-gray-300">{chart?.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Default Template */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData?.is_default}
                onChange={(e) => setFormData(prev => ({ ...prev, is_default: e?.target?.checked }))}
                className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
              />
              <span className="text-sm text-gray-300">Set as default template</span>
            </label>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-700 flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4 inline mr-1" />
            Cancel
          </button>
          <button
            onClick={handleSaveTemplate}
            disabled={loading || !formData?.template_name}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4 inline mr-1" />
            {loading ? 'Saving...' : 'Save Template'}
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
          <h2 className="text-xl font-semibold text-white mb-2">Report Templates</h2>
          <p className="text-gray-400">Manage your PDF report templates with customizable layouts and branding</p>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          New Template
        </button>
      </div>
      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map(template => (
          <div
            key={template?.id}
            className={`bg-gray-800 border rounded-lg p-6 transition-all cursor-pointer hover:bg-gray-750 ${
              selectedTemplate?.id === template?.id 
                ? 'border-blue-500 ring-2 ring-blue-500/20' :'border-gray-700 hover:border-gray-600'
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            {/* Template Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-400" />
                {template?.is_default && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    handleEditTemplate(template);
                  }}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    handleDeleteTemplate(template?.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Template Info */}
            <h3 className="text-lg font-medium text-white mb-2">{template?.template_name}</h3>
            <p className="text-sm text-gray-400 mb-3">
              {weeklyReportsService?.getTemplateTypeLabel(template?.template_type)}
            </p>

            {/* Template Features */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Palette className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">
                  {template?.template_config?.colorScheme || 'Professional'} theme
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400">
                  {template?.chart_types?.length || 0} chart types
                </span>
              </div>
            </div>

            {/* Default Badge */}
            {!template?.is_default && (
              <button
                onClick={(e) => {
                  e?.stopPropagation();
                  handleSetDefault(template?.id);
                }}
                className="mt-3 text-xs text-gray-400 hover:text-blue-400 transition-colors flex items-center space-x-1"
              >
                <StarOff className="w-3 h-3" />
                <span>Set as default</span>
              </button>
            )}
          </div>
        ))}

        {/* Empty State */}
        {!templates?.length && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Settings className="w-12 h-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No Templates Yet</h3>
            <p className="text-gray-500 mb-4">Create your first report template to get started</p>
            <button
              onClick={handleCreateTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
}