import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { schedulerLoop } from './services/orchestrator/scheduler.js';
import { playbooksLoop } from './services/orchestrator/playbooks.js';
import { proposalsLoop } from './services/orchestrator/proposals.js';
import orchExtra from './routes/orch.extra.js';

// Enhanced error handling and logging
process.on('uncaughtException', (error) => {
  console.error('[FATAL] Uncaught Exception:', error);
  console.error('Stack:', error?.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`[Orchestrator] Received ${signal}. Graceful shutdown starting...`);
  
  try {
    // Give services time to cleanup
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('[Orchestrator] Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('[Orchestrator] Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Validate environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'INTERNAL_ADMIN_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env?.[envVar]) {
    console.error(`[Orchestrator] Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();

// Middleware
app?.use(cors());
app?.use(express?.json({ limit: '2mb' }));

// Health check endpoint
app?.get('/health', (req, res) => {
  res?.json({ 
    ok: true, 
    service: 'orchestrator',
    timestamp: new Date()?.toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Mount governance routes
app?.use('/bridge', orchExtra);

// Error handling middleware
app?.use((error, req, res, next) => {
  console.error(`[API Error] ${req?.method} ${req?.path}:`, error);
  res?.status(500)?.json({ 
    ok: false, 
    error: 'Internal server error',
    timestamp: new Date()?.toISOString()
  });
});

// 404 handler
app?.use((req, res) => {
  res?.status(404)?.json({ 
    ok: false, 
    error: `Route not found: ${req?.method} ${req?.path}`,
    availableRoutes: [
      'GET /health',
      'POST /bridge/schedule',
      'GET /bridge/proposals',
      'POST /bridge/proposals/approve',
      'POST /bridge/proposals/reject',
      'GET /bridge/learning-kpis'
    ]
  });
});

const PORT = process.env?.PORT || 3000;

// Start HTTP server
const server = app?.listen(PORT, () => {
  console.log(`[Orchestrator API] listening on port ${PORT}`);
  console.log(`[Orchestrator] Environment: ${process.env?.NODE_ENV || 'development'}`);
  console.log('[Orchestrator] Ready to accept connections');
});

// Enhanced server error handling
server?.on('error', (error) => {
  if (error?.code === 'EADDRINUSE') {
    console.error(`[Orchestrator] Port ${PORT} is already in use`);
  } else {
    console.error('[Orchestrator] Server error:', error);
  }
  process.exit(1);
});

// Start orchestrator services with enhanced error handling and restart logic
async function startService(name, serviceFunction) {
  console.log(`[Orchestrator] Starting ${name}...`);
  
  let restartCount = 0;
  const maxRestarts = 5;
  
  while (restartCount < maxRestarts) {
    try {
      await serviceFunction();
      console.log(`[Orchestrator] ${name} ended normally`);
      break;
    } catch (error) {
      restartCount++;
      console.error(`[Orchestrator] ${name} error (attempt ${restartCount}/${maxRestarts}):`, error);
      
      if (restartCount < maxRestarts) {
        const backoffTime = Math.min(1000 * Math.pow(2, restartCount - 1), 30000);
        console.log(`[Orchestrator] Restarting ${name} in ${backoffTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      } else {
        console.error(`[Orchestrator] ${name} failed ${maxRestarts} times. Giving up.`);
        throw error;
      }
    }
  }
}

// Initialize and start all services
(async () => {
  try {
    console.log('[Orchestrator] Starting governance workers...');
    
    // Start services concurrently with proper error isolation
    const services = [
      { name: 'Scheduler', fn: schedulerLoop },
      { name: 'Playbooks', fn: playbooksLoop },
      { name: 'Proposals', fn: proposalsLoop }
    ];

    // Start each service in its own error-isolated context
    services?.forEach(service => {
      startService(service?.name, service?.fn)?.catch(error => {
          console.error(`[Orchestrator] Fatal error in ${service?.name}:`, error);
          // Don't crash the entire orchestrator if one service fails permanently
          console.error(`[Orchestrator] ${service?.name} service disabled due to fatal errors`);
        });
    });

    console.log('[Orchestrator] All services started successfully');
    
    // Performance monitoring
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const memUsedMB = Math.round(memUsage?.heapUsed / 1024 / 1024);
      
      if (memUsedMB > 500) { // Alert if using more than 500MB
        console.warn(`[Orchestrator] High memory usage: ${memUsedMB}MB`);
      }
      
      // Log periodic health status
      console.log(`[Orchestrator] Health check - Uptime: ${Math.round(process.uptime())}s, Memory: ${memUsedMB}MB`);
    }, 60000); // Every minute

  } catch (error) {
    console.error('[Orchestrator] Failed to start services:', error);
    process.exit(1);
  }
})();

// Export app for testing purposes
export default app;