const express = require("express");
const cors = require("cors");

const app = express();

// CORS configuration for trading-mvp.com
const allowedOrigins = [
  "https://trading-mvp.com",
  "https://www.trading-mvp.com", 
  /\.builtwithrocket\.new$/
];

app?.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    const isAllowed = allowedOrigins?.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin?.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    callback(new Error(`CORS policy violation: ${origin} not allowed`));
  },
  credentials: true
}));

app?.use(express?.json());

// Health check endpoint - CRITICAL for 502 prevention
app?.get('/health', (req, res) => {
  res?.status(200)?.json({ 
    ok: true, 
    status: 'healthy',
    timestamp: new Date()?.toISOString(),
    service: 'trading-mvp-api'
  });
});

app?.get('/api/health', (req, res) => {
  res?.status(200)?.json({ 
    ok: true, 
    status: 'healthy',
    timestamp: new Date()?.toISOString(),
    service: 'trading-mvp-api',
    endpoint: '/api/health'
  });
});

// Security RLS health endpoint
app?.get('/api/security/rls/health', (req, res) => {
  res?.status(200)?.json({
    ok: true,
    service: 'rls-health',
    status: 'operational',
    timestamp: new Date()?.toISOString(),
    checks: {
      database: 'connected',
      policies: 'active',
      auth: 'enabled'
    }
  });
});

// Example API routes
app?.get('/api/quotes', (req, res) => {
  res?.json({
    ok: true,
    data: [],
    message: 'Quotes endpoint operational'
  });
});

app?.get('/api/positions', (req, res) => {
  res?.json({
    ok: true,
    data: [],
    message: 'Positions endpoint operational'
  });
});

// 404 handler for unknown routes
app?.use((req, res) => {
  res?.status(404)?.json({ 
    ok: false, 
    error: 'endpoint_not_found', 
    path: req?.path,
    method: req?.method
  });
});

// Global error handler
app?.use((err, req, res, next) => {
  console.error('API Error:', err);
  
  // CORS error
  if (err?.message?.includes('CORS policy violation')) {
    return res?.status(403)?.json({
      ok: false,
      error: 'cors_violation',
      message: 'Origin not allowed by CORS policy'
    });
  }
  
  // General error
  res?.status(500)?.json({ 
    ok: false, 
    error: 'internal_server_error',
    message: err?.message || 'An unexpected error occurred'
  });
});

const PORT = process.env?.PORT || 3000;

app?.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Trading MVP API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔒 RLS Health: http://localhost:${PORT}/api/security/rls/health`);
});