/**
 * 🔧 Chunk Error Guard - Surgical Stabilization v2
 * Handles dynamic import failures with smart recovery
 */
let reloadAttempted = false;
let consecutiveErrors = 0;
const MAX_RETRIES = 2;

// Enhanced error detection patterns
const CHUNK_ERROR_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'Loading chunk',
  'Loading CSS chunk',
  'ChunkLoadError',
  'NetworkError when attempting to fetch resource'
];

function isChunkError(errorMessage) {
  const message = String(errorMessage || '');
  return CHUNK_ERROR_PATTERNS?.some(pattern => 
    message?.toLowerCase()?.includes(pattern?.toLowerCase())
  );
}

function isViteImportError(errorMessage) {
  const message = String(errorMessage || '');
  return message?.includes('import') && 
         (message?.includes('.js') || message?.includes('.ts') || message?.includes('.jsx'));
}

/**
 * Smart reload handler with cache busting
 */
function handleChunkError(error, source = 'unknown') {
  consecutiveErrors++;
  
  if (reloadAttempted && consecutiveErrors > MAX_RETRIES) {
    console.error('🚫 Maximum chunk reload attempts reached. Manual refresh required.');
    
    // Show user-friendly error message
    if (document?.body) {
      const errorBanner = document?.createElement('div');
      errorBanner.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; background: #dc2626; color: white; padding: 12px; text-align: center; z-index: 10000; font-family: system-ui;">
          <strong>⚡ Application Update Required</strong><br>
          <small>Please refresh your browser (Ctrl+F5 or Cmd+Shift+R)</small>
          <button onClick="location.reload(true)" style="margin-left: 10px; padding: 4px 8px; background: white; color: #dc2626; border: none; border-radius: 4px; cursor: pointer;">
            Refresh Now
          </button>
        </div>
      `;
      document?.body?.prepend(errorBanner);
    }
    return;
  }

  if (!reloadAttempted) {
    console.warn(`🔧 Chunk error detected from ${source}:`, error?.message);
    reloadAttempted = true;
    
    // Enhanced cache busting
    const url = new URL(window.location.href);
    url?.searchParams?.set('v', Date.now()?.toString());
    url?.searchParams?.set('chunk_fix', '1');
    
    console.log('🔄 Applying surgical cache bust...');
    
    // Clear any service worker caches
    if ('serviceWorker' in navigator && 'caches' in window) {
      caches?.keys()?.then(cacheNames => {
        cacheNames?.forEach(cacheName => caches?.delete(cacheName));
      })?.catch(() => {}); // Silent fail
    }
    
    // Reload with enhanced cache busting
    setTimeout(() => {
      window.location?.replace(url?.toString());
    }, 100);
  }
}

// Global error handler for chunk failures
window?.addEventListener('error', (event) => {
  const error = event?.error || event?.message || 'Unknown error';
  
  if (isChunkError(error) || isViteImportError(error)) {
    event?.preventDefault?.();
    handleChunkError(error, 'global');
  }
});

// Unhandled promise rejection handler
window?.addEventListener('unhandledrejection', (event) => {
  const error = event?.reason || event?.message || 'Unknown rejection';
  
  if (isChunkError(error) || isViteImportError(error)) {
    event?.preventDefault?.();
    handleChunkError(error, 'promise');
  }
});

// Module load failure handler for dynamic imports
const originalImport = window?.import || (() => {});
if (typeof originalImport === 'function') {
  window.import = function(...args) {
    return originalImport?.apply(this, args)?.catch(error => {
      if (isChunkError(error) || isViteImportError(error)) {
        handleChunkError(error, 'dynamic-import');
        return Promise.reject(error);
      }
      throw error;
    });
  };
}

// Export guard functions for manual use
export function isChunkGuardActive() {
  return true;
}

export function getChunkErrorCount() {
  return consecutiveErrors;
}

export function resetChunkGuard() {
  reloadAttempted = false;
  consecutiveErrors = 0;
}

export function forceChunkReload() {
  reloadAttempted = false;
  handleChunkError({ message: 'Manual chunk reload triggered' }, 'manual');
}

console.log('🛡️ Chunk Error Guard v2 - Surgical Stabilization Active');