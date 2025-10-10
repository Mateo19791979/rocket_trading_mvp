module.exports = {
  apps: [
    {
      name: 'market-data-processor',
      script: 'services/MarketDataProcessor.js',
      env: { 
        NODE_ENV: 'production',
        IB_GATEWAY_HOST: '127.0.0.1',
        IB_GATEWAY_PORT: '4002',
        IB_CLIENT_ID: '77',
        IB_IS_PAPER: 'true',
        SUBSCRIBE_SYMBOLS: 'AAPL,MSFT,SPY,EUR.USD,ESZ5',
        QUOTES_WS_PORT: '8083'
      },
      max_restarts: 10,
      exp_backoff_restart_delay: 5000,
      watch: false,
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: "node",
      host: "your-server.com", 
      ref: "origin/main",
      repo: "git@github.com:your-repo/trading-mvp.git",
      path: "/var/www/trading-mvp",
      "post-deploy": "npm install --omit=dev && pm2 reload ecosystem.config.cjs --env production"
    }
  }
};