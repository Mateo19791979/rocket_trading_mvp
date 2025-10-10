const cluster = require("cluster");
const os = require("os");

if (cluster?.isMaster) {
  const numWorkers = parseInt(process.env?.WS_WORKERS || String(Math.max(2, os?.cpus()?.length - 1)));
  
  console.log(`🚀 WebSocket Master starting ${numWorkers} workers...`);
  
  // Fork workers
  for (let i = 0; i < numWorkers; i++) {
    cluster?.fork();
  }
  
  // Replace dead workers
  cluster?.on("exit", (worker, code, signal) => {
    console.log(`⚠️ Worker ${worker?.process?.pid} died. Starting replacement...`);
    cluster?.fork();
  });
  
  console.log(`✅ WebSocket Cluster Master ready with ${numWorkers} workers`);
  
  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("🛑 Shutting down WebSocket cluster...");
    for (const id in cluster?.workers) {
      cluster?.workers?.[id]?.kill();
    }
    process.exit(0);
  });
  
} else {
  // Worker process - load your existing WebSocket server code
  console.log(`🔄 WebSocket Worker ${process.pid} starting...`);
  
  // Import your existing WebSocket worker implementation
  try {
    require("./worker");
    console.log(`✅ WebSocket Worker ${process.pid} ready`);
  } catch (error) {
    console.error(`❌ WebSocket Worker ${process.pid} failed:`, error?.message);
    process.exit(1);
  }
}