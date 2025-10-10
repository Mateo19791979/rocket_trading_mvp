import fs from 'fs/promises';

import yaml from 'js-yaml';
import Redis from 'ioredis';
import fetch from 'node-fetch';

class ProviderRouter {
  constructor(configPath = './providers.yaml') {
    this.configPath = configPath;
    this.providers = new Map();
    this.circuitBreakers = new Map();
    this.providerStats = new Map();
    this.cache = null;
    this.config = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Load configuration
      await this.loadConfig();
      
      // Initialize Redis cache if available
      await this.initializeCache();
      
      // Initialize providers and circuit breakers
      this.initializeProviders();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      this.initialized = true;
      console.log('✅ Provider Router initialized successfully');
    } catch (error) {
      console.error('❌ Provider Router initialization failed:', error?.message);
      throw error;
    }
  }

  async loadConfig() {
    try {
      const configFile = await fs?.readFile(this.configPath, 'utf8');
      const configContent = this.substituteEnvVariables(configFile);
      this.config = yaml?.load(configContent);
      
      console.log(`📋 Loaded ${this.config?.providers?.length} provider configurations`);
    } catch (error) {
      throw new Error(`Failed to load provider config: ${error?.message}`);
    }
  }

  substituteEnvVariables(content) {
    return content?.replace(/\${([^}]+)}/g, (match, envVar) => {
      return process.env?.[envVar] || match;
    });
  }

  async initializeCache() {
    try {
      if (process.env?.REDIS_URL) {
        this.cache = new Redis(process.env.REDIS_URL);
        console.log('✅ Redis cache initialized');
      } else {
        // Fallback to in-memory cache
        this.cache = new Map();
        console.log('⚠️ Using in-memory cache (Redis not available)');
      }
    } catch (error) {
      console.log('⚠️ Cache initialization failed, using in-memory fallback');
      this.cache = new Map();
    }
  }

  initializeProviders() {
    this.config?.providers?.forEach(providerConfig => {
      // Initialize provider stats
      this.providerStats?.set(providerConfig?.name, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgLatency: 0,
        lastRequestTime: null,
        isEnabled: providerConfig?.enabled,
        quotaRemaining: providerConfig?.rateLimit || 1000,
        quotaResetTime: Date.now() + (60 * 60 * 1000) // 1 hour
      });

      // Initialize circuit breaker
      this.circuitBreakers?.set(providerConfig?.name, {
        state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
        failureCount: 0,
        lastFailureTime: null,
        nextAttemptTime: null,
        successCount: 0
      });

      this.providers?.set(providerConfig?.name, providerConfig);
    });

    console.log(`🔧 Initialized ${this.providers?.size} providers with circuit breakers`);
  }

  startHealthMonitoring() {
    // Health check every 5 minutes
    setInterval(() => {
      this.performHealthChecks();
    }, 5 * 60 * 1000);

    // Circuit breaker cleanup every minute
    setInterval(() => {
      this.updateCircuitBreakers();
    }, 60 * 1000);

    console.log('🏥 Health monitoring started');
  }

  async performHealthChecks() {
    const promises = Array.from(this.providers?.values())?.filter(provider => provider?.enabled)?.map(provider => this.healthCheckProvider(provider));

    await Promise.allSettled(promises);
  }

  async healthCheckProvider(provider) {
    const startTime = Date.now();
    try {
      // Simple health check - try to fetch a known symbol
      const response = await this.makeRequest(provider, '/health', { timeout: 5000 });
      const latency = Date.now() - startTime;
      
      const stats = this.providerStats?.get(provider?.name);
      stats.avgLatency = (stats?.avgLatency + latency) / 2;
      stats.lastHealthCheck = Date.now();
      stats.healthStatus = 'healthy';
      
      console.log(`💚 ${provider?.name} health check: OK (${latency}ms)`);
    } catch (error) {
      const stats = this.providerStats?.get(provider?.name);
      stats.lastHealthCheck = Date.now();
      stats.healthStatus = 'unhealthy';
      stats.lastError = error?.message;
      
      console.log(`💔 ${provider?.name} health check failed: ${error?.message}`);
    }
  }

  updateCircuitBreakers() {
    this.circuitBreakers?.forEach((breaker, providerName) => {
      const stats = this.providerStats?.get(providerName);
      const provider = this.providers?.get(providerName);
      
      if (!provider || !stats) return;

      const totalRequests = stats?.totalRequests;
      const errorRate = totalRequests > 0 ? (stats?.failedRequests / totalRequests) * 100 : 0;
      const errorThreshold = this.config?.circuitBreaker?.errorThresholdPercentage || 30;

      // Open circuit if error rate exceeds threshold
      if (breaker?.state === 'CLOSED' && errorRate > errorThreshold && totalRequests >= (this.config?.circuitBreaker?.requestVolumeThreshold || 20)) {
        breaker.state = 'OPEN';
        breaker.nextAttemptTime = Date.now() + (this.config?.circuitBreaker?.openStateTimeoutSeconds || 60) * 1000;
        console.log(`🚨 Circuit breaker OPENED for ${providerName} (error rate: ${errorRate?.toFixed(1)}%)`);
      }

      // Transition to half-open when timeout expires
      if (breaker?.state === 'OPEN' && Date.now() > breaker?.nextAttemptTime) {
        breaker.state = 'HALF_OPEN';
        breaker.successCount = 0;
        console.log(`🔄 Circuit breaker HALF_OPEN for ${providerName}`);
      }

      // Close circuit after successful requests in half-open state
      if (breaker?.state === 'HALF_OPEN' && breaker?.successCount >= 3) {
        breaker.state = 'CLOSED';
        breaker.failureCount = 0;
        console.log(`✅ Circuit breaker CLOSED for ${providerName}`);
      }
    });
  }

  chooseProvider(asset = 'equity', market = 'US', excludeProviders = []) {
    const candidates = Array.from(this.providers?.values())?.filter(provider => {
        // Basic filters
        if (!provider?.enabled) return false;
        if (excludeProviders?.includes(provider?.name)) return false;
        if (!provider?.kind?.includes(asset)) return false;
        if (!provider?.markets?.includes(market) && !provider?.markets?.includes('Global')) return false;
        
        // Circuit breaker filter
        const breaker = this.circuitBreakers?.get(provider?.name);
        if (breaker?.state === 'OPEN') return false;
        
        // Quota filter
        const stats = this.providerStats?.get(provider?.name);
        if (stats?.quotaRemaining <= 0) return false;
        
        return true;
      })?.sort((a, b) => {
        const statsA = this.providerStats?.get(a?.name);
        const statsB = this.providerStats?.get(b?.name);
        
        // Sort by: priority DESC, error rate ASC, latency ASC
        if (a?.priority !== b?.priority) return b?.priority - a?.priority;
        
        const errorRateA = statsA?.totalRequests > 0 ? (statsA?.failedRequests / statsA?.totalRequests) : 0;
        const errorRateB = statsB?.totalRequests > 0 ? (statsB?.failedRequests / statsB?.totalRequests) : 0;
        
        if (errorRateA !== errorRateB) return errorRateA - errorRateB;
        
        return (statsA?.avgLatency || 999999) - (statsB?.avgLatency || 999999);
      });

    return candidates?.[0] || null;
  }

  async makeRequest(provider, endpoint, options = {}) {
    const url = `${provider?.baseUrl}${endpoint}`;
    const timeout = options?.timeout || provider?.timeout || 2000;
    
    const requestOptions = {
      method: options?.method || 'GET',
      headers: {
        'Authorization': `Bearer ${provider?.key}`,
        'Content-Type': 'application/json',
        ...options?.headers
      },
      timeout,
      signal: AbortSignal.timeout(timeout)
    };

    if (options?.body) {
      requestOptions.body = JSON.stringify(options?.body);
    }

    const response = await fetch(url, requestOptions);
    
    if (!response?.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response?.json();
  }

  async requestWithFallback(endpoint, options = {}) {
    const { asset = 'equity', market = 'US', ...requestOptions } = options;
    const maxRetries = 3;
    let attempt = 0;
    const excludedProviders = [];

    while (attempt < maxRetries) {
      attempt++;
      
      const provider = this.chooseProvider(asset, market, excludedProviders);
      if (!provider) {
        throw new Error('No available providers for request');
      }

      const startTime = Date.now();
      const stats = this.providerStats?.get(provider?.name);
      const breaker = this.circuitBreakers?.get(provider?.name);

      try {
        // Update stats
        stats.totalRequests++;
        stats.lastRequestTime = Date.now();
        
        // Check cache first
        const cacheKey = `${provider?.name}:${endpoint}:${JSON.stringify(requestOptions)}`;
        const cached = await this.getCached(cacheKey);
        if (cached) {
          return {
            data: cached,
            provider_used: provider?.name,
            source: 'cache',
            latency_ms: Date.now() - startTime
          };
        }

        // Make actual request
        const data = await this.makeRequest(provider, endpoint, requestOptions);
        
        // Update success stats
        stats.successfulRequests++;
        stats.avgLatency = (stats?.avgLatency + (Date.now() - startTime)) / 2;
        
        if (breaker?.state === 'HALF_OPEN') {
          breaker.successCount++;
        }
        
        // Cache the result
        await this.setCached(cacheKey, data);
        
        // Update quota
        stats.quotaRemaining = Math.max(0, stats?.quotaRemaining - 1);
        
        console.log(`✅ Request successful via ${provider?.name} (${Date.now() - startTime}ms)`);
        
        return {
          data,
          provider_used: provider?.name,
          source: 'api',
          latency_ms: Date.now() - startTime,
          quota_remaining: stats?.quotaRemaining
        };

      } catch (error) {
        // Update failure stats
        stats.failedRequests++;
        breaker.failureCount++;
        breaker.lastFailureTime = Date.now();
        
        console.log(`❌ Request failed via ${provider?.name}: ${error?.message}`);
        
        // Add to excluded list for retry
        excludedProviders?.push(provider?.name);
        
        // If this is the last attempt, throw the error
        if (attempt >= maxRetries) {
          throw new Error(`All providers failed. Last error: ${error?.message}`);
        }
        
        // Continue to next provider
        continue;
      }
    }
  }

  async getCached(key) {
    try {
      if (this.cache instanceof Map) {
        const entry = this.cache?.get(key);
        if (entry && entry?.expires > Date.now()) {
          return entry?.data;
        }
        this.cache?.delete(key);
        return null;
      } else {
        const cached = await this.cache?.get(key);
        return cached ? JSON.parse(cached) : null;
      }
    } catch (error) {
      console.log('Cache get error:', error?.message);
      return null;
    }
  }

  async setCached(key, data) {
    try {
      const ttl = this.config?.cache?.defaultTTLSeconds || 10;
      
      if (this.cache instanceof Map) {
        this.cache?.set(key, {
          data,
          expires: Date.now() + (ttl * 1000)
        });
        
        // Simple cleanup for in-memory cache
        if (this.cache?.size > (this.config?.cache?.maxEntries || 10000)) {
          const firstKey = this.cache?.keys()?.next()?.value;
          this.cache?.delete(firstKey);
        }
      } else {
        await this.cache?.setex(key, ttl, JSON.stringify(data));
      }
    } catch (error) {
      console.log('Cache set error:', error?.message);
    }
  }

  getHealthStatus() {
    const providers = Array.from(this.providers?.entries())?.map(([name, config]) => {
      const stats = this.providerStats?.get(name);
      const breaker = this.circuitBreakers?.get(name);
      
      return {
        name,
        enabled: config?.enabled,
        priority: config?.priority,
        markets: config?.markets,
        circuit_breaker_state: breaker?.state || 'UNKNOWN',
        total_requests: stats?.totalRequests || 0,
        success_rate: stats?.totalRequests > 0 ? 
          ((stats?.successfulRequests / stats?.totalRequests) * 100)?.toFixed(1) : 0,
        avg_latency_ms: Math.round(stats?.avgLatency || 0),
        quota_remaining: stats?.quotaRemaining || 0,
        last_request: stats?.lastRequestTime ? new Date(stats.lastRequestTime)?.toISOString() : null,
        health_status: stats?.healthStatus || 'unknown'
      };
    });

    return {
      overall_status: providers?.filter(p => p?.enabled && p?.circuit_breaker_state === 'CLOSED')?.length > 0 ? 'operational' : 'degraded',
      providers,
      timestamp: new Date()?.toISOString()
    };
  }

  getConfiguration() {
    return {
      providers: Array.from(this.providers?.values())?.map(p => ({
        name: p?.name,
        enabled: p?.enabled,
        priority: p?.priority,
        markets: p?.markets,
        features: p?.features
      })),
      circuit_breaker: this.config?.circuitBreaker,
      cache: this.config?.cache,
      timestamp: new Date()?.toISOString()
    };
  }
}

export default ProviderRouter;