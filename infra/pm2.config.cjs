module.exports = {
  apps: [
    {
      name: "api",
      script: "server/index.js",
      env: {
        NODE_ENV: "production"
      },
      max_restarts: 10,
      exp_backoff_restart_delay: 2000,
      watch: false,
      instances: 1,
      exec_mode: "fork"
    },
    
    {
      name: "sql-guard",
      script: "server/workers/sqlGuard.worker.js",
      env: {
        NODE_ENV: "production",
        SQL_GUARD_INTERVAL_MS: process.env.SQL_GUARD_INTERVAL_MS || "600000",
        SQL_GUARD_AUTO_REPAIR: process.env.SQL_GUARD_AUTO_REPAIR || "false"
      },
      max_restarts: 5,
      exp_backoff_restart_delay: 5000,
      watch: false,
      instances: 1,
      exec_mode: "fork"
    },
    
    {
      name: "ibkr-daily-restart",
      script: "./node_modules/.bin/pm2",
      args: "restart api",
      cron_restart: process.env.DAILY_RESTART_CRON || "0 5 * * *",
      autorestart: false,
      watch: false
    },
    
    {
      name: "ai-feed-watchdog",
      script: "node",
      args: ["-e", "setInterval(() => { const http = require('http'); http.get('http://localhost:3000/api/ai/symbols', (res) => { if (res.statusCode === 200) console.log('[WATCHDOG] AI feed healthy'); else console.warn('[WATCHDOG] AI feed issue:', res.statusCode); }).on('error', (e) => console.error('[WATCHDOG] AI feed error:', e.message)); }, 30000);"],
      env: {
        NODE_ENV: "production"
      },
      max_restarts: 5,
      exp_backoff_restart_delay: 10000,
      watch: false,
      instances: 1,
      exec_mode: "fork"
    },
    
    {
      name: 'rocket-trading-api',
      script: 'server/index.js',
      cwd: '.',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    
    // Pack de Stabilisation v2 - Evolution Engine
    {
      name: 'evolution-engine',
      script: 'server/workers/evolution.engine.js',
      cwd: '.',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      restart_delay: 5000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
        EVO_LOOP_MS: 30000,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY
      }
    },
    
    // Pack de Stabilisation v2 - Ops Supervisor
    {
      name: 'ops-supervisor',
      script: 'server/workers/opsSupervisor.js',
      cwd: '.',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      restart_delay: 5000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
        OPSSUP_LOOP_MS: 20000,
        OPSSUP_STALL_MS: 60000,
        SELF_URL: process.env.SELF_URL || 'http://localhost:3000',
        SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY
      }
    },
    
    // Pack de Stabilisation v1 - AI Orchestrator Supervisor
    {
      name: 'ai-orchestrator-supervisor',
      script: 'server/workers/ai_orchestrator_reconnect.js',
      cwd: '.',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      restart_delay: 5000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
        SUPERVISOR_LOOP_MS: 15000,
        SUPERVISOR_STALL_MS: 45000,
        SELF_URL: 'http://localhost:3000'
      }
    }
  ]
};