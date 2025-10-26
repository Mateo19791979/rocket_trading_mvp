// Service Worker for Network Recovery - Enhanced Weekend Mode Support
self.addEventListener('install', (event) => {
  console.log('[SW] Installing network recovery service worker');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating network recovery service worker');
  event.waitUntil(self.clients.claim());
});

// Enhanced fetch handler with weekend awareness
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Check if this is a market data request during weekend
  const isMarketDataRequest = url.pathname.includes('/api/market') || 
                             url.pathname.includes('/quotes') ||
                             url.pathname.includes('/market-data');
  
  if (isMarketDataRequest) {
    event.respondWith(handleMarketDataRequest(event.request));
  } else if (url.pathname.includes('/api/health')) {
    event.respondWith(handleHealthRequest(event.request));
  }
});

async function handleMarketDataRequest(request) {
  try {
    // Check if market is closed (simple weekend check)
    const now = new Date();
    const day = now.getUTCDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = day === 0 || day === 6;
    
    if (isWeekend) {
      // Return synthetic weekend response
      return new Response(JSON.stringify({
        success: true,
        data: {
          weekend: true,
          message: 'Market closed - equity data suspended',
          timestamp: new Date().toISOString()
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
    }
    
    // Try network request with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    
    try {
      const response = await fetch(request, {
        signal: controller.signal
      });
      clearTimeout(timeout);
      return response;
    } catch (error) {
      clearTimeout(timeout);
      
      // Return fallback response
      return new Response(JSON.stringify({
        success: false,
        error: 'Network timeout',
        fallback: true,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
    }
    
  } catch (error) {
    console.warn('[SW] Market data request failed:', error);
    
    // Return error response
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

async function handleHealthRequest(request) {
  try {
    // Always try to respond with a valid JSON health check
    const response = await fetch(request, {
      timeout: 3000
    });
    
    // Ensure JSON response
    const text = await response.text();
    
    try {
      // Verify it's valid JSON
      JSON.parse(text);
      return new Response(text, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
    } catch (jsonError) {
      // Invalid JSON - return synthetic health response
      return new Response(JSON.stringify({
        ok: true,
        status: 'synthetic',
        timestamp: new Date().toISOString(),
        source: 'service-worker'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
    }
    
  } catch (error) {
    // Network error - return synthetic health response
    return new Response(JSON.stringify({
      ok: false,
      status: 'offline',
      error: error.message,
      timestamp: new Date().toISOString(),
      source: 'service-worker'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'NETWORK_RECOVERY_CHECK') {
    console.log('[SW] Network recovery check requested');
    
    // Perform basic connectivity test
    fetch('/api/health', { method: 'HEAD' })
      .then(response => {
        event.ports[0].postMessage({
          type: 'NETWORK_RECOVERY_RESULT',
          online: response.ok,
          timestamp: Date.now()
        });
      })
      .catch(error => {
        event.ports[0].postMessage({
          type: 'NETWORK_RECOVERY_RESULT',
          online: false,
          error: error.message,
          timestamp: Date.now()
        });
      });
  }
});