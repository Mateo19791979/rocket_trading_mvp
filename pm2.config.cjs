module.exports = {
  apps: [
    {
      name: 'rocket-trading-mvp-api',
      script: 'server/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: 'logs/api-error.log',
      out_file: 'logs/api-out.log',
      log_file: 'logs/api-combined.log'
    },
    {
      name: 'supv-reconnect',
      script: 'server/workers/ai_orchestrator_reconnect.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        SUPERVISOR_LOOP_MS: 15000,
        SUPERVISOR_STALL_MS: 45000
      },
      error_file: 'logs/supervisor-error.log',
      out_file: 'logs/supervisor-out.log',
      log_file: 'logs/supervisor-combined.log'
    }
  ]
};