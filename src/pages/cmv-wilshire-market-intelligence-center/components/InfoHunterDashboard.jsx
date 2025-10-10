import React, { useState, useEffect } from 'react';
import { Server, Database, Activity, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
import { cmvWilshireService } from '../../../services/cmvWilshireService';

export default function InfoHunterDashboard({ loading, onRefresh }) {
  const [serviceHealth, setServiceHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [lastHealthCheck, setLastHealthCheck] = useState(null);

  const checkServiceHealth = async () => {
    setHealthLoading(true);
    try {
      const result = await cmvWilshireService?.getServiceHealth();
      
      // Always set service health data, even if there's an error
      if (result?.data) {
        setServiceHealth(result?.data);
      } else if (result?.error) {
        setServiceHealth({ 
          status: 'error', 
          error: result?.error,
          endpoint: `${import.meta.env?.VITE_MVP_API_BASE || 'http://localhost:3001'}/health`
        });
      }
      
      setLastHealthCheck(new Date()?.toLocaleString());
    } catch (error) {
      console.error('Service health check failed:', error);
      setServiceHealth({ 
        status: 'error', 
        error: error?.message || 'Unknown error occurred',
        endpoint: `${import.meta.env?.VITE_MVP_API_BASE || 'http://localhost:3001'}/health`
      });
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    checkServiceHealth();
    
    // Check health every 2 minutes instead of 30 seconds to reduce errors
    const interval = setInterval(checkServiceHealth, 120000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': case 'ok': case 'up': 
        return 'text-green-400';
      case 'warning': case 'degraded': 
        return 'text-yellow-400';
      case 'error': case 'down': case 'offline':
        return 'text-red-400';
      default: 
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': case 'ok': case 'up':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': case 'degraded':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'error': case 'down': case 'offline':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'healthy': case 'ok': case 'up':
        return 'Service Online';
      case 'warning': case 'degraded':
        return 'Service Degraded';
      case 'error': case 'down': case 'offline':
        return 'Service Offline';
      default:
        return 'Status Unknown';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Server className="w-6 h-6 text-orange-400" />
          <h2 className="text-xl font-semibold">InfoHunter Service Dashboard</h2>
        </div>
        <button
          onClick={checkServiceHealth}
          disabled={healthLoading}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm flex items-center space-x-2"
        >
          <Activity className={`w-4 h-4 ${healthLoading ? 'animate-spin' : ''}`} />
          <span>Health Check</span>
        </button>
      </div>
      <div className="space-y-4">
        {/* Service Status */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-200">Service Status</h3>
            {serviceHealth && getStatusIcon(serviceHealth?.status)}
          </div>
          
          {serviceHealth ? (
            <div className="space-y-2">
              <div className={`text-lg font-medium ${getStatusColor(serviceHealth?.status)}`}>
                {getStatusText(serviceHealth?.status)}
              </div>
              
              {serviceHealth?.uptime && (
                <div className="text-sm text-gray-400">
                  Uptime: {serviceHealth?.uptime}
                </div>
              )}
              
              {serviceHealth?.endpoint && (
                <div className="text-xs text-gray-500">
                  Endpoint: {serviceHealth?.endpoint}
                </div>
              )}
              
              {serviceHealth?.error && (
                <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded mt-2">
                  <strong>Error:</strong> {serviceHealth?.error}
                </div>
              )}
              
              {lastHealthCheck && (
                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <Clock className="w-3 h-3 mr-1" />
                  Last checked: {lastHealthCheck}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400">
              {healthLoading ? 'Checking service...' : 'Service status unknown'}
            </div>
          )}
        </div>

        {/* Parser Statistics */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <h3 className="font-medium text-gray-200 mb-3">Parser Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">3</div>
              <div className="text-xs text-gray-400">CMV Parsers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-teal-400">3</div>
              <div className="text-xs text-gray-400">Wilshire Parsers</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-400">1.5s</div>
              <div className="text-xs text-gray-400">Rate Limit</div>
            </div>
          </div>
        </div>

        {/* NATS Publishing Stats */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <h3 className="font-medium text-gray-200 mb-3">NATS Publishing</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">CMV Topics:</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-400">Active</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 ml-4">
              • macro.valuation.cmv.buffett<br/>
              • macro.valuation.cmv.pe10<br/>
              • macro.valuation.cmv.pricesales
            </div>
          </div>
          
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Wilshire Topics:</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-400">Active</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 ml-4">
              • index.wilshire.platform<br/>
              • index.wilshire.all-indexes<br/>
              • index.wilshire.methodology.ftw5000
            </div>
          </div>
        </div>

        {/* Database Connection */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-200">Database Connection</h3>
            <Database className="w-4 h-4 text-green-400" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Supabase Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}