import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Upload, 
  Download, 
  Settings, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Save
} from 'lucide-react';
import { providerConfigurationService } from '../../../services/providerConfigurationService';

const GoogleSheetsFallbackPanel = () => {
  const [configs, setConfigs] = useState([]);
  const [currentConfig, setCurrentConfig] = useState({
    spreadsheet_id: '',
    service_account_email: '',
    worksheet_name: 'market_data',
    sync_enabled: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const data = await providerConfigurationService?.getGoogleSheetsConfigs();
      setConfigs(data || []);
      
      if (data?.length > 0) {
        setCurrentConfig(data?.[0]);
      }
    } catch (error) {
      console.error('Error loading Google Sheets configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      await providerConfigurationService?.saveGoogleSheetsConfig(currentConfig);
      await loadConfigurations();
      
      // Success notification would go here
      
    } catch (error) {
      console.error('Error saving config:', error);
      // Error notification would go here
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCurrentConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getConnectionStatus = () => {
    if (!currentConfig?.spreadsheet_id || !currentConfig?.service_account_email) {
      return { status: 'not_configured', color: 'text-gray-400', icon: XCircle };
    }
    if (currentConfig?.sync_enabled) {
      return { status: 'active', color: 'text-green-400', icon: CheckCircle };
    }
    return { status: 'configured', color: 'text-orange-400', icon: AlertTriangle };
  };

  const status = getConnectionStatus();
  const StatusIcon = status?.icon;

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center h-40">
          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-teal-500" />
        <h2 className="text-xl font-semibold">Google Sheets Fallback Configuration</h2>
      </div>
      {/* Status Overview */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className={`w-5 h-5 ${status?.color}`} />
            <div>
              <h3 className="font-medium">Backup Data Source Status</h3>
              <p className="text-sm text-gray-400">
                {status?.status === 'not_configured' && 'Not configured - Setup required'}
                {status?.status === 'configured' && 'Configured but disabled'}
                {status?.status === 'active' && 'Active and ready for failover'}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            status?.status === 'active' ? 'bg-green-900/50 text-green-400' :
            status?.status === 'configured'? 'bg-orange-900/50 text-orange-400' : 'bg-gray-600/50 text-gray-400'
          }`}>
            {status?.status?.replace('_', ' ')?.toUpperCase()}
          </div>
        </div>
      </div>
      {/* Configuration Form */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Service Account Authentication</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Service Account Email
              </label>
              <input
                type="email"
                value={currentConfig?.service_account_email || ''}
                onChange={(e) => handleInputChange('service_account_email', e?.target?.value)}
                placeholder="trading-mvp@your-project.iam.gserviceaccount.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                Service account with Google Sheets API access required
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Spreadsheet Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Spreadsheet ID
              </label>
              <input
                type="text"
                value={currentConfig?.spreadsheet_id || ''}
                onChange={(e) => handleInputChange('spreadsheet_id', e?.target?.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                Found in the Google Sheets URL between /d/ and /edit
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Worksheet Name
              </label>
              <input
                type="text"
                value={currentConfig?.worksheet_name || ''}
                onChange={(e) => handleInputChange('worksheet_name', e?.target?.value)}
                placeholder="market_data"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Automatic Failover Settings */}
        <div>
          <h3 className="text-lg font-medium mb-4">Automatic Failover Configuration</h3>
          
          <div className="bg-gray-700/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Enable Automatic Failover</h4>
                <p className="text-sm text-gray-400">
                  Automatically switch to Google Sheets when primary providers fail
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentConfig?.sync_enabled || false}
                  onChange={(e) => handleInputChange('sync_enabled', e?.target?.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-gray-300">Latency &gt; 400ms</span>
              </div>
              
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-gray-300">Connection failures</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Quota exceeded</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mock Data Management */}
        <div>
          <h3 className="text-lg font-medium mb-4">Mock Data Management</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Upload className="w-4 h-4" />
              Upload Sample Data
            </button>
            
            <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>
          
          <p className="text-xs text-gray-400 mt-2">
            Use the template to format your backup market data properly
          </p>
        </div>

        {/* Save Configuration */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentConfig?.spreadsheet_id && (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${currentConfig?.spreadsheet_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Spreadsheet
                </a>
              )}
            </div>
            
            <button
              onClick={handleSaveConfig}
              disabled={saving || !currentConfig?.spreadsheet_id?.trim() || !currentConfig?.service_account_email?.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Last Sync Info */}
      {currentConfig?.last_sync_at && (
        <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Last Sync:</span>
            <span className="text-gray-300">
              {new Date(currentConfig?.last_sync_at)?.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsFallbackPanel;