// backend/routes/health.routes.js - Fixed health routes with proper JSON responses
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express?.Router();

// Initialize Supabase client with proper error handling
let supa;
try {
  if (process.env?.SUPABASE_URL && process.env?.SUPABASE_SERVICE_KEY) {
    supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);
  } else {
    console.warn('⚠️ Supabase credentials missing - health endpoints will use fallback');
  }
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error?.message);
}

// Force JSON content-type for all health responses (CRITICAL FIX)
router?.use((req, res, next) => {
  res?.setHeader('content-type', 'application/json; charset=utf-8');
  res?.setHeader('cache-control', 'no-cache, no-store, must-revalidate');
  next();
});

// Basic ping endpoint - always returns JSON
router?.get('/ping', (req, res) => {
  res?.status(200)?.json({ 
    ok: true, 
    pong: true, 
    timestamp: new Date()?.toISOString(),
    service: 'trading-mvp-api',
    env: process.env?.NODE_ENV || 'development'
  });
});

// CRITICAL FIX: RLS health check endpoint that always returns JSON
router?.get('/rls', async (req, res) => {
  try {
    if (!supa) {
      return res?.status(200)?.json({ 
        ok: false, 
        rls_ok: false,
        error: 'Supabase client not initialized',
        fallback: true,
        timestamp: new Date()?.toISOString()
      });
    }

    // Test basic database connectivity
    const { data, error } = await supa?.from('risk_metrics')?.select('id')?.limit(1);

    if (error && error?.code !== 'PGRST116') {
      return res?.status(200)?.json({ 
        ok: false, 
        rls_ok: false,
        error: error?.message,
        code: error?.code,
        timestamp: new Date()?.toISOString()
      });
    }

    // Success response
    return res?.status(200)?.json({ 
      ok: true, 
      rls_ok: true,
      rows: data ? data?.length : 0,
      timestamp: new Date()?.toISOString(),
      test: 'risk_metrics_access'
    });

  } catch (e) {
    // CRITICAL: Always return JSON even in catch block
    return res?.status(200)?.json({ 
      ok: false, 
      rls_ok: false,
      error: String(e?.message || e),
      timestamp: new Date()?.toISOString(),
      catch: true
    });
  }
});

// Main health endpoint - comprehensive system check
router?.get('/health', async (req, res) => {
  const startTime = Date.now();
  
  try {
    let dbStatus = { status: 'unknown', error: 'No Supabase client' };
    
    if (supa) {
      try {
        // Test basic Supabase connectivity with timeout
        const dbTest = await Promise.race([
          supa?.from('ops_flags')?.select('key')?.limit(1),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database timeout')), 5000))
        ]);

        if (dbTest?.error) {
          dbStatus = {
            status: 'error',
            error: dbTest?.error?.message,
            code: dbTest?.error?.code
          };
        } else {
          dbStatus = { status: 'healthy', connection: 'established' };
        }
      } catch (dbError) {
        dbStatus = {
          status: 'error',
          error: dbError?.message,
          timeout: dbError?.message?.includes('timeout')
        };
      }
    }

    const responseTime = Date.now() - startTime;

    // ALWAYS return JSON with proper structure
    res?.status(200)?.json({
      ok: dbStatus?.status === 'healthy',
      status: dbStatus?.status === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date()?.toISOString(),
      responseTime,
      database: dbStatus,
      service: 'trading-mvp-api',
      uptime: process.uptime(),
      environment: process.env?.NODE_ENV || 'development',
      version: '1.0.0'
    });

  } catch (e) {
    const responseTime = Date.now() - startTime;
    
    // CRITICAL: Always return JSON structure even in error case
    res?.status(200)?.json({
      ok: false,
      status: 'critical',
      timestamp: new Date()?.toISOString(),
      responseTime,
      error: String(e?.message || e),
      service: 'trading-mvp-api',
      fallback: true
    });
  }
});

// Market status endpoint with fallback
router?.get('/market-status', async (req, res) => {
  try {
    if (!supa) {
      // Fallback market status calculation
      const now = new Date();
      const hour = now?.getUTCHours();
      const isWeekend = now?.getUTCDay() === 0 || now?.getUTCDay() === 6;
      
      return res?.status(200)?.json({
        ok: true,
        data: {
          is_open: !isWeekend && hour >= 14 && hour < 21,
          is_weekend: isWeekend,
          status: isWeekend ? 'CLOSED' : (hour >= 14 && hour < 21 ? 'OPEN' : 'CLOSED'),
          timezone: 'UTC'
        },
        fallback: true,
        timestamp: new Date()?.toISOString()
      });
    }

    const { data, error } = await Promise.race([
      supa?.rpc('get_market_status'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Market status timeout')), 3000))
    ]);
    
    if (error) {
      // Fallback on error
      const now = new Date();
      const hour = now?.getUTCHours();
      const isWeekend = now?.getUTCDay() === 0 || now?.getUTCDay() === 6;
      
      return res?.status(200)?.json({
        ok: true,
        data: {
          is_open: !isWeekend && hour >= 14 && hour < 21,
          is_weekend: isWeekend,
          status: isWeekend ? 'CLOSED' : (hour >= 14 && hour < 21 ? 'OPEN' : 'CLOSED'),
          timezone: 'UTC'
        },
        error: error?.message,
        fallback: true,
        timestamp: new Date()?.toISOString()
      });
    }

    res?.status(200)?.json({
      ok: true,
      data,
      timestamp: new Date()?.toISOString()
    });

  } catch (e) {
    // Ultimate fallback
    const now = new Date();
    const hour = now?.getUTCHours();
    const isWeekend = now?.getUTCDay() === 0 || now?.getUTCDay() === 6;
    
    res?.status(200)?.json({
      ok: true,
      data: {
        is_open: !isWeekend && hour >= 14 && hour < 21,
        is_weekend: isWeekend,
        status: isWeekend ? 'CLOSED' : (hour >= 14 && hour < 21 ? 'OPEN' : 'CLOSED'),
        timezone: 'UTC'
      },
      error: String(e?.message || e),
      fallback: true,
      timestamp: new Date()?.toISOString()
    });
  }
});

// System status endpoint
router?.get('/system', async (req, res) => {
  try {
    const health = {
      api: 'operational',
      database: 'unknown',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env?.NODE_ENV || 'development',
      timestamp: new Date()?.toISOString()
    };

    if (supa) {
      try {
        const { error } = await supa?.from('ops_flags')?.select('key')?.limit(1);
        health.database = error ? 'error' : 'operational';
      } catch (dbError) {
        health.database = 'error';
        health.databaseError = dbError?.message;
      }
    }

    res?.status(200)?.json({
      ok: true,
      ...health
    });

  } catch (e) {
    res?.status(200)?.json({
      ok: false,
      error: String(e?.message || e),
      timestamp: new Date()?.toISOString(),
      fallback: true
    });
  }
});

// Export the router as both default and named export for compatibility
export default router;
export const health = router;

// Factory function for backward compatibility
export function createHealthRoutes() {
  console.log('✅ Health routes created successfully');
  return router;
}