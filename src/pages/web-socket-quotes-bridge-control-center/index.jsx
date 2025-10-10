import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Button from '../../components/ui/Button';


import webSocketQuotesService from '../../services/webSocketQuotesService';
import WebSocketServerPanel from './components/WebSocketServerPanel';
import QuoteStreamConfigPanel from './components/QuoteStreamConfigPanel';
import RealTimeMonitoringPanel from './components/RealTimeMonitoringPanel';
import RedisQueuePanel from './components/RedisQueuePanel';
import FallbackPollingPanel from './components/FallbackPollingPanel';
import StreamingControlsPanel from './components/StreamingControlsPanel';

const WebSocketQuotesBridgeControlCenter = () => {
  const [wsHealth, setWsHealth] = useState([]);
  const [activeStreams, setActiveStreams] = useState([]);
  const [redisMetrics, setRedisMetrics] = useState({});
  const [subscriptionConfig, setSubscriptionConfig] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Stream configuration state
  const [selectedProvider, setSelectedProvider] = useState('finnhub');
  const [streamingFrequency, setStreamingFrequency] = useState('1000');
  const [selectedSymbols, setSelectedSymbols] = useState(['AAPL', 'MSFT', 'GOOGL']);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  const providerOptions = [
    { value: 'finnhub', label: 'Finnhub' },
    { value: 'alpha_vantage', label: 'Alpha Vantage' },
    { value: 'twelvedata', label: 'TwelveData' }
  ];

  const frequencyOptions = [
    { value: '500', label: '500ms - Ultra Fast' },
    { value: '1000', label: '1s - Fast' },
    { value: '5000', label: '5s - Standard' },
    { value: '10000', label: '10s - Conservative' }
  ];

  // Add these handler functions before useEffect
  const handleMarketDataUpdate = (payload) => {
    // Update active streams with new data
    const newData = payload?.new;
    if (newData) {
      setActiveStreams(prev => {
        const updated = [...prev];
        const existingIndex = updated?.findIndex(stream => stream?.id === newData?.id);
        
        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...updated?.[existingIndex],
            price: newData?.close_price,
            volume: newData?.volume,
            timestamp: newData?.timestamp,
            changePercent: newData?.change_percent
          };
        } else {
          updated?.unshift({
            id: newData?.id,
            symbol: newData?.asset?.symbol,
            price: newData?.close_price,
            volume: newData?.volume,
            timestamp: newData?.timestamp,
            provider: newData?.api_provider,
            changePercent: newData?.change_percent
          });
        }
        
        return updated?.slice(0, 100); // Keep only latest 100 entries
      });
    }
  };

  const handleHealthUpdate = (payload) => {
    const newHealth = payload?.new;
    if (newHealth) {
      setWsHealth(prev => {
        const updated = [...prev];
        const existingIndex = updated?.findIndex(health => health?.id === newHealth?.id);
        
        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...updated?.[existingIndex],
            status: newHealth?.health_status,
            cpuUsage: newHealth?.cpu_usage,
            memoryUsage: newHealth?.memory_usage,
            lastHeartbeat: newHealth?.last_heartbeat,
            errorCount: newHealth?.error_count
          };
        } else {
          updated?.push({
            id: newHealth?.id,
            status: newHealth?.health_status,
            cpuUsage: newHealth?.cpu_usage,
            memoryUsage: newHealth?.memory_usage,
            lastHeartbeat: newHealth?.last_heartbeat,
            errorCount: newHealth?.error_count
          });
        }
        
        return updated;
      });
    }
  };

  useEffect(() => {
    loadInitialData();
    
    // Set up real-time subscriptions
    const marketDataSubscription = webSocketQuotesService?.subscribeToMarketData(
      handleMarketDataUpdate
    );
    
    const healthSubscription = webSocketQuotesService?.subscribeToSystemHealth(
      handleHealthUpdate
    );

    return () => {
      marketDataSubscription?.unsubscribe();
      healthSubscription?.unsubscribe();
    };
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [healthResult, streamsResult, redisResult, configResult] = await Promise.all([
        webSocketQuotesService?.getWebSocketHealth(),
        webSocketQuotesService?.getActiveStreams(),
        webSocketQuotesService?.getRedisMetrics(),
        webSocketQuotesService?.getSubscriptionConfig()
      ]);

      if (healthResult?.success) {
        setWsHealth(healthResult?.data);
      }

      if (streamsResult?.success) {
        setActiveStreams(streamsResult?.data);
      }

      if (redisResult?.success) {
        setRedisMetrics(redisResult?.data);
      }

      if (configResult?.success) {
        setSubscriptionConfig(configResult?.data);
      }
    } catch (error) {
      showNotification('Failed to load initial data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscriptionUpdate = async (symbols, enabled) => {
    try {
      const result = await webSocketQuotesService?.updateSubscription(symbols, enabled);
      
      if (result?.success) {
        showNotification(result?.data, 'success');
        // Refresh subscription config
        const configResult = await webSocketQuotesService?.getSubscriptionConfig();
        if (configResult?.success) {
          setSubscriptionConfig(configResult?.data);
        }
      } else {
        showNotification(result?.error || 'Failed to update subscription', 'error');
      }
    } catch (error) {
      showNotification('Failed to update subscription', 'error');
    }
  };

  const handleWebSocketTest = async () => {
    try {
      const result = await webSocketQuotesService?.testWebSocketConnection();
      
      if (result?.success) {
        setIsWebSocketConnected(true);
        showNotification('WebSocket connection test successful', 'success');
      } else {
        setIsWebSocketConnected(false);
        showNotification(result?.error || 'WebSocket connection test failed', 'error');
      }
    } catch (error) {
      setIsWebSocketConnected(false);
      showNotification('WebSocket connection test failed', 'error');
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading WebSocket Bridge Control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>WebSocket Quotes Bridge Control Center | Rocket Trading MVP</title>
        <meta name="description" content="Real-time WebSocket market data streaming infrastructure with Redis-powered quote distribution and Node.js orchestration" />
      </Helmet>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  WebSocket Quotes Bridge
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Real-time market data streaming control center
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isWebSocketConnected 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {isWebSocketConnected ? 'Connected' : 'Disconnected'}
              </div>
              <Button
                onClick={handleWebSocketTest}
                variant="outline"
                size="sm"
                iconName="Wifi"
              >
                Test Connection
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          notification?.type === 'success' ?'bg-green-500 text-white' 
            : notification?.type === 'error' ?'bg-red-500 text-white' :'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{notification?.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="ml-3 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* WebSocket Server Management */}
            <WebSocketServerPanel 
              wsHealth={wsHealth}
              onRefresh={loadInitialData}
            />

            {/* Quote Stream Configuration */}
            <QuoteStreamConfigPanel
              selectedProvider={selectedProvider}
              setSelectedProvider={setSelectedProvider}
              streamingFrequency={streamingFrequency}
              setStreamingFrequency={setStreamingFrequency}
              selectedSymbols={selectedSymbols}
              setSelectedSymbols={setSelectedSymbols}
              subscriptionConfig={subscriptionConfig}
              onSubscriptionUpdate={handleSubscriptionUpdate}
              providerOptions={providerOptions}
              frequencyOptions={frequencyOptions}
            />

            {/* Fallback HTTP Polling */}
            <FallbackPollingPanel
              isWebSocketConnected={isWebSocketConnected}
              onToggleFallback={() => {}}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Real-time Monitoring */}
            <RealTimeMonitoringPanel
              activeStreams={activeStreams}
              wsHealth={wsHealth}
            />

            {/* Redis Queue Management */}
            <RedisQueuePanel
              redisMetrics={redisMetrics}
              onRefresh={loadInitialData}
            />

            {/* Interactive Streaming Controls */}
            <StreamingControlsPanel
              onServerRestart={() => showNotification('Server restart initiated', 'info')}
              onConnectionTest={handleWebSocketTest}
              onEmergencyFallback={() => showNotification('Emergency fallback activated', 'warning')}
              isConnected={isWebSocketConnected}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketQuotesBridgeControlCenter;