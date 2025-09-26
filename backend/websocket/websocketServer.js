import { WebSocketServer } from 'ws';
import url from 'url';

export const createWebSocketServer = (server, ibClient) => {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws/ib'
  });

  wss?.on('connection', (ws, request) => {
    const location = url?.parse(request?.url, true);
    console.log('🔌 WebSocket client connected from:', request?.headers?.origin);

    // Add client to IB client's notification list
    ibClient?.addWebSocketClient(ws);

    // Send welcome message
    ws?.send(JSON.stringify({
      event: 'connected',
      data: {
        message: 'Connected to IBKR Bridge WebSocket',
        timestamp: new Date()?.toISOString(),
        ibConnected: ibClient?.connected,
        accounts: ibClient?.accounts
      }
    }));

    // Handle client messages
    ws?.on('message', (message) => {
      try {
        const data = JSON.parse(message?.toString());
        console.log('📨 Received WebSocket message:', data);

        // Handle ping
        if (data?.type === 'ping') {
          ws?.send(JSON.stringify({
            event: 'pong',
            data: { timestamp: new Date()?.toISOString() }
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws?.send(JSON.stringify({
          event: 'error',
          data: { error: 'Invalid message format' }
        }));
      }
    });

    ws?.on('close', () => {
      console.log('🔌 WebSocket client disconnected');
    });

    ws?.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send keep-alive ping every 15 seconds
    const pingInterval = setInterval(() => {
      if (ws?.readyState === 1) { // WebSocket.OPEN
        ws?.send(JSON.stringify({
          event: 'ping',
          data: { timestamp: new Date()?.toISOString() }
        }));
      } else {
        clearInterval(pingInterval);
      }
    }, 15000);
  });

  // Notify IB connection changes
  const originalConnect = ibClient?.connect?.bind(ibClient);
  if (ibClient && originalConnect) {
    ibClient.connect = async function() {
      const result = await originalConnect();
      ibClient?.notifyWebSocketClients('connectionChanged', {
        connected: ibClient?.connected,
        timestamp: new Date()?.toISOString()
      });
      return result;
    };
  }

  return wss;
};