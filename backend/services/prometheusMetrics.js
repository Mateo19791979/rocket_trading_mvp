const client = require('prom-client');

// ================== PROMETHEUS METRICS FOR GRAFANA DASHBOARD ==================

// 1. HTTP Request Duration Histogram (for p95/p99 latency)
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in milliseconds',
  labelNames: ['method', 'route', 'status_code', 'path'],
  buckets: [1, 5, 15, 50, 100, 200, 300, 400, 500, 750, 1000, 1500, 2000, 3000, 5000]
});

// 2. HTTP Requests Total Counter (for error rate calculation)
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'code']
});

// 3. WebSocket Active Connections Gauge
const wsActiveConnections = new client.Gauge({
  name: 'ws_active_connections',
  help: 'Number of active WebSocket connections',
});

// 4. WebSocket Messages Total Counter
const wsMessagesTotal = new client.Counter({
  name: 'ws_messages_total',
  help: 'Total number of WebSocket messages processed',
  labelNames: ['type', 'direction']
});

// 5. Knowledge Base Search Duration Histogram (RAG p95)
const kbSearchDuration = new client.Histogram({
  name: 'kb_search_duration_ms',
  help: 'Duration of knowledge base search operations in milliseconds',
  labelNames: ['search_type', 'status'],
  buckets: [50, 100, 200, 400, 700, 1000, 1500, 2500, 5000, 10000]
});

// 6. System Resource Metrics
const cpuUsage = new client.Gauge({
  name: 'system_cpu_usage_percent',
  help: 'CPU usage percentage',
});

const memoryUsage = new client.Gauge({
  name: 'system_memory_usage_percent', 
  help: 'Memory usage percentage',
});

// ================== MIDDLEWARE FOR EXPRESS.JS ==================

/**
 * Express middleware to collect HTTP metrics
 * Usage: app.use(collectHttpMetrics);
 */
function collectHttpMetrics(req, res, next) {
  const start = Date.now();
  
  res?.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res?.statusCode;
    const path = req?.route?.path || req?.path;
    
    // Record request duration
    httpRequestDuration?.labels(req?.method, path, statusCode, path)?.observe(duration);
    
    // Record request count
    httpRequestsTotal?.labels(req?.method, path, statusCode, String(statusCode))?.inc();
  });
  
  next();
}

// ================== WEBSOCKET METRICS HELPERS ==================

/**
 * Call when a new WebSocket connection is established
 */
function incrementWebSocketConnections() {
  wsActiveConnections?.inc();
}

/**
 * Call when a WebSocket connection is closed
 */
function decrementWebSocketConnections() {
  wsActiveConnections?.dec();
}

/**
 * Call when processing WebSocket messages
 * @param {string} type - Type of message (quote, order, etc.)
 * @param {string} direction - 'inbound' or 'outbound'
 */
function recordWebSocketMessage(type = 'message', direction = 'inbound') {
  wsMessagesTotal?.labels(type, direction)?.inc();
}

// ================== KNOWLEDGE BASE METRICS HELPERS ==================

/**
 * Time a knowledge base search operation
 * @param {string} searchType - Type of search (vector, text, hybrid)
 * @returns {Function} endTimer function
 */
function timeKnowledgeBaseSearch(searchType = 'vector') {
  return kbSearchDuration?.labels(searchType, 'success')?.startTimer();
}

/**
 * Record a failed knowledge base search
 * @param {string} searchType - Type of search
 * @param {number} duration - Duration in ms
 */
function recordFailedKBSearch(searchType = 'vector', duration) {
  kbSearchDuration?.labels(searchType, 'error')?.observe(duration);
}

// ================== SYSTEM METRICS HELPERS ==================

/**
 * Update system resource metrics
 * Call this periodically (e.g., every 30 seconds)
 */
function updateSystemMetrics() {
  // CPU Usage (requires additional monitoring setup)
  const usage = process.cpuUsage();
  const totalUsage = (usage?.user + usage?.system) / 1000000; // Convert to seconds
  cpuUsage?.set(Math.min(totalUsage * 100, 100)); // Rough percentage
  
  // Memory Usage
  const memStats = process.memoryUsage();
  const memoryUsagePercent = (memStats?.heapUsed / memStats?.heapTotal) * 100;
  memoryUsage?.set(memoryUsagePercent);
}

// Auto-update system metrics every 30 seconds
setInterval(updateSystemMetrics, 30000);

// ================== EXPORTS ==================

module.exports = {
  // Metrics objects
  httpRequestDuration,
  httpRequestsTotal,
  wsActiveConnections,
  wsMessagesTotal,
  kbSearchDuration,
  cpuUsage,
  memoryUsage,
  
  // Middleware & helpers
  collectHttpMetrics,
  incrementWebSocketConnections,
  decrementWebSocketConnections,
  recordWebSocketMessage,
  timeKnowledgeBaseSearch,
  recordFailedKBSearch,
  updateSystemMetrics,
  
  // Prometheus registry
  register: client?.register
};