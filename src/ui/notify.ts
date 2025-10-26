/**
 * Notification utilities for user feedback
 * Simple console-based implementation that can be replaced with a proper toast system
 */

/**
 * Show informational banner/notification
 * @param msg - Information message to display
 */
export function showInfoBanner(msg: string): void {
  // TODO: Replace with your actual notification system (toast, banner, etc.)
  console.info('[INFO BANNER]', msg);
  
  // For now, could also create a temporary DOM element for visual feedback
  if (typeof window !== 'undefined') {
    const banner = document.createElement('div');
    banner.style.cssText = `
      position: fixed; 
      top: 20px; 
      right: 20px; 
      background: #3b82f6; 
      color: white; 
      padding: 12px 16px; 
      border-radius: 6px; 
      z-index: 9999;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    banner.textContent = msg;
    document.body.appendChild(banner);
    
    setTimeout(() => {
      if (banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
    }, 5000);
  }
}

/**
 * Show warning notification
 * @param msg - Warning message to display
 */
export function showWarn(msg: string): void {
  console.warn('[WARN]', msg);
  
  if (typeof window !== 'undefined') {
    const banner = document.createElement('div');
    banner.style.cssText = `
      position: fixed; 
      top: 20px; 
      right: 20px; 
      background: #f59e0b; 
      color: white; 
      padding: 12px 16px; 
      border-radius: 6px; 
      z-index: 9999;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    banner.textContent = `⚠️ ${msg}`;
    document.body.appendChild(banner);
    
    setTimeout(() => {
      if (banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
    }, 7000);
  }
}

/**
 * Show error notification
 * @param msg - Error message to display
 */
export function showError(msg: string): void {
  console.error('[ERROR]', msg);
  
  if (typeof window !== 'undefined') {
    const banner = document.createElement('div');
    banner.style.cssText = `
      position: fixed; 
      top: 20px; 
      right: 20px; 
      background: #dc2626; 
      color: white; 
      padding: 12px 16px; 
      border-radius: 6px; 
      z-index: 9999;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    banner.textContent = `❌ ${msg}`;
    document.body.appendChild(banner);
    
    setTimeout(() => {
      if (banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
    }, 8000);
  }
}

/**
 * Show success notification
 * @param msg - Success message to display
 */
export function showSuccess(msg: string): void {
  console.info('[SUCCESS]', msg);
  
  if (typeof window !== 'undefined') {
    const banner = document.createElement('div');
    banner.style.cssText = `
      position: fixed; 
      top: 20px; 
      right: 20px; 
      background: #059669; 
      color: white; 
      padding: 12px 16px; 
      border-radius: 6px; 
      z-index: 9999;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    banner.textContent = `✅ ${msg}`;
    document.body.appendChild(banner);
    
    setTimeout(() => {
      if (banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
    }, 4000);
  }
}

/**
 * Clear all notifications
 */
export function clearNotifications(): void {
  if (typeof window !== 'undefined') {
    // Remove all notification banners
    const banners = document.querySelectorAll('[style*="position: fixed"][style*="z-index: 9999"]');
    banners.forEach(banner => {
      if (banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
    });
  }
}