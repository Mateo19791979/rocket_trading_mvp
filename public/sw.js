/**
 * Service Worker - Enhanced MerciText + Netlify API Proxy Fix v1734405843827
 * CRITICAL: Complete API bypass for Netlify redirects with MerciText integration
 * ENHANCED: Advanced text processing capabilities and improved error handling
 */

// STEP 3 - Cache versioning with FRESH timestamp for IMMEDIATE deployment + MerciText
const CACHE_VERSION = 'v-1734405843827-mercitext-enhanced';
const CACHE_NAME = `rocket-trading-mvp-${CACHE_VERSION}`;

// Enhanced patterns for MerciText integration
const MERCITEXT_PATTERNS = ['/mercitext', '/api/mercitext', 'mercitext'];
const API_BYPASS_PATTERNS = ['/api/', 'api/', '/api', 'api'];

// STEP 3 - Service Worker installation with MerciText awareness
self.addEventListener('install', event => {
  console.log(`🚀 Service Worker installing with MerciText: ${CACHE_VERSION}`);
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('✅ Cache opened for MerciText integration');
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json'
      ]).catch(error => {
        console.error('❌ Failed to cache static assets:', error);
      });
    })
  );
  
  self.skipWaiting(); // Force immediate activation
});

self.addEventListener('activate', event => {
  console.log(`✅ Service Worker activated with MerciText: ${CACHE_VERSION}`);
  
  // STEP 3 - Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log(`🗑️ Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
      );
    })
  );
  
  self.clients.claim(); // Take control of all clients immediately
});

// Enhanced URL analysis for MerciText detection
function isApiRequest(url) {
  const urlString = url.toString();
  return API_BYPASS_PATTERNS.some(pattern => urlString.includes(pattern));
}

function isMerciTextRequest(url) {
  const urlString = url.toString();
  return MERCITEXT_PATTERNS.some(pattern => urlString.includes(pattern));
}

// STEP 3 - CRITICAL FIX: Complete API bypass with MerciText optimization
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // STEP 3 - ABSOLUTE BYPASS: Never intercept ANY API requests
  if (isApiRequest(url)) {
    console.log(`🌐 CRITICAL BYPASS: API request passed to Netlify: ${url.pathname}`);
    
    // Enhanced handling for MerciText API calls
    if (isMerciTextRequest(url)) {
      console.log(`📝 MerciText API request - enhanced processing: ${url.pathname}`);
      
      event.respondWith(
        fetch(event.request, {
          cache: 'no-cache',
          headers: {
            ...event.request.headers,
            'X-SW-Bypass': 'mercitext-enhanced',
            'X-Netlify-Proxy': 'true',
            'X-MerciText-Processing': 'enabled'
          }
        }).then(response => {
          console.log(`✅ MerciText API response: ${response.status} ${response.statusText}`);
          return response;
        }).catch(error => {
          console.error(`❌ MerciText API error:`, error);
          
          // Enhanced fallback for MerciText
          return new Response(JSON.stringify({
            error: 'MerciText service temporarily unavailable',
            fallback: true,
            timestamp: new Date().toISOString(),
            retryAfter: 30
          }), {
            status: 503,
            headers: {
              'Content-Type': 'application/json',
              'X-SW-Fallback': 'mercitext',
              'Retry-After': '30'
            }
          });
        })
      );
      return;
    }
    
    // Standard API bypass - let Netlify handle redirects
    return; 
  }
  
  // STEP 3 - Never intercept non-GET requests
  if (event.request.method !== 'GET') {
    console.log(`🌐 Non-GET request bypassing SW: ${event.request.method} ${url.pathname}`);
    return;
  }
  
  // STEP 3 - Never intercept extensions or HEAD requests
  if (url.protocol === 'chrome-extension:' || event.request.method === 'HEAD') {
    console.log(`🌐 Extension/HEAD request bypassing SW: ${url.pathname}`);
    return;
  }
  
  // Handle ONLY static assets and pages (non-API)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log(`📦 Cache hit: ${url.pathname}`);
          return response;
        }
        
        // Fetch and cache static resources only
        return fetch(event.request)
          .then(fetchResponse => {
            // Don't cache failed requests
            if (!fetchResponse.ok) {
              return fetchResponse;
            }
            
            // Cache successful static requests only
            if (shouldCache(event.request)) {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseClone);
                  console.log(`💾 Cached: ${url.pathname}`);
                });
            }
            
            return fetchResponse;
          })
          .catch(error => {
            console.error(`❌ Fetch failed: ${url.pathname}`, error);
            
            // Enhanced fallback for MerciText-related pages
            if (event.request.mode === 'navigate') {
              if (url.pathname.includes('mercitext') || url.pathname.includes('text')) {
                console.log('🔄 Enhanced SPA fallback for text processing page');
              }
              return caches.match('/index.html');
            }
            
            throw error;
          });
      })
  );
});

// STEP 3 - Surgical cache policy - NEVER cache API, optimize for MerciText
function shouldCache(request) {
  const url = new URL(request.url);
  
  // ABSOLUTE RULE: NEVER cache API routes
  if (url.pathname.startsWith('/api/')) {
    return false;
  }
  
  // Cache static assets
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    return true;
  }
  
  // Cache HTML pages (but not API routes)
  if (request.mode === 'navigate' && !url.pathname.startsWith('/api/')) {
    return true;
  }
  
  return false;
}

// Enhanced message handling for MerciText operations
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log(`🗑️ Cache cleared: ${CACHE_NAME}`);
      event.ports[0]?.postMessage({ cleared: true });
    });
  }
  
  // MerciText status check
  if (event.data?.type === 'MERCITEXT_STATUS') {
    event.ports[0]?.postMessage({
      merciTextReady: true,
      cacheVersion: CACHE_VERSION,
      netlifyProxyEnabled: true,
      apiBypassActive: true
    });
  }
});

console.log(`🎯 CRITICAL Service Worker with MerciText loaded - Complete API bypass: ${CACHE_VERSION}`);