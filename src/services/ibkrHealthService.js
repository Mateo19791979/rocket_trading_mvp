/**
 * Service for IBKR Health Check Integration
 * Connects to the Python FastAPI IBKR health monitoring server
 * Enhanced with better error handling and localhost development support
 */
export class IBKRHealthService {
  constructor() {
    // Enhanced URL detection with environment-aware defaults
    this.baseUrl = this.detectServiceUrl();
    this.timeout = 8000; // Reduced timeout to 8 seconds
    this.retryCount = 0;
    this.maxRetries = 2;
    this.fallbackMode = false;
    this.serviceAvailable = null; // Cache service availability
    this.isDevelopment = this.isDevEnvironment();
  }

  /**
   * Detect the appropriate service URL based on environment
   * @private
   */
  detectServiceUrl() {
    // Environment variable takes priority
    if (import.meta.env?.VITE_IBKR_HEALTH_URL) {
      return import.meta.env?.VITE_IBKR_HEALTH_URL;
    }

    // In development mode, try to detect if we need HTTP or HTTPS
    const isDev = import.meta.env?.DEV || window.location?.hostname === 'localhost';
    
    if (isDev) {
      // In development, use HTTP for localhost to avoid SSL certificate issues
      return 'http://localhost:8081';
    }

    // In production, default to relative URL or HTTPS
    return window.location?.protocol === 'https:' ? 'https://localhost:8081' : 'http://localhost:8081';
  }

  /**
   * Check if running in development environment
   * @private
   */
  isDevEnvironment() {
    return import.meta.env?.DEV || 
           import.meta.env?.NODE_ENV === 'development' ||
           window.location?.hostname === 'localhost' ||
           window.location?.hostname === '127.0.0.1';
  }

  /**
   * Enhanced service availability check with development-aware error handling
   * @returns {Promise<boolean>}
   */
  async isServiceAvailable() {
    // Return cached result if available and fresh (within 30 seconds)
    if (this.serviceAvailable !== null && Date.now() - this.serviceAvailable?.timestamp < 30000) {
      return this.serviceAvailable?.available;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller?.abort(), 3000); // Quick 3s check
      
      const response = await fetch(`${this.baseUrl}/health/ibkr`, {
        method: 'HEAD',
        signal: controller?.signal
      });
      
      clearTimeout(timeoutId);
      
      const available = response?.ok;
      this.serviceAvailable = {
        available,
        timestamp: Date.now()
      };
      
      if (available) {
        this.fallbackMode = false;
        this.retryCount = 0;
        
        if (this.isDevelopment) {
          console.info('[IBKR-HEALTH] ✅ Service disponible sur:', this.baseUrl);
        }
      }
      
      return available;
    } catch (error) {
      // Enhanced error logging for development
      if (this.isDevelopment) {
        console.warn('[IBKR-HEALTH] Service indisponible:', this.baseUrl, '-', error?.message);
        
        if (error?.name === 'TypeError' && error?.message === 'Failed to fetch') {
          console.info('[IBKR-HEALTH] 💡 Conseil: Vérifiez que le serveur Python ibkr_health.py est démarré');
          console.info('[IBKR-HEALTH] 💡 Commande: python ibkr_health.py ou uvicorn ibkr_health:app --port 8081');
        }
      }
      
      this.serviceAvailable = {
        available: false,
        timestamp: Date.now(),
        error: error?.message
      };
      
      return false;
    }
  }

  /**
   * Get comprehensive IBKR health status with enhanced error handling
   * @returns {Promise<Object>} Health status with gateway, auth, account, marketData
   */
  async getHealthStatus() {
    // Quick availability check first
    const isAvailable = await this.isServiceAvailable();
    
    if (!isAvailable) {
      const errorMsg = this.isDevelopment 
        ? 'Service Python IBKR non démarré - Lancez ibkr_health.py' :'Service not available - server may be offline';
      
      console.info('[IBKR-HEALTH] Service indisponible, mode fallback activé');
      return this.getFallbackHealthStatus(errorMsg);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller?.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/health/ibkr`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller?.signal
      });

      clearTimeout(timeoutId);

      if (!response?.ok) {
        const errorData = await response?.json()?.catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response?.json();
      
      // Reset retry count on successful request
      this.retryCount = 0;
      this.fallbackMode = false;
      
      if (this.isDevelopment) {
        console.info('[IBKR-HEALTH] ✅ Données reçues avec succès');
      }
      
      return {
        success: true,
        data: {
          gateway: data?.gateway,
          auth: data?.auth,
          account: data?.account,
          marketData: data?.marketData,
          meta: data?.meta,
          overall: {
            status: (data?.gateway?.ok && data?.auth?.ok) ? 'healthy' : 'degraded',
            connected: data?.gateway?.ok || false,
            authenticated: data?.auth?.ok || false,
            accountAccess: data?.account?.ok || false,
            marketDataAccess: data?.marketData?.ok || false,
            lastCheck: new Date()?.toISOString(),
            mode: 'live-service',
            serviceUrl: this.baseUrl
          }
        }
      };
    } catch (error) {
      // Enhanced error logging with development hints
      if (this.isDevelopment) {
        console.warn('[IBKR-HEALTH] Erreur lors de la récupération des données:', error?.message);
        
        if (error?.name === 'AbortError') {
          console.warn('[IBKR-HEALTH] 💡 Timeout - Le serveur met trop de temps à répondre');
        } else if (error?.name === 'TypeError' && error?.message === 'Failed to fetch') {
          console.warn('[IBKR-HEALTH] 💡 Connexion impossible - Service arrêté ou port incorrect');
        }
      }
      
      // Increment retry count
      this.retryCount++;
      
      // Enable fallback mode after max retries
      if (this.retryCount >= this.maxRetries) {
        this.fallbackMode = true;
        console.info('[IBKR-HEALTH] Mode fallback activé après tentatives échouées');
      }
      
      return this.getFallbackHealthStatus(error?.message);
    }
  }

  /**
   * Fallback health status when service is unavailable
   * Enhanced with development-specific guidance
   * @private
   */
  getFallbackHealthStatus(errorMessage) {
    const developmentGuidance = this.isDevelopment ? {
      quickStart: 'Démarrez le service: python ibkr_health.py',
      requirements: 'Installez: pip install ib-insync fastapi uvicorn',
      configuration: `Vérifiez les variables d'environnement IBKR`,
      port: `Service attendu sur: ${this.baseUrl}`,
      logs: 'Consultez les logs Python pour plus de détails'
    } : null;

    return {
      success: false,
      error: errorMessage,
      data: {
        gateway: { 
          ok: false, 
          message: this.isDevelopment ? 'Service Python arrêté' : 'Health service offline',
          details: this.isDevelopment ? 'Démarrez ibkr_health.py' : 'The IBKR health monitoring server is not running'
        },
        auth: { 
          ok: false, 
          message: 'Service unavailable',
          details: this.isDevelopment ? 'Authentification IBKR indisponible' : 'Authentication status cannot be determined'
        },
        account: { 
          ok: false, 
          message: 'Service unavailable',
          details: this.isDevelopment ? 'Données compte indisponibles' : 'Account information unavailable'
        },
        marketData: { 
          ok: false, 
          message: 'Service unavailable',
          details: this.isDevelopment ? 'Données marché indisponibles' : 'Market data status unknown'
        },
        meta: { 
          host: this.baseUrl,
          port: 'unavailable',
          mode: 'fallback',
          ts: Math.floor(Date.now() / 1000),
          fallbackActive: true,
          retryCount: this.retryCount,
          isDevelopment: this.isDevelopment,
          ...(developmentGuidance && { developmentGuidance })
        },
        overall: {
          status: 'service-offline',
          connected: false,
          authenticated: false,
          accountAccess: false,
          marketDataAccess: false,
          lastCheck: new Date()?.toISOString(),
          error: errorMessage,
          mode: 'fallback',
          serviceAvailable: false,
          serviceUrl: this.baseUrl,
          isDevelopment: this.isDevelopment
        }
      }
    };
  }

  /**
   * Trigger IBKR reconnection with enhanced error handling
   * @returns {Promise<Object>} Reconnection result
   */
  async reconnect() {
    // Check service availability first
    const isAvailable = await this.isServiceAvailable();
    
    if (!isAvailable) {
      const errorMsg = this.isDevelopment 
        ? 'Service Python IBKR non disponible - Vérifiez ibkr_health.py'
        : 'IBKR Health Service is not available';
        
      return {
        success: false,
        error: errorMsg,
        data: {
          reconnected: false,
          message: 'Cannot reconnect - health service is offline',
          timestamp: new Date()?.toISOString(),
          serviceAvailable: false,
          serviceUrl: this.baseUrl,
          isDevelopment: this.isDevelopment
        }
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller?.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/health/ibkr/reconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller?.signal
      });

      clearTimeout(timeoutId);
      const data = await response?.json();

      if (!response?.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (this.isDevelopment) {
        console.info('[IBKR-HEALTH] ✅ Reconnexion réussie');
      }

      return {
        success: true,
        data: {
          reconnected: data?.ok,
          message: data?.message,
          host: data?.host,
          port: data?.port,
          timestamp: new Date()?.toISOString(),
          serviceAvailable: true,
          serviceUrl: this.baseUrl
        }
      };
    } catch (error) {
      if (this.isDevelopment) {
        console.warn('[IBKR-HEALTH] Erreur lors de la reconnexion:', error?.message);
      }
      
      return {
        success: false,
        error: error?.message,
        data: {
          reconnected: false,
          message: error?.message,
          timestamp: new Date()?.toISOString(),
          serviceAvailable: false,
          serviceUrl: this.baseUrl,
          isDevelopment: this.isDevelopment
        }
      };
    }
  }

  /**
   * Get formatted badges data for UI display with fallback support
   * @returns {Promise<Object>} Formatted badge data
   */
  async getBadgesData() {
    try {
      const healthResult = await this.getHealthStatus();
      
      if (!healthResult?.success) {
        return {
          success: false,
          badges: this.getErrorBadges(
            healthResult?.error, 
            healthResult?.data?.overall?.mode === 'fallback',
            healthResult?.data?.meta?.developmentGuidance
          )
        };
      }

      const { data } = healthResult;
      
      return {
        success: true,
        badges: {
          gateway: {
            label: 'Gateway',
            status: data?.gateway?.ok ? 'success' : 'error',
            message: data?.gateway?.message || 'Unknown',
            details: data?.gateway?.serverTime ? `Server: ${data?.gateway?.serverTime}` : data?.gateway?.details
          },
          auth: {
            label: 'Auth',
            status: data?.auth?.ok ? 'success' : 'error',
            message: data?.auth?.message || 'Unknown',
            details: data?.auth?.accounts?.length ? `Accounts: ${data?.auth?.accounts?.length}` : data?.auth?.details
          },
          account: {
            label: 'Account',
            status: data?.account?.ok ? 'success' : 'warning',
            message: data?.account?.message || 'Unknown',
            details: this.formatAccountSummary(data?.account?.summary) || data?.account?.details
          },
          marketData: {
            label: 'Market Data',
            status: data?.marketData?.ok ? 'success' : 'warning',
            message: data?.marketData?.message || 'Unknown',
            details: this.formatMarketData(data?.marketData?.data) || data?.marketData?.details
          }
        },
        meta: data?.meta,
        overall: data?.overall
      };
    } catch (error) {
      if (this.isDevelopment) {
        console.warn('[IBKR-HEALTH] Erreur getBadgesData:', error?.message);
      }
      return {
        success: false,
        badges: this.getErrorBadges(error?.message, true)
      };
    }
  }

  /**
   * Format account summary for display
   * @private
   */
  formatAccountSummary(summary) {
    if (!summary || Object.keys(summary)?.length === 0) return null;
    
    const netLiq = summary?.NetLiquidation;
    if (netLiq) {
      return `${netLiq?.currency} ${parseFloat(netLiq?.value)?.toLocaleString()}`;
    }
    
    const cash = summary?.TotalCashValue;
    if (cash) {
      return `Cash: ${cash?.currency} ${parseFloat(cash?.value)?.toLocaleString()}`;
    }
    
    return 'Available';
  }

  /**
   * Format market data for display
   * @private
   */
  formatMarketData(marketData) {
    if (!marketData || !marketData?.symbol) return null;
    
    const { symbol, last, bid, ask } = marketData;
    
    if (last !== null) {
      return `${symbol}: ${last}`;
    } else if (bid !== null && ask !== null) {
      return `${symbol}: ${bid}/${ask}`;
    }
    
    return symbol;
  }

  /**
   * Get error badges when service is unavailable - Enhanced with development guidance
   * @private
   */
  getErrorBadges(error, isFallbackMode = false, developmentGuidance = null) {
    const baseMessage = isFallbackMode 
      ? (this.isDevelopment ? 'Service Python Arrêté' : 'Health Service Offline')
      : 'Service Unavailable';
      
    const baseDetails = isFallbackMode 
      ? (this.isDevelopment 
          ? 'Démarrez: python ibkr_health.py' :'Start the Python health server to monitor IBKR status')
      : error;

    const badges = {
      gateway: {
        label: 'Gateway',
        status: 'error',
        message: baseMessage,
        details: baseDetails
      },
      auth: {
        label: 'Auth',
        status: 'error',
        message: baseMessage,
        details: isFallbackMode 
          ? (this.isDevelopment ? 'Service requis' : 'Authentication monitoring disabled')
          : null
      },
      account: {
        label: 'Account',
        status: 'error',
        message: baseMessage,
        details: isFallbackMode 
          ? (this.isDevelopment ? 'Service requis' : 'Account monitoring disabled')
          : null
      },
      marketData: {
        label: 'Market Data',
        status: 'error',
        message: baseMessage,
        details: isFallbackMode 
          ? (this.isDevelopment ? 'Service requis' : 'Market data monitoring disabled')
          : null
      }
    };

    // Add development guidance if available
    if (this.isDevelopment && developmentGuidance) {
      badges.gateway.developmentGuidance = developmentGuidance;
    }

    return badges;
  }

  /**
   * Reset service state (useful for manual retry)
   */
  resetService() {
    this.retryCount = 0;
    this.fallbackMode = false;
    this.serviceAvailable = null;
    
    if (this.isDevelopment) {
      console.info('[IBKR-HEALTH] État du service réinitialisé');
    }
  }

  /**
   * Get service status information with enhanced details
   */
  getServiceStatus() {
    return {
      baseUrl: this.baseUrl,
      fallbackMode: this.fallbackMode,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      serviceAvailable: this.serviceAvailable,
      isDevelopment: this.isDevelopment,
      environment: import.meta.env?.MODE || 'unknown'
    };
  }

  /**
   * Test service connectivity with detailed diagnostics
   * @returns {Promise<Object>} Connectivity test result
   */
  async testConnectivity() {
    console.group('[IBKR-HEALTH] 🔍 Test de connectivité');
    
    const testResult = {
      timestamp: new Date()?.toISOString(),
      serviceUrl: this.baseUrl,
      environment: import.meta.env?.MODE || 'unknown',
      tests: {}
    };

    // Test 1: Basic connectivity
    try {
      const startTime = performance.now();
      const response = await fetch(this.baseUrl, { method: 'HEAD' });
      const duration = performance.now() - startTime;
      
      testResult.tests.connectivity = {
        success: response?.ok,
        status: response?.status,
        duration: Math.round(duration),
        error: null
      };
      
      console.info('✅ Connectivité de base:', response?.ok ? 'OK' : 'ÉCHEC');
    } catch (error) {
      testResult.tests.connectivity = {
        success: false,
        status: null,
        duration: null,
        error: error?.message
      };
      console.error('❌ Connectivité de base: ÉCHEC -', error?.message);
    }

    // Test 2: Health endpoint
    try {
      const isAvailable = await this.isServiceAvailable();
      testResult.tests.healthEndpoint = {
        success: isAvailable,
        cached: this.serviceAvailable !== null,
        error: this.serviceAvailable?.error || null
      };
      
      console.info('✅ Endpoint health:', isAvailable ? 'OK' : 'ÉCHEC');
    } catch (error) {
      testResult.tests.healthEndpoint = {
        success: false,
        cached: false,
        error: error?.message
      };
      console.error('❌ Endpoint health: ÉCHEC -', error?.message);
    }

    console.groupEnd();
    return testResult;
  }
}

// Export singleton instance
export const ibkrHealthService = new IBKRHealthService();