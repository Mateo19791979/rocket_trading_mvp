import React, { useState } from 'react';
import { AlertTriangle, Power, Shield, AlertCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';

const EmergencyKillswitch = ({ 
  riskController, 
  onActivateKillswitch, 
  onDeactivateKillswitch,
  isLoading = false 
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationReason, setConfirmationReason] = useState('');
  const [actionType, setActionType] = useState(null);

  const isKillswitchActive = riskController?.killswitch_enabled || false;
  const status = riskController?.killswitch_status || 'inactive';

  const handleKillswitchToggle = (action) => {
    setActionType(action);
    setShowConfirmation(true);
    setConfirmationReason('');
  };

  const executeKillswitchAction = async () => {
    if (!confirmationReason?.trim()) return;

    try {
      if (actionType === 'activate') {
        await onActivateKillswitch?.(riskController?.id, confirmationReason);
      } else {
        await onDeactivateKillswitch?.(riskController?.id, confirmationReason);
      }
    } catch (error) {
      console.error('Killswitch action failed:', error);
    } finally {
      setShowConfirmation(false);
      setActionType(null);
      setConfirmationReason('');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'triggered':
        return 'text-red-600 bg-red-100';
      case 'active':
        return 'text-orange-600 bg-orange-100';
      case 'recovering':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'triggered':
        return <AlertTriangle className="h-6 w-6" />;
      case 'active':
        return <AlertCircle className="h-6 w-6" />;
      case 'recovering':
        return <Power className="h-6 w-6" />;
      default:
        return <Shield className="h-6 w-6" />;
    }
  };

  if (showConfirmation) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Confirm {actionType === 'activate' ? 'Killswitch Activation' : 'System Recovery'}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {actionType === 'activate' ?'This will immediately halt all trading activities and pause AI agents.' :'This will reactivate trading systems and resume AI agent operations.'
            }
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for {actionType}:
            </label>
            <textarea
              value={confirmationReason}
              onChange={(e) => setConfirmationReason(e?.target?.value)}
              placeholder="Enter reason for this action..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
              required
            />
          </div>

          <div className="flex space-x-3 justify-center">
            <Button
              onClick={() => setShowConfirmation(false)}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={executeKillswitchAction}
              variant={actionType === 'activate' ? 'destructive' : 'default'}
              disabled={isLoading || !confirmationReason?.trim()}
            >
              {isLoading ? 'Processing...' : `Confirm ${actionType === 'activate' ? 'Activation' : 'Recovery'}`}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Emergency Killswitch</h2>
            <p className="text-gray-600">System-wide trading halt controls</p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {status?.toUpperCase() || 'INACTIVE'}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
          <p className="text-sm text-gray-600">
            {isKillswitchActive ? 'All trading halted' : 'Normal operations'}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Last Triggered</h4>
          <p className="text-sm text-gray-600">
            {riskController?.triggered_at 
              ? new Date(riskController.triggered_at)?.toLocaleString()
              : 'Never'
            }
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Auto Recovery</h4>
          <p className="text-sm text-gray-600">
            {riskController?.auto_recovery_enabled ? 'Enabled' : 'Disabled'}
          </p>
        </div>
      </div>
      {riskController?.trigger_reason && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-yellow-800 mb-1">Last Trigger Reason</h4>
          <p className="text-sm text-yellow-700">{riskController?.trigger_reason}</p>
        </div>
      )}
      <div className="flex justify-center space-x-4">
        {!isKillswitchActive ? (
          <Button
            onClick={() => handleKillswitchToggle('activate')}
            variant="destructive"
            size="lg"
            disabled={isLoading}
            className="px-8"
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            ACTIVATE EMERGENCY STOP
          </Button>
        ) : (
          <Button
            onClick={() => handleKillswitchToggle('deactivate')}
            variant="default"
            size="lg"
            disabled={isLoading}
            className="px-8 bg-green-600 hover:bg-green-700"
          >
            <Power className="h-5 w-5 mr-2" />
            RESTORE OPERATIONS
          </Button>
        )}
      </div>
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Emergency actions are logged and require reason documentation
        </p>
      </div>
    </div>
  );
};

export default EmergencyKillswitch;