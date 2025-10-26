import React, { useState, useEffect } from 'react';
import { Activity, Zap, TrendingUp, AlertTriangle, Play, RefreshCw } from 'lucide-react';

export default function EvolutionEnginePanel() {
  const [candidates, setCandidates] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [policies, setPolicies] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('testing');

  const loadEvolutionData = async () => {
    try {
      const [candidatesRes, strategiesRes, policiesRes] = await Promise.all([
        fetch(`/api/evo/candidates?status=${selectedStatus}`),
        fetch('/api/evo/strategies'),
        fetch('/api/evo/policies')
      ]);

      const candidatesData = await candidatesRes?.json();
      const strategiesData = await strategiesRes?.json();
      const policiesData = await policiesRes?.json();

      if (candidatesData?.ok) setCandidates(candidatesData?.data || []);
      if (strategiesData?.ok) setStrategies(strategiesData?.data || []);
      if (policiesData?.ok) setPolicies(policiesData?.data || {});
    } catch (error) {
      console.log('Evolution data fetch error:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvolutionData();
    const interval = setInterval(loadEvolutionData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [selectedStatus]);

  const triggerMutation = async () => {
    try {
      const response = await fetch('/api/evo/mutate', {
        method: 'POST',
        headers: {
          'x-internal-key': process.env?.VITE_INTERNAL_ADMIN_KEY || 'CHANGE_ME',
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response?.json();
      if (result?.ok) {
        console.log('Mutation triggered successfully');
        setTimeout(loadEvolutionData, 2000); // Refresh after mutation
      }
    } catch (error) {
      console.log('Mutation trigger error:', error?.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'testing': return 'text-blue-600 bg-blue-50';
      case 'paper': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'live': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Evolution Engine v2</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={triggerMutation}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Force Mutation</span>
            </button>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex space-x-2 mb-4">
          {['testing', 'paper', 'rejected', 'live']?.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedStatus === status 
                  ? 'bg-purple-100 text-purple-800' :'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
            </button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Testing</p>
                <p className="text-2xl font-bold text-blue-900">
                  {candidates?.filter(c => c?.status === 'testing')?.length || 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Paper</p>
                <p className="text-2xl font-bold text-green-900">
                  {candidates?.filter(c => c?.status === 'paper')?.length || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium">Live</p>
                <p className="text-2xl font-bold text-emerald-900">{strategies?.length || 0}</p>
              </div>
              <Play className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Rejected</p>
                <p className="text-2xl font-bold text-red-900">
                  {candidates?.filter(c => c?.status === 'rejected')?.length || 0}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>
      {/* Candidates List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold">
            {selectedStatus?.charAt(0)?.toUpperCase() + selectedStatus?.slice(1)} Candidates
          </h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strategy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Genome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates?.map((candidate) => (
                <tr key={candidate?.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {candidate?.method || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{candidate?.asset_class || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="max-w-xs truncate">
                        TF: {candidate?.genome?.timeframe || 'N/A'} | 
                        Assets: {candidate?.genome?.assets?.length || 0}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(candidate?.status)}`}>
                      {candidate?.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {candidate?.created_at ? new Date(candidate.created_at)?.toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {candidates?.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No {selectedStatus} candidates found.
            </div>
          )}
        </div>
      </div>
      {/* Live Strategies */}
      {selectedStatus === 'live' && strategies?.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold">Live Strategies</h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fitness
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {strategies?.map((strategy) => (
                  <tr key={strategy?.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {strategy?.name || 'Unnamed Strategy'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{strategy?.method || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{strategy?.asset_class || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {strategy?.fitness ? (strategy?.fitness * 100)?.toFixed(1) + '%' : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(strategy?.status)}`}>
                        {strategy?.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}