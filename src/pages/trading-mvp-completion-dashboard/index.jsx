import React, { useState, useEffect } from 'react';
import { Activity, Database, Wifi, CheckCircle, AlertTriangle, Server, Zap } from 'lucide-react';
import { ohlcAggregatorService } from '../../services/ohlcAggregatorService';
import { dataQualityService } from '../../services/dataQualityService';
import { streamingSubscriptionService } from '../../services/streamingSubscriptionService';
import { webSocketQuotesService } from '../../services/webSocketQuotesService';


export default function TradingMVPCompletionDashboard() {
  const [ohlcStatus, setOhlcStatus] = useState({ loading: true, data: null });
  const [qualityStatus, setQualityStatus] = useState({ loading: true, data: null });
  const [streamingStatus, setStreamingStatus] = useState({ loading: true, data: null });
  const [systemHealth, setSystemHealth] = useState({ loading: true, data: null });
  const [completionPercentage, setCompletionPercentage] = useState(67);

  const calculateCompletionPercentage = () => {
    let score = 67; // Base 67% from existing system
    
    // OHLC Data (+10%)
    if (ohlcStatus?.data?.totalBars > 0) score += 10;
    
    // Data Quality (+8%)  
    if (qualityStatus?.data?.overallHealthScore > 0.8) score += 8;
    
    // Streaming (+10%)
    if (streamingStatus?.data?.activeSubscriptions > 0) score += 10;
    
    // System Health (+5%)
    if (systemHealth?.data?.length > 0) score += 5;
    
    setCompletionPercentage(Math.min(score, 100));
  };

  const loadCompletionStatus = async () => {
    // Load OHLC Aggregation Status
    try {
      const ohlcResult = await ohlcAggregatorService?.getAggregationStatus();
      setOhlcStatus({ loading: false, data: ohlcResult?.data, error: ohlcResult?.error });
    } catch (error) {
      setOhlcStatus({ loading: false, error: error?.message });
    }

    // Load Data Quality Overview
    try {
      const qualityResult = await dataQualityService?.getQualityOverview();
      setQualityStatus({ loading: false, data: qualityResult?.data, error: qualityResult?.error });
    } catch (error) {
      setQualityStatus({ loading: false, error: error?.message });
    }

    // Load Streaming Status
    try {
      const streamingResult = await streamingSubscriptionService?.getSubscriptionStats();
      setStreamingStatus({ loading: false, data: streamingResult?.data, error: streamingResult?.error });
    } catch (error) {
      setStreamingStatus({ loading: false, error: error?.message });
    }

    // Load System Health
    try {
      const healthResult = await webSocketQuotesService?.getWebSocketHealth();
      setSystemHealth({ loading: false, data: healthResult?.data, error: healthResult?.error });
    } catch (error) {
      setSystemHealth({ loading: false, error: error?.message });
    }

    // Calculate completion percentage
    calculateCompletionPercentage();
  };

  useEffect(() => {
    loadCompletionStatus();
    const interval = setInterval(loadCompletionStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleBackfillOHLC = async () => {
    setOhlcStatus({ ...ohlcStatus, loading: true });
    try {
      const result = await ohlcAggregatorService?.backfillOHLCData('1h', 7);
      if (result?.success) {
        alert(`OHLC Backfill completed: ${result?.results?.successful?.length} assets processed`);
        loadCompletionStatus();
      } else {
        alert(`Backfill failed: ${result?.error}`);
      }
    } catch (error) {
      alert(`Backfill error: ${error?.message}`);
    }
    setOhlcStatus({ ...ohlcStatus, loading: false });
  };

  const handleRunQualityChecks = async () => {
    setQualityStatus({ ...qualityStatus, loading: true });
    try {
      const result = await dataQualityService?.runQualityChecks();
      if (result?.success) {
        alert(`Quality check completed: ${result?.data?.checked} assets checked, ${result?.data?.issues} issues found`);
        loadCompletionStatus();
      } else {
        alert(`Quality check failed: ${result?.error}`);
      }
    } catch (error) {
      alert(`Quality check error: ${error?.message}`);
    }
    setQualityStatus({ ...qualityStatus, loading: false });
  };

  const handleTestStreaming = async () => {
    setStreamingStatus({ ...streamingStatus, loading: true });
    try {
      const result = await streamingSubscriptionService?.testStreamingConnection('AAPL');
      if (result?.success) {
        alert(`Streaming test: ${result?.data?.messagesReceived} messages received in ${result?.data?.testDuration}`);
        loadCompletionStatus();
      } else {
        alert(`Streaming test failed: ${result?.error}`);
      }
    } catch (error) {
      alert(`Streaming test error: ${error?.message}`);
    }
    setStreamingStatus({ ...streamingStatus, loading: false });
  };

  const getStatusColor = (isHealthy) => {
    return isHealthy ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (isHealthy) => {
    return isHealthy ? CheckCircle : AlertTriangle;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚀 Trading MVP Completion Dashboard</h1>
          <p className="text-xl text-gray-600">Complete the missing 33% to reach 100% operational status</p>
        </div>

        {/* Completion Progress */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">System Completion Progress</h2>
            <div className="text-3xl font-bold text-blue-600">{completionPercentage}%</div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-700">Infrastructure</div>
              <div className="text-green-600 font-bold">✓ 67% Complete</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-700">OHLC Data</div>
              <div className={`font-bold ${ohlcStatus?.data?.totalBars > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {ohlcStatus?.data?.totalBars > 0 ? '✓ +10%' : '○ +10%'}
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-700">Data Quality</div>
              <div className={`font-bold ${qualityStatus?.data?.overallHealthScore > 0.8 ? 'text-green-600' : 'text-orange-600'}`}>
                {qualityStatus?.data?.overallHealthScore > 0.8 ? '✓ +8%' : '○ +8%'}
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-700">Real-time Streaming</div>
              <div className={`font-bold ${streamingStatus?.data?.activeSubscriptions > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {streamingStatus?.data?.activeSubscriptions > 0 ? '✓ +15%' : '○ +15%'}
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* OHLC Aggregation Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Database className="w-6 h-6 mr-2 text-blue-600" />
                OHLC Data Aggregation
              </h3>
              {!ohlcStatus?.loading && (
                <div className={`flex items-center ${getStatusColor(ohlcStatus?.data?.totalBars > 0)}`}>
                  {React.createElement(getStatusIcon(ohlcStatus?.data?.totalBars > 0), { className: "w-5 h-5" })}
                </div>
              )}
            </div>

            {ohlcStatus?.loading ? (
              <div className="animate-pulse">Loading OHLC status...</div>
            ) : ohlcStatus?.error ? (
              <div className="text-red-600">Error: {ohlcStatus?.error}</div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total OHLC Bars:</span>
                    <div className="font-bold text-lg">{ohlcStatus?.data?.totalBars?.toLocaleString() || 0}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Is Aggregating:</span>
                    <div className={`font-bold ${ohlcStatus?.data?.isAggregating ? 'text-orange-600' : 'text-gray-600'}`}>
                      {ohlcStatus?.data?.isAggregating ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Available Timeframes:</h4>
                  <div className="flex flex-wrap gap-2">
                    {ohlcStatus?.data?.timeframes?.map((tf, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {tf?.timeframe}: {tf?.bars} bars
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleBackfillOHLC}
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={ohlcStatus?.loading}
                >
                  {ohlcStatus?.loading ? 'Running Backfill...' : 'Run OHLC Backfill (7 days)'}
                </button>
              </div>
            )}
          </div>

          {/* Data Quality Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-green-600" />
                Data Quality Monitor
              </h3>
              {!qualityStatus?.loading && (
                <div className={`flex items-center ${getStatusColor(qualityStatus?.data?.overallHealthScore > 0.8)}`}>
                  {React.createElement(getStatusIcon(qualityStatus?.data?.overallHealthScore > 0.8), { className: "w-5 h-5" })}
                </div>
              )}
            </div>

            {qualityStatus?.loading ? (
              <div className="animate-pulse">Loading quality status...</div>
            ) : qualityStatus?.error ? (
              <div className="text-red-600">Error: {qualityStatus?.error}</div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Health Score:</span>
                    <div className="font-bold text-lg">
                      {Math.round((qualityStatus?.data?.overallHealthScore || 0) * 100)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Active Issues:</span>
                    <div className={`font-bold text-lg ${qualityStatus?.data?.totalIssues > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {qualityStatus?.data?.totalIssues || 0}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-gray-600">Critical Issues:</span>
                  <div className={`font-bold ${qualityStatus?.data?.criticalIssues > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {qualityStatus?.data?.criticalIssues || 0}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Issues by Type:</h4>
                  <div className="space-y-1">
                    {qualityStatus?.data?.issuesByType?.map((issue, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="capitalize">{issue?.type?.replace('_', ' ')}</span>
                        <span className={`font-bold ${issue?.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                          {issue?.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleRunQualityChecks}
                  className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  disabled={qualityStatus?.loading}
                >
                  {qualityStatus?.loading ? 'Running Checks...' : 'Run Quality Checks'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Streaming & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Streaming Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Wifi className="w-6 h-6 mr-2 text-purple-600" />
                Real-time Streaming
              </h3>
              {!streamingStatus?.loading && (
                <div className={`flex items-center ${getStatusColor(streamingStatus?.data?.activeSubscriptions > 0)}`}>
                  {React.createElement(getStatusIcon(streamingStatus?.data?.activeSubscriptions > 0), { className: "w-5 h-5" })}
                </div>
              )}
            </div>

            {streamingStatus?.loading ? (
              <div className="animate-pulse">Loading streaming status...</div>
            ) : streamingStatus?.error ? (
              <div className="text-red-600">Error: {streamingStatus?.error}</div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Active Subscriptions:</span>
                    <div className="font-bold text-lg">{streamingStatus?.data?.activeSubscriptions || 0}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Subscriptions:</span>
                    <div className="font-bold text-lg">{streamingStatus?.data?.totalSubscriptions || 0}</div>
                  </div>
                </div>

                <div>
                  <span className="text-gray-600">Avg Data Points:</span>
                  <div className="font-bold">{Math.round(streamingStatus?.data?.avgDataPoints || 0)}</div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">By Type:</h4>
                  <div className="space-y-1">
                    {streamingStatus?.data?.byType?.map((type, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="capitalize">{type?.type}</span>
                        <span className="font-bold">{type?.active}/{type?.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleTestStreaming}
                  className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  disabled={streamingStatus?.loading}
                >
                  {streamingStatus?.loading ? 'Testing...' : 'Test Streaming Connection'}
                </button>
              </div>
            )}
          </div>

          {/* System Health */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Server className="w-6 h-6 mr-2 text-orange-600" />
                System Health
              </h3>
              {!systemHealth?.loading && (
                <div className={`flex items-center ${getStatusColor(systemHealth?.data?.length > 0)}`}>
                  {React.createElement(getStatusIcon(systemHealth?.data?.length > 0), { className: "w-5 h-5" })}
                </div>
              )}
            </div>

            {systemHealth?.loading ? (
              <div className="animate-pulse">Loading system health...</div>
            ) : systemHealth?.error ? (
              <div className="text-red-600">Error: {systemHealth?.error}</div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-600">Healthy Services:</span>
                  <div className="font-bold text-lg">{systemHealth?.data?.length || 0}</div>
                </div>

                <div className="space-y-2">
                  {systemHealth?.data?.slice(0, 3)?.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{service?.agentName}</div>
                        <div className="text-xs text-gray-600">CPU: {service?.cpuUsage}% | Mem: {service?.memoryUsage}%</div>
                      </div>
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>

                {systemHealth?.data?.length === 0 && (
                  <div className="text-center py-4 text-gray-600">
                    No healthy services detected
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Completion Status */}
        {completionPercentage >= 100 && (
          <div className="mt-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white text-center">
            <Zap className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">🎉 Trading MVP 100% Complete!</h2>
            <p className="text-xl opacity-90">
              System is fully operational and ready for production deployment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}