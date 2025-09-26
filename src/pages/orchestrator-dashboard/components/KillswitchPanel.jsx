import { useState } from 'react';
import { AlertTriangle, Shield, ShieldOff, Clock } from 'lucide-react';

function KillswitchPanel({ onActivate }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastActivation, setLastActivation] = useState(null);

  const predefinedReasons = [
    'System Maintenance',
    'Emergency Market Conditions',
    'Technical Issues',
    'Risk Management Override',
    'Manual Intervention Required',
    'Data Quality Issues'
  ];

  const handleActivate = async () => {
    if (!reason?.trim()) {
      alert('Please provide a reason for the killswitch activation');
      return;
    }

    setLoading(true);
    try {
      const result = await onActivate?.(reason?.trim());
      
      if (result?.success) {
        setLastActivation({
          reason: reason?.trim(),
          timestamp: new Date()?.toISOString(),
          status: 'activated'
        });
        setShowConfirm(false);
        setReason('');
        
        // Show success notification
        // You might want to replace this with a proper toast notification
        alert('Killswitch activated successfully');
      } else {
        throw new Error(result?.error || 'Failed to activate killswitch');
      }
    } catch (error) {
      console.error('Killswitch activation error:', error);
      alert(`Failed to activate killswitch: ${error?.message || 'Unknown error'}`);
    }
    setLoading(false);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    try {
      const date = new Date(timestamp);
      return date?.toLocaleString();
    } catch {
      return 'Invalid';
    }
  };

  if (showConfirm) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg">
        <div className="p-4 border-b border-red-700">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h3 className="font-semibold text-red-400">Confirm Killswitch Activation</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-red-900/30 border border-red-600 rounded-lg p-3">
            <div className="flex items-start space-x-3">
              <ShieldOff className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400">WARNING</p>
                <p className="text-xs text-red-300 mt-1">
                  This will immediately stop all trading activities and trigger emergency protocols.
                  This action cannot be undone automatically.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Reason for activation (required)
            </label>
            
            <div className="space-y-2">
              {predefinedReasons?.map((predefined) => (
                <button
                  key={predefined}
                  onClick={() => setReason(predefined)}
                  className={`w-full text-left px-3 py-2 text-sm rounded border transition-colors ${
                    reason === predefined
                      ? 'border-red-500 bg-red-900/30 text-red-200' :'border-gray-600 bg-gray-700 text-gray-300 hover:border-red-600 hover:bg-red-900/20'
                  }`}
                >
                  {predefined}
                </button>
              ))}
            </div>

            <div className="mt-3">
              <textarea
                value={reason}
                onChange={(e) => setReason(e?.target?.value || '')}
                placeholder="Or enter custom reason..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleActivate}
              disabled={!reason?.trim() || loading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white px-4 py-2 rounded font-medium text-sm transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Activating...</span>
                </>
              ) : (
                <>
                  <ShieldOff className="h-4 w-4" />
                  <span>ACTIVATE KILLSWITCH</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                setShowConfirm(false);
                setReason('');
              }}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded font-medium text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-red-400" />
          <h3 className="font-semibold">Emergency Killswitch</h3>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full border-4 border-red-500 flex items-center justify-center">
            <ShieldOff className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Emergency stop for all trading activities and agent operations
          </p>
        </div>

        {lastActivation && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <Clock className="h-4 w-4 text-red-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400">Last Activation</p>
                <p className="text-xs text-red-300 mt-1">
                  {formatTimestamp(lastActivation?.timestamp)}
                </p>
                <p className="text-xs text-red-300">
                  Reason: {lastActivation?.reason}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowConfirm(true)}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <AlertTriangle className="h-5 w-5" />
          <span>ACTIVATE KILLSWITCH</span>
        </button>

        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>⚠️ This action will immediately stop all operations</p>
          <p>💼 Use only in emergency situations</p>
          <p>🔧 System recovery may require manual intervention</p>
        </div>
      </div>
    </div>
  );
}

export default KillswitchPanel;