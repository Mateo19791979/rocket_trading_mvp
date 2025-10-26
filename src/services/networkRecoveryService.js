// Network Recovery Service - Fixed to prevent "forceNetworkCheck is not a function"
import { checkOnline, runNetworkDiagnostics } from '@/lib/online.js';
import { resolveApiBase } from '@/lib/apiBase.js';
import { isEquitiesMarketClosed } from '@/lib/market/utils';

class NetworkRecoveryService {
  constructor() {
    this.connectionState = {
      isOnline: navigator?.onLine || false,
      consecutiveFailures: 0,
      lastSuccessfulConnection: null,
      lastFailedConnection: null,
      uptime: Date.now(),
      recoveryAttempts: 0,
      maxRecoveryAttempts: 5 // Limit to prevent infinite recovery loops
    };
    
    this.listeners = new Map();
    this.recoveryInProgress = false;
    this.healthCheckInterval = null;
    this.lastErrorCode = null; // Track last error type
    
    // Initialize network event listeners
    this.initializeEventListeners();
    
    // Start periodic health checks with reasonable interval
    this.startHealthChecks(45000); // Every 45 seconds instead of 30
  }

  initializeEventListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleBrowserOnline?.bind(this));
      window.addEventListener('offline', this.handleBrowserOffline?.bind(this));
      
      // Listen for visibility changes to resume health checks
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !this.healthCheckInterval) {
          this.startHealthChecks();
        }
      });
    }
  }

  handleBrowserOnline() {
    console.log('🟢 Browser online event detected');
    this.connectionState.isOnline = true;
    this.connectionState.consecutiveFailures = 0;
    this.emitEvent('network:browser-online', { timestamp: Date.now() });
    this.attemptRecovery();
  }

  handleBrowserOffline() {
    console.warn('🔴 Browser offline event detected');
    this.connectionState.isOnline = false;
    this.connectionState.consecutiveFailures++;
    this.connectionState.lastFailedConnection = Date.now();
    this.emitEvent('network:browser-offline', { 
      consecutiveFailures: this.connectionState?.consecutiveFailures,
      timestamp: Date.now()
    });
  }

  startHealthChecks(intervalMs = 45000) {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(async () => {
      if (!this.recoveryInProgress) {
        await this.performHealthCheck();
      }
    }, intervalMs);
    
    // Perform initial health check after a short delay
    setTimeout(() => this.performHealthCheck(), 2000);
  }

  async performHealthCheck() {
    try {
      const result = await checkOnline(5000); // Increased timeout
      
      if (result?.online) {
        this.handleSuccessfulConnection();
      } else {
        this.handleFailedConnection(result?.error);
      }
      
      return result;
    } catch (error) {
      this.handleFailedConnection(error?.message);
      return { online: false, error: error?.message };
    }
  }

  handleSuccessfulConnection() {
    const wasOffline = this.connectionState?.consecutiveFailures > 0;
    
    this.connectionState.isOnline = true;
    this.connectionState.consecutiveFailures = 0;
    this.connectionState.recoveryAttempts = 0; // Reset recovery attempts on success
    this.connectionState.lastSuccessfulConnection = Date.now();
    this.recoveryInProgress = false;
    this.lastErrorCode = null; // Clear error code on success
    
    if (wasOffline) {
      console.log('🎉 Network recovered successfully');
      this.emitEvent('network:recovered', {
        timestamp: Date.now(),
        uptime: Date.now() - this.connectionState?.uptime
      });
    }
  }

  handleFailedConnection(error) {
    this.connectionState.isOnline = false;
    this.connectionState.consecutiveFailures++;
    this.connectionState.lastFailedConnection = Date.now();
    
    if (this.connectionState?.consecutiveFailures === 1) {
      // First failure - emit offline event
      this.emitEvent('network:offline', {
        error,
        timestamp: Date.now()
      });
    }
    
    // Only attempt recovery if we haven't exceeded max attempts
    if (this.connectionState?.consecutiveFailures >= 3 && 
        this.connectionState?.recoveryAttempts < this.connectionState?.maxRecoveryAttempts &&
        !this.recoveryInProgress) {
      this.attemptRecovery();
    } else if (this.connectionState?.recoveryAttempts >= this.connectionState?.maxRecoveryAttempts) {
      console.warn('🚫 Max recovery attempts reached - stopping automatic recovery');
      this.emitEvent('network:max-attempts-reached', {
        attempts: this.connectionState?.recoveryAttempts,
        timestamp: Date.now()
      });
    }
  }

  async attemptRecovery() {
    if (this.recoveryInProgress || 
        this.connectionState?.recoveryAttempts >= this.connectionState?.maxRecoveryAttempts) {
      return;
    }
    
    this.recoveryInProgress = true;
    this.connectionState.recoveryAttempts++;
    
    console.log(`🔄 Attempting network recovery (attempt ${this.connectionState?.recoveryAttempts}/${this.connectionState?.maxRecoveryAttempts})`);
    
    try {
      // Try multiple recovery strategies with progressive timeouts
      const strategies = [
        { name: 'basic', fn: () => this.basicConnectivityTest(), timeout: 5000 },
        { name: 'api', fn: () => this.apiHealthTest(), timeout: 8000 },
        { name: 'fallback', fn: () => this.fallbackConnectivityTest(), timeout: 10000 }
      ];
      
      for (const strategy of strategies) {
        try {
          const result = await Promise.race([
            strategy?.fn(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`${strategy.name} timeout`)), strategy.timeout)
            )
          ]);
          
          if (result?.success) {
            console.log(`✅ Recovery successful using ${strategy?.name} strategy`);
            this.handleSuccessfulConnection();
            return;
          }
        } catch (strategyError) {
          console.warn(`❌ ${strategy?.name} recovery strategy failed:`, strategyError?.message);
        }
        
        // Wait between strategies
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // All strategies failed
      console.warn(`❌ All recovery strategies failed (attempt ${this.connectionState?.recoveryAttempts})`);
      this.emitEvent('network:recovery-failed', {
        attempts: this.connectionState?.recoveryAttempts,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Recovery attempt failed:', error);
      this.emitEvent('network:recovery-failed', {
        error: error?.message,
        timestamp: Date.now()
      });
    } finally {
      this.recoveryInProgress = false;
    }
  }

  async basicConnectivityTest() {
    try {
      const controller = new AbortController();
      setTimeout(() => controller?.abort(), 5000);
      
      const result = await fetch('https://httpbin.org/get', {
        method: 'GET',
        cache: 'no-cache',
        signal: controller?.signal
      });
      
      return { success: result?.ok, method: 'basic', status: result?.status };
    } catch (error) {
      return { success: false, method: 'basic', error: error?.message };
    }
  }

  async apiHealthTest() {
    try {
      const baseUrl = resolveApiBase();
      const controller = new AbortController();
      setTimeout(() => controller?.abort(), 8000);
      
      const result = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        cache: 'no-cache',
        signal: controller?.signal
      });
      
      return { success: result?.ok, method: 'api', status: result?.status };
    } catch (error) {
      return { success: false, method: 'api', error: error?.message };
    }
  }

  async fallbackConnectivityTest() {
    try {
      const controller = new AbortController();
      setTimeout(() => controller?.abort(), 10000);
      
      // Try Google DNS as ultimate fallback
      const result = await fetch('https://dns.google/resolve?name=example.com&type=A', {
        method: 'GET',
        cache: 'no-cache',
        signal: controller?.signal
      });
      
      return { success: result?.ok, method: 'fallback', status: result?.status };
    } catch (error) {
      return { success: false, method: 'fallback', error: error?.message };
    }
  }

  // PUBLIC: Force recovery method for user-initiated recovery
  async forceRecovery() {
    console.log('🚀 Force recovery initiated by user');
    this.connectionState.recoveryAttempts = 0; // Reset attempts for user-initiated recovery
    await this.attemptRecovery();
  }

  // PUBLIC: Force network check method (fixes the "is not a function" error)
  async forceNetworkCheck() {
    try {
      const result = await this.performHealthCheck();
      return {
        isOnline: result?.online || false,
        timestamp: Date.now(),
        source: 'force_check',
        details: result
      };
    } catch (error) {
      return {
        isOnline: false,
        timestamp: Date.now(),
        source: 'force_check',
        error: error?.message
      };
    }
  }

  // ENHANCED: Weekend-aware network recovery
  async recoverNetwork() {
    // If last error was MARKET_CLOSED => no aggressive "max attempts"
    if (this.lastErrorCode === 'MARKET_CLOSED') {
      console.info('[NRS] Weekend gate active — suspend reconnect loops');
      return;
    }

    const ok = await this.pingHealth();
    
    if (!ok) {
      // Classic backoff (exponential), but no more than N attempts
      await this.attemptRecovery();
    }
  }

  async pingHealth() {
    try {
      const baseUrl = resolveApiBase();
      const controller = new AbortController();
      setTimeout(() => controller?.abort(), 8000);
      
      const result = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        cache: 'no-cache',
        signal: controller?.signal
      });
      
      return result?.ok;
    } catch (error) {
      return false;
    }
  }

  // Method to set last error code (used by market services)
  setLastErrorCode(code) {
    this.lastErrorCode = code;
  }

  // PUBLIC: Execute network request with recovery
  async executeNetworkRequest(requestFn, options = {}) {
    const maxRetries = options?.maxRetries || 2;
    const timeout = options?.timeout || 10000;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        // Add timeout wrapper
        const result = await Promise.race([
          requestFn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          )
        ]);
        
        return result;
      } catch (error) {
        console.warn(`Network request attempt ${attempt} failed:`, error?.message);
        
        // Set error code for weekend gate logic
        if (error?.code === 'MARKET_CLOSED') {
          this.setLastErrorCode('MARKET_CLOSED');
        } else {
          this.setLastErrorCode(null);
        }
        
        if (attempt <= maxRetries) {
          // Try recovery between attempts, but skip if market closed
          if (attempt === 1 && this.lastErrorCode !== 'MARKET_CLOSED') {
            await this.forceRecovery();
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        
        // Return fallback if enabled
        if (options?.enableFallback) {
          return { 
            fallback: true, 
            error: error?.message,
            endpoint: options?.endpoint 
          };
        }
        
        throw error;
      }
    }
  }

  // ENHANCED: Get network diagnostics (now available!)
  async getNetworkDiagnostics() {
    try {
      const diagnostics = await runNetworkDiagnostics();
      
      return {
        ...diagnostics,
        connectionState: { ...this.connectionState },
        browserOnline: navigator?.onLine,
        serviceWorkerStatus: await this.getServiceWorkerStatus(),
        overall: this.generateOverallAssessment(diagnostics),
        weekendGateActive: isEquitiesMarketClosed()
      };
    } catch (error) {
      // Return basic diagnostics if full diagnostics fail
      return {
        timestamp: new Date()?.toISOString(),
        connectionState: { ...this.connectionState },
        browserOnline: navigator?.onLine,
        overall: {
          status: 'degraded',
          issues: ['Diagnostics unavailable'],
          recommendations: ['Check network connectivity'],
          averageSuccessRate: 0
        },
        error: error?.message,
        weekendGateActive: isEquitiesMarketClosed()
      };
    }
  }

  async getServiceWorkerStatus() {
    if (!('serviceWorker' in navigator)) {
      return { supported: false };
    }
    
    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      return {
        supported: true,
        registered: !!registration,
        active: !!registration?.active,
        installing: !!registration?.installing,
        waiting: !!registration?.waiting
      };
    } catch (error) {
      return { supported: true, error: error?.message };
    }
  }

  generateOverallAssessment(diagnostics) {
    const issues = [];
    const recommendations = [];
    
    if (!diagnostics?.api?.online) {
      issues?.push('API connectivity failed');
      recommendations?.push('Check API server status and network connectivity');
    }
    
    if (this.connectionState?.consecutiveFailures > 5) {
      issues?.push('Multiple consecutive connection failures');
      recommendations?.push('Consider checking firewall and proxy settings');
    }
    
    if (!navigator?.onLine) {
      issues?.push('Browser reports offline status');
      recommendations?.push('Check network connection and try reconnecting');
    }
    
    if (this.connectionState?.recoveryAttempts >= this.connectionState?.maxRecoveryAttempts) {
      issues?.push('Max recovery attempts reached');
      recommendations?.push('Manual intervention required - check network infrastructure');
    }
    
    // Weekend gate considerations
    if (isEquitiesMarketClosed()) {
      recommendations?.push('Market is closed - some equity data requests are suspended');
    }
    
    const averageSuccessRate = diagnostics?.api?.online ? 100 : 0;
    
    let status = 'healthy';
    if (issues?.length > 0) {
      status = issues?.length > 2 ? 'critical' : 'degraded';
    }
    
    return {
      status,
      issues,
      recommendations,
      averageSuccessRate,
      recoveryAttempts: this.connectionState?.recoveryAttempts,
      maxAttempts: this.connectionState?.maxRecoveryAttempts,
      actions: status !== 'healthy' ? [
        'Click "Force Network Recovery" to retry connection',
        'Check browser network settings',
        'Verify API server is accessible',
        'Clear browser cache and reload page'
      ] : []
    };
  }

  emitEvent(eventName, detail) {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent(eventName, { detail });
      window.dispatchEvent(event);
    }
  }

  getConnectionState() {
    return { ...this.connectionState };
  }

  isOnline() {
    return this.connectionState?.isOnline && navigator?.onLine !== false;
  }

  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleBrowserOnline);
      window.removeEventListener('offline', this.handleBrowserOffline);
    }
  }
}

// Create singleton instance
const networkRecovery = new NetworkRecoveryService();

export { networkRecovery };
export default networkRecovery;

// Export individual functions for backward compatibility
export const {
  forceRecovery,
  forceNetworkCheck,
  getNetworkDiagnostics,
  executeNetworkRequest,
  setLastErrorCode,
  recoverNetwork,
  isOnline,
  getConnectionState
} = networkRecovery;
function useNetworkStatus(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: useNetworkStatus is not implemented yet.', args);
  return null;
}

export { useNetworkStatus };