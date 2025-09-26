import React, { useState } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const RiskConfigurationPanel = ({ 
  riskController, 
  onUpdateConfiguration,
  isLoading = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    max_daily_loss: riskController?.max_daily_loss || 1000,
    max_portfolio_drawdown: riskController?.max_portfolio_drawdown || 10,
    auto_recovery_enabled: riskController?.auto_recovery_enabled ?? true,
    recovery_delay_minutes: riskController?.recovery_delay_minutes || 30,
    configuration: {
      market_hours_only: riskController?.configuration?.market_hours_only ?? true,
      validate_orders: riskController?.configuration?.validate_orders ?? true,
      max_position_size: riskController?.configuration?.max_position_size || 50000,
      ...riskController?.configuration
    }
  });

  const handleInputChange = (field, value) => {
    if (field?.startsWith('configuration.')) {
      const configField = field?.replace('configuration.', '');
      setFormData(prev => ({
        ...prev,
        configuration: {
          ...prev?.configuration,
          [configField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    if (!riskController?.id) return;

    setIsSaving(true);
    try {
      const updates = {
        max_daily_loss: parseFloat(formData?.max_daily_loss),
        max_portfolio_drawdown: parseFloat(formData?.max_portfolio_drawdown),
        auto_recovery_enabled: formData?.auto_recovery_enabled,
        recovery_delay_minutes: parseInt(formData?.recovery_delay_minutes),
        configuration: formData?.configuration
      };

      await onUpdateConfiguration?.(riskController?.id, updates);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      max_daily_loss: riskController?.max_daily_loss || 1000,
      max_portfolio_drawdown: riskController?.max_portfolio_drawdown || 10,
      auto_recovery_enabled: riskController?.auto_recovery_enabled ?? true,
      recovery_delay_minutes: riskController?.recovery_delay_minutes || 30,
      configuration: {
        market_hours_only: riskController?.configuration?.market_hours_only ?? true,
        validate_orders: riskController?.configuration?.validate_orders ?? true,
        max_position_size: riskController?.configuration?.max_position_size || 50000,
        ...riskController?.configuration
      }
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(4)]?.map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Settings className="h-6 w-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Risk Configuration</h2>
        </div>
        
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              disabled={isSaving}
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        )}
      </div>
      <div className="space-y-6">
        {/* Risk Limits */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Limits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Daily Loss ($)
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={formData?.max_daily_loss}
                  onChange={(e) => handleInputChange('max_daily_loss', e?.target?.value)}
                  placeholder="1000.00"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  ${formData?.max_daily_loss?.toLocaleString() || '0'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Portfolio Drawdown (%)
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={formData?.max_portfolio_drawdown}
                  onChange={(e) => handleInputChange('max_portfolio_drawdown', e?.target?.value)}
                  placeholder="10.00"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  {formData?.max_portfolio_drawdown}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recovery Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recovery Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData?.auto_recovery_enabled}
                  onChange={(e) => handleInputChange('auto_recovery_enabled', e?.target?.checked)}
                  disabled={!isEditing}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable Auto Recovery
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recovery Delay (minutes)
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  min="1"
                  value={formData?.recovery_delay_minutes}
                  onChange={(e) => handleInputChange('recovery_delay_minutes', e?.target?.value)}
                  placeholder="30"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  {formData?.recovery_delay_minutes} minutes
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trading Controls */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Trading Controls</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData?.configuration?.market_hours_only ?? true}
                    onChange={(e) => handleInputChange('configuration.market_hours_only', e?.target?.checked)}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Market Hours Only
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-6">
                  Prevent trading outside market hours
                </p>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData?.configuration?.validate_orders ?? true}
                    onChange={(e) => handleInputChange('configuration.validate_orders', e?.target?.checked)}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Validate Orders
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-6">
                  Enable order validation checks
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Position Size ($)
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  step="1"
                  value={formData?.configuration?.max_position_size || 50000}
                  onChange={(e) => handleInputChange('configuration.max_position_size', parseInt(e?.target?.value))}
                  placeholder="50000"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  ${(formData?.configuration?.max_position_size || 50000)?.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Last updated: {riskController?.updated_at 
            ? new Date(riskController.updated_at)?.toLocaleString()
            : 'Never'
          }
        </p>
      </div>
    </div>
  );
};

export default RiskConfigurationPanel;