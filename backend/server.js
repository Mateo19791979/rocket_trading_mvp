import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { IBClient } from './lib/ibClient.js';
import { createWebSocketServer } from './websocket/websocketServer.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import { createHealthRoutes } from './routes/health.js';
import { createIBRoutes } from './routes/ib.js';
import { createMarketRoutes } from './routes/market.js';
import { createOrderRoutes } from './routes/orders.js';
import { createPositionRoutes } from './routes/positions.js';
import { createPnlRoutes } from './routes/pnl.js';

// Load environment variables
dotenv?.config();

const app = express();
const server = createServer(app);

// Configuration
const PORT = process.env?.PORT || 8080;
const IB_HOST = process.env?.IB_HOST || '127.0.0.1';
const IB_PORT = parseInt(process.env?.IB_PORT) || 7497;
const IB_CLIENT_ID = parseInt(process.env?.IB_CLIENT_ID) || 42;
const CORS_ORIGIN = process.env?.CORS_ORIGIN || 'https://trading.mvp.com';

console.log('🚀 Starting IBKR Bridge Backend...');
console.log(`📊 IB Configuration: ${IB_HOST}:${IB_PORT} (Client ID: ${IB_CLIENT_ID})`);
console.log(`🌐 CORS Origin: ${CORS_ORIGIN}`);

// Security middleware
app?.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app?.use(cors({
  origin: CORS_ORIGIN?.split(',')?.map(origin => origin?.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting: 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    error: 'rate_limit_exceeded',
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app?.use(limiter);

// Logging
app?.use(morgan('combined'));

// Body parsing
app?.use(express?.json({ limit: '10mb' }));
app?.use(express?.urlencoded({ extended: true }));

// Initialize IB Client
const ibClient = new IBClient({
  host: IB_HOST,
  port: IB_PORT,
  clientId: IB_CLIENT_ID
});

// Routes
app?.use('/health', createHealthRoutes(ibClient));
app?.use('/ib', createIBRoutes(ibClient));
app?.use('/market', createMarketRoutes());
app?.use('/orders', createOrderRoutes(ibClient));
app?.use('/positions', createPositionRoutes(ibClient));
app?.use('/pnl', createPnlRoutes(ibClient));

// Root endpoint
app?.get('/', (req, res) => {
  res?.json({
    service: 'IBKR Bridge Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      ibHandshake: '/ib/handshake',
      marketStatus: '/market/status?ex=NYSE|SIX',
      orders: '/orders',
      positions: '/positions',
      pnl: '/pnl',
      websocket: '/ws/ib'
    },
    ibConnection: {
      host: IB_HOST,
      port: IB_PORT,
      clientId: IB_CLIENT_ID,
      connected: ibClient?.connected
    },
    timestamp: new Date()?.toISOString()
  });
});

// 404 handler
app?.use('*', (req, res) => {
  res?.status(404)?.json({
    error: 'not_found',
    message: 'Endpoint not found',
    path: req?.originalUrl
  });
});

// Error handling middleware
app?.use(errorHandler);

// Initialize WebSocket server
const wss = createWebSocketServer(server, ibClient);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  // Close WebSocket server
  wss?.close();
  
  // Disconnect from IB
  await ibClient?.disconnect();
  
  // Close HTTP server
  server?.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Auto-connect to IB on startup
const initializeIBConnection = async () => {
  try {
    console.log('🔌 Attempting to connect to IB Gateway/TWS...');
    const result = await ibClient?.connect();
    if (result?.success) {
      console.log('✅ Successfully connected to IB Gateway/TWS');
    } else {
      console.log('⚠️  Failed to connect to IB Gateway/TWS on startup');
      console.log('📝 Server will run in degraded mode');
      console.log('💡 Use /ib/handshake endpoint to retry connection');
    }
  } catch (error) {
    console.error('❌ IB Connection error on startup:', error?.message);
    console.log('📝 Server will run in degraded mode');
  }
};

// Start server
server?.listen(PORT, () => {
  console.log(`🚀 IBKR Bridge Backend running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/ws/ib`);
  console.log(`📊 Environment: ${process.env?.NODE_ENV || 'development'}`);
  
  // Initialize IB connection after a short delay
  setTimeout(initializeIBConnection, 2000);
});

export default app;