import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowRight, Settings, Pause, Activity, TrendingUp, Clock, Users } from 'lucide-react';

const CanaryPromotionPanel = () => {
  const [policy, setPolicy] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promoting, setPromoting] = useState(false);

  const fetchPolicy = async () => {
    try {
      const response = await fetch('/api/evo/canary/policy');
      if (!response?.ok) throw new Error('Failed to fetch policy');
      const data = await response?.json();
      if (data?.ok) {
        setPolicy(data?.policy);
      } else {
        setError(data?.error || 'Failed to load policy');
      }
    } catch (err) {
      setError(err?.message || 'Error fetching policy');
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/evo/canary/logs');
      if (!response?.ok) throw new Error('Failed to fetch logs');
      const data = await response?.json();
      if (data?.ok) {
        setLogs(data?.data || []);
      } else {
        setError(data?.error || 'Failed to load logs');
      }
    } catch (err) {
      setError(err?.message || 'Error fetching logs');
    }
  };

  const promoteCandidate = async (candidateId) => {
    if (!candidateId) return;
    
    setPromoting(true);
    try {
      const response = await fetch('/api/evo/canary/promote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': process.env?.REACT_APP_INTERNAL_ADMIN_KEY || 'CHANGE_ME'
        },
        body: JSON.stringify({ candidate_id: candidateId })
      });
      
      if (!response?.ok) throw new Error('Failed to promote candidate');
      const data = await response?.json();
      
      if (data?.ok) {
        // Refresh logs after successful promotion
        await fetchLogs();
      } else {
        setError(data?.error || 'Failed to promote candidate');
      }
    } catch (err) {
      setError(err?.message || 'Error promoting candidate');
    } finally {
      setPromoting(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPolicy(), fetchLogs()]);
      setLoading(false);
    };

    loadData();

    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getActionIcon = (action) => {
    switch (action) {
      case 'queued_canary': return <ArrowRight className="h-4 w-4 text-green-500" />;
      case 'skipped': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'queued_canary': return 'text-green-600 bg-green-50';
      case 'skipped': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="h-5 w-5 text-blue-600 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900">Canary Promotion System</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Canary IBKR Paper v1</h3>
          </div>
          <div className="flex items-center space-x-2">
            {policy?.active ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1"></div>
                Active
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-1"></div>
                Inactive
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Policy Summary */}
        {policy && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Settings className="h-4 w-4 mr-1" />
              Current Policy
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500">Min Paper Score</div>
                <div className="text-lg font-semibold text-gray-900">{policy?.min_paper_score || 0.70}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500">Min Adversarial</div>
                <div className="text-lg font-semibold text-gray-900">{policy?.min_adversarial_score || 0.65}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Hours in Paper
                </div>
                <div className="text-lg font-semibold text-gray-900">{policy?.min_hours_in_paper || 2}h</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  Max Parallel
                </div>
                <div className="text-lg font-semibold text-gray-900">{policy?.max_parallel || 3}</div>
              </div>
            </div>
          </div>
        )}

        {/* Promotion Logs */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Activity className="h-4 w-4 mr-1" />
            Recent Promotions ({logs?.length || 0})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No promotion activity yet</p>
              </div>
            ) : (
              logs?.map((log) => (
                <div key={log?.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getActionIcon(log?.action)}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {log?.candidate_id ? `Candidate ${log?.candidate_id?.slice(0, 8)}...` : 'System'}
                      </div>
                      <div className="text-xs text-gray-500">{log?.reason || log?.action}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getActionColor(log?.action)}`}>
                      {log?.action}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(log?.created_at)?.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Promotion system is {policy?.active ? 'running automatically' : 'paused'}
              {policy?.dry_run && ' in dry-run mode'}
            </div>
            <button
              onClick={() => window.open('/api/evo/canary/policy', '_blank')}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Settings className="h-3 w-3 mr-1" />
              View Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanaryPromotionPanel;