import React, { useState, useEffect } from 'react';
import { Database, Activity, Users, DollarSign, BarChart3, ShoppingCart, Shield, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export function APIOperationsDashboard({ connectionStatus, shadowMode }) {
  const [endpointStatus, setEndpointStatus] = useState({
    health: { status: 'success', lastCall: null, responseTime: 85 },
    accounts: { status: 'success', lastCall: null, responseTime: 120 },
    positions: { status: 'success', lastCall: null, responseTime: 95 },
    pnl: { status: 'success', lastCall: null, responseTime: 110 },
    snapshot: { status: 'success', lastCall: null, responseTime: 75 },
    order: { status: shadowMode ? 'blocked' : 'ready', lastCall: null, responseTime: null }
  });

  const [liveData, setLiveData] = useState({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    blockedRequests: 0
  });

  useEffect(() => {
    // Simulate endpoint monitoring
    const interval = setInterval(() => {
      setEndpointStatus(prev => ({
        ...prev,
        health: {
          ...prev?.health,
          lastCall: connectionStatus?.status === 'connected' ? new Date()?.toISOString() : null,
          responseTime: connectionStatus?.status === 'connected' ? 80 + Math.random() * 40 : null
        }
      }));

      if (connectionStatus?.status === 'connected') {
        setLiveData(prev => ({
          ...prev,
          totalRequests: prev?.totalRequests + Math.floor(Math.random() * 3),
          successfulRequests: prev?.successfulRequests + Math.floor(Math.random() * 2),
          blockedRequests: shadowMode ? prev?.blockedRequests + Math.floor(Math.random() * 2) : prev?.blockedRequests
        }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [connectionStatus, shadowMode]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'blocked': return <Shield className="w-4 h-4 text-orange-400" />;
      case 'ready': return <Clock className="w-4 h-4 text-blue-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-300';
      case 'error': return 'text-red-300';
      case 'blocked': return 'text-orange-300';
      case 'ready': return 'text-blue-300';
      default: return 'text-gray-300';
    }
  };

  const endpoints = [
    {
      key: 'health',
      name: '/health',
      description: 'Gateway connectivity & auth status',
      icon: Activity,
      data: endpointStatus?.health
    },
    {
      key: 'accounts',
      name: '/accounts',
      description: 'Portfolio accounts access',
      icon: Users,
      data: endpointStatus?.accounts
    },
    {
      key: 'positions',
      name: '/positions',
      description: 'Real-time holdings data',
      icon: BarChart3,
      data: endpointStatus?.positions
    },
    {
      key: 'pnl',
      name: '/pnl',
      description: 'Profit/loss tracking',
      icon: DollarSign,
      data: endpointStatus?.pnl
    },
    {
      key: 'snapshot',
      name: '/snapshot',
      description: 'Market data feeds',
      icon: Database,
      data: endpointStatus?.snapshot
    },
    {
      key: 'order',
      name: '/order',
      description: 'Order execution endpoint',
      icon: ShoppingCart,
      data: endpointStatus?.order
    }
  ];

  return (
    <div className="space-y-6">
      {/* Endpoint Monitoring */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
          <Database className="w-4 h-4 mr-2" />
          API Endpoint Monitoring
        </h3>
        
        <div className="space-y-3">
          {endpoints?.map((endpoint) => (
            <div key={endpoint?.key} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <endpoint.icon className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-white">{endpoint?.name}</span>
                      {getStatusIcon(endpoint?.data?.status)}
                    </div>
                    <p className="text-xs text-gray-400">{endpoint?.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`text-sm font-medium ${getStatusColor(endpoint?.data?.status)} capitalize`}>
                    {endpoint?.data?.status === 'blocked' ? 'Shadow Mode' : endpoint?.data?.status}
                  </span>
                  {endpoint?.data?.responseTime && (
                    <p className="text-xs text-gray-400">{Math.round(endpoint?.data?.responseTime)}ms</p>
                  )}
                </div>
              </div>

              {endpoint?.data?.lastCall && (
                <div className="mt-2 text-xs text-gray-400">
                  Last call: {new Date(endpoint.data.lastCall)?.toLocaleTimeString()}
                </div>
              )}

              {/* Special indicator for order endpoint in shadow mode */}
              {endpoint?.key === 'order' && shadowMode && (
                <div className="mt-2 flex items-center space-x-2 text-xs text-orange-300">
                  <Shield className="w-3 h-3" />
                  <span>Orders blocked by shadow mode protection</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Real-time Statistics */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Real-time Statistics
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Total Requests</span>
              <span className="text-sm font-medium text-white">{liveData?.totalRequests}</span>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Successful</span>
              <span className="text-sm font-medium text-green-300">{liveData?.successfulRequests}</span>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Failed</span>
              <span className="text-sm font-medium text-red-300">{liveData?.failedRequests}</span>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Blocked</span>
              <span className="text-sm font-medium text-orange-300">{liveData?.blockedRequests}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Shadow Mode Protection Indicators */}
      {shadowMode && (
        <div className="bg-gradient-to-r from-orange-900/20 to-green-900/20 border border-orange-700/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Shadow Mode Active</h4>
              <div className="text-xs text-gray-300 space-y-1">
                <p>• All order operations are intercepted and blocked</p>
                <p>• Market data and account queries function normally</p>
                <p>• Safe for testing without risk of actual trades</p>
                <p>• Response: <code className="text-orange-300">{"{ ok: false, shadow: true, note: 'Shadow mode actif' }"}</code></p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Connection Required Warning */}
      {connectionStatus?.status !== 'connected' && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <XCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-red-300 mb-2">Gateway Connection Required</h4>
              <p className="text-xs text-gray-300">
                API operations require an active connection to IB Gateway. Please configure and test your connection in the configuration panel.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}