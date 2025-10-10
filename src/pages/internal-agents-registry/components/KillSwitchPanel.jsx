import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function KillSwitchPanel({ switches }) {
  const getSwitchIcon = (isActive) => {
    return isActive ? 
      <AlertTriangle className="w-5 h-5 text-red-500" /> :
      <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getSwitchColor = (isActive) => {
    return isActive ? 
      'border-red-200 bg-red-50' : 'border-green-200 bg-green-50';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never updated';
    return new Date(timestamp)?.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Kill Switch Status</h2>
            <p className="text-gray-600 text-sm mt-1">System safety controls</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        {switches?.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Kill Switches</h3>
            <p className="text-gray-600">No safety controls are configured.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {switches?.map((switchItem) => (
              <div
                key={switchItem?.module}
                className={`border p-4 rounded-lg ${getSwitchColor(switchItem?.is_active)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getSwitchIcon(switchItem?.is_active)}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {switchItem?.module?.replace(/_/g, ' ') || 'Unknown Module'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {switchItem?.is_active ? 'DISABLED' : 'ACTIVE'}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    switchItem?.is_active 
                      ? 'bg-red-100 text-red-800' :'bg-green-100 text-green-800'
                  }`}>
                    {switchItem?.is_active ? 'OFF' : 'ON'}
                  </div>
                </div>
                
                {switchItem?.reason && (
                  <div className="mb-3 p-3 bg-white border border-gray-200 rounded">
                    <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                    <p className="text-sm text-gray-600">{switchItem?.reason}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Updated: {formatTimestamp(switchItem?.updated_at)}</span>
                  </div>
                  {switchItem?.activated_by && (
                    <span>By: {switchItem?.activated_by}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Status Legend:</h4>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Module is running normally</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Module is disabled for safety</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}