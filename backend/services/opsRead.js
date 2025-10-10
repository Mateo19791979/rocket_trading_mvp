const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env?.SUPABASE_URL;
const supabaseServiceKey = process.env?.SUPABASE_SERVICE_KEY;

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * Mount operations read endpoints
 */
const mountOpsRead = (app) => {
  
  // System status endpoint
  app?.get('/api/ops/status', async (req, res) => {
    try {
      const status = {
        timestamp: new Date()?.toISOString(),
        api: 'operational',
        database: 'unknown',
        environment: process.env?.NODE_ENV || 'development'
      };

      if (supabase) {
        try {
          const { data, error } = await supabase?.from('public.rls_health_monitor')?.select('count')?.limit(1);

          status.database = error ? 'error' : 'operational';
          status.database_error = error?.message;
        } catch (dbError) {
          status.database = 'error';
          status.database_error = dbError?.message;
        }
      }

      res?.json(status);
    } catch (error) {
      res?.status(500)?.json({
        error: 'Status check failed',
        details: error?.message,
        timestamp: new Date()?.toISOString()
      });
    }
  });

  // Database health endpoint
  app?.get('/api/ops/db-health', async (req, res) => {
    try {
      if (!supabase) {
        return res?.status(503)?.json({
          ok: false,
          error: 'Database not configured',
          timestamp: new Date()?.toISOString()
        });
      }

      // Test multiple table access
      const checks = [
        { table: 'shadow_portfolios', operation: 'read' },
        { table: 'trading_audit_logs', operation: 'read' },
        { table: 'market_data_sync_jobs', operation: 'read' }
      ];

      const results = [];

      for (const check of checks) {
        try {
          const { data, error } = await supabase?.from(check?.table)?.select('*')?.limit(1);

          results?.push({
            ...check,
            status: error ? 'error' : 'ok',
            error_message: error?.message,
            row_count: data?.length || 0
          });
        } catch (checkError) {
          results?.push({
            ...check,
            status: 'critical_error',
            error_message: checkError?.message
          });
        }
      }

      const healthyCount = results?.filter(r => r?.status === 'ok')?.length;
      const overallHealth = healthyCount === results?.length ? 'healthy' : 'degraded';

      res?.json({
        ok: true,
        overall_health: overallHealth,
        healthy_tables: healthyCount,
        total_tables: results?.length,
        checks: results,
        timestamp: new Date()?.toISOString()
      });

    } catch (error) {
      res?.status(500)?.json({
        ok: false,
        error: 'Database health check failed',
        details: error?.message,
        timestamp: new Date()?.toISOString()
      });
    }
  });

  // Configuration info (safe)
  app?.get('/api/ops/config', (req, res) => {
    res?.json({
      node_version: process.version,
      environment: process.env?.NODE_ENV || 'development',
      port: process.env?.PORT || 3000,
      has_supabase: !!supabaseUrl,
      has_redis: !!process.env?.REDIS_URL,
      cors_origin: process.env?.CORS_ORIGIN || 'not_configured',
      timestamp: new Date()?.toISOString()
    });
  });

  // Basic health check endpoint (CRITICAL FIX)
  app?.get('/api/health', async (req, res) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date()?.toISOString(),
        version: '2.0.0',
        connections: {
          database: {
            status: supabase ? 'connected' : 'disconnected'
          },
          api: {
            status: 'operational'
          }
        },
        system: {
          uptime: process?.uptime(),
          memory: process?.memoryUsage(),
          environment: process?.env?.NODE_ENV || 'development'
        }
      };
      
      // Test database connection if available
      if (supabase) {
        try {
          const { error } = await supabase?.from('public.rls_health_monitor')?.select('count')?.limit(1);
          health.connections.database.status = error ? 'error' : 'connected';
          health.connections.database.error = error?.message;
        } catch (dbError) {
          health.connections.database.status = 'error';
          health.connections.database.error = dbError?.message;
        }
      }
      
      const statusCode = health?.connections?.database?.status === 'error' ? 503 : 200;
      res?.status(statusCode)?.json(health);
      
    } catch (error) {
      res?.status(503)?.json({
        status: 'unhealthy',
        error: error?.message,
        timestamp: new Date()?.toISOString()
      });
    }
  });

  // Positions endpoint (CRITICAL FIX)
  app?.get('/api/positions', async (req, res) => {
    try {
      // Mock positions data for now - replace with actual IBKR/database integration
      const positions = [
        { 
          symbol: "AAPL", 
          quantity: 100, 
          price: 150.00, 
          market_value: 15000.00,
          unrealized_pnl: 1500.00,
          realized_pnl: 0,
          account: 'DU123456',
          position_id: 'pos_001'
        },
        { 
          symbol: "GOOGL", 
          quantity: 50, 
          price: 2800.00, 
          market_value: 140000.00,
          unrealized_pnl: -2000.00,
          realized_pnl: 500,
          account: 'DU123456',
          position_id: 'pos_002'
        }
      ];

      res?.json({
        ok: true,
        positions,
        total_positions: positions?.length,
        total_market_value: positions?.reduce((sum, pos) => sum + pos?.market_value, 0),
        total_unrealized_pnl: positions?.reduce((sum, pos) => sum + pos?.unrealized_pnl, 0),
        timestamp: new Date()?.toISOString()
      });
      
    } catch (error) {
      res?.status(500)?.json({
        ok: false,
        error: 'Failed to fetch positions',
        details: error?.message,
        timestamp: new Date()?.toISOString()
      });
    }
  });

  // Market data endpoint (CRITICAL FIX)
  app?.get('/api/market', async (req, res) => {
    try {
      // Mock market data - replace with actual provider integration
      const marketData = {
        market_status: 'OPEN',
        session: 'REGULAR',
        quotes: [
          { 
            symbol: 'SPY', 
            price: 420.50, 
            change: 1.2, 
            change_percent: 0.29,
            volume: 45234567,
            bid: 420.48,
            ask: 420.52,
            last_update: new Date()?.toISOString()
          },
          { 
            symbol: 'QQQ', 
            price: 350.75, 
            change: -0.8,
            change_percent: -0.23, 
            volume: 32456789,
            bid: 350.73,
            ask: 350.77,
            last_update: new Date()?.toISOString()
          },
          {
            symbol: 'AAPL',
            price: 150.25,
            change: 2.15,
            change_percent: 1.45,
            volume: 67890123,
            bid: 150.23,
            ask: 150.27,
            last_update: new Date()?.toISOString()
          }
        ],
        indices: {
          'S&P 500': { value: 4185.25, change: 12.5 },
          'NASDAQ': { value: 12845.75, change: -23.8 },
          'DOW': { value: 33245.50, change: 45.2 }
        }
      };

      res?.json({
        ok: true,
        ...marketData,
        timestamp: new Date()?.toISOString()
      });
      
    } catch (error) {
      res?.status(500)?.json({
        ok: false,
        error: 'Failed to fetch market data',
        details: error?.message,
        timestamp: new Date()?.toISOString()
      });
    }
  });

  // Orders endpoint (ADDITIONAL FIX)
  app?.get('/api/orders', async (req, res) => {
    try {
      // Mock orders data - replace with actual IBKR integration
      const orders = [
        { 
          id: 'ord_001',
          symbol: 'TSLA', 
          side: 'BUY', 
          quantity: 10, 
          price: 800.00,
          order_type: 'LIMIT',
          status: 'PENDING',
          account: 'DU123456',
          created_at: new Date()?.toISOString(),
          updated_at: new Date()?.toISOString()
        },
        { 
          id: 'ord_002',
          symbol: 'MSFT', 
          side: 'SELL', 
          quantity: 25,
          price: 345.00,
          order_type: 'MARKET',
          status: 'FILLED',
          filled_quantity: 25,
          avg_fill_price: 344.85,
          account: 'DU123456',
          created_at: new Date(Date.now() - 3600000)?.toISOString(),
          updated_at: new Date()?.toISOString()
        }
      ];

      res?.json({
        ok: true,
        orders,
        total_orders: orders?.length,
        pending_orders: orders?.filter(o => o?.status === 'PENDING')?.length,
        filled_orders: orders?.filter(o => o?.status === 'FILLED')?.length,
        timestamp: new Date()?.toISOString()
      });
      
    } catch (error) {
      res?.status(500)?.json({
        ok: false,
        error: 'Failed to fetch orders',
        details: error?.message,
        timestamp: new Date()?.toISOString()
      });
    }
  });

  console.log('✅ OpsRead endpoints mounted: /api/ops/*, /api/health, /api/positions, /api/market, /api/orders');
};

module.exports = {
  mountOpsRead
};