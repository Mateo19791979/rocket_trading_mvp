import { useState } from 'react';
import { Shield, Clock, User, AlertCircle, CheckCircle, Play, Pause } from 'lucide-react';

export default function CrisisResponseDashboard({ activeIncidents = [], onAction }) {
  const [newIncidentOpen, setNewIncidentOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    type: '',
    severity: 'medium',
    description: '',
    affectedSystems: []
  });

  const handleCreateIncident = async () => {
    if (!incidentForm?.type || !incidentForm?.description) return;

    await onAction?.('create_incident', incidentForm);
    
    setNewIncidentOpen(false);
    setIncidentForm({
      type: '',
      severity: 'medium',
      description: '',
      affectedSystems: []
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-red-100 border-red-500 text-red-800';
      case 'investigating': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'resolved': return 'bg-green-100 border-green-500 text-green-800';
      case 'escalated': return 'bg-purple-100 border-purple-500 text-purple-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const INCIDENT_TYPES = [
    'System Malfunction',
    'Algorithm Anomaly',
    'Market Volatility',
    'Data Quality Issue',
    'Security Breach',
    'Performance Degradation',
    'Trading Loss Spike',
    'API Failure'
  ];

  const SYSTEM_MODULES = [
    'LIVE_TRADING',
    'STRATEGY_GENERATION',
    'EXECUTION',
    'META_LEARNING',
    'BREEDING_ENGINE',
    'DATA_FEEDS',
    'RISK_MANAGEMENT'
  ];

  return (
    <div className="bg-gray-800 rounded-xl border border-blue-600 shadow-2xl">
      <div className="p-6 border-b border-blue-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-blue-100">Crisis Response Dashboard</h2>
              <p className="text-blue-300 text-sm">Active incident management and response coordination</p>
            </div>
          </div>
          
          <button
            onClick={() => setNewIncidentOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
          >
            Report Incident
          </button>
        </div>
      </div>
      <div className="p-6">
        {/* Incident Summary */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-red-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-200">
                {activeIncidents?.filter(i => i?.status === 'active')?.length || 0}
              </div>
              <div className="text-red-400 text-sm">Active</div>
            </div>
            <div className="bg-orange-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-200">
                {activeIncidents?.filter(i => i?.status === 'investigating')?.length || 0}
              </div>
              <div className="text-orange-400 text-sm">Investigating</div>
            </div>
            <div className="bg-purple-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-200">
                {activeIncidents?.filter(i => i?.status === 'escalated')?.length || 0}
              </div>
              <div className="text-purple-400 text-sm">Escalated</div>
            </div>
            <div className="bg-blue-900 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-200">
                {activeIncidents?.filter(i => i?.severity === 'critical')?.length || 0}
              </div>
              <div className="text-blue-400 text-sm">Critical</div>
            </div>
          </div>
        </div>

        {/* Active Incidents List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Active Incidents</h3>
            <div className="text-sm text-gray-400">
              {activeIncidents?.length} total incidents
            </div>
          </div>

          {activeIncidents?.length === 0 ? (
            <div className="bg-green-900 border border-green-600 rounded-lg p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <div className="text-green-200 font-medium mb-1">No Active Incidents</div>
              <div className="text-green-400 text-sm">All systems operating normally</div>
            </div>
          ) : (
            <div className="space-y-3">
              {activeIncidents?.map((incident) => (
                <div
                  key={incident?.id}
                  className={`p-4 rounded-lg border ${getStatusColor(incident?.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <AlertCircle className="h-5 w-5" />
                        <div className="font-semibold">{incident?.incident_type}</div>
                        <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(incident?.severity)}`}>
                          {incident?.severity?.toUpperCase()}
                        </span>
                        <span className="text-xs opacity-75">
                          #{incident?.id?.slice(-8)}
                        </span>
                      </div>
                      
                      <div className="text-sm mb-3">{incident?.description}</div>
                      
                      <div className="flex items-center space-x-4 text-xs opacity-75">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(incident?.created_at)?.toLocaleString()}</span>
                        </div>
                        {incident?.assigned_user && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{incident?.assigned_user?.full_name}</span>
                          </div>
                        )}
                        {incident?.affected_systems?.length > 0 && (
                          <div>
                            Affected: {incident?.affected_systems?.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {incident?.status === 'active' && (
                        <button
                          onClick={() => onAction?.('update_incident_status', {
                            id: incident?.id,
                            status: 'investigating'
                          })}
                          className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition-colors"
                        >
                          Investigate
                        </button>
                      )}
                      {incident?.status === 'investigating' && (
                        <button
                          onClick={() => onAction?.('update_incident_status', {
                            id: incident?.id,
                            status: 'resolved'
                          })}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Automated Response Protocols */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Automated Response Protocols</h3>
          <div className="grid grid-cols-1 gap-2">
            <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Play className="h-4 w-4 text-green-400" />
                <div>
                  <div className="font-medium text-white">High Volatility Response</div>
                  <div className="text-gray-400 text-sm">Auto-reduce position sizes during volatile markets</div>
                </div>
              </div>
              <div className="text-green-400 text-sm">Active</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Play className="h-4 w-4 text-green-400" />
                <div>
                  <div className="font-medium text-white">Error Escalation</div>
                  <div className="text-gray-400 text-sm">Auto-create incidents for critical error rates</div>
                </div>
              </div>
              <div className="text-green-400 text-sm">Active</div>
            </div>

            <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Pause className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium text-white">Loss Limit Breaker</div>
                  <div className="text-gray-400 text-sm">Auto-halt trading on major loss events</div>
                </div>
              </div>
              <div className="text-gray-400 text-sm">Standby</div>
            </div>
          </div>
        </div>
      </div>
      {/* New Incident Modal */}
      {newIncidentOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-red-500 p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-red-100">Report Emergency Incident</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Incident Type
                </label>
                <select
                  value={incidentForm?.type}
                  onChange={(e) => setIncidentForm(prev => ({ ...prev, type: e?.target?.value }))}
                  className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-red-500 focus:outline-none"
                >
                  <option value="">Select incident type...</option>
                  {INCIDENT_TYPES?.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Severity Level
                </label>
                <select
                  value={incidentForm?.severity}
                  onChange={(e) => setIncidentForm(prev => ({ ...prev, severity: e?.target?.value }))}
                  className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-red-500 focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={incidentForm?.description}
                  onChange={(e) => setIncidentForm(prev => ({ ...prev, description: e?.target?.value }))}
                  placeholder="Describe the emergency situation in detail..."
                  className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-red-500 focus:outline-none h-20 resize-none"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCreateIncident}
                  disabled={!incidentForm?.type || !incidentForm?.description}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded font-bold transition-colors"
                >
                  CREATE INCIDENT
                </button>
                <button
                  onClick={() => setNewIncidentOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}