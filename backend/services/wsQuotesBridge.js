import http from 'http';
import { WebSocketServer as WSS } from '../../src/ws';
import Redis from 'ioredis';
import url from 'url';

const PORT_WS = parseInt(process.env?.PORT_WS || '8088', 10);
const REDIS_URL = process.env?.REDIS_URL || 'redis://localhost:6379';
const CHANNEL_PREFIX = process.env?.CH_PREFIX || 'data.market';

class WebSocketQuotesBridge {
  constructor() {
    this.server = null;
    this.wss = null;
    this.redis = null;
    this.clients = new Map();
  }

  async initialize() {
    // Create HTTP server for WebSocket upgrades
    this.server = http?.createServer((_, res) => { 
      res?.writeHead(200); 
      res?.end('WebSocket Quotes Bridge - OK'); 
    });

    // Initialize WebSocket Server
    this.wss = new WSS({ server: this.server });

    // Initialize Redis connection
    try {
      this.redis = new Redis(REDIS_URL);
      console.log('✅ Redis connected for WebSocket bridge');
    } catch (error) {
      console.warn('⚠️ Redis connection failed, using fallback mode');
      this.redis = null;
    }

    // Handle WebSocket connections
    this.wss?.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    console.log(`🚀 WebSocket Quotes Bridge initialized on port ${PORT_WS}`);
  }

  handleConnection(ws, req) {
    const urlParts = url?.parse(req?.url, true);
    const symbols = (urlParts?.query?.symbols || '')?.split(',')?.map(s => s?.trim()?.toUpperCase())?.filter(Boolean);
    const timeframe = urlParts?.query?.tf || '1m';

    if (!symbols?.length) {
      ws?.close(1008, 'Missing symbols parameter');
      return;
    }

    const clientId = `client_${Date.now()}_${Math.random()?.toString(36)?.substr(2, 9)}`;
    
    console.log(`🔗 WebSocket client connected: ${clientId}, symbols: ${symbols?.join(',')}, tf: ${timeframe}`);

    // Store client info
    this.clients?.set(clientId, {
      ws,
      symbols,
      timeframe,
      connectedAt: new Date()
    });

    // Subscribe to Redis channels for each symbol
    if (this.redis) {
      symbols?.forEach(symbol => {
        const channel = `${CHANNEL_PREFIX}.${symbol}.${timeframe}`;
        this.redis?.subscribe(channel);
      });

      // Listen for Redis messages
      this.redis?.on('message', (channel, message) => {
        this.broadcastToRelevantClients(channel, message);
      });
    }

    // Send welcome message
    this.sendMessage(ws, {
      event: 'connected',
      data: {
        clientId,
        symbols,
        timeframe,
        message: 'Connected to WebSocket Quotes Bridge',
        timestamp: new Date()?.toISOString()
      }
    });

    // Handle client messages
    ws?.on('message', (message) => {
      try {
        const data = JSON.parse(message?.toString());
        this.handleClientMessage(clientId, data);
      } catch (error) {
        this.sendMessage(ws, {
          event: 'error',
          data: { error: 'Invalid message format' }
        });
      }
    });

    // Handle client disconnect
    ws?.on('close', () => {
      console.log(`🔌 WebSocket client disconnected: ${clientId}`);
      this.clients?.delete(clientId);
    });

    // Handle WebSocket errors
    ws?.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.clients?.delete(clientId);
    });

    // Start heartbeat for this client
    this.startHeartbeat(clientId);
  }

  handleClientMessage(clientId, data) {
    const client = this.clients?.get(clientId);
    if (!client) return;

    switch (data?.type) {
      case 'ping':
        this.sendMessage(client?.ws, {
          event: 'pong',
          data: { timestamp: new Date()?.toISOString() }
        });
        break;

      case 'subscribe':
        // Handle dynamic symbol subscription
        if (data?.symbols?.length) {
          client.symbols = data?.symbols?.map(s => s?.toUpperCase());
          console.log(`📊 Client ${clientId} updated symbols: ${client?.symbols?.join(',')}`);
        }
        break;

      default:
        console.warn(`Unknown message type: ${data?.type}`);
    }
  }

  broadcastToRelevantClients(channel, message) {
    // Parse channel to extract symbol and timeframe
    const channelParts = channel?.split('.');
    if (channelParts?.length < 3) return;

    const symbol = channelParts?.[channelParts?.length - 2];
    const timeframe = channelParts?.[channelParts?.length - 1];

    // Send to clients subscribed to this symbol/timeframe
    this.clients?.forEach((client, clientId) => {
      if (client?.ws?.readyState === 1 && // WebSocket.OPEN
          client?.symbols?.includes(symbol) && 
          client?.timeframe === timeframe) {
        
        try {
          const parsedMessage = JSON.parse(message);
          this.sendMessage(client?.ws, {
            event: 'quote',
            data: parsedMessage
          });
        } catch (error) {
          console.error(`Failed to broadcast to client ${clientId}:`, error);
        }
      }
    });
  }

  sendMessage(ws, message) {
    if (ws?.readyState === 1) { // WebSocket.OPEN
      ws?.send(JSON.stringify(message));
    }
  }

  startHeartbeat(clientId) {
    const client = this.clients?.get(clientId);
    if (!client) return;

    const heartbeatInterval = setInterval(() => {
      if (!this.clients?.has(clientId) || client?.ws?.readyState !== 1) {
        clearInterval(heartbeatInterval);
        return;
      }

      this.sendMessage(client?.ws, {
        event: 'heartbeat',
        data: { timestamp: new Date()?.toISOString() }
      });
    }, 30000); // 30 seconds

    // Store interval reference for cleanup
    client.heartbeatInterval = heartbeatInterval;
  }

  // Publish quote data to Redis (for external data feeds)
  async publishQuote(symbol, data) {
    if (!this.redis) return;

    const timeframes = ['1m', '5m', '1h', '1d'];
    
    for (const tf of timeframes) {
      const channel = `${CHANNEL_PREFIX}.${symbol}.${tf}`;
      const message = JSON.stringify({
        symbol,
        price: data?.price,
        change: data?.change,
        change_percent: data?.change_percent,
        volume: data?.volume,
        timestamp: new Date()?.toISOString(),
        timeframe: tf
      });

      await this.redis?.publish(channel, message);
    }
  }

  // Get connection stats
  getStats() {
    const clients = Array.from(this.clients?.entries())?.map(([id, client]) => ({
      clientId: id,
      symbols: client?.symbols,
      timeframe: client?.timeframe,
      connectedAt: client?.connectedAt,
      connected: client?.ws?.readyState === 1
    }));

    return {
      totalClients: this.clients?.size,
      activeClients: clients?.filter(c => c?.connected)?.length,
      clients,
      redisConnected: !!this.redis,
      uptime: process.uptime()
    };
  }

  start() {
    this.server?.listen(PORT_WS, '0.0.0.0', () => {
      console.log(`🚀 WebSocket Quotes Bridge listening on http://0.0.0.0:${PORT_WS}`);
    });
  }

  async stop() {
    if (this.wss) {
      this.wss?.close();
    }
    if (this.server) {
      this.server?.close();
    }
    if (this.redis) {
      await this.redis?.quit();
    }
    console.log('🛑 WebSocket Quotes Bridge stopped');
  }
}

export const wsQuotesBridge = new WebSocketQuotesBridge();

// Auto-initialize if run directly
if (import.meta.url === `file://${process.argv?.[1]}`) {
  wsQuotesBridge?.initialize();
  wsQuotesBridge?.start();
}