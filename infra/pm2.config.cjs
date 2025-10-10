module.exports = {
  apps: [
    {
      name: "backend-api",
      script: "server/index.js",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production", PORT: process.env.PORT || 3000 }
    },
    {
      name: "market-data-processor",
      script: "server/workers/marketData.js",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production" }
    }
  ]
}