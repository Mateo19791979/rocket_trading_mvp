import { useEffect, useRef, useState } from "react";

export function useQuotesWS({ 
  symbols, 
  tf = "1m", 
  httpFallbackUrl = "/api/quotes" 
}) {
  const [data, setData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [messageCount, setMessageCount] = useState(0);
  const wsRef = useRef(null);
  const fallbackTimerRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  const startPolling = () => {
    fallbackTimerRef.current = setInterval(async () => {
      try {
        const symbolString = symbols?.join(',');
        const response = await fetch(`${httpFallbackUrl}?symbols=${symbolString}&src=auto`);
        const json = await response?.json()?.catch(() => null);
        
        if (json?.success) {
          setData(json);
          setMessageCount(prev => prev + 1);
        }
      } catch (error) {
        console.error('HTTP polling error:', error);
      }
    }, 2500);
  };

  useEffect(() => {
    if (!symbols?.length) {
      setConnectionStatus('disconnected');
      return;
    }

    const symbolString = symbols?.join(',');
    const wsUrl = `${import.meta.env?.VITE_WS_URL || 'ws://localhost:8088'}/quotes?symbols=${symbolString}&tf=${tf}`;
    
    let reconnectTimer = null;

    const connectWebSocket = () => {
      try {
        wsRef.current = new WebSocket(wsUrl);
        setConnectionStatus('connecting');

        wsRef.current.onopen = () => {
          console.log('✅ WebSocket connected successfully');
          setConnectionStatus('connected');
          reconnectAttemptsRef.current = 0;
          
          // Clear any existing polling
          if (fallbackTimerRef?.current) {
            clearInterval(fallbackTimerRef?.current);
            fallbackTimerRef.current = null;
          }
        };

        wsRef.current.onmessage = (event) => {
          try {
            const messageData = JSON.parse(event?.data);
            
            // Handle different message types
            if (messageData?.event === 'quote') {
              setData(messageData?.data);
              setMessageCount(prev => prev + 1);
            } else if (messageData?.event === 'connected') {
              console.log('WebSocket connection confirmed:', messageData?.data?.message);
            }
          } catch (error) {
            console.error('WebSocket message parse error:', error);
          }
        };

        wsRef.current.onclose = (event) => {
          console.log(`🔌 WebSocket closed: ${event?.reason || 'Unknown reason'}`);
          setConnectionStatus('disconnected');
          
          // Attempt reconnection or fallback to polling
          if (reconnectAttemptsRef?.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef?.current), 10000);
            
            console.log(`🔄 Attempting WebSocket reconnection in ${delay}ms (attempt ${reconnectAttemptsRef?.current})`);
            
            reconnectTimer = setTimeout(() => {
              connectWebSocket();
            }, delay);
          } else {
            console.log('❌ Max WebSocket reconnection attempts reached, switching to HTTP polling');
            setConnectionStatus('polling');
            startPolling();
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('error');
          
          // If first connection fails, immediately try polling
          if (reconnectAttemptsRef?.current === 0) {
            setConnectionStatus('polling');
            startPolling();
          }
        };

      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setConnectionStatus('polling');
        startPolling();
      }
    };

    // Start initial connection
    connectWebSocket();

    // Cleanup function
    return () => {
      if (wsRef?.current) {
        wsRef?.current?.close();
        wsRef.current = null;
      }
      
      if (fallbackTimerRef?.current) {
        clearInterval(fallbackTimerRef?.current);
        fallbackTimerRef.current = null;
      }
      
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      
      setConnectionStatus('disconnected');
    };
  }, [symbols?.join(','), tf]);

  return {
    data,
    connectionStatus,
    messageCount,
    isConnected: connectionStatus === 'connected',
    isPolling: connectionStatus === 'polling',
    hasError: connectionStatus === 'error',
    // Re-connection method for manual retry
    reconnect: () => {
      if (wsRef?.current) {
        wsRef?.current?.close();
      }
      reconnectAttemptsRef.current = 0;
    }
  };
}

export default useQuotesWS;