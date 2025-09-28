import { Router } from 'express';

const router = Router();

export const createHealthRoutes = (ibClient, supabase) => {
  // Basic health check
  router?.get('/', async (req, res) => {
    try {
      // Check database connectivity
      const { data: dbHealth, error: dbError } = await supabase?.from('strategies')?.select('count')?.limit(1);
      
      // Check IB connection
      const ibConnected = ibClient?.connected;
      
      // Get system metrics
      const health = {
        status: 'healthy',
        timestamp: new Date()?.toISOString(),
        version: '2.0.0',
        connections: {
          database: {
            status: dbError ? 'disconnected' : 'connected',
            error: dbError?.message || null
          },
          ibkr: {
            status: ibConnected ? 'connected' : 'disconnected',
            accounts: ibClient?.accounts?.length || 0,
            orders: ibClient?.orders?.size || 0,
            positions: ibClient?.positions?.size || 0
          }
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage()
        }
      };
      
      // Determine overall health status
      const isHealthy = !dbError && (ibConnected || process.env?.NODE_ENV === 'development');
      const statusCode = isHealthy ? 200 : 503;
      
      if (!isHealthy) {
        health.status = 'degraded';
        health.warnings = [];
        
        if (dbError) {
          health?.warnings?.push('Database connection issue');
        }
        
        if (!ibConnected) {
          health?.warnings?.push('IB Gateway/TWS not connected');
        }
      }
      
      res?.status(statusCode)?.json(health);
      
    } catch (error) {
      res?.status(503)?.json({
        status: 'unhealthy',
        error: error?.message,
        timestamp: new Date()?.toISOString()
      });
    }
  });
  
  // Detailed health check for monitoring systems
  router?.get('/detailed', async (req, res) => {
    try {
      const results = await Promise.allSettled([
        // Database queries
        supabase?.from('strategies')?.select('count')?.limit(1),
        supabase?.from('scores')?.select('count')?.limit(1),
        supabase?.from('user_profiles')?.select('count')?.limit(1),
        
        // System checks
        Promise.resolve({
          nodejs: process.version,
          platform: process.platform,
          arch: process.arch,
          uptime: process.uptime()
        })
      ]);
      
      const [dbStrategies, dbScores, dbUsers, systemInfo] = results;
      
      const detailedHealth = {
        status: 'healthy',
        timestamp: new Date()?.toISOString(),
        checks: {
          database: {
            strategies: dbStrategies?.status === 'fulfilled' ? 'ok' : 'error',
            scores: dbScores?.status === 'fulfilled' ? 'ok' : 'error',
            users: dbUsers?.status === 'fulfilled' ? 'ok' : 'error'
          },
          services: {
            ibkr: ibClient?.connected ? 'connected' : 'disconnected',
            websocket: 'running' // Assume running if server is up
          },
          system: systemInfo?.status === 'fulfilled' ? systemInfo?.value : 'error'
        },
        performance: {
          response_time_ms: Date.now() - req?.startTime || 0,
          memory_usage: process.memoryUsage(),
          cpu_usage: process.cpuUsage()
        }
      };
      
      // Calculate overall health
      const hasErrors = Object.values(detailedHealth?.checks?.database)?.includes('error');
      const statusCode = hasErrors ? 503 : 200;
      
      if (hasErrors) {
        detailedHealth.status = 'degraded';
      }
      
      res?.status(statusCode)?.json(detailedHealth);
      
    } catch (error) {
      res?.status(503)?.json({
        status: 'error',
        error: error?.message,
        timestamp: new Date()?.toISOString()
      });
    }
  });

  return router;
};