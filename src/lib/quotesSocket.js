// src/lib/quotesSocket.js
// 🚨 ENHANCED SSL WEBSOCKET CONNECTION - SAFE MODE ROCKET SUSPENSION RESPONSE
const WS_URL = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws/quotes/';

let ws;
let lastHeartbeat = Date.now();
let heartbeatTimeout = null;
let reconnectAttempts = 0;
let maxReconnectAttempts = 10; // Increased for emergency scenarios
let connectionHealth = {
  status: 'disconnected',
  lastConnected: null,
  sslTerminationActive: false,
  fallbackMode: false,
  emergencyMode: false, // New emergency flag
  suspensionDetected: false, // Site suspension detection
  safeModeActive: false, // Safe Mode Rocket status
  recoveryInProgress: false // Safe Mode recovery status
};

// 🚨 SAFE MODE ROCKET: Enhanced heartbeat detection for site suspension scenarios
function setupSafeModeHeartbeatDetection(onTick) {
  if (heartbeatTimeout) {
    clearInterval(heartbeatTimeout);
  }
  
  // More aggressive checking during potential suspension
  heartbeatTimeout = setInterval(() => {
    const timeSinceHeartbeat = Date.now() - lastHeartbeat;
    
    if (timeSinceHeartbeat > 30000) { // Reduced to 30 seconds for emergency
      console.error("[QuotesSocket] 🚨 SAFE MODE: WebSocket connection stale - possible site suspension");
      connectionHealth.status = 'stale';
      connectionHealth.suspensionDetected = true;
      connectionHealth.safeModeActive = true; // Activate Safe Mode
      
      if (ws) {
        ws?.close(); // Force reconnection attempt
      }
      
      // Trigger Safe Mode Rocket protection
      window.dispatchEvent(new CustomEvent('safeModeActivated', {
        detail: {
          reason: 'WebSocket heartbeat failure',
          timeSinceHeartbeat,
          domain: location.hostname,
          timestamp: Date.now()
        }
      }));
      
    } else if (timeSinceHeartbeat > 15000) {
      console.warn("[QuotesSocket] ⚠️ WebSocket heartbeat delayed - checking site status");
      connectionHealth.status = 'delayed';
    }
  }, 10000); // Check every 10 seconds during emergency
}

// 🚨 SAFE MODE ROCKET SSL TERMINATION VALIDATION WITH SITE SUSPENSION DETECTION
function validateSSLTerminationSafeMode() {
  const isHTTPS = location.protocol === 'https:';
  const wsProtocol = WS_URL?.startsWith('wss://') ? 'wss' : 'ws';
  
  connectionHealth.sslTerminationActive = isHTTPS && wsProtocol === 'wss';
  connectionHealth.emergencyMode = true; // Activate emergency mode
  
  // Enhanced logging for Safe Mode diagnosis
  console.log(`[QuotesSocket] 🚨 SAFE MODE SSL CHECK:`, {
    protocol: location.protocol,
    wsProtocol,
    sslTerminationActive: connectionHealth?.sslTerminationActive,
    targetURL: WS_URL,
    suspensionDetected: connectionHealth?.suspensionDetected,
    safeModeActive: connectionHealth?.safeModeActive,
    domain: location.hostname
  });
  
  // Additional checks for Safe Mode activation triggers
  if (location.hostname === 'trading-mvp.com' || location.hostname?.includes('trading-mvp')) {
    connectionHealth.emergencyMode = true;
    connectionHealth.safeModeActive = true;
    console.warn("[QuotesSocket] 🚨 DOMAIN ALERT: trading-mvp.com domain detected - Safe Mode Rocket monitoring active");
  }
  
  return connectionHealth?.sslTerminationActive;
}

// 🚨 SAFE MODE ROCKET SITE SUSPENSION DETECTOR
function detectSiteSuspensionSafeMode(error, event) {
  const suspensionIndicators = [
    'ERR_NAME_NOT_RESOLVED',
    'ERR_CONNECTION_REFUSED',
    'ERR_CONNECTION_TIMED_OUT',
    'DNS_PROBE_FINISHED_NXDOMAIN',
    'SSL_ERROR_BAD_CERT_DOMAIN',
    'SEC_ERROR_EXPIRED_CERTIFICATE'
  ];
  
  let suspicionLevel = 'low';
  let suspensionReasons = [];
  let safeModeRecommended = false;
  
  // Check WebSocket close codes that indicate suspension
  if (event && event?.code) {
    switch (event?.code) {
      case 1006: // Abnormal closure - often indicates server issues
        suspicionLevel = 'high';
        safeModeRecommended = true;
        suspensionReasons?.push('Server disconnection (Safe Mode protection required)');
        break;
      case 1015: // TLS handshake failure
        suspicionLevel = 'high'; 
        safeModeRecommended = true;
        suspensionReasons?.push('SSL/TLS failure (certificate renewal required)');
        break;
      case 1002: // Protocol error
        suspicionLevel = 'medium';
        suspensionReasons?.push('Protocol error (possible misconfiguration)');
        break;
    }
  }
  
  // Check for DNS/SSL specific errors - Safe Mode triggers
  if (error && typeof error === 'string') {
    suspensionIndicators?.forEach(indicator => {
      if (error?.includes(indicator)) {
        suspicionLevel = 'critical';
        safeModeRecommended = true;
        suspensionReasons?.push(`DNS/SSL Issue: ${indicator} (Safe Mode required)`);
      }
    });
  }
  
  // Multiple failed connections indicate probable suspension - activate Safe Mode
  if (reconnectAttempts >= 5) {
    suspicionLevel = 'critical';
    safeModeRecommended = true;
    suspensionReasons?.push('Multiple connection failures (Safe Mode protection activated)');
  }
  
  connectionHealth.suspensionDetected = suspicionLevel === 'critical' || suspicionLevel === 'high';
  connectionHealth.safeModeActive = safeModeRecommended;
  
  if (connectionHealth?.suspensionDetected) {
    console.error("[QuotesSocket] 🚨 SAFE MODE ROCKET: Site suspension detected - activating protection:", {
      suspicionLevel,
      reasons: suspensionReasons,
      reconnectAttempts,
      lastError: error,
      closeCode: event?.code,
      safeModeActive: connectionHealth?.safeModeActive,
      domain: location.hostname
    });
    
    // Dispatch Safe Mode activation event
    if (safeModeRecommended && typeof window !== 'undefined') {
      // Use setTimeout to prevent immediate DOM manipulation that causes jumps
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('safeModeRequired', {
          detail: {
            reasons: suspensionReasons,
            suspicionLevel,
            domain: location.hostname,
            timestamp: Date.now(),
            recoveryPlan: 'SSL_DNS_5_STEP'
          }
        }));
      }, 100);
    }
  }
  
  return {
    suspicionLevel,
    suspensionReasons,
    suspensionDetected: connectionHealth?.suspensionDetected,
    safeModeActive: connectionHealth?.safeModeActive,
    recoveryRecommended: safeModeRecommended
  };
}

export function startQuotesFeed(onTick) {
  // Clean up existing connection
  if (ws) {
    ws?.close();
  }

  // Safe Mode SSL validation
  validateSSLTerminationSafeMode();

  console.log(`[QuotesSocket] 🚨 SAFE MODE CONNECTION to: ${WS_URL}`);
  console.log(`[QuotesSocket] SSL Termination: ${connectionHealth?.sslTerminationActive ? 'ACTIVE' : '⚠️ INACTIVE'}`);
  console.log(`[QuotesSocket] Safe Mode Rocket: ${connectionHealth?.safeModeActive ? '🛡️ ENABLED' : 'STANDBY'}`);
  
  ws = new WebSocket(WS_URL);
  
  // Reduced timeout for Safe Mode scenarios
  const connectionTimeout = setTimeout(() => {
    if (ws && ws?.readyState === WebSocket.CONNECTING) {
      console.error("[QuotesSocket] 🚨 CONNECTION TIMEOUT - Safe Mode protection activating");
      ws?.close();
      const detection = detectSiteSuspensionSafeMode('CONNECTION_TIMEOUT', { code: 1006 });
      
      // Auto-activate Safe Mode on connection timeout
      if (detection?.safeModeActive) {
        connectionHealth.safeModeActive = true;
        console.log("[QuotesSocket] 🛡️ Safe Mode Rocket ACTIVATED due to connection timeout");
      }
    }
  }, 8000); // 8 second timeout for Safe Mode
  
  ws.onopen = () => {
    clearTimeout(connectionTimeout);
    console.log("[QuotesSocket] ✅ SAFE MODE: WebSocket connection established.");
    connectionHealth.status = 'connected';
    connectionHealth.lastConnected = Date.now();
    connectionHealth.suspensionDetected = false; // Reset suspension flag on success
    connectionHealth.safeModeActive = false; // Deactivate Safe Mode on successful connection
    reconnectAttempts = 0;
    lastHeartbeat = Date.now();
    setupSafeModeHeartbeatDetection(onTick);
    
    // Send Safe Mode connection info
    if (ws?.readyState === WebSocket.OPEN) {
      ws?.send(JSON.stringify({
        t: 'safe_mode_client_info',
        ssl_termination: connectionHealth?.sslTerminationActive,
        protocol: location.protocol,
        domain: location.hostname,
        safe_mode_active: connectionHealth?.safeModeActive,
        emergency_mode: connectionHealth?.emergencyMode,
        reconnect_attempts: reconnectAttempts,
        ts: Date.now()
      }));
    }
    
    // ENHANCED FIX: Better Safe Mode event dispatching with throttling
    if (typeof window !== 'undefined') {
      // Clear any pending events to prevent event spam
      clearTimeout(window._safeModeEventTimeout);
      window._safeModeEventTimeout = setTimeout(() => {
        try {
          window.dispatchEvent(new CustomEvent('safeModeDeactivated', {
            detail: {
              reason: 'Successful connection established',
              domain: location.hostname,
              timestamp: Date.now(),
              preventPageJump: true,
              throttled: true // Flag indicating this event was throttled
            }
          }));
        } catch (error) {
          console.warn('[QuotesSocket] Event dispatch error (non-critical):', error);
        }
      }, 150); // Increased delay for better stability
    }
  };
  
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev?.data);
      
      // Handle Safe Mode heartbeat messages
      if (msg?.t === 'heartbeat' || msg?.t === 'safe_mode_heartbeat' || msg?.t === 'emergency_heartbeat') {
        lastHeartbeat = msg?.ts || Date.now();
        connectionHealth.status = 'healthy';
        connectionHealth.suspensionDetected = false;
        connectionHealth.safeModeActive = false; // Safe Mode can be deactivated on healthy heartbeat
        console.debug(`[QuotesSocket] ${connectionHealth?.safeModeActive ? '🛡️' : ''} Heartbeat received`);
        return;
      }
      
      // Handle server Safe Mode status messages
      if (msg?.t === 'safe_mode_status' || msg?.t === 'emergency_status') {
        console.warn('[QuotesSocket] 🛡️ Server Safe Mode Status:', msg);
        if (msg?.site_status === 'suspended' || msg?.site_status === 'maintenance' || msg?.safe_mode === true) {
          connectionHealth.suspensionDetected = true;
          connectionHealth.safeModeActive = true;
          console.error('[QuotesSocket] 🛡️ SERVER CONFIRMED: Safe Mode activation - site protection active');
          
          // ENHANCED FIX: Better Safe Mode server confirmation dispatching
          if (typeof window !== 'undefined') {
            clearTimeout(window._safeModeServerTimeout);
            window._safeModeServerTimeout = setTimeout(() => {
              try {
                window.dispatchEvent(new CustomEvent('safeModeServerConfirmed', {
                  detail: {
                    serverStatus: msg,
                    timestamp: Date.now(),
                    preventPageJump: true,
                    throttled: true
                  }
                }));
              } catch (error) {
                console.warn('[QuotesSocket] Server confirmation dispatch error (non-critical):', error);
              }
            }, 150);
          }
        }
        return;
      }
      
      // Handle SSL termination status
      if (msg?.t === 'ssl_termination_status') {
        console.log('[QuotesSocket] Server SSL Status:', msg);
        connectionHealth.sslTerminationActive = msg?.active || false;
        
        // Check if SSL issues require Safe Mode
        if (!msg?.active && location.protocol === 'https:') {
          connectionHealth.safeModeActive = true;
          console.warn('[QuotesSocket] 🛡️ SSL termination inactive - Safe Mode recommended');
        }
        return;
      }
      
      // Handle Safe Mode recovery status updates
      if (msg?.t === 'recovery_status') {
        connectionHealth.recoveryInProgress = msg?.in_progress || false;
        console.log('[QuotesSocket] 🚀 Recovery Status Update:', msg);
        return;
      }
      
      // ENHANCED FIX: More stable message processing to prevent page resets
      connectionHealth.status = 'active';
      connectionHealth.suspensionDetected = false;
      connectionHealth.safeModeActive = false;
      
      // Advanced throttling with batching to prevent excessive updates
      if (typeof onTick === 'function') {
        // Batch multiple updates and debounce to prevent rapid re-renders
        clearTimeout(window._quotesUpdateTimeout);
        window._quotesUpdateTimeout = setTimeout(() => {
          requestAnimationFrame(() => {
            try {
              onTick(msg);
            } catch (error) {
              console.warn('[QuotesSocket] onTick error (non-critical):', error);
            }
          });
        }, 50); // 50ms debounce to batch updates
      }
    } catch (error) {
      console.warn('[QuotesSocket] Message parsing failed:', error);
      // Don't treat parsing errors as suspension indicators
    }
  };

  ws.onerror = (error) => {
    clearTimeout(connectionTimeout);
    console.error("[QuotesSocket] 🚨 SAFE MODE: WebSocket error:", error);
    const detection = detectSiteSuspensionSafeMode(error?.message || 'WebSocket error', null);
    
    if (detection?.safeModeActive) {
      connectionHealth.safeModeActive = true;
      console.log("[QuotesSocket] 🛡️ Safe Mode Rocket ACTIVATED due to WebSocket error");
    }
  };

  ws.onclose = (event) => {
    clearTimeout(connectionTimeout);
    console.warn(`[QuotesSocket] 🚨 SAFE MODE: WebSocket closed. Code: ${event?.code}, Reason: ${event?.reason}`);
    
    connectionHealth.status = 'disconnected';
    const detection = detectSiteSuspensionSafeMode(event?.reason, event);
    
    if (detection?.suspensionDetected && reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      
      console.log(`[QuotesSocket] 🛡️ Safe Mode reconnect attempt ${reconnectAttempts}/${maxReconnectAttempts} in ${backoffDelay}ms`);
      
      setTimeout(() => {
        if (reconnectAttempts <= maxReconnectAttempts) {
          startQuotesFeed(onTick);
        }
      }, backoffDelay);
    } else if (reconnectAttempts >= maxReconnectAttempts) {
      console.error("[QuotesSocket] 🚨 Maximum reconnection attempts reached - Safe Mode protection required");
      connectionHealth.safeModeActive = true;
      connectionHealth.suspensionDetected = true;
    }
  };
}

export function stopQuotesFeed() {
  if (heartbeatTimeout) {
    clearInterval(heartbeatTimeout);
    heartbeatTimeout = null;
  }
  
  if (ws) {
    ws?.close();
    ws = null;
  }
  
  connectionHealth.status = 'disconnected';
  console.log("[QuotesSocket] 🛡️ SAFE MODE: WebSocket connection stopped");
}

export function getConnectionHealth() {
  return { ...connectionHealth };
}

export function getConnectionState() {
  return connectionHealth?.status;
}

export function isConnectionHealthy() {
  const timeSinceHeartbeat = Date.now() - lastHeartbeat;
  return connectionHealth?.status === 'connected' && 
         timeSinceHeartbeat < 60000 && // Less than 1 minute since last heartbeat
         !connectionHealth?.suspensionDetected &&
         !connectionHealth?.safeModeActive;
}

export function getLastHeartbeat() {
  return lastHeartbeat;
}

export function isSafeModeActive() {
  return connectionHealth?.safeModeActive || connectionHealth?.suspensionDetected;
}

// ENHANCED FIX: More stable force reconnect with better state cleanup
export function forceReconnect(onTick) {
  console.log('[QuotesSocket] 🛡️ SAFE MODE: Force reconnect requested - enhanced stability mode');
  
  // Clear all pending timeouts to prevent conflicts
  clearTimeout(window._quotesUpdateTimeout);
  clearTimeout(window._safeModeEventTimeout);
  clearTimeout(window._safeModeServerTimeout);
  clearTimeout(window._safeModeRequiredTimeout);
  
  // Reset all connection state
  reconnectAttempts = 0;
  connectionHealth.suspensionDetected = false;
  connectionHealth.safeModeActive = false;
  connectionHealth.recoveryInProgress = false;
  connectionHealth.status = 'reconnecting';
  
  stopQuotesFeed();
  
  // Longer delay with better error handling
  setTimeout(() => {
    try {
      startQuotesFeed(onTick);
    } catch (error) {
      console.error('[QuotesSocket] Force reconnect failed:', error);
      connectionHealth.status = 'error';
    }
  }, 1500);
}