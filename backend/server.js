import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import fs from "fs";
import os from "os";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = process.env?.PORT || 8080;

// ---- Enhanced Configuration Loading ----
let env = {};
try {
  // Try loading from config/env.json first
  env = JSON.parse(fs?.readFileSync(new URL("./config/env.json", import.meta.url)));
  console.log("✅ Loaded configuration from config/env.json");
} catch (e) {
  console.warn("⚠️ config/env.json not found, using environment variables");
  env.SUPABASE_URL = process.env?.SUPABASE_URL;
  env.SUPABASE_KEY = process.env?.SUPABASE_KEY;
  env.SUPABASE_ANON_KEY = process.env?.SUPABASE_ANON_KEY; // Alternative naming
  env.CORS_ORIGIN = process.env?.CORS_ORIGIN || "*";
  env.NODE_ENV = process.env?.NODE_ENV || "production";
}

// Use SUPABASE_KEY or SUPABASE_ANON_KEY (flexible naming)
const supabaseKey = env.SUPABASE_KEY || env.SUPABASE_ANON_KEY;

if (!env?.SUPABASE_URL || !supabaseKey) {
  console.error("❌ Missing Supabase credentials:");
  console.error(`   SUPABASE_URL: ${env?.SUPABASE_URL ? "✅" : "❌"}`);
  console.error(`   SUPABASE_KEY: ${supabaseKey ? "✅" : "❌"}`);
  console.error("   Please check your config/env.json or environment variables");
  process.exit(1);
}

const supabase = createClient(env.SUPABASE_URL, supabaseKey);

console.log("🚀 Starting Enhanced Trading MVP Backend...");
console.log(`🌐 CORS Origin: ${env.CORS_ORIGIN}`);
console.log(`🗄️  Supabase URL: ${env.SUPABASE_URL}`);
console.log(`📊 Environment: ${env.NODE_ENV}`);

// ---- Enhanced Security & Middleware ----
app?.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false,
  hsts: env.NODE_ENV === "production" ? { maxAge: 31536000 } : false
}));

// Enhanced CORS configuration
app?.use(cors({ 
  origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN?.split(',')?.map(o => o?.trim()),
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));

// Enhanced rate limiting with tiered approach
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Generous for general API usage
  message: { error: 'too_many_requests', retry_after: 900 },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req?.ip}`);
    res?.status(429)?.json({ 
      error: 'too_many_requests', 
      message: 'Rate limit exceeded, please try again later',
      retry_after: 900
    });
  }
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute  
  max: 30, // More restrictive for sensitive endpoints
  message: { error: 'rate_limit_strict', retry_after: 60 }
});

app?.use(generalLimiter);

// Enhanced request logging
app?.use(morgan('combined', {
  skip: (req, res) => res?.statusCode < 400 && env.NODE_ENV !== 'development'
}));

// Body parsing with size limits
app?.use(express?.json({ limit: '5mb' }));
app?.use(express?.urlencoded({ extended: true, limit: '5mb' }));

// Request ID middleware for debugging
app?.use((req, res, next) => {
  req.requestId = Math.random()?.toString(36)?.substring(7);
  res?.setHeader('X-Request-ID', req?.requestId);
  next();
});

// ---- Health Check & System Status ----
app?.get("/status", async (_req, res) => {
  const startTime = Date.now();
  const systemInfo = {
    service: "Trading MVP Backend API",
    version: "2.1.0",
    status: "operational",
    timestamp: new Date()?.toISOString(),
    uptime: process.uptime(),
    hostname: os?.hostname(),
    environment: env.NODE_ENV,
    memory_usage: process.memoryUsage(),
    latency_ms: 0 // Will be calculated below
  };

  try {
    // Test Supabase connection
    const { data, error } = await supabase?.from("strategies")?.select("id")?.limit(1);

    systemInfo.latency_ms = Date.now() - startTime;
    systemInfo.database = {
      status: error ? "error" : "connected",
      latency_ms: systemInfo?.latency_ms,
      error: error?.message || null
    };

    // System health score
    const healthScore = error ? 75 : 100;
    systemInfo.health_score = healthScore;

    res?.status(error ? 503 : 200)?.json(systemInfo);
  } catch (e) {
    systemInfo.latency_ms = Date.now() - startTime;
    systemInfo.database = { status: "error", error: e?.message };
    systemInfo.health_score = 50;
    res?.status(503)?.json(systemInfo);
  }
});

// ---- Enhanced API Endpoints ----

// Scores endpoint with flexible parameters
app?.get("/scores", async (req, res) => {
  try {
    const { window = 252, strategy_id, date_from, date_to } = req?.query;
    const limit = Math.min(Math.max(1, parseInt(window, 10)), 1000); // Cap at 1000

    let query = supabase?.from("scores")?.select("*")?.order("date", { ascending: false })?.limit(limit);

    if (strategy_id) {
      query = query?.eq("strategy_id", strategy_id);
    }

    if (date_from) {
      query = query?.gte("date", date_from);
    }

    if (date_to) {
      query = query?.lte("date", date_to);
    }

    const { data, error } = await query;
    if (error) throw error;

    res?.json({
      success: true,
      window: limit,
      count: data?.length || 0,
      scores: data || [],
      filters: { strategy_id, date_from, date_to },
      timestamp: new Date()?.toISOString()
    });
  } catch (error) {
    console.error("❌ Scores endpoint error:", error);
    res?.status(500)?.json({
      success: false,
      error: "database_error",
      message: error?.message,
      timestamp: new Date()?.toISOString()
    });
  }
});

// Selected strategy endpoint
app?.get("/select", async (_req, res) => {
  try {
    const { data, error } = await supabase?.from("strategies")?.select("*")?.eq("selected", true)?.limit(1)?.maybeSingle(); // Use maybeSingle to handle no results gracefully

    if (error) throw error;

    res?.json({
      success: true,
      selected: data || null,
      timestamp: new Date()?.toISOString()
    });
  } catch (error) {
    console.error("❌ Selected strategy error:", error);
    res?.status(500)?.json({
      success: false,
      error: "database_error",
      message: error?.message,
      timestamp: new Date()?.toISOString()
    });
  }
});

// Strategies endpoint with enhanced filtering
app?.get("/api/strategies", strictLimiter, async (req, res) => {
  try {
    const { limit = 50, active_only = "true", include_scores = "false" } = req?.query;
    const maxLimit = Math.min(parseInt(limit, 10), 100);

    let selectQuery = "id, name, description, selected, is_active, created_at, updated_at";
    if (include_scores === "true") {
      selectQuery += ", scores(date, value, metadata)";
    }

    let query = supabase?.from("strategies")?.select(selectQuery)?.limit(maxLimit);

    if (active_only === "true") {
      query = query?.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) throw error;

    res?.json({
      success: true,
      count: data?.length || 0,
      strategies: data || [],
      pagination: { limit: maxLimit },
      timestamp: new Date()?.toISOString()
    });
  } catch (error) {
    console.error("❌ Strategies endpoint error:", error);
    res?.status(500)?.json({
      success: false,
      error: "database_error",
      message: error?.message,
      timestamp: new Date()?.toISOString()
    });
  }
});

// Root endpoint with comprehensive API documentation
app?.get("/", async (_req, res) => {
  const systemStatus = {
    service: "Enhanced Trading MVP Backend",
    version: "2.1.0",
    status: "operational",
    timestamp: new Date()?.toISOString(),
    features: [
      "Real-time market data processing",
      "Strategy scoring and selection",
      "Enhanced security with rate limiting",
      "Comprehensive error handling",
      "Flexible API endpoints"
    ],
    endpoints: {
      health: {
        path: "/status",
        method: "GET",
        description: "System health and performance metrics"
      },
      scores: {
        path: "/scores",
        method: "GET", 
        description: "Trading scores with flexible filtering",
        parameters: "?window=252&strategy_id=1&date_from=2024-01-01&date_to=2024-12-31"
      },
      selected: {
        path: "/select",
        method: "GET",
        description: "Currently selected trading strategy"
      },
      strategies: {
        path: "/api/strategies",
        method: "GET",
        description: "List all strategies with optional score inclusion",
        parameters: "?limit=50&active_only=true&include_scores=false"
      }
    },
    rate_limits: {
      general: "1000 requests per 15 minutes",
      strict: "30 requests per minute (sensitive endpoints)"
    }
  };

  // Test database connectivity for status
  try {
    const { error } = await supabase?.from("strategies")?.select("count")?.limit(1);
    systemStatus.database_status = error ? "degraded" : "connected";
  } catch (e) {
    systemStatus.database_status = "error";
  }

  res?.json(systemStatus);
});

// Enhanced 404 handler
app?.use("*", (req, res) => {
  res?.status(404)?.json({
    success: false,
    error: "endpoint_not_found",
    message: `Endpoint ${req?.method} ${req?.originalUrl} not found`,
    available_endpoints: ["/", "/status", "/scores", "/select", "/api/strategies"],
    timestamp: new Date()?.toISOString(),
    request_id: req?.requestId
  });
});

// Enhanced global error handler
app?.use((error, req, res, next) => {
  console.error(`❌ [${req?.requestId}] Unhandled error:`, error);
  
  res?.status(500)?.json({
    success: false,
    error: "internal_server_error",
    message: env.NODE_ENV === "development" ? error?.message : "Internal server error",
    request_id: req?.requestId,
    timestamp: new Date()?.toISOString()
  });
});

// ---- Server Startup & Graceful Shutdown ----
const server = app?.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 Enhanced Trading MVP Backend running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Process ID: ${process.pid}`);
  console.log(`💾 Memory Usage: ${Math.round(process.memoryUsage()?.heapUsed / 1024 / 1024)} MB`);
  
  // Test database connection on startup
  try {
    const { error } = await supabase?.from("strategies")?.select("count")?.limit(1);
    console.log(`🗄️  Database: ${error ? "❌ Connection failed" : "✅ Connected"}`);
    if (error) console.error(`   Error: ${error?.message}`);
  } catch (e) {
    console.error("🗄️  Database: ❌ Connection error:", e?.message);
  }

  console.log("✅ Backend API ready for connections!");
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  
  server?.close(() => {
    console.log("✅ HTTP server closed");
    console.log("👋 Backend shutdown complete");
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("⚠️  Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Promise Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

export default app;