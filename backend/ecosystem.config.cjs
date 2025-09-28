module.exports = {
  apps: [
    {
      name: "trading-mvp-api",
      script: "server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 8080
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8080
      },
      // Logging
      log_file: "./logs/combined.log",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      
      // Process management
      max_memory_restart: "500M",
      min_uptime: "10s",
      max_restarts: 5,
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Auto restart on file changes (disable in production)
      watch: false,
      ignore_watch: ["node_modules", "logs"],
      
      // Advanced options
      kill_timeout: 3000,
      restart_delay: 1000
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