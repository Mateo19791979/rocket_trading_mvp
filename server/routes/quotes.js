const express = require("express");
const LRU = require("lru-cache");
const router = express?.Router();

// Micro-cache configuration (2 second TTL)
const cache = new LRU({ 
  max: 1000, 
  ttl: 2_000,  // 2 seconds
  updateAgeOnGet: false
});

// Circuit breaker state
let circuitOpen = false;
let failureCount = 0;
const FAILURE_THRESHOLD = 5;
const CIRCUIT_TIMEOUT = 10_000; // 10 seconds

// Reset circuit breaker after timeout
function resetCircuitBreaker() {
  circuitOpen = false;
  failureCount = 0;
  console.log("🔄 Circuit breaker reset");
}

// Your existing provider routing function (placeholder)
async function routeToBestProvider(queryParams) {
  // This should be your existing implementation that routes to providers
  // Return mock data for now - replace with your actual provider routing logic
  throw new Error("Provider routing not implemented");
}

// Enhanced /quotes endpoint with micro-cache and circuit breaker
router?.get("/", async (req, res) => {
  const cacheKey = req?.originalUrl;
  
  try {
    // Check cache first
    const cachedResult = cache?.get(cacheKey);
    if (cachedResult) {
      return res?.json({
        ...cachedResult,
        cached: true,
        timestamp: new Date()?.toISOString()
      });
    }
    
    // Check circuit breaker
    if (circuitOpen) {
      return res?.status(503)?.json({
        success: false,
        error: "circuit_open",
        message: "Service temporarily unavailable - circuit breaker open",
        retry_after: CIRCUIT_TIMEOUT / 1000,
        timestamp: new Date()?.toISOString()
      });
    }
    
    // Attempt to get data from providers
    const data = await routeToBestProvider(req?.query);
    
    // Success - cache result and reset failure count
    cache?.set(cacheKey, {
      success: true,
      data: data,
      provider: data?.source || "unknown"
    });
    
    failureCount = 0;
    
    res?.json({
      success: true,
      data: data,
      cached: false,
      timestamp: new Date()?.toISOString()
    });
    
  } catch (error) {
    console.error("❌ Quotes endpoint error:", error?.message);
    
    // Increment failure count
    failureCount++;
    
    // Open circuit breaker if threshold reached
    if (failureCount >= FAILURE_THRESHOLD && !circuitOpen) {
      circuitOpen = true;
      console.warn(`⚠️ Circuit breaker opened after ${failureCount} failures`);
      
      // Schedule circuit breaker reset
      setTimeout(resetCircuitBreaker, CIRCUIT_TIMEOUT);
    }
    
    res?.status(502)?.json({
      success: false,
      error: "provider_failure", 
      message: "Failed to fetch quotes from providers",
      failures: failureCount,
      circuit_open: circuitOpen,
      timestamp: new Date()?.toISOString()
    });
  }
});

// Health check endpoint
router?.get("/health", (req, res) => {
  res?.json({
    success: true,
    cache_stats: {
      size: cache?.size,
      max: cache?.max,
      ttl: cache?.ttl
    },
    circuit_breaker: {
      open: circuitOpen,
      failures: failureCount,
      threshold: FAILURE_THRESHOLD
    },
    timestamp: new Date()?.toISOString()
  });
});

module.exports = router;