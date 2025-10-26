import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/tailwind.css';

// 🔧 SURGICAL: Import chunk guard early to prevent Vite import errors
import './app/chunkGuard';

// FIXED: Enhanced service worker management for offline recovery - prevents Rocket asset errors
if ('serviceWorker' in navigator) {
  // STEP 1: Unregister ALL existing service workers that cause caching issues
  navigator.serviceWorker?.getRegistrations()?.then(registrations => {
    console.log(`🔍 Found ${registrations?.length} service worker registrations - cleaning up...`);
    
    const unregisterPromises = registrations?.map(registration => {
      console.log('🗑️ Unregistering service worker:', registration?.scope);
      return registration?.unregister()?.catch(error => {
        console.warn('Failed to unregister service worker:', error?.message);
        return false;
      });
    });
    
    return Promise.all(unregisterPromises);
  })?.then(results => {
    console.log(`✅ Service worker cleanup completed: ${results?.filter(Boolean)?.length} unregistered`);
    
    // STEP 2: Clear ALL cached data that might cause "asset error" issues
    if ('caches' in window) {
      caches.keys()?.then(cacheNames => {
        const deletionPromises = cacheNames?.map(cacheName => {
          console.log('🗑️ Deleting cache:', cacheName);
          return caches.delete(cacheName);
        });
        
        return Promise.all(deletionPromises);
      })?.then(() => {
        console.log('✅ All caches cleared - Rocket asset errors should be resolved');
      })?.catch(error => {
        console.warn('Cache cleanup failed:', error?.message);
      });
    }
  })?.catch(error => {
    console.warn('Failed to manage service workers:', error?.message);
  });

  // STEP 3: Register NEW network recovery service worker with enhanced error handling
  const swUrl = '/sw-network-recovery.js';
  
  navigator.serviceWorker?.register(swUrl, {
    scope: '/',
    updateViaCache: 'none' // Always fetch fresh service worker - prevents stale cache issues
  })?.then(registration => {
    console.log('✅ Network recovery service worker registered successfully');
    
    // Handle service worker updates to prevent version conflicts
    registration?.addEventListener('updatefound', () => {
      console.log('🔄 New service worker version detected');
      const newWorker = registration?.installing;
      
      newWorker?.addEventListener('statechange', () => {
        if (newWorker?.state === 'installed' && navigator.serviceWorker?.controller) {
          console.log('📦 New service worker ready - reload recommended');
          
          // Optionally notify user about update
          window.dispatchEvent(new CustomEvent('sw-update-available', {
            detail: { registration }
          }));
        }
      });
    });

    // Handle service worker activation
    registration?.addEventListener('activate', () => {
      console.log('🚀 Service worker activated successfully');
    });

  })?.catch(error => {
    console.warn('❌ Service worker registration failed:', error?.message);
    
    // Don't break the app if service worker fails
    console.log('📱 App will continue without service worker support');
  });

  // STEP 4: Enhanced service worker message handling for network recovery
  navigator.serviceWorker?.addEventListener('message', event => {
    const data = event?.data;
    console.log('📨 Service worker message:', data);
    
    switch(data?.type) {
      case 'NETWORK_ERROR':
        window.dispatchEvent(new CustomEvent('network:service-worker-error', {
          detail: data
        }));
        break;
        
      case 'CACHE_ERROR': console.warn('🗑️ Cache error detected:', data?.error);
        window.dispatchEvent(new CustomEvent('cache:error', {
          detail: data
        }));
        break;
        
      case 'RECOVERY_SUCCESS': console.log('🎉 Network recovery successful via service worker');
        window.dispatchEvent(new CustomEvent('network:recovery-success', {
          detail: data
        }));
        break;
        
      default:
        console.log('📨 Unknown service worker message:', data);
    }
  });
}

// ENHANCED: Global error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  const reason = event?.reason?.message || String(event?.reason);
  console.warn('⚠️ Unhandled promise rejection:', reason);
  
  // Enhanced network error detection and handling
  const networkErrorPatterns = [
    'Failed to fetch',
    'NetworkError',
    'TypeError: fetch',
    'CONNECTION_ERROR',
    'ERR_NETWORK',
    'ERR_INTERNET_DISCONNECTED'
  ];
  
  if (networkErrorPatterns?.some(pattern => reason?.includes(pattern))) {
    window.dispatchEvent(new CustomEvent('network:unhandled-error', {
      detail: { 
        error: reason, 
        timestamp: Date.now(),
        type: 'network_error'
      }
    }));
  }
  
  // Don't preventDefault() - let React handle it
});

// ENHANCED: Global error handling for JavaScript errors (distinguishes code bugs from network issues)
window.addEventListener('error', event => {
  const error = event?.error?.message || event?.message;
  const filename = event?.filename || 'unknown';
  const lineno = event?.lineno || 0;
  
  console.warn('⚠️ Global JavaScript error:', error, `(${filename}:${lineno})`);
  
  // Only report actual code errors, not network/infrastructure issues
  const networkErrorPatterns = [
    'Failed to fetch',
    'NetworkError',
    'ERR_NETWORK',
    'Loading chunk',
    'Loading CSS chunk'
  ];
  
  if (!networkErrorPatterns?.some(pattern => error?.includes(pattern))) {
    // This is a real JavaScript code bug that needs attention
    console.error('🐛 Code error detected:', {
      message: error,
      filename,
      lineno,
      timestamp: new Date()?.toISOString()
    });
  }
});

// ENHANCED: Environment validation with user-friendly warnings
const validateEnvironment = () => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const optionalEnvVars = [
    'VITE_API_BASE_URL',
    'VITE_ORCHESTRATOR_URL'
  ];
  
  const missing = requiredEnvVars?.filter(key => !import.meta.env?.[key]);
  const missingOptional = optionalEnvVars?.filter(key => !import.meta.env?.[key]);
  
  if (missing?.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables:', missing);
    
    // Show critical error banner
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; background: #dc2626; color: white; padding: 16px; text-align: center; z-index: 9999; font-family: system-ui;">
        <div style="font-weight: bold; margin-bottom: 8px;">⚠️ CONFIGURATION ERROR</div>
        <div style="font-size: 14px; margin-bottom: 12px;">Missing critical environment variables: ${missing?.join(', ')}</div>
        <div style="font-size: 12px; opacity: 0.9;">Application may not function properly. Please configure your environment variables.</div>
        <button onClick="this.parentElement.parentElement.style.display='none'" style="margin-top: 8px; background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Dismiss</button>
      </div>
    `;
    document.body?.appendChild(errorDiv);
  }
  
  if (missingOptional?.length > 0) {
    console.warn('⚠️ Missing optional environment variables:', missingOptional);
    console.log('💡 Some features may use fallback configurations');
  }
};

// ENHANCED: Startup diagnostics and logging
const logStartupInfo = () => {
  const startupInfo = {
    timestamp: new Date()?.toISOString(),
    environment: import.meta.env?.NODE_ENV,
    mode: import.meta.env?.MODE,
    api_base: import.meta.env?.VITE_API_BASE_URL || 'fallback',
    supabase_configured: !!import.meta.env?.VITE_SUPABASE_URL,
    service_worker_supported: 'serviceWorker' in navigator,
    online_status: navigator?.onLine,
    user_agent: navigator?.userAgent?.substring(0, 100),
    url: window.location?.href
  };
  
  console.log('🚀 Trading MVP starting up...', startupInfo);
  
  // Log any immediate issues
  if (!startupInfo?.supabase_configured) {
    console.warn('📊 Database not configured - some features will use mock data');
  }
  
  if (!startupInfo?.online_status) {
    console.warn('📡 Browser reports offline status - network features may be limited');
  }
};

// STEP 5: Run validation and logging
validateEnvironment();
logStartupInfo();

// STEP 6: Enhanced app mounting with error boundary
try {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found - HTML structure may be corrupted');
  }
  
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log('✅ React app mounted successfully with surgical stabilization fixes active');
  
} catch (mountError) {
  console.error('❌ Failed to mount React app:', mountError);
  
  // Show fallback error page
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui; background: #f3f4f6;">
      <div style="text-align: center; max-width: 400px; padding: 32px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
        <h1 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 16px;">Application Error</h1>
        <p style="color: #6b7280; margin-bottom: 24px;">The Trading MVP application failed to start. Please check the browser console for details.</p>
        <button onClick="window.location.reload()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 500;">Reload Application</button>
      </div>
    </div>
  `;
}