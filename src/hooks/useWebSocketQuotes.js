import { useState, useEffect, useRef, useCallback } from 'react';
import { streamingSubscriptionService } from '../services/streamingSubscriptionService';

export function useWebSocketQuotes({ 
  symbols = [], 
  timeframe = '1m', 
  subscriptionType = 'quotes',
  enabled = true,
  fallbackUrl = import.meta.env?.VITE_WS_FALLBACK_URL 
}) {
  const [data, setData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [messageCount, setMessageCount] = useState(0);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const websocketRef = useRef(null);
  const fallbackTimerRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Clean up function
  const cleanup = useCallback(() => {
    if (websocketRef?.current) {
      websocketRef?.current?.close();
      websocketRef.current = null;
    }
    
    if (fallbackTimerRef?.current) {
      clearInterval(fallbackTimerRef?.current);
      fallbackTimerRef.current = null;
    }
    
    setConnectionStatus('disconnected');
  }, []);

  // Start HTTP polling fallback
  const startPollingFallback = useCallback(async () => {
    if (!fallbackUrl || symbols?.length === 0) return;

    console.log('🔄 Starting HTTP polling fallback');
    setConnectionStatus('polling');

    fallbackTimerRef.current = setInterval(async () => {
      try {
        const symbolString = symbols?.join(',');
        const response = await fetch(`${fallbackUrl}/quotes?symbols=${symbolString}`);
        
        if (response?.ok) {
          const fallbackData = await response?.json();
          setData(fallbackData);
          setMessageCount(prev => prev + 1);
        }
      } catch (error) {
        console.error('HTTP polling error:', error);
      }
    }, 2500);
  }, [fallbackUrl, symbols]);

  // WebSocket connection handler
  const connectWebSocket = useCallback(async () => {
    if (!enabled || symbols?.length === 0) return;

    try {
      const symbolString = symbols?.join(',');
      const wsUrl = `${import.meta.env?.VITE_WS_URL || 'wss://localhost:8088'}/quotes?symbols=${symbolString}&tf=${timeframe}`;
      
      console.log(`🔗 Connecting to WebSocket: ${wsUrl}`);
      
      websocketRef.current = new WebSocket(wsUrl);
      setConnectionStatus('connecting');

      websocketRef.current.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        
        // Clear any existing fallback polling
        if (fallbackTimerRef?.current) {
          clearInterval(fallbackTimerRef?.current);
          fallbackTimerRef.current = null;
        }
      };

      websocketRef.current.onmessage = (event) => {
        try {
          const messageData = JSON.parse(event?.data);
          setData(messageData);
          setMessageCount(prev => prev + 1);
          
          // Update subscription stats
          if (messageData?.symbol) {
            streamingSubscriptionService?.updateSubscriptionStats?.(messageData?.symbol);
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      websocketRef.current.onclose = (event) => {
        console.log(`🔌 WebSocket closed: ${event?.reason}`);
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect or fallback to polling
        if (reconnectAttemptsRef?.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef?.current), 30000);
          
          console.log(`🔄 Attempting reconnection in ${delay}ms (attempt ${reconnectAttemptsRef?.current})`);
          
          setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else {
          console.log('❌ Max reconnection attempts reached, switching to HTTP polling');
          startPollingFallback();
        }
      };

      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        
        // Immediately try fallback if WebSocket fails
        if (reconnectAttemptsRef?.current === 0) {
          startPollingFallback();
        }
      };

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setConnectionStatus('error');
      startPollingFallback();
    }
  }, [enabled, symbols, timeframe, startPollingFallback]);

  // Create subscription in database
  const createSubscription = useCallback(async () => {
    if (!enabled || symbols?.length === 0) return;

    try {
      // Create subscription for the first symbol (primary)
      const result = await streamingSubscriptionService?.createSubscription?.(
        symbols?.[0], 
        subscriptionType, 
        { timeframe, clientId: `client_${Date.now()}` }
      );

      if (result?.success) {
        setSubscriptionId(result?.data?.subscriptionId);
      }
    } catch (error) {
      console.error('Subscription creation error:', error);
    }
  }, [enabled, symbols, subscriptionType, timeframe]);

  // Initialize connection and subscription
  useEffect(() => {
    if (!enabled || symbols?.length === 0) {
      cleanup();
      return;
    }

    // Create subscription record
    createSubscription();
    
    // Start WebSocket connection
    connectWebSocket();

    // Cleanup on unmount or dependency change
    return cleanup;
  }, [enabled, symbols?.join(','), timeframe, subscriptionType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      
      // Cancel subscription if exists
      if (subscriptionId) {
        streamingSubscriptionService?.cancelSubscription?.(subscriptionId);
      }
    };
  }, [cleanup, subscriptionId]);

  return {
    data,
    connectionStatus,
    messageCount,
    subscriptionId,
    isConnected: connectionStatus === 'connected',
    isPolling: connectionStatus === 'polling',
    hasError: connectionStatus === 'error',
    reconnect: connectWebSocket
  };
}

export default useWebSocketQuotes;